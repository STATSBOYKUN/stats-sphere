import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface Meta {
    name: string
    location: string
    created: Date
    n_vars: number
    n_case: number
    weight: number
}

interface MetaStore {
    meta: Meta
    setMeta: (newMeta: Partial<Meta>) => void
}

export const useMetaStore = create<MetaStore>()(
    persist(
        (set) => ({
            meta: {
                name: '',
                location: '',
                created: new Date(),
                n_vars: 0,
                n_case: 0,
                weight: 0,
            },
            setMeta: (newMeta) =>
                set((state) => ({
                    meta: { ...state.meta, ...newMeta },
                })),
        }),
        {
            name: 'meta-storage',
            storage: createJSONStorage(() => localStorage, {
                replacer: (key: string, value: any) => {
                    if (value instanceof Date) {
                        return { type: 'date', value: value.toISOString() }
                    }
                    return value
                },
                reviver: (key: string, value: any) => {
                    if (value && typeof value === 'object' && (value as any).type === 'date') {
                        return new Date((value as any).value)
                    }
                    return value
                },
            }),
        }
    )
)
