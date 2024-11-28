// lib/db.ts

import Dexie, { Table } from 'dexie';

// Interface Definitions

export interface Coordinate {
    id?: number;
    x: number;
    y: number;
    isiData: string;
}

export interface Cell {
    id?: number;
    x: number; // Column index
    y: number; // Row index
    value: string;
}

export interface Variable {
    id?: number;
    columnIndex: number; // Index kolom yang diwakili oleh variabel ini
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
    log_id?: number; // Auto-incremented primary key
    timestamp?: Date; // Default to current timestamp
    values?: string; // Deskripsi log
}

export interface Result {
    result_id?: number; // Auto-incremented primary key
    log_id?: number; // Foreign key ke Log (optional)
    parent_id?: number; // Foreign key ke Result lain (optional)
    title: string; // Nama hasil analisis
    note?: string; // Catatan tambahan
    active_dataset?: string; // Nama dataset yang digunakan
}

export interface Statistic {
    stat_id?: number; // Auto-incremented primary key
    result_id: number; // Foreign key ke Result
    title: string; // Judul statistik
    output_type: string; // e.g., "table", "chart"
    output_data: object; // Data JSON
    components?: object; // Metadata frontend
}

class MyDatabase extends Dexie {
    // Existing Tables
    coordinates!: Table<Coordinate, number>;
    cells!: Table<Cell, [number, number]>;
    variables!: Table<Variable, number>;

    // New Tables
    logs!: Table<Log, number>;
    results!: Table<Result, number>;
    statistics!: Table<Statistic, number>;

    constructor() {
        super('Statify');

        // Define Versions and Stores
        this.version(1).stores({
            // Existing Tables
            coordinates: '++id, [x+y], x, y, isiData',
            cells: '[x+y], x, y, value',
            variables: '++id, columnIndex, name, type, width, decimals, label, values, missing, columns, align, measure',
        });

        this.version(2).stores({
            // Existing Tables
            coordinates: '++id, [x+y], x, y, isiData',
            cells: '[x+y], x, y, value',
            variables: '++id, columnIndex, name, type, width, decimals, label, values, missing, columns, align, measure',

            // New Tables
            logs: '++log_id, timestamp, values',
            results: '++result_id, log_id, parent_id, title, note, active_dataset',
            statistics: '++stat_id, result_id, title, output_type, output_data, components',
        });

        // Initialize Tables
        this.coordinates = this.table('coordinates');
        this.cells = this.table('cells');
        this.variables = this.table('variables');

        this.logs = this.table('logs');
        this.results = this.table('results');
        this.statistics = this.table('statistics');

        // Handle Unhandled Rejections
        if (typeof window !== "undefined") {
            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled promise rejection:', event.reason);
            });
        }
    }
}

const db = new MyDatabase();

export default db;
