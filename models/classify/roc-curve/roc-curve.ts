import React from "react";

export type RocCurveMainType = {
    TestTargetVariable: string[] | null;
    StateTargetVariable: string | null;
    StateVarVal: string | null;
    RocCurve: boolean;
    DiagRef: boolean;
    ErrInterval: boolean;
    CoordPt: boolean;
};

export type RocCurveDialogProps = {
    isMainOpen: boolean;
    setIsMainOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof RocCurveMainType,
        value: string[] | string | boolean | null
    ) => void;
    data: RocCurveMainType;
    globalVariables: string[];
    onContinue: (mainState: RocCurveMainType) => void;
    onReset: () => void;
};

export type RocCurveOptionsType = {
    IncludeCutoff: boolean;
    ExcludeCutoff: boolean;
    LargerTest: boolean;
    SmallerTest: boolean;
    DistAssumptMethod: string | null;
    ConfLevel: number | null;
    ExcludeMissValue: boolean;
    MissValueAsValid: boolean;
};

export type RocCurveOptionsProps = {
    isOptionsOpen: boolean;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof RocCurveOptionsType,
        value: string | number | boolean | null
    ) => void;
    data: RocCurveOptionsType;
};

export type RocCurveType = {
    main: RocCurveMainType;
    options: RocCurveOptionsType;
};

export type RocCurveContainerProps = {
    onClose: () => void;
};
