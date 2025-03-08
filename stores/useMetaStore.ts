import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface Meta {
    name: string
    location: string
    created: Date
    weight: string
    dates: string // Stores formatted date string like Day(1)Hour(2;24)Minute(5;60)
}

interface MetaStore {
    meta: Meta
    setMeta: (newMeta: Partial<Meta>) => void
    clearDates: () => void
}

export const useMetaStore = create<MetaStore>()(
    persist(
        (set) => ({
            meta: {
                name: '',
                location: '',
                created: new Date(),
                weight: '',
                dates: '',
            },
            setMeta: (newMeta) =>
                set((state) => ({
                    meta: { ...state.meta, ...newMeta },
                })),
            clearDates: () =>
                set((state) => ({
                    meta: { ...state.meta, dates: '' },
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