import {
    RepeatedMeasureDefineFactor,
    RepeatedMeasure,
    RepeatedMeasureDefineData,
    RepeatedMeasureDefineType,
} from "@/models/general-linear-model/repeated-measures/repeated-measure-define";
import React from "react";

export const RepeatedMeasureDefineFactorDefault: RepeatedMeasureDefineFactor = {
    name: null,
    levels: null,
};

export const RepeatedMeasureDefault: RepeatedMeasure = {
    name: null,
};

export const RepeatedMeasureDefineMainDefault: RepeatedMeasureDefineData = {
    factors: [],
    measures: [],
    factorName: null,
    factorLevels: null,
    measureName: null,
    selectedFactor: null,
    selectedMeasure: null,
};

export const RepeatedMeasureDefineDefault: RepeatedMeasureDefineType = {
    main: RepeatedMeasureDefineMainDefault,
};
