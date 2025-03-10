// lib/db.ts

import Dexie, { Table } from 'dexie';

export interface Cell {
    id?: number;
    x: number;
    y: number;
    value: string;
}

export type RawData = string[][];

export interface Variable {
    id?: number;
    columnIndex: number;
    name: string;
    type: string;
    width: number;
    decimals: number;
    label?: string;
    values: string;
    missing: string;
    columns: string;
    align: string;
    measure: string;
}

export interface VariableDef {
    name: string;
    columnIndex: number;
    type: string;
    label: string;
    values: string;
    missing: string;
    measure: string;
    width: number;
    decimals: number;
    columns: number;
    align: string;
}

export interface Log {
    id?: number;
    log: string;
}

export interface Analytic {
    id?: number;
    log_id?: number;
    title: string;
    note?: string;
}

export interface Statistic {
    id?: number;
    analytic_id: number;
    title: string;
    output_data: string;
    components: string;
}

class MyDatabase extends Dexie {
    cells!: Table<Cell, [number, number]>;
    variables!: Table<Variable, number>;

    logs!: Table<Log, number>;
    analytics!: Table<Analytic, number>;
    statistics!: Table<Statistic, number>;

    constructor() {
        super('Statify');

        this.version(2).stores({
            cells: '[x+y], x, y, value',
            variables: '++id, columnIndex, name, type, width, decimals, label, values, missing, columns, align, measure',

            logs: '++id, log',
            analytics: '++id, log_id, title, note',
            statistics: '++id, analytic_id, title, output_data, components',
        });

        this.cells = this.table('cells');

        this.variables = this.table('variables');

        this.logs = this.table('logs');
        this.analytics = this.table('analytics');
        this.statistics = this.table('statistics');

        // Event listener for unhandled promise rejections
        if (typeof window !== "undefined") {
            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled promise rejection:', event.reason);
            });
        }
    }

    // Optional: Adding a method to handle the output_data serialization
    serializeData(obj: any): string {
        return JSON.stringify(obj);
    }

    // Optional: Adding a method to deserialize output_data
    deserializeData(json: string): any {
        try {
            return JSON.parse(json);
        } catch (e) {
            console.error("Error deserializing data:", e);
            return null;
        }
    }
}

const db = new MyDatabase();

export default db;
