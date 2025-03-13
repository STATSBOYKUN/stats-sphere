import React from "react";

export type RocAnalysisMainType = {
    TestTargetVariable: string[] | null;
    StateTargetVariable: string | null;
    StateVarVal: string | null;
    TargetGroupVar: string | null;
    PairedSample: boolean;
};

export type RocAnalysisDialogProps = {
    isMainOpen: boolean;
    setIsMainOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDefineGroupsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDisplayOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof RocAnalysisMainType,
        value: string[] | string | boolean | null
    ) => void;
    data: RocAnalysisMainType;
    globalVariables: string[];
    onContinue: (mainState: RocAnalysisMainType) => void;
    onReset: () => void;
};

export type RocAnalysisDefineGroupsType = {
    SpecifiedValues: boolean;
    Group1: string | null;
    Group2: string | null;
    UseMidValue: boolean;
    CutPoint: boolean;
    CutPointValue: number | null;
};

export type RocAnalysisDefineGroupsProps = {
    isDefineGroupsOpen: boolean;
    setIsDefineGroupsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof RocAnalysisDefineGroupsType,
        value: string | boolean | number | null
    ) => void;
    data: RocAnalysisDefineGroupsType;
};

export type RocAnalysisOptionsType = {
    IncludeCutoff: boolean;
    ExcludeCutoff: boolean;
    LargerTest: boolean;
    SmallerTest: boolean;
    DistAssumptMethod: string | null;
    ConfLevel: number | null;
    ExcludeMissValue: boolean;
    MissValueAsValid: boolean;
};

export type RocAnalysisOptionsProps = {
    isOptionsOpen: boolean;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof RocAnalysisOptionsType,
        value: string | number | boolean | null
    ) => void;
    data: RocAnalysisOptionsType;
};

export type RocAnalysisDisplayType = {
    RocCurve: boolean;
    Refline: boolean;
    PRC: boolean;
    IntepolateTrue: boolean;
    IntepolateFalse: boolean;
    Overall: boolean;
    SECI: boolean;
    ROCPoint: boolean;
    PRCPoint: boolean;
    EvalMetrics: boolean;
};

export type RocAnalysisDisplayProps = {
    isDisplayOpen: boolean;
    setIsDisplayOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof RocAnalysisDisplayType,
        value: string | boolean | null
    ) => void;
    data: RocAnalysisDisplayType;
};

export type RocAnalysisType = {
    main: RocAnalysisMainType;
    defineGroups: RocAnalysisDefineGroupsType;
    options: RocAnalysisOptionsType;
    display: RocAnalysisDisplayType;
};

export type RocAnalysisContainerProps = {
    onClose: () => void;
};
