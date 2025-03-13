import {
    HierClusMainType, HierClusMethodType,
    HierClusPlotsType, HierClusSaveType,
    HierClusStatisticsType, HierClusType
} from "@/models/classify/hierarchical-cluster/hierarchical-cluster";

export const HierClusMainDefault: HierClusMainType = {
    Variables: null,
    LabelCases: null,
    ClusterCases: false,
    ClusterVar: false,
    DispStats: false,
    DispPlots: false,
};

export const HierClusStatisticsDefault: HierClusStatisticsType = {
    AgglSchedule: false,
    ProxMatrix: false,
    NoneSol: false,
    SingleSol: false,
    RangeSol: false,
    NoOfCluster: null,
    MaxCluster: null,
    MinCluster: null,
};

export const HierClusPlotsDefault: HierClusPlotsType = {
    Dendrograms: false,
    AllClusters: false,
    RangeClusters: false,
    NoneClusters: false,
    StartCluster: null,
    StopCluster: null,
    StepByCluster: null,
    VertOrien: false,
    HoriOrien: false,
};

export const HierClusSaveDefault: HierClusSaveType = {
    NoneSol: false,
    SingleSol: false,
    RangeSol: false,
    NoOfCluster: null,
    MaxCluster: null,
    MinCluster: null,
};

export const HierClusMethodDefault: HierClusMethodType = {
    ClusMethod: null,
    Interval: false,
    IntervalMethod: null,
    Power: null,
    Root: null,
    Counts: false,
    CountsMethod: null,
    Binary: false,
    BinaryMethod: null,
    Present: null,
    Absent: null,
    StandardizeMethod: null,
    ByVariable: false,
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
