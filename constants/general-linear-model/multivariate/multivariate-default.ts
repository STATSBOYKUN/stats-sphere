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
    NonCust: true,
    Custom: false,
    BuildCustomTerm: false,
    FactorsVar: null,
    TermsVar: null,
    FactorsModel: null,
    CovModel: null,
    RandomModel: null,
    BuildTermMethod: "interaction",
    TermText: null,
    SumOfSquareMethod: "typeIII",
    Intercept: true,
};

export const MultivariateContrastDefault: MultivariateContrastType = {
    FactorList: null,
    ContrastMethod: "none",
    Last: true,
    First: false,
};

export const MultivariatePlotsDefault: MultivariatePlotsType = {
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

export const MultivariatePostHocDefault: MultivariatePostHocType = {
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

export const MultivariateEMMeansDefault: MultivariateEMMeansType = {
    SrcList: null,
    TargetList: null,
    CompMainEffect: false,
    ConfiIntervalMethod: "lsdNone",
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
    NewDataSet: true,
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
    SigLevel: 0.05,
};

export const MultivariateBootstrapDefault: MultivariateBootstrapType = {
    PerformBootStrapping: false,
    NumOfSamples: 1000,
    Seed: false,
    SeedValue: 200000,
    Level: 95,
    Percentile: true,
    BCa: false,
    Simple: true,
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
