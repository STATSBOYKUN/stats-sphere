import { Analytic, Log, Statistic } from "@/lib/db";
import { RocCurveType } from "./roc-curve";

export type RocCurveAnalysisType = {
    tempData: RocCurveType;
    dataVariables: any[];
    variables: any[];
    addLog: (log: Omit<Log, "id">) => Promise<number>;
    addAnalytic: (analytic: Omit<Analytic, "id">) => Promise<number>;
    addStatistic: (stat: Omit<Statistic, "id">) => Promise<number>;
};

export type RocCurveFinalResultType = {
    addLog: (log: Omit<Log, "id">) => Promise<number>;
    addAnalytic: (analytic: Omit<Analytic, "id">) => Promise<number>;
    addStatistic: (stat: Omit<Statistic, "id">) => Promise<number>;
};
