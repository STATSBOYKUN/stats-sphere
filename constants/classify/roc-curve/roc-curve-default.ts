import {RocCurveMainType, RocCurveOptionsType, RocCurveType} from "@/models/classify/roc-curve/roc-curve";

export const RocCurveMainDefault: RocCurveMainType = {
    SrcVar: null,
    StateTargetVariable: null,
    StateVarVal: null,
    TestTargetVariable: null,
    CoordPt: false,
    DiagRef: false,
    ErrInterval: false,
    RocCurve: false,
};

export const RocCurveOptionsDefault: RocCurveOptionsType = {
    IncludeCutoff: false,
    ExcludeCutoff: false,
    LargerTest: false,
    SmallerTest: false,
    DistAssumptMethod: null,
    ConfLevel: null,
    ExcludeMissValue: false,
    MissValueAsValid: false,
};

export const RocCurveDefault: RocCurveType = {
    main: RocCurveMainDefault,
    options: RocCurveOptionsDefault,
};
