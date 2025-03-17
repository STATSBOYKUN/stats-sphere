import React from "react";

export type KNNMainType = {
    DepVar: string | null;
    FeatureVar: string[] | null;
    CaseIdenVar: string | null;
    FocalCaseIdenVar: string | null;
    NormCovar: boolean;
};

export type KNNDialogProps = {
    isMainOpen: boolean;
    setIsMainOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsNeighborsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsFeaturesOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsPartitionOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOutputOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof KNNMainType,
        value: string[] | string | boolean | null
    ) => void;
    data: KNNMainType;
    globalVariables: string[];
    onContinue: (mainState: KNNMainType) => void;
    onReset: () => void;
};

export type KNNNeighborsType = {
    Specify: boolean;
    AutoSelection: boolean;
    SpecifyK: number | null;
    MinK: number | null;
    MaxK: number | null;
    MetricEucli: boolean;
    MetricManhattan: boolean;
    Weight: boolean;
    PredictionsMean: boolean;
    PredictionsMedian: boolean;
};

export type KNNNeighborsProps = {
    isNeighborsOpen: boolean;
    setIsNeighborsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof KNNNeighborsType,
        value: number | boolean | null
    ) => void;
    data: KNNNeighborsType;
};

export type KNNFeaturesType = {
    ForwardSelection: string[] | null;
    ForcedEntryVar: string[] | null;
    FeaturesToEvaluate: number | null;
    ForcedFeatures: number | null;
    PerformSelection: boolean;
    MaxReached: boolean;
    BelowMin: boolean;
    MaxToSelect: number | null;
    MinChange: number | null;
};

export type KNNFeaturesProps = {
    isFeaturesOpen: boolean;
    setIsFeaturesOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof KNNFeaturesType,
        value: string[] | number | string | boolean | null
    ) => void;
    data: KNNFeaturesType;
};

export type KNNPartitionType = {
    SrcVar: string[] | null;
    PartitioningVariable: string | null;
    UseRandomly: boolean;
    UseVariable: boolean;
    VFoldPartitioningVariable: string | null;
    VFoldUseRandomly: boolean;
    VFoldUsePartitioningVar: boolean;
    TrainingNumber: number | null;
    NumPartition: number | null;
    SetSeed: boolean;
    Seed: number | null;
};

export type KNNPartitionProps = {
    isPartitionOpen: boolean;
    setIsPartitionOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof KNNPartitionType,
        value: string[] | number | string | boolean | null
    ) => void;
    data: KNNPartitionType;
};

export type KNNSaveType = {
    AutoName: boolean;
    CustomName: boolean;
    MaxCatsToSave: number | null;
    HasTargetVar: boolean;
    IsCateTargetVar: boolean;
    RandomAssignToPartition: boolean;
    RandomAssignToFold: boolean;
};

export type KNNSaveProps = {
    isSaveOpen: boolean;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof KNNSaveType,
        value: number | boolean | null
    ) => void;
    data: KNNSaveType;
};

export type KNNOutputType = {
    CaseSummary: boolean;
    ChartAndTable: boolean;
    ExportModelXML: boolean;
    XMLFilePath: string | null;
    ExportDistance: boolean;
    CreateDataset: boolean;
    WriteDataFile: boolean;
    NewDataFilePath: string | null;
    DatasetName: string | null;
};

export type KNNOutputProps = {
    isOutputOpen: boolean;
    setIsOutputOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof KNNOutputType,
        value: string | boolean | null
    ) => void;
    data: KNNOutputType;
};

export type KNNOptionsType = {
    Exclude: boolean;
    Include: boolean;
};

export type KNNOptionsProps = {
    isOptionsOpen: boolean;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof KNNOptionsType,
        value: string | boolean | null
    ) => void;
    data: KNNOptionsType;
};

export type KNNType = {
    main: KNNMainType;
    neighbors: KNNNeighborsType;
    features: KNNFeaturesType;
    partition: KNNPartitionType;
    save: KNNSaveType;
    output: KNNOutputType;
    options: KNNOptionsType;
};

export type KNNContainerProps = {
    onClose: () => void;
};
