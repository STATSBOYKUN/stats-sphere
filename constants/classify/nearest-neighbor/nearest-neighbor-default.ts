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
    NormCovar: true,
};

export const KNNNeighborsDefault: KNNNeighborsType = {
    Specify: true,
    AutoSelection: false,
    SpecifyK: 3,
    MinK: 3,
    MaxK: 5,
    MetricEucli: true,
    MetricManhattan: false,
    Weight: false,
    PredictionsMean: true,
    PredictionsMedian: false,
};

export const KNNFeaturesDefault: KNNFeaturesType = {
    ForwardSelection: null,
    ForcedEntryVar: null,
    FeaturesToEvaluate: 0,
    ForcedFeatures: 0,
    PerformSelection: false,
    MaxReached: true,
    BelowMin: false,
    MaxToSelect: null,
    MinChange: 0.01,
};

export const KNNPartitionDefault: KNNPartitionType = {
    SrcVar: null,
    PartitioningVariable: null,
    UseRandomly: false,
    UseVariable: false,
    VFoldPartitioningVariable: null,
    VFoldUseRandomly: false,
    VFoldUsePartitioningVar: false,
    TrainingNumber: 70,
    NumPartition: 10,
    SetSeed: false,
    Seed: null,
};

export const KNNSaveDefault: KNNSaveType = {
    AutoName: true,
    CustomName: false,
    MaxCatsToSave: null,
    HasTargetVar: false,
    IsCateTargetVar: false,
    RandomAssignToPartition: false,
    RandomAssignToFold: false,
};

export const KNNOutputDefault: KNNOutputType = {
    CaseSummary: true,
    ChartAndTable: true,
    ExportModelXML: false,
    XMLFilePath: null,
    ExportDistance: false,
    CreateDataset: true,
    WriteDataFile: false,
    NewDataFilePath: null,
    DatasetName: null,
};

export const KNNOptionsDefault: KNNOptionsType = {
    Exclude: true,
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
