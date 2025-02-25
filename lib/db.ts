// lib/db
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
    type:
        | "NUMERIC"
        | "COMMA"
        | "SCIENTIFIC"
        | "DATE"
        | "ADATE"
        | "EDATE"
        | "SDATE"
        | "JDATE"
        | "QYR"
        | "MOYR"
        | "WKYR"
        | "DATETIME"
        | "TIME"
        | "DTIME"
        | "WKDAY"
        | "MONTH"
        | "DOLLAR"
        | "CUSTOM_CURRENCY"
        | "STRING"
        | "RESTRICTED_NUMERIC";
    width: number;
    decimals: number;
    label?: string;
    values: ValueLabel[];
    missing: (number | string)[];
    columns: number;
    align: string;
    measure: string;
}

export interface ValueLabel {
    id?: number;
    variableName: string;
    value: number | string;
    label: string;
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
    cells!: Table<Cell, number>;
    variables!: Table<Variable, number>;
    valueLabels!: Table<ValueLabel, number>;
    logs!: Table<Log, number>;
    analytics!: Table<Analytic, number>;
    statistics!: Table<Statistic, number>;

    constructor() {
        super('Statify');

        this.version(2).stores({
            cells: '[x+y], x, y, value',
            variables: '++id, columnIndex, name, type, width, decimals, label, missing, columns, align, measure',
            valueLabels: '++id, variableName, value, label',
            logs: '++id, log',
            analytics: '++id, log_id, title, note',
            statistics: '++id, analytic_id, title, output_data, components'
        });

        this.cells = this.table('cells');
        this.variables = this.table('variables');
        this.valueLabels = this.table('valueLabels');
        this.logs = this.table('logs');
        this.analytics = this.table('analytics');
        this.statistics = this.table('statistics');

        // Menangani unhandled promise rejection
        if (typeof window !== "undefined") {
            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled promise rejection:', event.reason);
            });
        }
    }

    // Metode untuk serialisasi data
    serializeData(obj: any): string {
        return JSON.stringify(obj);
    }

    // Metode untuk deserialisasi data
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
