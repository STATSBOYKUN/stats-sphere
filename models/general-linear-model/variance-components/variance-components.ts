import React from "react";

export type VarianceCompsMainType = {
    DepVar: string | null;
    FixFactor: string[] | null;
    RandFactor: string[] | null;
    Covar: string[] | null;
    WlsWeight: string | null;
};

export type VarianceCompsDialogProps = {
    isMainOpen: boolean;
    setIsMainOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsModelOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof VarianceCompsMainType,
        value: string[] | string | null
    ) => void;
    data: VarianceCompsMainType;
    globalVariables: string[];
    onContinue: (mainState: VarianceCompsMainType) => void;
    onReset: () => void;
};

export type VarianceCompsModelType = {
    NonCust: boolean;
    Custom: boolean;
    FactorsVar: string[] | null;
    TermsVar: string | null;
    FactorsModel: string[] | null;
    BuildTermMethod: string | null;
    Intercept: boolean;
};

export type VarianceCompsModelProps = {
    isModelOpen: boolean;
    setIsModelOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof VarianceCompsModelType,
        value: string[] | string | boolean | null
    ) => void;
    data: VarianceCompsModelType;
};

export type VarianceCompsOptionsType = {
    Minque: boolean;
    Anova: boolean;
    MaxLikelihood: boolean;
    ResMaxLikelihood: boolean;
    Uniform: boolean;
    Zero: boolean;
    TypeI: boolean;
    TypeIII: boolean;
    ConvergenceMethod: string | null;
    MaxIter: number | null;
    SumOfSquares: boolean;
    ExpectedMeanSquares: boolean;
    IterationHistory: boolean;
    InStepsOf: number | null;
};

export type VarianceCompsOptionsProps = {
    isOptionsOpen: boolean;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof VarianceCompsOptionsType,
        value: string | number | boolean | null
    ) => void;
    data: VarianceCompsOptionsType;
};

export type VarianceCompsSaveType = {
    VarCompEst: boolean;
    CompCovar: boolean;
    CovMatrix: boolean;
    CorMatrix: boolean;
    CreateNewDataset: boolean;
    DatasetName: string | null;
    WriteNewDataFile: boolean;
    FilePath: string | null;
};

export type VarianceCompsSaveProps = {
    isSaveOpen: boolean;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof VarianceCompsSaveType,
        value: string | boolean | null
    ) => void;
    data: VarianceCompsSaveType;
};

export type VarianceCompsType = {
    main: VarianceCompsMainType;
    model: VarianceCompsModelType;
    options: VarianceCompsOptionsType;
    save: VarianceCompsSaveType;
};

export type VarianceCompsContainerProps = {
    onClose: () => void;
};
