import {
    OptScaOveralsDefineRangeScaleType,
    OptScaOveralsDefineRangeType,
    OptScaOveralsMainType,
    OptScaOveralsOptionsType,
    OptScaOveralsType,
} from "@/models/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals";

export const OptScaOveralsMainDefault: OptScaOveralsMainType = {
    SetTargetVariable: null,
    PlotsTargetVariable: null,
    Dimensions: null,
};

export const OptScaOveralsDefineRangeScaleDefault: OptScaOveralsDefineRangeScaleType =
    {
        Minimum: null,
        Maximum: null,
        Ordinal: false,
        SingleNominal: false,
        MultipleNominal: false,
        DiscreteNumeric: false,
    };

export const OptScaOveralsDefineRangeDefault: OptScaOveralsDefineRangeType = {
    Minimum: null,
    Maximum: null,
};

export const OptScaOveralsOptionsDefault: OptScaOveralsOptionsType = {
    Freq: false,
    SingMult: false,
    Centroid: false,
    CategoryQuant: false,
    IterHistory: false,
    ObjScore: false,
    WeightCompload: false,
    CategCoord: false,
    CategCentroid: false,
    PlotObjScore: false,
    Trans: false,
    Compload: false,
    SaveObjscore: false,
    UseRandconf: false,
    MaxIter: null,
    Conv: null,
};

export const OptScaOveralsDefault: OptScaOveralsType = {
    main: OptScaOveralsMainDefault,
    defineRangeScale: OptScaOveralsDefineRangeScaleDefault,
    defineRange: OptScaOveralsDefineRangeDefault,
    options: OptScaOveralsOptionsDefault,
};
