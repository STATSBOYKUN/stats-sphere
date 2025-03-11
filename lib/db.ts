import Dexie, { Table } from "dexie";
import { Cell } from "@/types/Cell";
import { Variable } from "@/types/Variable";
import { ValueLabel } from "@/types/ValueLabel";
import { Log } from "@/types/Log";
import { Analytic } from "@/types/Analytic";
import { Statistic } from "@/types/Statistic";

class MyDatabase extends Dexie {
    cells!: Table<Cell, number>;
    variables!: Table<Variable, number>;
    valueLabels!: Table<ValueLabel, number>;
    logs!: Table<Log, number>;
    analytics!: Table<Analytic, number>;
    statistics!: Table<Statistic, number>;

    constructor() {
        super("Statify");
        this.version(2).stores({
            cells: "[col+row], col, row, value",
            variables: "++id, columnIndex, name, type, width, decimals, label, missing, columns, align, measure, role",
            valueLabels: "++id, variableName, value, label",
            logs: "++id, log",
            analytics: "++id, log_id, title, note",
            statistics: "++id, analytic_id, title, output_data, components"
        });
        this.cells = this.table("cells");
        this.variables = this.table("variables");
        this.valueLabels = this.table("valueLabels");
        this.logs = this.table("logs");
        this.analytics = this.table("analytics");
        this.statistics = this.table("statistics");
        if (typeof window !== "undefined") {
            window.addEventListener("unhandledrejection", (event) => {
                console.error("Unhandled promise rejection:", event.reason);
            });
        }
    }

    serializeData(obj: any): string {
        return JSON.stringify(obj);
    }

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
