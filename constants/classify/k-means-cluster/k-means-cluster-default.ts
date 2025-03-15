import {
    KMeansClusterMainType,
    KMeansClusterIterateType,
    KMeansClusterOptionsType,
    KMeansClusterSaveType,
    KMeansClusterType,
} from "@/models/classify/k-means-cluster/k-means-cluster";

export const KMeansClusterMainDefault: KMeansClusterMainType = {
    TargetVar: null,
    CaseTarget: null,
    IterateClassify: true,
    ClassifyOnly: false,
    Cluster: 2,
    OpenDataset: false,
    ExternalDatafile: false,
    NewDataset: false,
    DataFile: false,
    ReadInitial: false,
    WriteFinal: false,
    OpenDatasetMethod: null,
    NewData: null,
    InitialData: null,
    FinalData: null,
};

export const KMeansClusterIterateDefault: KMeansClusterIterateType = {
    MaximumIterations: 10,
    ConvergenceCriterion: 0,
    UseRunningMeans: false,
};

export const KMeansClusterSaveDefault: KMeansClusterSaveType = {
    ClusterMembership: false,
    DistanceClusterCenter: false,
};

export const KMeansClusterOptionsDefault: KMeansClusterOptionsType = {
    InitialCluster: true,
    ANOVA: false,
    ClusterInfo: false,
    ExcludeListWise: true,
    ExcludePairWise: false,
};

export const KMeansClusterDefault: KMeansClusterType = {
    main: KMeansClusterMainDefault,
    iterate: KMeansClusterIterateDefault,
    save: KMeansClusterSaveDefault,
    options: KMeansClusterOptionsDefault,
};
