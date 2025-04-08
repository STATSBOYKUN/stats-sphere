import { DiscriminantType } from "@/models/classify/discriminant/discriminant";
import { Analytic, Log, Statistic } from "@/lib/db";
import { ResultJson } from "./discriminant-ouput";

export type DiscriminantAnalysisType = {
    configData: DiscriminantType;
    dataVariables: any[];
    variables: any[];
    addLog: (log: Omit<Log, "id">) => Promise<number>;
    addAnalytic: (analytic: Omit<Analytic, "id">) => Promise<number>;
    addStatistic: (stat: Omit<Statistic, "id">) => Promise<number>;
};

export type DiscriminantFinalResultType = {
    addLog: (log: Omit<Log, "id">) => Promise<number>;
    addAnalytic: (analytic: Omit<Analytic, "id">) => Promise<number>;
    addStatistic: (stat: Omit<Statistic, "id">) => Promise<number>;

    formattedResult: ResultJson;
};
