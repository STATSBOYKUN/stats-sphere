import React from "react";

export type CorrespondenceMainType = {
    SrcVar: string | null;
    RowTargetVar: string | null;
    ColTargetVar: string | null;
}

export type CorrespondenceDialogProps = {
    isMainOpen: boolean;
    setIsMainOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDefineRangeRowOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDefineRangeColumnOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsModelOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsStatisticsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (field: keyof CorrespondenceMainType, value: string | null) => void;
    data: CorrespondenceMainType;
}

export type CorrespondenceDefineRangeRowType = {
    MinValue: number | null;
    MaxValue: number | null;
    ConstraintsList: string | null;
    None: boolean;
    CategoryEqual: boolean;
    CategorySupplemental: boolean;
    DefaultListModel: string | null;
}

export type CorrespondenceDefineRangeRowProps = {
    isDefineRangeRowOpen: boolean;
    setIsDefineRangeRowOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (field: keyof CorrespondenceDefineRangeRowType, value: string | number | boolean | null) => void;
    data: CorrespondenceDefineRangeRowType;
}

export type CorrespondenceDefineRangeColumnType = {
    MinValue: number | null;
    MaxValue: number | null;
    ConstraintsList: string | null;
    None: boolean;
    CategoryEqual: boolean;
    CategorySupplemental: boolean;
    DefaultListModel: string | null;
}

export type CorrespondenceDefineRangeColumnProps = {
    isDefineRangeColumnOpen: boolean;
    setIsDefineRangeColumnOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (field: keyof CorrespondenceDefineRangeColumnType, value: string | number | boolean | null) => void;
    data: CorrespondenceDefineRangeColumnType;
}

export type CorrespondenceModelType = {
    ChiSquare: boolean;
    Euclidean: boolean;
    RNCRemoved: boolean;
    RowRemoved: boolean;
    ColRemoved: boolean;
    RowTotals: boolean;
    ColTotals: boolean;
    Symmetrical: boolean;
    RowPrincipal: boolean;
    Custom: boolean;
    Principal: boolean;
    ColPrincipal: boolean;
    Dimensions: number | null;
    CustomDimensions: number | null;
}

export type CorrespondenceModelProps = {
    isModelOpen: boolean;
    setIsModelOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (field: keyof CorrespondenceModelType, value: string | number | boolean | null) => void;
    data: CorrespondenceModelType;
}

export type CorrespondenceStatisticsType = {
    CorrTable: boolean;
    StatRowPoints: boolean;
    StatColPoints: boolean;
    PermutationTest: boolean;
    MaxPermutations: number | null;
    RowProfile: boolean;
    ColProfile: boolean;
    RowPoints: boolean;
    ColPoints: boolean;
}

export type CorrespondenceStatisticsProps = {
    isStatisticsOpen: boolean;
    setIsStatisticsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (field: keyof CorrespondenceStatisticsType, value: number | boolean | null) => void;
    data: CorrespondenceStatisticsType;
}

export type CorrespondencePlotsType = {
    Biplot: boolean;
    RowPts: boolean;
    ColPts: boolean;
    IdScatter: number | null;
    TransRow: boolean;
    TransCol: boolean;
    IdLine: number | null;
    DisplayAll: boolean;
    RestrictDim: boolean;
    Lowest: number | null;
    Highest: number | null;
}

export type CorrespondencePlotsProps = {
    isPlotsOpen: boolean;
    setIsPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (field: keyof CorrespondencePlotsType, value: number | boolean | null) => void;
    data: CorrespondencePlotsType;
}

export type CorrespondenceType = {
    main: CorrespondenceMainType;
    defineRangeRow: CorrespondenceDefineRangeRowType;
    defineRangeColumn: CorrespondenceDefineRangeColumnType;
    model: CorrespondenceModelType;
    statistics: CorrespondenceStatisticsType;
    plots: CorrespondencePlotsType;
}

export type CorrespondenceContainerProps = {
    onClose: () => void;
}