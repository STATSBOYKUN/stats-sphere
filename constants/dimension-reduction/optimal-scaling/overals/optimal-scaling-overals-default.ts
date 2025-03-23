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
    Dimensions: 2,
};

export const OptScaOveralsDefineRangeScaleDefault: OptScaOveralsDefineRangeScaleType =
    {
        Minimum: 1,
        Maximum: null,
        Ordinal: true,
        SingleNominal: false,
        MultipleNominal: false,
        DiscreteNumeric: false,
    };

export const OptScaOveralsDefineRangeDefault: OptScaOveralsDefineRangeType = {
    Minimum: 1,
    Maximum: null,
};

export const OptScaOveralsOptionsDefault: OptScaOveralsOptionsType = {
    Freq: true,
    SingMult: true,
    Centroid: true,
    CategoryQuant: true,
    IterHistory: false,
    ObjScore: false,
    WeightCompload: false,
    CategCoord: false,
    CategCentroid: false,
    PlotObjScore: true,
    Trans: false,
    Compload: true,
    SaveObjscore: false,
    UseRandconf: false,
    MaxIter: 100,
    Conv: 0.00001,
};

export const OptScaOveralsDefault: OptScaOveralsType = {
    main: OptScaOveralsMainDefault,
    defineRangeScale: OptScaOveralsDefineRangeScaleDefault,
    defineRange: OptScaOveralsDefineRangeDefault,
    options: OptScaOveralsOptionsDefault,
};
