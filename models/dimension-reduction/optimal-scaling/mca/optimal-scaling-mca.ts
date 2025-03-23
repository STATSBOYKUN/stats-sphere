import React from "react";

export type OptScaMCAMainType = {
    AnalysisVars: string[] | null;
    SuppleVars: string[] | null;
    LabelingVars: string[] | null;
    Dimensions: number | null;
};

export type DialogHandlers = {
    handleDefineVariableContinue: (data: OptScaMCADefineVariableType) => void;
};

export type VariableInfoType = {
    [key: string]: {
        weight?: number;
    };
};

export type OptScaMCADialogProps = {
    isMainOpen: boolean;
    setIsMainOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDefineVariableOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDiscretizeOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsMissingOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOutputOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsObjectPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsVariablePlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaMCAMainType,
        value: string[] | string | number | null
    ) => void;
    data: OptScaMCAMainType;
    globalVariables: string[];
    onContinue: (mainState: OptScaMCAMainType) => void;
    onReset: () => void;
};

export type OptScaMCADefineVariableType = {
    VariableWeight: number | null;
};

export type OptScaMCADefineVariableProps = {
    isDefineVariableOpen: boolean;
    setIsDefineVariableOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaMCADefineVariableType,
        value: number | null
    ) => void;
    data: OptScaMCADefineVariableType;
    onContinue?: (data: OptScaMCADefineVariableType) => void;
};

export type OptScaMCADiscretizeType = {
    VariablesList: string[] | null;
    Method: string | null;
    NumberOfCategories: boolean;
    NumberOfCategoriesValue: number | null;
    DistributionNormal: boolean;
    DistributionUniform: boolean;
    EqualIntervals: boolean;
    EqualIntervalsValue: number | null;
};

export type OptScaMCADiscretizeProps = {
    isDiscretizeOpen: boolean;
    setIsDiscretizeOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaMCADiscretizeType,
        value: string[] | string | number | boolean | null
    ) => void;
    data: OptScaMCADiscretizeType;
};

export type OptScaMCAMissingType = {
    CurrentTargetList: string[] | null;
    AnalysisVariables: string[] | null;
    SupplementaryVariables: string[] | null;
    MissingValuesExclude: boolean;
    ExcludeMode: boolean;
    ExcludeExtraCat: boolean;
    ExcludeRandomCat: boolean;
    MissingValuesImpute: boolean;
    ImputeMode: boolean;
    ImputeExtraCat: boolean;
    ImputeRandomCat: boolean;
    ExcludeObjects: boolean;
};

export type OptScaMCAMissingProps = {
    isMissingOpen: boolean;
    setIsMissingOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaMCAMissingType,
        value: string[] | string | boolean | null
    ) => void;
    data: OptScaMCAMissingType;
};

export type OptScaMCAOptionsType = {
    RangeOfCases: boolean;
    First: string | null;
    Last: string | null;
    SingleCase: boolean;
    SingleCaseValue: string | null;
    NormalizationMethod: string | null;
    NormCustomValue: number | null;
    Convergence: number | null;
    MaximumIterations: number | null;
    VariableLabels: boolean;
    LimitForLabel: number | null;
    VariableNames: boolean;
    PlotDimDisplayAll: boolean;
    PlotDimRestrict: boolean;
    PlotDimLoDim: number | null;
    PlotDimHiDim: number | null;
    ConfigurationMethod: string | null;
    ConfigFile: string | null;
    None: boolean;
    Varimax: boolean;
    Oblimin: boolean;
    DeltaFloat: number | null;
    Quartimax: boolean;
    Equimax: boolean;
    Promax: boolean;
    KappaFloat: number | null;
    Kaiser: boolean;
};

export type OptScaMCAOptionsProps = {
    isOptionsOpen: boolean;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaMCAOptionsType,
        value: string | number | boolean | null
    ) => void;
    data: OptScaMCAOptionsType;
};

export type OptScaMCAOutputType = {
    QuantifiedVars: string[] | null;
    LabelingVars: string[] | null;
    CatQuantifications: string[] | null;
    DescStats: string[] | null;
    ObjScoresIncludeCat: string[] | null;
    ObjScoresLabelBy: string[] | null;
    ObjectScores: boolean;
    DiscMeasures: boolean;
    IterationHistory: boolean;
    CorreOriginalVars: boolean;
    CorreTransVars: boolean;
};

export type OptScaMCAOutputProps = {
    isOutputOpen: boolean;
    setIsOutputOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaMCAOutputType,
        value: string[] | string | boolean | null
    ) => void;
    data: OptScaMCAOutputType;
};

export type OptScaMCASaveType = {
    Discretized: boolean;
    DiscNewdata: boolean;
    DiscDataset: string | null;
    DiscWriteNewdata: boolean;
    DiscretizedFile: string | null;
    SaveTrans: boolean;
    Trans: boolean;
    TransNewdata: boolean;
    TransDataset: string | null;
    TransWriteNewdata: boolean;
    TransformedFile: string | null;
    SaveObjScores: boolean;
    ObjScores: boolean;
    ObjNewdata: boolean;
    ObjDataset: string | null;
    ObjWriteNewdata: boolean;
    ObjScoresFile: string | null;
    All: boolean;
    First: boolean;
    MultiNomDim: number | null;
};

export type OptScaMCASaveProps = {
    isSaveOpen: boolean;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaMCASaveType,
        value: string | boolean | number | null
    ) => void;
    data: OptScaMCASaveType;
};

export type OptScaMCAObjectPlotsType = {
    ObjectPoints: boolean;
    Biplot: boolean;
    BTIncludeAllVars: boolean;
    BTIncludeSelectedVars: boolean;
    BTAvailableVars: string[] | null;
    BTSelectedVars: string[] | null;
    LabelObjLabelByCaseNumber: boolean;
    LabelObjLabelByVar: boolean;
    LabelObjAvailableVars: string[] | null;
    LabelObjSelectedVars: string[] | null;
};

export type OptScaMCAObjectPlotsProps = {
    isObjectPlotsOpen: boolean;
    setIsObjectPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaMCAObjectPlotsType,
        value: string[] | string | boolean | null
    ) => void;
    data: OptScaMCAObjectPlotsType;
};

export type OptScaMCAVariablePlotsType = {
    DimensionsForMultiNom: number | null;
    SourceVar: string[] | null;
    CatPlotsVar: string[] | null;
    JointCatPlotsVar: string[] | null;
    TransPlotsVar: string[] | null;
    InclResidPlots: boolean;
    DiscMeasuresVar: string[] | null;
    DisplayPlot: boolean;
    UseAllVars: boolean;
    UseSelectedVars: boolean;
};

export type OptScaMCAVariablePlotsProps = {
    isVariablePlotsOpen: boolean;
    setIsVariablePlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaMCAVariablePlotsType,
        value: string[] | string | boolean | number | null
    ) => void;
    data: OptScaMCAVariablePlotsType;
};

export type OptScaMCAType = {
    main: OptScaMCAMainType;
    defineVariable: OptScaMCADefineVariableType;
    discretize: OptScaMCADiscretizeType;
    missing: OptScaMCAMissingType;
    options: OptScaMCAOptionsType;
    output: OptScaMCAOutputType;
    save: OptScaMCASaveType;
    objectPlots: OptScaMCAObjectPlotsType;
    variablePlots: OptScaMCAVariablePlotsType;
};

export type OptScaMCAContainerProps = {
    onClose: () => void;
};
