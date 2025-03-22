import React from "react";

export type OptScaCatpcaMainType = {
    AnalysisVars: string[] | null;
    SuppleVars: string[] | null;
    LabelingVars: string[] | null;
    Dimensions: number | null;
};

export type DialogHandlers = {
    handleDefineScaleContinue: (data: OptScaCatpcaDefineScaleType) => void;
    handleDefineRangeScaleContinue: (
        data: OptScaCatpcaDefineRangeScaleType
    ) => void;
};

export type VariableInfoType = {
    [key: string]: {
        weight?: number;
        scaling: string;
        degree: number;
        interiorKnots: number;
    };
};

export type OptScaCatpcaDialogProps = {
    isMainOpen: boolean;
    setIsMainOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDefineRangeScaleOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDefineScaleOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDiscretizeOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsMissingOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOutputOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsBootstrapOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsObjectPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsCategoryPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsLoadingPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaCatpcaMainType,
        value: string[] | string | number | null
    ) => void;
    data: OptScaCatpcaMainType;
    globalVariables: string[];
    onContinue: (mainState: OptScaCatpcaMainType) => void;
    onReset: () => void;
    handleDefineRangeScaleContinue?: (
        data: OptScaCatpcaDefineRangeScaleType
    ) => void;
    handleDefineScaleContinue?: (data: OptScaCatpcaDefineScaleType) => void;
};

export type OptScaCatpcaDefineRangeScaleType = {
    Weight: number | null;
    SplineOrdinal: boolean;
    SplineNominal: boolean;
    MultipleNominal: boolean;
    Ordinal: boolean;
    Nominal: boolean;
    Numeric: boolean;
    Degree: number | null;
    InteriorKnots: number | null;
};

export type OptScaCatpcaDefineRangeScaleProps = {
    isDefineRangeScaleOpen: boolean;
    setIsDefineRangeScaleOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaCatpcaDefineRangeScaleType,
        value: string | number | boolean | null
    ) => void;
    data: OptScaCatpcaDefineRangeScaleType;
    onContinue?: (data: OptScaCatpcaDefineRangeScaleType) => void;
};

export type OptScaCatpcaDefineScaleType = {
    SplineOrdinal: boolean;
    SplineNominal: boolean;
    MultipleNominal: boolean;
    Ordinal: boolean;
    Nominal: boolean;
    Numeric: boolean;
    Degree: number | null;
    InteriorKnots: number | null;
};

export type OptScaCatpcaDefineScaleProps = {
    isDefineScaleOpen: boolean;
    setIsDefineScaleOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaCatpcaDefineScaleType,
        value: string | number | boolean | null
    ) => void;
    data: OptScaCatpcaDefineScaleType;
    onContinue?: (data: OptScaCatpcaDefineScaleType) => void;
};

export type OptScaCatpcaDiscretizeType = {
    VariablesList: string[] | null;
    Method: string | null;
    NumberOfCategories: boolean;
    NumberOfCategoriesValue: number | null;
    DistributionNormal: boolean;
    DistributionUniform: boolean;
    EqualIntervals: boolean;
    EqualIntervalsValue: number | null;
};

export type OptScaCatpcaDiscretizeProps = {
    isDiscretizeOpen: boolean;
    setIsDiscretizeOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaCatpcaDiscretizeType,
        value: string[] | string | number | boolean | null
    ) => void;
    data: OptScaCatpcaDiscretizeType;
};

export type OptScaCatpcaMissingType = {
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

export type OptScaCatpcaMissingProps = {
    isMissingOpen: boolean;
    setIsMissingOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaCatpcaMissingType,
        value: string[] | string | boolean | null
    ) => void;
    data: OptScaCatpcaMissingType;
};

export type OptScaCatpcaOptionsType = {
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
    Delta: number | null;
    Quartimax: boolean;
    Equimax: boolean;
    Promax: boolean;
    Kappa: number | null;
    Kaiser: boolean;
};

export type OptScaCatpcaOptionsProps = {
    isOptionsOpen: boolean;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaCatpcaOptionsType,
        value: string | number | boolean | null
    ) => void;
    data: OptScaCatpcaOptionsType;
};

export type OptScaCatpcaOutputType = {
    ObjectScores: boolean;
    ComponentLoadings: boolean;
    SortBySize: boolean;
    IterationHistory: boolean;
    CorreOriginalVars: boolean;
    CorreTransVars: boolean;
    Variance: boolean;
    QuantifiedVars: string[] | null;
    LabelingVars: string[] | null;
    CatQuantifications: string[] | null;
    DescStats: string[] | null;
    ObjScoresIncludeCat: string[] | null;
    ObjScoresLabelBy: string[] | null;
};

export type OptScaCatpcaOutputProps = {
    isOutputOpen: boolean;
    setIsOutputOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaCatpcaOutputType,
        value: string[] | string | boolean | null
    ) => void;
    data: OptScaCatpcaOutputType;
};

