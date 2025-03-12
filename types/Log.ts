import { Analytic } from "@/types/Analytic";

export type Log = {
    id?: number;
    log: string;
    analytics?: Analytic[];
};