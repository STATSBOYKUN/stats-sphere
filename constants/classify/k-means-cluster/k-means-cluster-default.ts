import {
    KMeansClusterMainType,
    KMeansClusterIterateType, KMeansClusterOptionsType,
    KMeansClusterSaveType,
    KMeansClusterType
} from "@/models/classify/k-means-cluster/k-means-cluster";

export const KMeansClusterMainDefault: KMeansClusterMainType = {
    TargetVar: null,
    CaseTarget: null,
    IterateClassify: false,
    ClassifyOnly: false,
    OpenDataset: false,
    ExternalDatafile: false,
    NewDataset: false,
    DataFile: false,
    ReadInitial: false,
    WriteFinal: false,
    OpenDatasetMethod: null,
    NewData: null,
    Cluster: null,
    InitialData: null,
    FinalData: null,
};

export const KMeansClusterIterateDefault: KMeansClusterIterateType = {
    MaximumIterations: null,
    ConvergenceCriterion: null,
    UseRunningMeans: false,
};

export const KMeansClusterSaveDefault: KMeansClusterSaveType = {
    ClusterMembership: false,
    DistanceClusterCenter: false,
};

export const KMeansClusterOptionsDefault: KMeansClusterOptionsType = {
    InitialCluster: false,
    ANOVA: false,
    ClusterInfo: false,
    ExcludeListWise: false,
    ExcludePairWise: false,
};

export const KMeansClusterDefault: KMeansClusterType = {
    main: KMeansClusterMainDefault,
    iterate: KMeansClusterIterateDefault,
    save: KMeansClusterSaveDefault,
    options: KMeansClusterOptionsDefault,
};
