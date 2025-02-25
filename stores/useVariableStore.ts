import { create } from 'zustand'
import zookeeper from 'zukeeper'
import { devtools } from 'zustand/middleware'
import db from '@/lib/db'
import { Variable } from '@/lib/db' // Sesuaikan path

interface VariableStoreState {
    variables: Variable[]
    totalColumns: number
    setTotalColumns: (total: number) => void
    setVariables: (variables: Variable[]) => void
    updateVariable: <K extends keyof Variable>(
        rowIndex: number,
        field: K,
        value: Variable[K]
    ) => Promise<void>
    addVariable: (variable: Variable) => Promise<void>
    getVariableByColumnIndex: (columnIndex: number) => Variable | undefined
    loadVariables: () => Promise<void>
    createNextVariable: (overrides?: Partial<Variable>) => Promise<void>
    resetVariables: () => Promise<void>
}

const initialTotalColumns = 45

// Helper untuk membuat Variable default
const createDefaultVariable = (index: number): Variable => ({
    columnIndex: index,
    name: '',
    type: 'NUMERIC',
    width: 8,
    decimals: 2,
    label: '',
    values: [],
    missing: [],
    columns: 200,
    align: 'right',
    measure: 'scale',
})

export const useVariableStore = create<VariableStoreState>()(
    zookeeper(
        devtools((set, get) => ({
            variables: [],
            totalColumns: initialTotalColumns,

            setTotalColumns: (total) => set({ totalColumns: total }),
            setVariables: (variables) => set({ variables }),

            updateVariable: async <K extends keyof Variable>(
                rowIndex: number,
                field: K,
                value: Variable[K]
            ) => {
                let variables = [...get().variables]
                if (rowIndex >= variables.length) {
                    const currentLength = variables.length
                    for (let i = currentLength; i <= rowIndex; i++) {
                        variables.push(createDefaultVariable(i))
                    }
                    set({ totalColumns: variables.length })
                }

                variables[rowIndex] = { ...variables[rowIndex], [field]: value }
                set({ variables })

                try {
                    await db.variables.put(variables[rowIndex])
                } catch (error) {
                    console.error('Failed to update variable in Dexie:', error)
                }
            },

            addVariable: async (variable) => {
                const variables = [...get().variables, variable]
                set({ variables })
                const newTotal = Math.max(get().totalColumns, variable.columnIndex + 1)
                set({ totalColumns: newTotal })

                try {
                    await db.variables.add(variable)
                } catch (error) {
                    console.error('Failed to add variable to Dexie:', error)
                }
            },

            getVariableByColumnIndex: (columnIndex) => {
                return get().variables.find((v) => v.columnIndex === columnIndex)
            },

            // Tidak lagi menerima parameter totalVariables
            loadVariables: async () => {
                try {
                    // Ambil semua data dari DB
                    const variablesFromDb = await db.variables.orderBy('columnIndex').toArray()

                    // Tentukan nilai maksimum columnIndex + 1
                    let maxColumn = initialTotalColumns
                    variablesFromDb.forEach((v) => {
                        if (v.columnIndex + 1 > maxColumn) {
                            maxColumn = v.columnIndex + 1
                        }
                    })

                    // Copy data yang ada di DB
                    const variables: Variable[] = [...variablesFromDb]

                    // Jika masih kurang (misal DB punya columnIndex 60, tapi array baru 45),
                    // tambahkan Variable default hingga maxColumn
                    for (let i = variables.length; i < maxColumn; i++) {
                        variables.push(createDefaultVariable(i))
                    }

                    set({ variables, totalColumns: maxColumn })
                } catch (error) {
                    console.error('Failed to fetch variables from Dexie:', error)
                }
            },

            createNextVariable: async (overrides = {}) => {
                const { variables } = get()
                const varNumbers = variables
                    .map((v) => {
                        const match = v.name.match(/^VAR(\d+)$/)
                        return match ? parseInt(match[1], 10) : 0
                    })
                    .filter((num) => num > 0)

                const maxNumber = varNumbers.length ? Math.max(...varNumbers) : 0
                const currentMaxIndex = variables.length
                    ? Math.max(...variables.map((v) => v.columnIndex))
                    : -1
                const requestedIndex =
                    overrides.columnIndex !== undefined ? overrides.columnIndex : currentMaxIndex + 1

                if (requestedIndex > currentMaxIndex + 1) {
                    for (let fillIndex = currentMaxIndex + 1; fillIndex < requestedIndex; fillIndex++) {
                        const fillName = `VAR${String(
                            maxNumber + 1 + (fillIndex - (currentMaxIndex + 1))
                        ).padStart(3, '0')}`
                        const fillVariable: Variable = {
                            columnIndex: fillIndex,
                            name: fillName,
                            type: 'NUMERIC',
                            width: 8,
                            decimals: 2,
                            label: '',
                            values: [],
                            missing: [],
                            columns: 8,
                            align: 'Right',
                            measure: 'Nominal',
                        }
                        await get().addVariable(fillVariable)
                    }
                }

                const modifiedOverrides = { ...overrides }
                if (modifiedOverrides.type === 'STRING') {
                    modifiedOverrides.decimals = 0
                    modifiedOverrides.align = 'Left'
                }

                const newName = `VAR${String(
                    maxNumber + 1 + (requestedIndex - (currentMaxIndex + 1))
                ).padStart(3, '0')}`
                const defaultVariable: Variable = {
                    columnIndex: requestedIndex,
                    name: newName,
                    type: 'NUMERIC',
                    width: 8,
                    decimals: 2,
                    label: '',
                    values: [],
                    missing: [],
                    columns: 8,
                    align: 'Right',
                    measure: 'Nominal',
                }

                const newVariable: Variable = { ...defaultVariable, ...modifiedOverrides }
                await get().addVariable(newVariable)
            },

            resetVariables: async () => {
                try {
                    await db.variables.clear()
                    set({ variables: [], totalColumns: initialTotalColumns })
                } catch (error) {
                    console.error('Failed to reset variables in Dexie:', error)
                }
            },
        }))
    )
)
