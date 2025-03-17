import {
    RocCurveMainType,
    RocCurveOptionsType,
    RocCurveType,
} from "@/models/classify/roc-curve/roc-curve";

export const RocCurveMainDefault: RocCurveMainType = {
    StateTargetVariable: null,
    StateVarVal: null,
    TestTargetVariable: null,
    CoordPt: false,
    DiagRef: false,
    ErrInterval: false,
    RocCurve: true,
};

export const RocCurveOptionsDefault: RocCurveOptionsType = {
    IncludeCutoff: true,
    ExcludeCutoff: false,
    LargerTest: true,
    SmallerTest: false,
    DistAssumptMethod: "Nonparametric",
    ConfLevel: 95,
    ExcludeMissValue: true,
    MissValueAsValid: false,
};

export const RocCurveDefault: RocCurveType = {
    main: RocCurveMainDefault,
    options: RocCurveOptionsDefault,
};
