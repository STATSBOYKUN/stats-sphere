import {
    DiscriminantBootstrapType, DiscriminantClassifyType,
    DiscriminantDefineRangeType,
    DiscriminantMainType, DiscriminantMethodType, DiscriminantSaveType,
    DiscriminantSetValueType, DiscriminantStatisticsType, DiscriminantType
} from "@/models/classify/discriminant/discriminant";

export const DiscriminantMainDefault : DiscriminantMainType = {
    GroupingVariable: null,
    IndependentVariables: null,
    Together: true,
    Stepwise: false,
    SelectionVariable: null,
}

export const DiscriminantDefineRangeDefault : DiscriminantDefineRangeType = {
    minRange: null,
    maxRange: null,
}

export const DiscriminantSetValueDefault : DiscriminantSetValueType = {
    Value: null,
}

export const DiscriminantStatisticsDefault : DiscriminantStatisticsType = {
    Means: false,
    ANOVA: false,
    BoxM: false,
    Fisher: false,
    Unstandardized: false,
    WGCorrelation: false,
    WGCovariance: false,
    SGCovariance: false,
    TotalCovariance: false,
}

export const DiscriminantMethodDefault : DiscriminantMethodType = {
    Wilks: true,
    Unexplained: false,
    Mahalonobis: false,
    FRatio: false,
    Raos: false,
    FValue: true,
    FProbability: false,
    Summary: true,
    Pairwise: false,
    VEnter: 0,
    FEntry: 3.84,
    FRemoval: 2.71,
    PEntry: 0.05,
    PRemoval: 0.10,
}

export const DiscriminantClassifyDefault : DiscriminantClassifyType = {
    AllGroupEqual: true,
    GroupSize: false,
    WithinGroup: true,
    SepGroup: false,
    Case: false,
    Limit: false,
    LimitValue: null,
    Summary: false,
    Leave: false,
    Combine: false,
    SepGrp: false,
    Terr: false,
    Replace: false,
}

export const DiscriminantSaveDefault : DiscriminantSaveType = {
    Predicted: false,
    Discriminant: false,
    Probabilities: false,
    XmlFile: null,
}

export const DiscriminantBootstrapDefault : DiscriminantBootstrapType = {
    PerformBootStrapping: false,
    NumOfSamples: 1000,
    Seed: false,
    SeedValue: 2000000,
    Level: 95,
    Percentile: true,
    BCa: false,
    Simple: true,
    Stratified: false,
    Variables: null,
    StrataVariables: null,
}

export const DiscriminantDefault : DiscriminantType = {
    main: DiscriminantMainDefault,
    defineRange: DiscriminantDefineRangeDefault,
    setValue: DiscriminantSetValueDefault,
    statistics: DiscriminantStatisticsDefault,
    method: DiscriminantMethodDefault,
    classify: DiscriminantClassifyDefault,
    save: DiscriminantSaveDefault,
    bootstrap: DiscriminantBootstrapDefault,
}