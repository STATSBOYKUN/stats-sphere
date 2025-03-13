import { Analytic, Log, Statistic } from "@/lib/db";
import { TwoStepClusterType } from "./two-step-cluster";

export type TwoStepClusterAnalysisType = {
    tempData: TwoStepClusterType;
    dataVariables: any[];
    variables: any[];
    addLog: (log: Omit<Log, "id">) => Promise<number>;
    addAnalytic: (analytic: Omit<Analytic, "id">) => Promise<number>;
    addStatistic: (stat: Omit<Statistic, "id">) => Promise<number>;
};

export type TwoStepClusterFinalResultType = {
    addLog: (log: Omit<Log, "id">) => Promise<number>;
    addAnalytic: (analytic: Omit<Analytic, "id">) => Promise<number>;
    addStatistic: (stat: Omit<Statistic, "id">) => Promise<number>;
};