export type OptScaCatpcaSaveType = {
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
    SaveApprox: boolean;
    Approx: boolean;
    ApproxNewdata: boolean;
    ApproxDataset: string | null;
    ApproxWriteNewdata: boolean;
    ApproximationsFile: string | null;
    BTLoading: boolean;
    BTObject: boolean;
    BTCategories: boolean;
    BTEllipseCoord: boolean;
    BTNewDataset: boolean;
    BTDatasetName: string | null;
    BTWriteDataFile: boolean;
    BTFileText: string | null;
    All: boolean;
    First: boolean;
    MultiNomDim: number | null;
};

export type OptScaCatpcaSaveProps = {
    isSaveOpen: boolean;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaCatpcaSaveType,
        value: string | boolean | number | null
    ) => void;
    data: OptScaCatpcaSaveType;
};

export type OptScaCatpcaBootstrapType = {
    PerformBT: boolean;
    Balanced: boolean;
    Unbalanced: boolean;
    NumberSamples: number | null;
    ConfLevel: number | null;
    Procrustes: boolean;
    Reflection: boolean;
    ThresholdLoading: string | null;
    ThresholdObject: string | null;
    ThresholdCategory: string | null;
    OperatorLoading: string | null;
    OperatorObject: string | null;
    OperatorCategory: string | null;
    ValueLoading: number | null;
    ValueObject: number | null;
    ValueCategory: number | null;
    NumberPoints: number | null;
};

export type OptScaCatpcaBootstrapProps = {
    isBootstrapOpen: boolean;
    setIsBootstrapOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaCatpcaBootstrapType,
        value: string | boolean | number | null
    ) => void;
    data: OptScaCatpcaBootstrapType;
};

export type OptScaCatpcaObjectPlotsType = {
    ObjectPoints: boolean;
    Biplot: boolean;
    BiLoadings: boolean;
    BiCentroids: boolean;
    Triplot: boolean;
    BTIncludeAllVars: boolean;
    BTIncludeSelectedVars: boolean;
    BTAvailableVars: string[] | null;
    BTSelectedVars: string[] | null;
    LabelObjLabelByCaseNumber: boolean;
    LabelObjLabelByVar: boolean;
    LabelObjAvailableVars: string[] | null;
    LabelObjSelectedVars: string[] | null;
};

export type OptScaCatpcaObjectPlotsProps = {
    isObjectPlotsOpen: boolean;
    setIsObjectPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaCatpcaObjectPlotsType,
        value: string[] | string | boolean | null
    ) => void;
    data: OptScaCatpcaObjectPlotsType;
};

export type OptScaCatpcaCategoryPlotsType = {
    SourceVar: string[] | null;
    CatPlotsVar: string[] | null;
    JointCatPlotsVar: string[] | null;
    TransPlotsVar: string[] | null;
    DimensionsForMultiNom: number | null;
    InclResidPlots: boolean;
    PrjCentroidsOfVar: string | null;
    PrjCentroidsOntoVar: string[] | null;
};

export type OptScaCatpcaCategoryPlotsProps = {
    isCategoryPlotsOpen: boolean;
    setIsCategoryPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaCatpcaCategoryPlotsType,
        value: string[] | string | number | boolean | null
    ) => void;
    data: OptScaCatpcaCategoryPlotsType;
};

export type OptScaCatpcaLoadingPlotsType = {
    Variance: boolean;
    DisplayCompLoadings: boolean;
    LoadingIncludeAllVars: boolean;
    LoadingIncludeSelectedVars: boolean;
    LoadingAvailableVars: string[] | null;
    LoadingSelectedVars: string[] | null;
    IncludeCentroids: boolean;
    IncludeCentroidsIncludeAllVars: boolean;
    IncludeCentroidsIncludeSelectedVars: boolean;
    IncludeCentroidsAvailableVars: string[] | null;
    IncludeCentroidsSelectedVars: string[] | null;
};

export type OptScaCatpcaLoadingPlotsProps = {
    isLoadingPlotsOpen: boolean;
    setIsLoadingPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof OptScaCatpcaLoadingPlotsType,
        value: string[] | string | boolean | null
    ) => void;
    data: OptScaCatpcaLoadingPlotsType;
};

export type OptScaCatpcaType = {
    main: OptScaCatpcaMainType;
    defineRangeScale: OptScaCatpcaDefineRangeScaleType;
    defineScale: OptScaCatpcaDefineScaleType;
    discretize: OptScaCatpcaDiscretizeType;
    missing: OptScaCatpcaMissingType;
    options: OptScaCatpcaOptionsType;
    output: OptScaCatpcaOutputType;
    save: OptScaCatpcaSaveType;
    bootstrap: OptScaCatpcaBootstrapType;
    objectPlots: OptScaCatpcaObjectPlotsType;
    categoryPlots: OptScaCatpcaCategoryPlotsType;
    loadingPlots: OptScaCatpcaLoadingPlotsType;
};

export type OptScaCatpcaContainerProps = {
    onClose: () => void;
};
