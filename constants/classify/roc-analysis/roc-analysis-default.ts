import {
    RocAnalysisDefineGroupsType,
    RocAnalysisDisplayType,
    RocAnalysisMainType,
    RocAnalysisOptionsType,
    RocAnalysisType,
} from "@/models/classify/roc-analysis/roc-analysis";

export const RocAnalysisMainDefault: RocAnalysisMainType = {
    PairedSample: false,
    StateTargetVariable: null,
    StateVarVal: null,
    TestTargetVariable: null,
    TargetGroupVar: null,
};

export const RocAnalysisDefineGroupsDefault: RocAnalysisDefineGroupsType = {
    SpecifiedValues: true,
    Group1: null,
    Group2: null,
    UseMidValue: false,
    CutPoint: false,
    CutPointValue: null,
};

export const RocAnalysisOptionsDefault: RocAnalysisOptionsType = {
    IncludeCutoff: true,
    ExcludeCutoff: false,
    LargerTest: true,
    SmallerTest: false,
    DistAssumptMethod: "Nonparametric",
    ConfLevel: 95,
    ExcludeMissValue: true,
    MissValueAsValid: false,
};

export const RocAnalysisDisplayDefault: RocAnalysisDisplayType = {
    RocCurve: true,
    Refline: false,
    PRC: false,
    IntepolateTrue: true,
    IntepolateFalse: false,
    Overall: false,
    SECI: false,
    ROCPoint: false,
    PRCPoint: false,
    EvalMetrics: false,
};

export const RocAnalysisDefault: RocAnalysisType = {
    main: RocAnalysisMainDefault,
    defineGroups: RocAnalysisDefineGroupsDefault,
    options: RocAnalysisOptionsDefault,
    display: RocAnalysisDisplayDefault,
};
