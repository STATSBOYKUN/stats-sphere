import {
    RepeatedMeasuresContrastType,
    RepeatedMeasuresEMMeansType,
    RepeatedMeasuresMainType,
    RepeatedMeasuresModelType,
    RepeatedMeasuresOptionsType,
    RepeatedMeasuresPlotsType,
    RepeatedMeasuresPostHocType,
    RepeatedMeasuresSaveType,
    RepeatedMeasuresType,
} from "@/models/general-linear-model/repeated-measures/repeated-measures";

export const RepeatedMeasuresMainDefault: RepeatedMeasuresMainType = {
    SubVar: null,
    FactorsVar: null,
    Covariates: null,
};

export const RepeatedMeasuresModelDefault: RepeatedMeasuresModelType = {
    NonCust: false,
    Custom: false,
    BuildCustomTerm: false,
    BetSubVar: null,
    BetSubModel: null,
    WithSubVar: null,
    WithSubModel: null,
    DefFactors: null,
    BetFactors: null,
    CovModel: null,
    BuildTermMethod: null,
    SumOfSquareMethod: null,
    TermText: null,
};

export const RepeatedMeasuresContrastDefault: RepeatedMeasuresContrastType = {
    FactorList: null,
    ContrastMethod: null,
    Last: false,
    First: false,
};

export const RepeatedMeasuresPlotsDefault: RepeatedMeasuresPlotsType = {
    SrcList: null,
    AxisList: null,
    LineList: null,
    PlotList: null,
    FixFactorVars: null,
    RandFactorVars: null,
    LineChartType: false,
    BarChartType: false,
    IncludeErrorBars: false,
    ConfidenceInterval: false,
    StandardError: false,
    IncludeRefLineForGrandMean: false,
    YAxisStart0: false,
    Multiplier: null,
};

export const RepeatedMeasuresPostHocDefault: RepeatedMeasuresPostHocType = {
    SrcList: null,
    FixFactorVars: null,
    ErrorRatio: null,
    Twosided: false,
    LtControl: false,
    GtControl: false,
    CategoryMethod: null,
    Waller: false,
    Dunnett: false,
    Lsd: false,
    Bonfe: false,
    Sidak: false,
    Scheffe: false,
    Regwf: false,
    Regwq: false,
    Snk: false,
    Tu: false,
    Tub: false,
    Dun: false,
    Hoc: false,
    Gabriel: false,
    Tam: false,
    Dunt: false,
    Games: false,
    Dunc: false,
};

export const RepeatedMeasuresEMMeansDefault: RepeatedMeasuresEMMeansType = {
    SrcList: null,
    TargetList: null,
    CompMainEffect: false,
    ConfiIntervalMethod: null,
};

export const RepeatedMeasuresSaveDefault: RepeatedMeasuresSaveType = {
    ResWeighted: false,
    PreWeighted: false,
    StdStatistics: false,
    CooksD: false,
    Leverage: false,
    UnstandardizedRes: false,
    WeightedRes: false,
    StandardizedRes: false,
    StudentizedRes: false,
    DeletedRes: false,
    CoeffStats: false,
    NewDataSet: false,
    FilePath: null,
    DatasetName: null,
    WriteNewDataSet: false,
};

export const RepeatedMeasuresOptionsDefault: RepeatedMeasuresOptionsType = {
    DescStats: false,
    HomogenTest: false,
    EstEffectSize: false,
    SprVsLevel: false,
    ObsPower: false,
    ResPlot: false,
    ParamEst: false,
    LackOfFit: false,
    SscpMat: false,
    GeneralFun: false,
    ResSscpMat: false,
    CoefficientMatrix: false,
    TransformMat: false,
    SigLevel: null,
};

export const RepeatedMeasuresDefault: RepeatedMeasuresType = {
    main: RepeatedMeasuresMainDefault,
    model: RepeatedMeasuresModelDefault,
    contrast: RepeatedMeasuresContrastDefault,
    plots: RepeatedMeasuresPlotsDefault,
    posthoc: RepeatedMeasuresPostHocDefault,
    emmeans: RepeatedMeasuresEMMeansDefault,
    save: RepeatedMeasuresSaveDefault,
    options: RepeatedMeasuresOptionsDefault,
};
