import React from "react";

export type MultivariateMainType = {
    DepVar: string[] | null;
    FixFactor: string[] | null;
    Covar: string[] | null;
    WlsWeight: string | null;
};

export type MultivariateDialogProps = {
    isMainOpen: boolean;
    setIsMainOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsModelOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsContrastOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsPostHocOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsEMMeansOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsBootstrapOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof MultivariateMainType,
        value: string[] | string | null
    ) => void;
    data: MultivariateMainType;
    globalVariables: string[];
    onContinue: (mainState: MultivariateMainType) => void;
    onReset: () => void;
};

export type MultivariateModelType = {
    NonCust: boolean;
    Custom: boolean;
    BuildCustomTerm: boolean;
    FactorsVar: string[] | null;
    BuildTermMethod: string | null;
    FactorsModel: string[] | null;
    TermsVar: string | null;
    CovModel: string | null;
    RandomModel: string | null;
    TermText: string | null;
    SumOfSquareMethod: string | null;
    Intercept: boolean;
};

export type MultivariateModelProps = {
    isModelOpen: boolean;
    setIsModelOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof MultivariateModelType,
        value: string[] | string | boolean | null
    ) => void;
    data: MultivariateModelType;
};

export type MultivariateContrastType = {
    FactorList: string[] | null;
    ContrastMethod: string | null;
    Last: boolean;
    First: boolean;
};

export type MultivariateContrastProps = {
    isContrastOpen: boolean;
    setIsContrastOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof MultivariateContrastType,
        value: string[] | string | boolean | null
    ) => void;
    data: MultivariateContrastType;
};

export type MultivariatePlotsType = {
    SrcList: string[] | null;
    AxisList: string | null;
    LineList: string | null;
    PlotList: string | null;
    FixFactorVars: string[] | null;
    RandFactorVars: string | null;
    LineChartType: boolean;
    BarChartType: boolean;
    IncludeErrorBars: boolean;
    ConfidenceInterval: boolean;
    StandardError: boolean;
    Multiplier: number | null;
    IncludeRefLineForGrandMean: boolean;
    YAxisStart0: boolean;
};

export type MultivariatePlotsProps = {
    isPlotsOpen: boolean;
    setIsPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof MultivariatePlotsType,
        value: string[] | string | number | boolean | null
    ) => void;
    data: MultivariatePlotsType;
};

export type MultivariatePostHocType = {
    SrcList: string[] | null;
    FixFactorVars: string[] | null;
    Lsd: boolean;
    Bonfe: boolean;
    Sidak: boolean;
    Scheffe: boolean;
    Regwf: boolean;
    Regwq: boolean;
    Snk: boolean;
    Tu: boolean;
    Tub: boolean;
    Dun: boolean;
    Hoc: boolean;
    Gabriel: boolean;
    Waller: boolean;
    ErrorRatio: number | null;
    Dunnett: boolean;
    CategoryMethod: string | null;
    Twosided: boolean;
    LtControl: boolean;
    GtControl: boolean;
    Tam: boolean;
    Dunt: boolean;
    Games: boolean;
    Dunc: boolean;
};

export type MultivariatePostHocProps = {
    isPostHocOpen: boolean;
    setIsPostHocOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof MultivariatePostHocType,
        value: string[] | string | number | boolean | null
    ) => void;
    data: MultivariatePostHocType;
};

export type MultivariateEMMeansType = {
    SrcList: string[] | null;
    TargetList: string[] | null;
    CompMainEffect: boolean;
    ConfiIntervalMethod: string | null;
};

export type MultivariateEMMeansProps = {
    isEMMeansOpen: boolean;
    setIsEMMeansOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof MultivariateEMMeansType,
        value: string[] | string | boolean | null
    ) => void;
    data: MultivariateEMMeansType;
};

export type MultivariateSaveType = {
    ResWeighted: boolean;
    PreWeighted: boolean;
    StdStatistics: boolean;
    CooksD: boolean;
    Leverage: boolean;
    UnstandardizedRes: boolean;
    WeightedRes: boolean;
    StandardizedRes: boolean;
    StudentizedRes: boolean;
    DeletedRes: boolean;
    CoeffStats: boolean;
    NewDataSet: boolean;
    DatasetName: string | null;
    WriteNewDataSet: boolean;
    FilePath: string | null;
};

export type MultivariateSaveProps = {
    isSaveOpen: boolean;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof MultivariateSaveType,
        value: string | boolean | null
    ) => void;
    data: MultivariateSaveType;
};

export type MultivariateOptionsType = {
    DescStats: boolean;
    EstEffectSize: boolean;
    ObsPower: boolean;
    ParamEst: boolean;
    SscpMat: boolean;
    ResSscpMat: boolean;
    HomogenTest: boolean;
    SprVsLevel: boolean;
    ResPlot: boolean;
    LackOfFit: boolean;
    GeneralFun: boolean;
    SigLevel: number | null;
    CoefficientMatrix: boolean;
    TransformMat: boolean;
};

export type MultivariateOptionsProps = {
    isOptionsOpen: boolean;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof MultivariateOptionsType,
        value: number | boolean | null
    ) => void;
    data: MultivariateOptionsType;
};

export type MultivariateBootstrapType = {
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

export type MultivariateBootstrapProps = {
    isBootstrapOpen: boolean;
    setIsBootstrapOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof MultivariateBootstrapType,
        value: string[] | string | number | boolean | null
    ) => void;
    data: MultivariateBootstrapType;
};

export type MultivariateType = {
    main: MultivariateMainType;
    model: MultivariateModelType;
    contrast: MultivariateContrastType;
    plots: MultivariatePlotsType;
    posthoc: MultivariatePostHocType;
    emmeans: MultivariateEMMeansType;
    save: MultivariateSaveType;
    options: MultivariateOptionsType;
    bootstrap: MultivariateBootstrapType;
};

export type MultivariateContainerProps = {
    onClose: () => void;
};
