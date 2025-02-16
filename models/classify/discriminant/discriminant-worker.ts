import {DiscriminantType} from "@/models/classify/discriminant/discriminant";
import {Analytic, Log, Statistic} from "@/lib/db";

export type DiscriminantAnalysisType = {
    tempData : DiscriminantType,
    dataVariables: any[],
    variables: any[],
    addLog: (log: Omit<Log, 'id'>) => Promise<number>;
    addAnalytic: (analytic: Omit<Analytic, 'id'>) => Promise<number>;
    addStatistic: (stat: Omit<Statistic, 'id'>) => Promise<number>;
}

export type DiscriminantFinalResultType = {
    analysisCaseData: any,
    addLog: (log: Omit<Log, 'id'>) => Promise<number>;
    addAnalytic: (analytic: Omit<Analytic, 'id'>) => Promise<number>;
    addStatistic: (stat: Omit<Statistic, 'id'>) => Promise<number>;
}