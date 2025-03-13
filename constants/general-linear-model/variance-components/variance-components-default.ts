import {
    VarianceCompsMainType, VarianceCompsModelType, VarianceCompsOptionsType, VarianceCompsSaveType,
    VarianceCompsType
} from "@/models/general-linear-model/variance-components/variance-components";

export const VarianceCompsMainTypeDefault: VarianceCompsMainType = {
    SrcVar: null,
    DepVar: null,
    FixFactor: null,
    RandFactor: null,
    Covar: null,
    WlsWeight: null,
};

export const VarianceCompsModelTypeDefault: VarianceCompsModelType = {
    NonCust: false,
    Custom: false,
    FactorsVar: null,
    TermsVar: null,
    FactorsModel: null,
    BuildTermMethod: null,
    Intercept: false,
};

export const VarianceCompsOptionsTypeDefault: VarianceCompsOptionsType = {
    Minque: false,
    Anova: false,
    MaxLikelihood: false,
    ResMaxLikelihood: false,
    Uniform: false,
    Zero: false,
    TypeI: false,
    TypeIII: false,
    ConvergenceMethod: null,
    MaxIter: null,
    SumOfSquares: false,
    ExpectedMeanSquares: false,
    IterationHistory: false,
    InStepsOf: null,
};

export const VarianceCompsSaveTypeDefault: VarianceCompsSaveType = {
    VarCompEst: false,
    CompCovar: false,
    CovMatrix: false,
    CorMatrix: false,
    CreateNewDataset: false,
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
