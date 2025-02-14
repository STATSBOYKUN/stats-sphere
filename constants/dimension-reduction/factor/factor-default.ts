import {
    FactorType,
    FactorDescriptivesType, FactorExtractionType,
    FactorMainType, FactorRotationType, FactorScoresType,
    FactorValueType, FactorOptionsType
} from "@/models/dimension-reduction/factor/factor";

export const FactorMainDefault: FactorMainType = {
    SrcVar: null,
    TargetVar: null,
    ValueTarget: null,
};

export const FactorValueDefault: FactorValueType = {
    Selection: null,
};

export const FactorDescriptivesDefault: FactorDescriptivesType = {
    UnivarDesc: false,
    InitialSol: false,
    Coefficient: false,
    Inverse: false,
    SignificanceLvl: false,
    Reproduced: false,
    Determinant: false,
    AntiImage: false,
    KMO: false,
};

export const FactorExtractionDefault: FactorExtractionType = {
    Method: null,
    Correlation: false,
    Covariance: false,
    Unrotated: false,
    Scree: false,
    Eigen: false,
    Factor: false,
    EigenVal: null,
    MaxFactors: null,
    MaxIter: null,
};

export const FactorRotationDefault: FactorRotationType = {
    None: false,
    Varimax: false,
    Oblimin: false,
    Delta: null,
    Quartimax: false,
    Equimax: false,
    Promax: false,
    Kappa: null,
    RotatedSol: false,
    LoadingPlot: false,
    MaxIter: null,
};

export const FactorScoresDefault: FactorScoresType = {
    SaveVar: false,
    Regression: false,
    Bartlett: false,
    Anderson: false,
    DisplayFactor: false,
};

export const FactorOptionsDefault: FactorOptionsType = {
    ExcludeListWise: false,
    ExcludePairWise: false,
    ReplaceMean: false,
    SortSize: false,
    SuppressValues: false,
    SuppressValuesNum: null,
}

export const FactorDefault: FactorType = {
    main: FactorMainDefault,
    value: FactorValueDefault,
    descriptives: FactorDescriptivesDefault,
    extraction: FactorExtractionDefault,
    rotation: FactorRotationDefault,
    scores: FactorScoresDefault,
    options: FactorOptionsDefault,
};
