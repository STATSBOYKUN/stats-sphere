import React from "react";

export type RepeatedMeasuresMainType = {
    SubVar: string[] | null;
    FactorsVar: string[] | null;
    Covariates: string[] | null;
};

export type RepeatedMeasuresDialogProps = {
    isMainOpen: boolean;
    setIsMainOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsModelOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsContrastOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsPostHocOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsEMMeansOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof RepeatedMeasuresMainType,
        value: string[] | string | null
    ) => void;
    data: RepeatedMeasuresMainType;
    globalVariables: string[];
    combinationVars: string[];
    onContinue: (mainState: RepeatedMeasuresMainType) => void;
    onReset: () => void;
};

export type RepeatedMeasuresModelType = {
    NonCust: boolean;
    Custom: boolean;
    BuildCustomTerm: boolean;
    BetSubVar: string[] | null;
    BetSubModel: string[] | null;
    WithSubVar: string | null;
    WithSubModel: string | null;
    DefFactors: string | null;
    BetFactors: string | null;
    CovModel: string | null;
    BuildTermMethod: string | null;
    SumOfSquareMethod: string | null;
    TermText: string | null;
};

export type RepeatedMeasuresModelProps = {
    isModelOpen: boolean;
    setIsModelOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof RepeatedMeasuresModelType,
        value: string[] | string | boolean | null
    ) => void;
    data: RepeatedMeasuresModelType;
};

export type RepeatedMeasuresContrastType = {
    FactorList: string[] | null;
    ContrastMethod: string | null;
    Last: boolean;
    First: boolean;
};

export type RepeatedMeasuresContrastProps = {
    isContrastOpen: boolean;
    setIsContrastOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof RepeatedMeasuresContrastType,
        value: string[] | string | boolean | null
    ) => void;
    data: RepeatedMeasuresContrastType;
};

export type RepeatedMeasuresPlotsType = {
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
    IncludeRefLineForGrandMean: boolean;
    YAxisStart0: boolean;
    Multiplier: number | null;
};

export type RepeatedMeasuresPlotsProps = {
    isPlotsOpen: boolean;
    setIsPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof RepeatedMeasuresPlotsType,
        value: string[] | string | number | boolean | null
    ) => void;
    data: RepeatedMeasuresPlotsType;
};

export type RepeatedMeasuresPostHocType = {
    SrcList: string[] | null;
    FixFactorVars: string[] | null;
    ErrorRatio: number | null;
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

export type RepeatedMeasuresPostHocProps = {
    isPostHocOpen: boolean;
    setIsPostHocOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof RepeatedMeasuresPostHocType,
        value: string[] | string | number | boolean | null
    ) => void;
    data: RepeatedMeasuresPostHocType;
};

export type RepeatedMeasuresEMMeansType = {
    SrcList: string[] | null;
    TargetList: string[] | null;
    CompMainEffect: boolean;
    ConfiIntervalMethod: string | null;
};

export type RepeatedMeasuresEMMeansProps = {
    isEMMeansOpen: boolean;
    setIsEMMeansOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof RepeatedMeasuresEMMeansType,
        value: string[] | string | boolean | null
    ) => void;
    data: RepeatedMeasuresEMMeansType;
};

export type RepeatedMeasuresSaveType = {
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
    FilePath: string | null;
    DatasetName: string | null;
    WriteNewDataSet: boolean;
};

export type RepeatedMeasuresSaveProps = {
    isSaveOpen: boolean;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof RepeatedMeasuresSaveType,
        value: string | boolean | null
    ) => void;
    data: RepeatedMeasuresSaveType;
};

export type RepeatedMeasuresOptionsType = {
    DescStats: boolean;
    HomogenTest: boolean;
    EstEffectSize: boolean;
    SprVsLevel: boolean;
    ObsPower: boolean;
    ResPlot: boolean;
    ParamEst: boolean;
    LackOfFit: boolean;
    SscpMat: boolean;
    GeneralFun: boolean;
    ResSscpMat: boolean;
    CoefficientMatrix: boolean;
    TransformMat: boolean;
    SigLevel: number | null;
};

export type RepeatedMeasuresOptionsProps = {
    isOptionsOpen: boolean;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof RepeatedMeasuresOptionsType,
        value: number | boolean | null
    ) => void;
    data: RepeatedMeasuresOptionsType;
};

export type RepeatedMeasuresType = {
    main: RepeatedMeasuresMainType;
    model: RepeatedMeasuresModelType;
    contrast: RepeatedMeasuresContrastType;
    plots: RepeatedMeasuresPlotsType;
    posthoc: RepeatedMeasuresPostHocType;
    emmeans: RepeatedMeasuresEMMeansType;
    save: RepeatedMeasuresSaveType;
    options: RepeatedMeasuresOptionsType;
};

export type RepeatedMeasuresContainerProps = {
    onClose: () => void;
    combinationVars: string[];
    factorVars: string[];
};
