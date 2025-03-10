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

export type DiscriminantAnalysisCheckDataType = {
    data: any[]
}

export type DiscriminantAnalysisGroupStatisticsType = {
    groupData: any[],
    groupDefs: any[],
    independentData: any[],
    independentDefs: any[],
    minRange: number | null,
    maxRange: number | null
}

export type DiscriminantAnalysisSummaryCanonicalType = {
    groupData: any[],
    independentData: any[],
    minRange: number | null,
    maxRange: number | null
}

export type DiscriminantFinalResultType = {
    analysisCaseData: any,
    groupStatisticsData: any,
    addLog: (log: Omit<Log, 'id'>) => Promise<number>;
    addAnalytic: (analytic: Omit<Analytic, 'id'>) => Promise<number>;
    addStatistic: (stat: Omit<Statistic, 'id'>) => Promise<number>;
}

