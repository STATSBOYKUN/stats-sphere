import {
    TwoStepClusterMainType,
    TwoStepClusterOptionsType,
    TwoStepClusterOutputType,
    TwoStepClusterType,
} from "@/models/classify/two-step-cluster/two-step-cluster";

export const TwoStepClusterMainDefault: TwoStepClusterMainType = {
    CategoricalVar: null,
    ContinousVar: null,
    Log: true,
    Euclidean: false,
    Auto: true,
    MaxCluster: 15,
    Fixed: false,
    NumCluster: 5,
    Aic: false,
    Bic: true,
    ToStandardized: null,
    AssumedStandardized: null,
};

export const TwoStepClusterOptionsDefault: TwoStepClusterOptionsType = {
    SrcVar: null,
    TargetVar: null,
    Noise: false,
    NoiseCluster: 25,
    NoiseThreshold: 0,
    MxBranch: 8,
    MxDepth: 3,
    MemoryValue: 64,
    MaxNodes: 585,
    ImportCFTree: false,
    CFTreeName: null,
};

export const TwoStepClusterOutputDefault: TwoStepClusterOutputType = {
    SrcVar: null,
    TargetVar: null,
    PivotTable: false,
    ChartTable: true,
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
