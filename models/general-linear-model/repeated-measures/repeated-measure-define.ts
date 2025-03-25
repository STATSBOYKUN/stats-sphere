import React from "react";

export type RepeatedMeasureDefineFactor = {
    name: string | null;
    levels: number | null;
};

export type RepeatedMeasure = {
    name: string | null;
};

export type RepeatedMeasureDefineData = {
    factors: RepeatedMeasureDefineFactor[];
    measures: RepeatedMeasure[];
    factorName: string | null;
    factorLevels: number | null;
    measureName: string | null;
    selectedFactor: string | null;
    selectedMeasure: string | null;
};

export type RepeatedMeasureDefineDialogProps = {
    isDefineOpen: boolean;
    setIsDefineOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof RepeatedMeasureDefineData,
        value: any
    ) => void;
    data: RepeatedMeasureDefineData;
    onReset: () => void;
};

export type RepeatedMeasureDefineType = {
    main: RepeatedMeasureDefineData;
};

export type RepeatedMeasuresDefineContainerProps = {
    onClose: () => void;
};

export type FactorLevelCombination = {
    factorLevels: number[];
    measure: string | null;
};
