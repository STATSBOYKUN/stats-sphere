import {
    UnivariateType,
    UnivariateBootstrapType, UnivariateContrastType, UnivariateEMMeansType,
    UnivariateMainType,
    UnivariateModelType, UnivariateOptionsType, UnivariatePlotsType, UnivariatePostHocType, UnivariateSaveType
} from "@/models/general-linear-model/univariate/univariate";

export const UnivariateMainDefault: UnivariateMainType = {
    SrcVar: null,
    DepVar: null,
    FixFactor: null,
    RandFactor: null,
    Covar: null,
    WlsWeight: null,
};

export const UnivariateModelDefault: UnivariateModelType = {
    NonCust: false,
    Custom: false,
    BuildCustomTerm: false,
    FactorsVar: null,
    TermsVar: null,
    FactorsModel: null,
    CovModel: null,
    RandomModel: null,
    BuildTermMethod: null,
    TermText: null,
    SumOfSquareMethod: null,
    Intercept: false,
};

export const UnivariateContrastDefault: UnivariateContrastType = {
    FactorList: null,
    ContrastMethod: null,
    Last: false,
    First: false,
};

export const UnivariatePlotsDefault: UnivariatePlotsType = {
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
    Multiplier: null,
    IncludeRefLineForGrandMean: false,
    YAxisStart0: false,
};

export const UnivariatePostHocDefault: UnivariatePostHocType = {
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

export const UnivariateEMMeansDefault: UnivariateEMMeansType = {
    SrcList: null,
    TargetList: null,
    CompMainEffect: false,
    ConfiIntervalMethod: null,
};

export const UnivariateSaveDefault: UnivariateSaveType = {
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
    StandardStats: false,
    Heteroscedasticity: false,
    NewDataSet: false,
    FilePath: null,
    DatasetName: null,
    WriteNewDataSet: false,
};

export const UnivariateOptionsDefault: UnivariateOptionsType = {
    DescStats: false,
    HomogenTest: false,
    EstEffectSize: false,
    SprVsLevel: false,
    ObsPower: false,
    ResPlot: false,
    ParamEst: false,
    LackOfFit: false,
    TransformMat: false,
    GeneralFun: false,
    ModBruschPagan: false,
    FTest: false,
    BruschPagan: false,
    WhiteTest: false,
    ParamEstRobStdErr: false,
    HC0: false,
    HC1: false,
    HC2: false,
    HC3: false,
    HC4: false,
    CoefficientMatrix: false,
    SigLevel: null,
};

export const UnivariateBootstrapDefault: UnivariateBootstrapType = {
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

export const UnivariateDefault: UnivariateType = {
    main: UnivariateMainDefault,
    model: UnivariateModelDefault,
    contrast: UnivariateContrastDefault,
    plots: UnivariatePlotsDefault,
    posthoc: UnivariatePostHocDefault,
    emmeans: UnivariateEMMeansDefault,
    save: UnivariateSaveDefault,
    options: UnivariateOptionsDefault,
    bootstrap: UnivariateBootstrapDefault,
};
