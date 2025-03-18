import React from "react";

export type TreeMainType = {
    DependentTargetVar: string | null;
    IndependentTargetVar: string[] | null;
    InfluenceTargetVar: string | null;
    Force: boolean;
    GrowingMethod: string | null;
};

export type TreeDialogProps = {
    isMainOpen: boolean;
    setIsMainOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsCategoriesOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOutputOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsValidationOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsCriteriaOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof TreeMainType,
        value: string[] | string | boolean | null
    ) => void;
    data: TreeMainType;
    globalVariables: string[];
    onContinue: (mainState: TreeMainType) => void;
    onReset: () => void;
};

export type TreeCategoriesType = {
    TargetVar: string | null;
    ModelVar: string | null;
};

export type TreeCategoriesProps = {
    isCategoriesOpen: boolean;
    setIsCategoriesOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof TreeCategoriesType,
        value: string | boolean | null
    ) => void;
    data: TreeCategoriesType;
};

export type TreeOutputTreeType = {
    TreeOutput: boolean;
    TopDown: boolean;
    L2R: boolean;
    R2L: boolean;
    Table: boolean;
    Chart: boolean;
    TableAndChart: boolean;
    Automatic: boolean;
    Custom: boolean;
    Percent: number | null;
    IndVarStats: boolean;
    NodeDef: boolean;
    TreeInTableFormat: boolean;
};

export type TreeOutputStatsType = {
    Summary: boolean;
    Risk: boolean;
    ClassTable: boolean;
    CPSP: boolean;
    ImpToModel: boolean;
    Surrogates: boolean;
    SummaryNP: boolean;
    TargetCategory: boolean;
    RowsMethod: string | null;
    SortOrderMethod: string | null;
    PercentIncMethod: number | null;
    Display: boolean;
};

export type TreeOutputRulesType = {
    GenRules: boolean;
    Spss: boolean;
    Sql: boolean;
    SimpleText: boolean;
    ValLbl: boolean;
    ValToCases: boolean;
    SelectCases: boolean;
    IncSurrogates: boolean;
    TerminalNodes: boolean;
    BestTerminal: boolean;
    NumberOfNodes: number | null;
    BestTerminalPercent: boolean;
    TermPercent: number | null;
    BestTerminalMinIndex: boolean;
    MinIndex: number | null;
    AllNodes: boolean;
    ExportRules: boolean;
    FileEdit: string | null;
};

export type TreeOutputProps = {
    isOutputOpen: boolean;
    setIsOutputOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof (
            | TreeOutputTreeType
            | TreeOutputStatsType
            | TreeOutputRulesType
        ),
        value: number | string | boolean | null
    ) => void;
    data: TreeOutputTreeType & TreeOutputStatsType & TreeOutputRulesType;
};

export type TreeValidationType = {
    None: boolean;
    CrossValidation: boolean;
    NumberOfSample: number | null;
    SplitSample: boolean;
    UseRandom: boolean;
    TrainingSample: number | null;
    UseVariable: boolean;
    SrcVar: string[] | null;
    TargetVar: string | null;
    Training: boolean;
    TestSample: boolean;
};

export type TreeValidationProps = {
    isValidationOpen: boolean;
    setIsValidationOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof TreeValidationType,
        value: string[] | number | string | boolean | null
    ) => void;
    data: TreeValidationType;
};

export type TreeCriteriaGrowthType = {
    Automatic: boolean;
    Custom: boolean;
    Value: number | null;
    ParentNode: number | null;
    ChildNode: number | null;
};

export type TreeCriteriaCHAIDType = {
    Split: number | null;
    MergCate: number | null;
    Pearson: boolean;
    LikeliHood: boolean;
    MaxNoText: number | null;
    MinChange: number | null;
    AdjustSign: boolean;
    Allow: boolean;
};

export type TreeCriteriaIntervalsType = {
    FixedNo: boolean;
    ValueFixed: number | null;
    CustomInterval: boolean;
};

export type TreeCriteriaProps = {
    isCriteriaOpen: boolean;
    setIsCriteriaOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof (
            | TreeCriteriaGrowthType
            | TreeCriteriaCHAIDType
            | TreeCriteriaIntervalsType
        ),
        value: string | number | boolean | null
    ) => void;
    data: TreeCriteriaGrowthType &
        TreeCriteriaCHAIDType &
        TreeCriteriaIntervalsType;
};

export type TreeSaveType = {
    TerminalNode: boolean;
    PredictedValue: boolean;
    PredictedProbabilities: boolean;
    SampleAssign: boolean;
    TrainingSample: boolean;
    TrainingFile: string | null;
    TestSample: boolean;
    TestSampleFile: string | null;
};

export type TreeSaveProps = {
    isSaveOpen: boolean;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof TreeSaveType,
        value: string | boolean | null
    ) => void;
    data: TreeSaveType;
};

export type TreeOptionsMissCostsType = {
    EqualCrossCate: boolean;
    Custom: boolean;
    DupLowMatrix: boolean;
    DupUppMatrix: boolean;
    UseAvg: boolean;
};

export type TreeOptionsProfitsType = {
    NoneProfits: boolean;
    CustomProfits: boolean;
};

export type TreeOptionsProps = {
    isOptionsOpen: boolean;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof (TreeOptionsMissCostsType | TreeOptionsProfitsType),
        value: boolean | null
    ) => void;
    data: TreeOptionsMissCostsType & TreeOptionsProfitsType;
};

export type TreeType = {
    main: TreeMainType;
    categories: TreeCategoriesType;
    output: TreeOutputTreeType & TreeOutputStatsType & TreeOutputRulesType;
    validation: TreeValidationType;
    criteria: TreeCriteriaGrowthType &
        TreeCriteriaCHAIDType &
        TreeCriteriaIntervalsType;
    save: TreeSaveType;
    options: TreeOptionsMissCostsType & TreeOptionsProfitsType;
};

export type TreeContainerProps = {
    onClose: () => void;
};
