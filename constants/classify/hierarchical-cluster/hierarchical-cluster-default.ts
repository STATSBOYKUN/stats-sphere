import {
    HierClusMainType,
    HierClusMethodType,
    HierClusPlotsType,
    HierClusSaveType,
    HierClusStatisticsType,
    HierClusType,
} from "@/models/classify/hierarchical-cluster/hierarchical-cluster";

export const HierClusMainDefault: HierClusMainType = {
    Variables: null,
    LabelCases: null,
    ClusterCases: true,
    ClusterVar: false,
    DispStats: true,
    DispPlots: true,
};

export const HierClusStatisticsDefault: HierClusStatisticsType = {
    AgglSchedule: true,
    ProxMatrix: false,
    NoneSol: true,
    SingleSol: false,
    RangeSol: false,
    NoOfCluster: null,
    MaxCluster: null,
    MinCluster: null,
};

export const HierClusPlotsDefault: HierClusPlotsType = {
    Dendrograms: false,
    AllClusters: true,
    RangeClusters: false,
    NoneClusters: false,
    StartCluster: 1,
    StopCluster: null,
    StepByCluster: 1,
    VertOrien: true,
    HoriOrien: false,
};

export const HierClusSaveDefault: HierClusSaveType = {
    NoneSol: true,
    SingleSol: false,
    RangeSol: false,
    NoOfCluster: null,
    MaxCluster: null,
    MinCluster: null,
};

export const HierClusMethodDefault: HierClusMethodType = {
    ClusMethod: "AverageBetweenGroups",
    Interval: true,
    IntervalMethod: "Euclidean",
    Power: "2",
    Root: "2",
    Counts: false,
    CountsMethod: "CHISQ",
    Binary: false,
    BinaryMethod: "BSEUCLID",
    Present: 1,
    Absent: 0,
    StandardizeMethod: "None",
    ByVariable: true,
    ByCase: false,
    AbsValue: false,
    ChangeSign: false,
    RescaleRange: false,
};

export const HierClusDefault: HierClusType = {
    main: HierClusMainDefault,
    statistics: HierClusStatisticsDefault,
    plots: HierClusPlotsDefault,
    save: HierClusSaveDefault,
    method: HierClusMethodDefault,
};
