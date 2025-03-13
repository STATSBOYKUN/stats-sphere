import {
    TwoStepClusterMainType,
    TwoStepClusterOptionsType, TwoStepClusterOutputType,
    TwoStepClusterType
} from "@/models/classify/two-step-cluster/two-step-cluster";

export const TwoStepClusterMainDefault: TwoStepClusterMainType = {
    SrcVar: null,
    CategoricalVar: null,
    ContinousVar: null,
    Log: false,
    Euclidean: false,
    Auto: false,
    MaxCluster: null,
    Fixed: false,
    NumCluster: null,
    Aic: false,
    Bic: false,
    ToStandardized: null,
    AssumedStandardized: null,
};

export const TwoStepClusterOptionsDefault: TwoStepClusterOptionsType = {
    SrcVar: null,
    TargetVar: null,
    Noise: false,
    NoiseCluster: null,
    NoiseThreshold: null,
    MxBranch: null,
    MxDepth: null,
    MemoryValue: null,
    MaxNodes: null,
    ImportCFTree: false,
    CFTreeName: null,
};

export const TwoStepClusterOutputDefault: TwoStepClusterOutputType = {
    SrcVar: null,
    TargetVar: null,
    PivotTable: false,
    ChartTable: false,
    ClustVar: false,
    ExportModel: false,
    ExportCFTree: false,
    ModelName: null,
    CFTreeName: null,
};

export const TwoStepClusterDefault: TwoStepClusterType = {
    main: TwoStepClusterMainDefault,
    options: TwoStepClusterOptionsDefault,
    output: TwoStepClusterOutputDefault,
};
