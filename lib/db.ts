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
        this.version(3).stores({
            cells: "[col+row], col, row, value",
            variables: "++id, columnIndex, name, type, width, decimals, label, missing, columns, align, measure, role",
            valueLabels: "++id, variableName, value, label",
            logs: "++id, log",
            analytics: "++id, log_id, title, note",
            statistics: "++id, analytic_id, title, output_data, components, description"
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

    async getLogWithRelations(logId: number): Promise<Log | undefined> {
        const log = await this.logs.get(logId);
        if (!log) return undefined;

        const analytics = await this.analytics.where('log_id').equals(logId).toArray();

        for (const analytic of analytics) {
            if (analytic.id) {
                analytic.statistics = await this.statistics.where('analytic_id').equals(analytic.id).toArray();
            }
        }

        log.analytics = analytics;
        return log;
    }

    async getAllLogsWithRelations(): Promise<Log[]> {
        const logs = await this.logs.toArray();
        const analytics = await this.analytics.toArray();
        const statistics = await this.statistics.toArray();

        const analyticMap = new Map<number, Analytic[]>();
        const statisticMap = new Map<number, Statistic[]>();

        for (const statistic of statistics) {
            if (!statistic.analytic_id) continue;

            if (!statisticMap.has(statistic.analytic_id)) {
                statisticMap.set(statistic.analytic_id, []);
            }
            statisticMap.get(statistic.analytic_id)!.push(statistic);
        }

        for (const analytic of analytics) {
            if (!analytic.id) continue;

            analytic.statistics = statisticMap.get(analytic.id) || [];

            if (!analytic.log_id) continue;

            if (!analyticMap.has(analytic.log_id)) {
                analyticMap.set(analytic.log_id, []);
            }
            analyticMap.get(analytic.log_id)!.push(analytic);
        }

        for (const log of logs) {
            if (!log.id) continue;
            log.analytics = analyticMap.get(log.id) || [];
        }

        return logs;
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