import {
    FactorType,
    FactorDescriptivesType,
    FactorExtractionType,
    FactorMainType,
    FactorRotationType,
    FactorScoresType,
    FactorValueType,
    FactorOptionsType,
} from "@/models/dimension-reduction/factor/factor";

export const FactorMainDefault: FactorMainType = {
    TargetVar: null,
    ValueTarget: null,
};

export const FactorValueDefault: FactorValueType = {
    Selection: null,
};

export const FactorDescriptivesDefault: FactorDescriptivesType = {
    UnivarDesc: false,
    InitialSol: true,
    Coefficient: false,
    Inverse: false,
    SignificanceLvl: false,
    Reproduced: false,
    Determinant: false,
    AntiImage: false,
    KMO: false,
};

export const FactorExtractionDefault: FactorExtractionType = {
    Method: "PrincipalComp",
    Correlation: true,
    Covariance: false,
    Unrotated: true,
    Scree: false,
    Eigen: true,
    Factor: false,
    EigenVal: 1,
    MaxFactors: null,
    MaxIter: 25,
};

export const FactorRotationDefault: FactorRotationType = {
    None: true,
    Varimax: false,
    Oblimin: false,
    Delta: 0,
    Quartimax: false,
    Equimax: false,
    Promax: false,
    Kappa: 4,
    RotatedSol: true,
    LoadingPlot: false,
    MaxIter: 25,
};

export const FactorScoresDefault: FactorScoresType = {
    SaveVar: false,
    Regression: true,
    Bartlett: false,
    Anderson: false,
    DisplayFactor: false,
};

export const FactorOptionsDefault: FactorOptionsType = {
    ExcludeListWise: true,
    ExcludePairWise: false,
    ReplaceMean: false,
    SortSize: false,
    SuppressValues: false,
    SuppressValuesNum: 0.1,
};

export const FactorDefault: FactorType = {
    main: FactorMainDefault,
    value: FactorValueDefault,
    descriptives: FactorDescriptivesDefault,
    extraction: FactorExtractionDefault,
    rotation: FactorRotationDefault,
    scores: FactorScoresDefault,
    options: FactorOptionsDefault,
};
