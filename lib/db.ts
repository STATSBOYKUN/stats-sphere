// lib/db.ts

import Dexie, { Table } from 'dexie';

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

class MyDatabase extends Dexie {
    coordinates!: Table<Coordinate, number>;
    cells!: Table<Cell, [number, number]>; // Menggunakan [x+y] sebagai primary key
    variables!: Table<Variable, number>;

    constructor() {
        super('Statify');

        this.version(2).stores({
            coordinates: '++id, [x+y], x, y, isiData',
            cells: '[x+y], x, y, value',
            variables: '++id, columnIndex, name, type, width, decimals, label, values, missing, columns, align, measure'
        });

        this.coordinates = this.table('coordinates');
        this.cells = this.table('cells');
        this.variables = this.table('variables');

        if (typeof window !== "undefined") {
            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled promise rejection:', event.reason);
            });
        }

    }
}

const db = new MyDatabase();

export default db;
