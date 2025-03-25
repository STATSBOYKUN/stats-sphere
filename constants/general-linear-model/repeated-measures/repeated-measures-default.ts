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
    NonCust: true,
    Custom: false,
    BuildCustomTerm: false,
    BetSubVar: null,
    BetSubModel: null,
    WithSubVar: null,
    WithSubModel: null,
    DefFactors: null,
    BetFactors: null,
    CovModel: null,
    BuildTermMethod: "interaction",
    SumOfSquareMethod: "typeIII",
    TermText: null,
};

export const RepeatedMeasuresContrastDefault: RepeatedMeasuresContrastType = {
    FactorList: null,
    ContrastMethod: "none",
    Last: true,
    First: false,
};

export const RepeatedMeasuresPlotsDefault: RepeatedMeasuresPlotsType = {
    SrcList: null,
    AxisList: null,
    LineList: null,
    PlotList: null,
    FixFactorVars: null,
    RandFactorVars: null,
    LineChartType: true,
    BarChartType: false,
    IncludeErrorBars: false,
    ConfidenceInterval: true,
    StandardError: false,
    IncludeRefLineForGrandMean: false,
    YAxisStart0: false,
    Multiplier: 2,
};

export const RepeatedMeasuresPostHocDefault: RepeatedMeasuresPostHocType = {
    SrcList: null,
    FixFactorVars: null,
    ErrorRatio: 100,
    Twosided: true,
    LtControl: false,
    GtControl: false,
    CategoryMethod: "last",
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
    ConfiIntervalMethod: "lsdNone",
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
    NewDataSet: true,
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
    SigLevel: 0.05,
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
