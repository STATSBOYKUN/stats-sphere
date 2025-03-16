import { Analytic, Log, Statistic } from "@/lib/db";
import { KMeansClusterType } from "./k-means-cluster";

export type KMeansClusterAnalysisType = {
    tempData: KMeansClusterType;
    dataVariables: any[];
    variables: any[];
    addLog: (log: Omit<Log, "id">) => Promise<number>;
    addAnalytic: (analytic: Omit<Analytic, "id">) => Promise<number>;
    addStatistic: (stat: Omit<Statistic, "id">) => Promise<number>;
};

export type KMeansClusterFinalResultType = {
    addLog: (log: Omit<Log, "id">) => Promise<number>;
    addAnalytic: (analytic: Omit<Analytic, "id">) => Promise<number>;
    addStatistic: (stat: Omit<Statistic, "id">) => Promise<number>;
    initialClusterCentersTable: any;
    iterationHistoryTable: any;
    finalClusterCentersTable: any;
    numberOfCasesTable: any;
    clusterMembershipTable: any;
    clusterStatisticsTable: any;
    distancesFromClusterCentersTable: any;
};
