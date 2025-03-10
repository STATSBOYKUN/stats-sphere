// lib/db
import Dexie, { Table } from 'dexie';

export interface Cell {
    id?: number;
    col: number;
    row: number;
    value: string | number;
}

export interface Variable {
    id?: number;
    columnIndex: number;
    name: string;
    type:
        | "NUMERIC"
        | "COMMA"
        | "DOT"
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
        | "CCA"
        | "CCB"
        | "CCC"
        | "CCD"
        | "CCE"
        | "STRING"
        | "RESTRICTED_NUMERIC";
    width: number;
    decimals: number;
    label?: string;
    values: ValueLabel[];
    missing: (number | string)[];
    columns: number;
    align: "right" | "left" | "center";
    measure: "scale" | "ordinal" | "nominal" | "unknown";
    role: "input" | "target" | "both" | "none" | "partition" | "split";
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
            // Updated index keys: changed x and y to col and row.
            cells: '[col+row], col, row, value',
            variables: '++id, columnIndex, name, type, width, decimals, label, missing, columns, align, measure, role',
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

        // Handling unhandled promise rejections.
        if (typeof window !== "undefined") {
            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled promise rejection:', event.reason);
            });
        }
    }

    // Method for serializing data.
    serializeData(obj: any): string {
        return JSON.stringify(obj);
    }

    // Method for deserializing data.
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
