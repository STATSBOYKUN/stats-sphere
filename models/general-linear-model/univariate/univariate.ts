import React from "react";

export type UnivariateMainType = {
    DepVar: string[] | null;
    FixFactor: string[] | null;
    RandFactor: string[] | null;
    Covar: string[] | null;
    WlsWeight: string | null;
};

export type UnivariateDialogProps = {
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
        field: keyof UnivariateMainType,
        value: string[] | string | null
    ) => void;
    data: UnivariateMainType;
    globalVariables: string[];
    onContinue: (mainState: UnivariateMainType) => void;
    onReset: () => void;
};

export type UnivariateModelType = {
    NonCust: boolean;
    Custom: boolean;
    BuildCustomTerm: boolean;
    FactorsVar: string | null;
    TermsVar: string | null;
    FactorsModel: string | null;
    CovModel: string | null;
    RandomModel: string | null;
    BuildTermMethod: string | null;
    TermText: string | null;
    SumOfSquareMethod: string | null;
    Intercept: boolean;
};

export type UnivariateModelProps = {
    isModelOpen: boolean;
    setIsModelOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof UnivariateModelType,
        value: string | boolean | null
    ) => void;
    data: UnivariateModelType;
};

export type UnivariateContrastType = {
    FactorList: string | null;
    ContrastMethod: string | null;
    Last: boolean;
    First: boolean;
};

export type UnivariateContrastProps = {
    isContrastOpen: boolean;
    setIsContrastOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof UnivariateContrastType,
        value: string | boolean | null
    ) => void;
    data: UnivariateContrastType;
};

export type UnivariatePlotsType = {
    SrcList: string | null;
    AxisList: string | null;
    LineList: string | null;
    PlotList: string | null;
    FixFactorVars: string | null;
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

export type UnivariatePlotsProps = {
    isPlotsOpen: boolean;
    setIsPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof UnivariatePlotsType,
        value: string | number | boolean | null
    ) => void;
    data: UnivariatePlotsType;
};

export type UnivariatePostHocType = {
    SrcList: string | null;
    FixFactorVars: string | null;
    ErrorRatio: string | null;
    Twosided: boolean;
    LtControl: boolean;
    GtControl: boolean;
    CategoryMethod: string | null;
    Waller: boolean;
    Dunnett: boolean;
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
    Tam: boolean;
    Dunt: boolean;
    Games: boolean;
    Dunc: boolean;
};

export type UnivariatePostHocProps = {
    isPostHocOpen: boolean;
    setIsPostHocOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof UnivariatePostHocType,
        value: string | boolean | null
    ) => void;
    data: UnivariatePostHocType;
};

export type UnivariateEMMeansType = {
    SrcList: string | null;
    TargetList: string | null;
    CompMainEffect: boolean;
    ConfiIntervalMethod: string | null;
};

export type UnivariateEMMeansProps = {
    isEMMeansOpen: boolean;
    setIsEMMeansOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof UnivariateEMMeansType,
        value: string | boolean | null
    ) => void;
    data: UnivariateEMMeansType;
};

export type UnivariateSaveType = {
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
    StandardStats: boolean;
    Heteroscedasticity: boolean;
    NewDataSet: boolean;
    FilePath: string | null;
    DatasetName: string | null;
    WriteNewDataSet: boolean;
};

export type UnivariateSaveProps = {
    isSaveOpen: boolean;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof UnivariateSaveType,
        value: string | boolean | null
    ) => void;
    data: UnivariateSaveType;
};

export type UnivariateOptionsType = {
    DescStats: boolean;
    HomogenTest: boolean;
    EstEffectSize: boolean;
    SprVsLevel: boolean;
    ObsPower: boolean;
    ResPlot: boolean;
    ParamEst: boolean;
    LackOfFit: boolean;
    TransformMat: boolean;
    GeneralFun: boolean;
    ModBruschPagan: boolean;
    FTest: boolean;
    BruschPagan: boolean;
    WhiteTest: boolean;
    ParamEstRobStdErr: boolean;
    HC0: boolean;
    HC1: boolean;
    HC2: boolean;
    HC3: boolean;
    HC4: boolean;
    CoefficientMatrix: boolean;
    SigLevel: number | null;
};

export type UnivariateOptionsProps = {
    isOptionsOpen: boolean;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof UnivariateOptionsType,
        value: number | boolean | null
    ) => void;
    data: UnivariateOptionsType;
};

export type UnivariateBootstrapType = {
    PerformBootStrapping: boolean;
    NumOfSamples: number | null;
    Seed: boolean;
    SeedValue: number | null;
    Level: number | null;
    Percentile: boolean;
    BCa: boolean;
    Simple: boolean;
    Stratified: boolean;
    Variables: string | null;
    StrataVariables: string | null;
};

export type UnivariateBootstrapProps = {
    isBootstrapOpen: boolean;
    setIsBootstrapOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof UnivariateBootstrapType,
        value: string | number | boolean | null
    ) => void;
    data: UnivariateBootstrapType;
};

export type UnivariateType = {
    main: UnivariateMainType;
    model: UnivariateModelType;
    contrast: UnivariateContrastType;
    plots: UnivariatePlotsType;
    posthoc: UnivariatePostHocType;
    emmeans: UnivariateEMMeansType;
    save: UnivariateSaveType;
    options: UnivariateOptionsType;
    bootstrap: UnivariateBootstrapType;
};

export type UnivariateContainerProps = {
    onClose: () => void;
};
