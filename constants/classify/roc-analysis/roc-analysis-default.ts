import {
    RocAnalysisDefineGroupsType,
    RocAnalysisDisplayType,
    RocAnalysisMainType,
    RocAnalysisOptionsType, RocAnalysisType
} from "@/models/classify/roc-analysis/roc-analysis";

export const RocAnalysisMainDefault: RocAnalysisMainType = {
    PairedSample: false,
    SrcVar: null,
    StateTargetVariable: null,
    StateVarVal: null,
    TestTargetVariable: null,
    TargetGroupVar: null,
};

export const RocAnalysisDefineGroupsDefault: RocAnalysisDefineGroupsType = {
    SpecifiedValues: false,
    Group1: null,
    Group2: null,
    UseMidValue: false,
    CutPoint: false,
    CutPointValue: null,
};

export const RocAnalysisOptionsDefault: RocAnalysisOptionsType = {
    IncludeCutoff: false,
    ExcludeCutoff: false,
    LargerTest: false,
    SmallerTest: false,
    DistAssumptMethod: null,
    ConfLevel: null,
    ExcludeMissValue: false,
    MissValueAsValid: false,
};

export const RocAnalysisDisplayDefault: RocAnalysisDisplayType = {
    RocCurve: false,
    Refline: false,
    PRC: false,
    IntepolateTrue: false,
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
