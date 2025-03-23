import React from "react";

export type OptScaOveralsMainType = {
    SetTargetVariable: string[][] | null;
    PlotsTargetVariable: string[] | null;
    Dimensions: number | null;
};

export type DialogHandlers = {
    handleDefineRangeScaleContinue: (
        data: OptScaOveralsDefineRangeScaleType
    ) => void;
    handleDefineRangeContinue: (data: OptScaOveralsDefineRangeType) => void;
};

export type VariableInfoType = {
    [key: string]: {
        measScale?: string;
        minimum?: number;
        maximum?: number;
    };
};

export type OptScaOveralsDialogProps = {
    isMainOpen: boolean;
    setIsMainOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDefineRangeScaleOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDefineRangeOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaOveralsMainType,
        value: string[][] | string[] | string | number | null
    ) => void;
    data: OptScaOveralsMainType;
    globalVariables: string[];
    onContinue: (mainState: OptScaOveralsMainType) => void;
    onReset: () => void;
};

export type OptScaOveralsDefineRangeScaleType = {
    Minimum: number | null;
    Maximum: number | null;
    Ordinal: boolean;
    SingleNominal: boolean;
    MultipleNominal: boolean;
    DiscreteNumeric: boolean;
};

export type OptScaOveralsDefineRangeScaleProps = {
    isDefineRangeScaleOpen: boolean;
    setIsDefineRangeScaleOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaOveralsDefineRangeScaleType,
        value: string | number | boolean | null
    ) => void;
    data: OptScaOveralsDefineRangeScaleType;
    onContinue?: (data: OptScaOveralsDefineRangeScaleType) => void;
};

export type OptScaOveralsDefineRangeType = {
    Minimum: number | null;
    Maximum: number | null;
};

export type OptScaOveralsDefineRangeProps = {
    isDefineRangeOpen: boolean;
    setIsDefineRangeOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaOveralsDefineRangeType,
        value: string | number | null
    ) => void;
    data: OptScaOveralsDefineRangeType;
    onContinue?: (data: OptScaOveralsDefineRangeType) => void;
};

export type OptScaOveralsOptionsType = {
    Freq: boolean;
    Centroid: boolean;
    IterHistory: boolean;
    WeightCompload: boolean;
    SingMult: boolean;
    CategoryQuant: boolean;
    ObjScore: boolean;
    CategCoord: boolean;
    PlotObjScore: boolean;
    Compload: boolean;
    CategCentroid: boolean;
    Trans: boolean;
    SaveObjscore: boolean;
    UseRandconf: boolean;
    MaxIter: number | null;
    Conv: number | null;
};

export type OptScaOveralsOptionsProps = {
    isOptionsOpen: boolean;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaOveralsOptionsType,
        value: string | number | boolean | null
    ) => void;
    data: OptScaOveralsOptionsType;
};

export type OptScaOveralsType = {
    main: OptScaOveralsMainType;
    defineRangeScale: OptScaOveralsDefineRangeScaleType;
    defineRange: OptScaOveralsDefineRangeType;
    options: OptScaOveralsOptionsType;
};

export type OptScaOveralsContainerProps = {
    onClose: () => void;
};
