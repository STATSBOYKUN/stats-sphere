import React from "react";

export type DiscriminantMainType = {
    GroupingVariable: string | null;
    IndependentVariables: string[] | null;
    Together: boolean;
    Stepwise: boolean;
    SelectionVariable: string | null;
};

export type DiscriminantDialogProps = {
    isMainOpen: boolean;
    setIsMainOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDefineRangeOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSetValueOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsStatisticsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsMethodOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsClassifyOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsBootstrapOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof DiscriminantMainType,
        value: string | string[] | boolean | null
    ) => void;
    data: DiscriminantMainType;
    globalVariables: string[];
    onContinue: (mainState: DiscriminantMainType) => void;
    onReset: () => void;
};

export type DiscriminantDefineRangeType = {
    minRange: number | null;
    maxRange: number | null;
};

export type DiscriminantDefineRangeProps = {
    isDefineRangeOpen: boolean;
    setIsDefineRangeOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof DiscriminantDefineRangeType,
        value: number | null
    ) => void;
    data: DiscriminantDefineRangeType;
};

export type DiscriminantSetValueType = {
    Value: number | null;
};

export type DiscriminantSetValueProps = {
    isSetValueOpen: boolean;
    setIsSetValueOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof DiscriminantSetValueType,
        value: number | null
    ) => void;
    data: DiscriminantSetValueType;
};

export type DiscriminantStatisticsType = {
    Means: boolean;
    ANOVA: boolean;
    BoxM: boolean;
    Fisher: boolean;
    Unstandardized: boolean;
    WGCorrelation: boolean;
    WGCovariance: boolean;
    SGCovariance: boolean;
    TotalCovariance: boolean;
};

export type DiscriminantStatisticsProps = {
    isStatisticsOpen: boolean;
    setIsStatisticsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof DiscriminantStatisticsType,
        value: boolean
    ) => void;
    data: DiscriminantStatisticsType;
};

export type DiscriminantMethodType = {
    Wilks: boolean;
    Unexplained: boolean;
    Mahalonobis: boolean;
    FRatio: boolean;
    Raos: boolean;
    FValue: boolean;
    FProbability: boolean;
    Summary: boolean;
    Pairwise: boolean;
    VEnter: number | null;
    FEntry: number | null;
    FRemoval: number | null;
    PEntry: number | null;
    PRemoval: number | null;
};

export type DiscriminantMethodProps = {
    isMethodOpen: boolean;
    setIsMethodOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof DiscriminantMethodType,
        value: number | boolean | null
    ) => void;
    data: DiscriminantMethodType;
};

export type DiscriminantClassifyType = {
    AllGroupEqual: boolean;
    GroupSize: boolean;
    WithinGroup: boolean;
    SepGroup: boolean;
    Case: boolean;
    Limit: boolean;
    LimitValue: number | null;
    Summary: boolean;
    Leave: boolean;
    Combine: boolean;
    SepGrp: boolean;
    Terr: boolean;
    Replace: boolean;
};

export type DiscriminantClassifyProps = {
    isClassifyOpen: boolean;
    setIsClassifyOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof DiscriminantClassifyType,
        value: number | boolean | null
    ) => void;
    data: DiscriminantClassifyType;
};

export type DiscriminantSaveType = {
    Predicted: boolean;
    Discriminant: boolean;
    Probabilities: boolean;
    XmlFile: string | null;
};

export type DiscriminantSaveProps = {
    isSaveOpen: boolean;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof DiscriminantSaveType,
        value: boolean | string | null
    ) => void;
    data: DiscriminantSaveType;
};

export type DiscriminantBootstrapType = {
    PerformBootStrapping: boolean;
    NumOfSamples: number | null;
    Seed: boolean;
    SeedValue: number | null;
    Level: number | null;
    Percentile: boolean;
    BCa: boolean;
    Simple: boolean;
    Stratified: boolean;
    Variables: string[] | null;
    StrataVariables: string[] | null;
};

export type DiscriminantBootstrapProps = {
    isBootstrapOpen: boolean;
    setIsBootstrapOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof DiscriminantBootstrapType,
        value: string[] | string | number | boolean | null
    ) => void;
    data: DiscriminantBootstrapType;
};

export type DiscriminantType = {
    main: DiscriminantMainType;
    defineRange: DiscriminantDefineRangeType;
    setValue: DiscriminantSetValueType;
    statistics: DiscriminantStatisticsType;
    method: DiscriminantMethodType;
    classify: DiscriminantClassifyType;
    save: DiscriminantSaveType;
    bootstrap: DiscriminantBootstrapType;
};

export type DiscriminantContainerProps = {
    onClose: () => void;
};
