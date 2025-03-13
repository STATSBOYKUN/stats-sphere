import React from "react";

export type FactorMainType = {
    TargetVar: string[] | null;
    ValueTarget: string | null;
};

export type FactorDialogProps = {
    isMainOpen: boolean;
    setIsMainOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsValueOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDescriptivesOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsExtractionOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsRotationOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsScoresOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof FactorMainType,
        value: string[] | string | null
    ) => void;
    data: FactorMainType;
    globalVariables: string[];
    onContinue: (mainState: FactorMainType) => void;
    onReset: () => void;
};

export type FactorValueType = {
    Selection: string | null;
};

export type FactorValueProps = {
    isValueOpen: boolean;
    setIsValueOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof FactorValueType,
        value: string | null
    ) => void;
    data: FactorValueType;
};

export type FactorDescriptivesType = {
    UnivarDesc: boolean;
    InitialSol: boolean;
    Coefficient: boolean;
    SignificanceLvl: boolean;
    Determinant: boolean;
    KMO: boolean;
    Inverse: boolean;
    Reproduced: boolean;
    AntiImage: boolean;
};

export type FactorDescriptivesProps = {
    isDescriptivesOpen: boolean;
    setIsDescriptivesOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof FactorDescriptivesType,
        value: string | boolean | null
    ) => void;
    data: FactorDescriptivesType;
};

export type FactorExtractionType = {
    Method: string | null;
    Correlation: boolean;
    Covariance: boolean;
    Unrotated: boolean;
    Scree: boolean;
    Eigen: boolean;
    Factor: boolean;
    EigenVal: number | null;
    MaxFactors: number | null;
    MaxIter: number | null;
};

export type FactorExtractionProps = {
    isExtractionOpen: boolean;
    setIsExtractionOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof FactorExtractionType,
        value: string | number | boolean | null
    ) => void;
    data: FactorExtractionType;
};

export type FactorRotationType = {
    None: boolean;
    Quartimax: boolean;
    Varimax: boolean;
    Equimax: boolean;
    Oblimin: boolean;
    Promax: boolean;
    Delta: number | null;
    Kappa: number | null;
    RotatedSol: boolean;
    LoadingPlot: boolean;
    MaxIter: number | null;
};

export type FactorRotationProps = {
    isRotationOpen: boolean;
    setIsRotationOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof FactorRotationType,
        value: number | boolean | null
    ) => void;
    data: FactorRotationType;
};

export type FactorScoresType = {
    SaveVar: boolean;
    Regression: boolean;
    Bartlett: boolean;
    Anderson: boolean;
    DisplayFactor: boolean;
};

export type FactorScoresProps = {
    isScoresOpen: boolean;
    setIsScoresOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof FactorScoresType,
        value: string | boolean | null
    ) => void;
    data: FactorScoresType;
};

export type FactorOptionsType = {
    ExcludeListWise: boolean;
    ExcludePairWise: boolean;
    ReplaceMean: boolean;
    SortSize: boolean;
    SuppressValues: boolean;
    SuppressValuesNum: number | null;
};

export type FactorOptionsProps = {
    isOptionsOpen: boolean;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof FactorOptionsType,
        value: number | boolean | null
    ) => void;
    data: FactorOptionsType;
};

export type FactorType = {
    main: FactorMainType;
    value: FactorValueType;
    descriptives: FactorDescriptivesType;
    extraction: FactorExtractionType;
    rotation: FactorRotationType;
    scores: FactorScoresType;
    options: FactorOptionsType;
};

export type FactorContainerProps = {
    onClose: () => void;
};
