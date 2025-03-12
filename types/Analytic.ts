import { Statistic } from "@/types/Statistic";

export type Analytic = {
    id?: number;
    log_id?: number;
    title: string;
    note?: string;
    statistics?: Statistic[];
};