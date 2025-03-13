import {
    MultivariateType,
    MultivariateBootstrapType,
    MultivariateContrastType,
    MultivariateEMMeansType,
    MultivariateMainType,
    MultivariateModelType,
    MultivariateOptionsType,
    MultivariatePlotsType,
    MultivariatePostHocType,
    MultivariateSaveType,
} from "@/models/general-linear-model/multivariate/multivariate";

export const MultivariateMainDefault: MultivariateMainType = {
    DepVar: null,
    FixFactor: null,
    Covar: null,
    WlsWeight: null,
};

export const MultivariateModelDefault: MultivariateModelType = {
    FactorsVar: null,
    TermsVar: null,
    FactorsModel: null,
    CovModel: null,
    RandomModel: null,
    BuildTermMethod: null,
    NonCust: false,
    Custom: false,
    BuildCustomTerm: false,
    TermText: null,
    SumOfSquareMethod: null,
    Intercept: false,
};

export const MultivariateContrastDefault: MultivariateContrastType = {
    FactorList: null,
    ContrastMethod: null,
    Last: false,
    First: false,
};

export const MultivariatePlotsDefault: MultivariatePlotsType = {
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

export const MultivariatePostHocDefault: MultivariatePostHocType = {
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

export const MultivariateEMMeansDefault: MultivariateEMMeansType = {
    SrcList: null,
    TargetList: null,
    CompMainEffect: false,
    ConfiIntervalMethod: null,
};

export const MultivariateSaveDefault: MultivariateSaveType = {
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

export const MultivariateOptionsDefault: MultivariateOptionsType = {
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

export const MultivariateBootstrapDefault: MultivariateBootstrapType = {
    PerformBootStrapping: false,
    NumOfSamples: null,
    Seed: false,
    SeedValue: null,
    Level: null,
    Percentile: false,
    BCa: false,
    Simple: false,
    Stratified: false,
    Variables: null,
    StrataVariables: null,
};

export const MultivariateDefault: MultivariateType = {
    main: MultivariateMainDefault,
    model: MultivariateModelDefault,
    contrast: MultivariateContrastDefault,
    plots: MultivariatePlotsDefault,
    posthoc: MultivariatePostHocDefault,
    emmeans: MultivariateEMMeansDefault,
    save: MultivariateSaveDefault,
    options: MultivariateOptionsDefault,
    bootstrap: MultivariateBootstrapDefault,
};
