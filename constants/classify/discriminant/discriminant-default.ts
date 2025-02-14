import {
    DiscriminantBootstrapType, DiscriminantClassifyType,
    DiscriminantDefineRangeType,
    DiscriminantMainType, DiscriminantMethodType, DiscriminantSaveType,
    DiscriminantSetValueType, DiscriminantStatisticsType, DiscriminantType
} from "@/models/classify/discriminant/discriminant";

export const DiscriminantMainDefault : DiscriminantMainType = {
    GroupingVariable: null,
    IndependentVariables: null,
    Together: false,
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
    Wilks: false,
    Unexplained: false,
    Mahalonobis: false,
    FRatio: false,
    Raos: false,
    FValue: false,
    FProbability: false,
    Summary: false,
    Pairwise: false,
    VEnter: null,
    FEntry: null,
    FRemoval: null,
    PEntry: null,
    PRemoval: null,
}

export const DiscriminantClassifyDefault : DiscriminantClassifyType = {
    AllGroupEqual: false,
    GroupSize: false,
    WithinGroup: false,
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