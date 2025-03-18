import React from "react";

export type TwoStepClusterMainType = {
    CategoricalVar: string[] | null;
    ContinousVar: string[] | null;
    Log: boolean;
    Euclidean: boolean;
    Auto: boolean;
    MaxCluster: number | null;
    Fixed: boolean;
    NumCluster: number | null;
    Aic: boolean;
    Bic: boolean;
    ToStandardized: number | null;
    AssumedStandardized: number | null;
};

export type TwoStepClusterDialogProps = {
    isMainOpen: boolean;
    setIsMainOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOutputOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof TwoStepClusterMainType,
        value: string[] | number | string | boolean | null
    ) => void;
    data: TwoStepClusterMainType;
    globalVariables: string[];
    onContinue: (mainState: TwoStepClusterMainType) => void;
    onReset: () => void;
};

export type TwoStepClusterOptionsType = {
    SrcVar: string[] | null;
    TargetVar: string[] | null;
    Noise: boolean;
    NoiseCluster: number | null;
    NoiseThreshold: number | null;
    MxBranch: number | null;
    MxDepth: number | null;
    MemoryValue: number | null;
    MaxNodes: number | null;
    ImportCFTree: boolean;
    CFTreeName: string | null;
};

export type TwoStepClusterOptionsProps = {
    isOptionsOpen: boolean;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof TwoStepClusterOptionsType,
        value: string[] | number | string | boolean | null
    ) => void;
    data: TwoStepClusterOptionsType;
};

export type TwoStepClusterOutputType = {
    SrcVar: string[] | null;
    TargetVar: string[] | null;
    PivotTable: boolean;
    ChartTable: boolean;
    ClustVar: boolean;
    ExportModel: boolean;
    ExportCFTree: boolean;
    ModelName: string | null;
    CFTreeName: string | null;
};

export type TwoStepClusterOutputProps = {
    isOutputOpen: boolean;
    setIsOutputOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof TwoStepClusterOutputType,
        value: string[] | string | boolean | null
    ) => void;
    data: TwoStepClusterOutputType;
};

export type TwoStepClusterType = {
    main: TwoStepClusterMainType;
    options: TwoStepClusterOptionsType;
    output: TwoStepClusterOutputType;
};

export type TwoStepClusterContainerProps = {
    onClose: () => void;
};
