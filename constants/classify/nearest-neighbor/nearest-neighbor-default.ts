import {
    KNNFeaturesType,
    KNNNeighborsType,
    KNNOptionsType,
    KNNOutputType,
    KNNPartitionType,
    KNNSaveType,
    KNNType,
    KNNMainType,
} from "@/models/classify/nearest-neighbor/nearest-neighbor";

export const KNNMainDefault: KNNMainType = {
    DepVar: null,
    FeatureVar: null,
    CaseIdenVar: null,
    FocalCaseIdenVar: null,
    NormCovar: false,
};

export const KNNNeighborsDefault: KNNNeighborsType = {
    Specify: false,
    AutoSelection: false,
    SpecifyK: null,
    MinK: null,
    MaxK: null,
    MetricEucli: false,
    MetricManhattan: false,
    Weight: false,
    PredictionsMean: false,
    PredictionsMedian: false,
};

export const KNNFeaturesDefault: KNNFeaturesType = {
    ForwardSelection: null,
    ForcedEntryVar: null,
    FeaturesToEvaluate: null,
    ForcedFeatures: null,
    PerformSelection: false,
    MaxReached: false,
    BelowMin: false,
    MaxToSelect: null,
    MinChange: null,
};

export const KNNPartitionDefault: KNNPartitionType = {
    SrcVar: null,
    PartitioningVariable: null,
    UseRandomly: false,
    UseVariable: false,
    VFoldPartitioningVariable: null,
    VFoldUseRandomly: false,
    VFoldUsePartitioningVar: false,
    NumPartition: null,
    TrainingNumber: null,
    SetSeed: false,
    Seed: null,
};

export const KNNSaveDefault: KNNSaveType = {
    AutoName: false,
    CustomName: false,
    MaxCatsToSave: null,
    HasTargetVar: false,
    IsCateTargetVar: false,
    RandomAssignToPartition: false,
    RandomAssignToFold: false,
};

export const KNNOutputDefault: KNNOutputType = {
    CaseSummary: false,
    ChartAndTable: false,
    ExportModelXML: false,
    XMLFilePath: null,
    ExportDistance: false,
    CreateDataset: false,
    WriteDataFile: false,
    NewDataFilePath: null,
    DatasetName: null,
};

export const KNNOptionsDefault: KNNOptionsType = {
    Exclude: false,
    Include: false,
};

export const KNNDefault: KNNType = {
    main: KNNMainDefault,
    neighbors: KNNNeighborsDefault,
    features: KNNFeaturesDefault,
    partition: KNNPartitionDefault,
    save: KNNSaveDefault,
    output: KNNOutputDefault,
    options: KNNOptionsDefault,
};
