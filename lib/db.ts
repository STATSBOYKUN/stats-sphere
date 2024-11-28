// lib/db.ts

import Dexie, { Table } from 'dexie';

export interface Cell {
    id?: number;
    x: number;
    y: number;
    value: string;
}

export interface Variable {
    id?: number;
    columnIndex: number;
    name: string;
    type: string;
    width: number;
    decimals: number;
    label: string;
    values: string;
    missing: string;
    columns: string;
    align: string;
    measure: string;
}

export interface Log {
    log_id?: number;
    timestamp?: Date;
    values?: string;
}

export interface Analytic {
    analytic_id?: number;
    log_id?: number;
    parent_id?: number;
    title: string;
    note?: string;
    active_dataset?: string;
}

export interface Statistic {
    stat_id?: number;
    analytic_id: number;
    title: string;
    output_type: string;
    output_data: object;
    components?: object;
}

class MyDatabase extends Dexie {
    cells!: Table<Cell, [number, number]>;
    variables!: Table<Variable, number>;

    logs!: Table<Log, number>;
    analytics!: Table<Analytic, number>;
    statistics!: Table<Statistic, number>;

    constructor() {
        super('Statify');

        this.version(1).stores({
            coordinates: '++id, [x+y], x, y, isiData',
            cells: '[x+y], x, y, value',
            variables: '++id, columnIndex, name, type, width, decimals, label, values, missing, columns, align, measure',

            logs: '++log_id, timestamp, values',
            analytics: '++analytic_id, log_id, parent_id, title, note, active_dataset',
            statistics: '++stat_id, analytic_id, title, output_type, output_data, components',
        });

        this.cells = this.table('cells');
        this.variables = this.table('variables');

        this.logs = this.table('logs');
        this.analytics = this.table('analytics');
        this.statistics = this.table('statistics');

        if (typeof window !== "undefined") {
            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled promise rejection:', event.reason);
            });
        }
    }
}

const db = new MyDatabase();

export default db;
