import {
    VarianceCompsMainType,
    VarianceCompsModelType,
    VarianceCompsOptionsType,
    VarianceCompsSaveType,
    VarianceCompsType,
} from "@/models/general-linear-model/variance-components/variance-components";

export const VarianceCompsMainTypeDefault: VarianceCompsMainType = {
    DepVar: null,
    FixFactor: null,
    RandFactor: null,
    Covar: null,
    WlsWeight: null,
};

export const VarianceCompsModelTypeDefault: VarianceCompsModelType = {
    NonCust: true,
    Custom: false,
    FactorsVar: null,
    TermsVar: null,
    FactorsModel: null,
    BuildTermMethod: "interaction",
    Intercept: true,
};

export const VarianceCompsOptionsTypeDefault: VarianceCompsOptionsType = {
    Minque: false,
    Anova: false,
    MaxLikelihood: true,
    ResMaxLikelihood: false,
    Uniform: false,
    Zero: false,
    TypeI: false,
    TypeIII: true,
    ConvergenceMethod: "default",
    MaxIter: 100,
    SumOfSquares: false,
    ExpectedMeanSquares: false,
    IterationHistory: false,
    InStepsOf: 1,
};

export const VarianceCompsSaveTypeDefault: VarianceCompsSaveType = {
    VarCompEst: false,
    CompCovar: false,
    CovMatrix: false,
    CorMatrix: false,
    CreateNewDataset: true,
    FilePath: null,
    WriteNewDataFile: false,
    DatasetName: null,
};

export const VarianceCompsDefault: VarianceCompsType = {
    main: VarianceCompsMainTypeDefault,
    model: VarianceCompsModelTypeDefault,
    options: VarianceCompsOptionsTypeDefault,
    save: VarianceCompsSaveTypeDefault,
};
