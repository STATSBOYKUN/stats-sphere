import {
    OptScaMCADefineVariableType,
    OptScaMCADiscretizeType,
    OptScaMCAMainType,
    OptScaMCAMissingType,
    OptScaMCAObjectPlotsType,
    OptScaMCAOptionsType,
    OptScaMCAOutputType,
    OptScaMCASaveType,
    OptScaMCAType,
    OptScaMCAVariablePlotsType,
} from "@/models/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca";

export const OptScaMCAMainDefault: OptScaMCAMainType = {
    AnalysisVars: null,
    SuppleVars: null,
    LabelingVars: null,
    Dimensions: null,
};

export const OptScaMCADefineVariableDefault: OptScaMCADefineVariableType = {
    VariableWeight: null,
};

export const OptScaMCADiscretizeDefault: OptScaMCADiscretizeType = {
    VariablesList: null,
    Method: null,
    NumberOfCategories: false,
    NumberOfCategoriesValue: null,
    DistributionNormal: false,
    DistributionUniform: false,
    EqualIntervals: false,
    EqualIntervalsValue: null,
};

export const OptScaMCAMissingDefault: OptScaMCAMissingType = {
    CurrentTargetList: null,
    AnalysisVariables: null,
    SupplementaryVariables: null,
    MissingValuesExclude: false,
    ExcludeMode: false,
    ExcludeExtraCat: false,
    ExcludeRandomCat: false,
    MissingValuesImpute: false,
    ImputeMode: false,
    ImputeExtraCat: false,
    ImputeRandomCat: false,
    ExcludeObjects: false,
};

export const OptScaMCAOptionsDefault: OptScaMCAOptionsType = {
    RangeOfCases: false,
    First: null,
    Last: null,
    SingleCase: false,
    SingleCaseValue: null,
    NormalizationMethod: null,
    NormCustomValue: null,
    Convergence: null,
    MaximumIterations: null,
    VariableLabels: false,
    LimitForLabel: null,
    VariableNames: false,
    PlotDimDisplayAll: false,
    PlotDimRestrict: false,
    PlotDimLoDim: null,
    PlotDimHiDim: null,
    ConfigurationMethod: null,
    ConfigFile: null,
    None: false,
    Varimax: false,
    Oblimin: false,
    DeltaFloat: null,
    Quartimax: false,
    Equimax: false,
    Promax: false,
    KappaFloat: null,
    Kaiser: false,
};

export const OptScaMCAOutputDefault: OptScaMCAOutputType = {
    QuantifiedVars: null,
    LabelingVars: null,
    CatQuantifications: null,
    DescStats: null,
    ObjScoresIncludeCat: null,
    ObjScoresLabelBy: null,
    ObjectScores: false,
    DiscMeasures: false,
    IterationHistory: false,
    CorreOriginalVars: false,
    CorreTransVars: false,
};

export const OptScaMCASaveDefault: OptScaMCASaveType = {
    Discretized: false,
    DiscNewdata: false,
    DiscDataset: null,
    DiscWriteNewdata: false,
    DiscretizedFile: null,
    SaveTrans: false,
    Trans: false,
    TransNewdata: false,
    TransDataset: null,
    TransWriteNewdata: false,
    TransformedFile: null,
    SaveObjScores: false,
    ObjScores: false,
    ObjNewdata: false,
    ObjDataset: null,
    ObjWriteNewdata: false,
    ObjScoresFile: null,
    All: false,
    First: false,
    MultiNomDim: null,
};

export const OptScaMCAObjectPlotsDefault: OptScaMCAObjectPlotsType = {
    ObjectPoints: false,
    Biplot: false,
    BTIncludeAllVars: false,
    BTIncludeSelectedVars: false,
    BTAvailableVars: null,
    BTSelectedVars: null,
    LabelObjLabelByCaseNumber: false,
    LabelObjLabelByVar: false,
    LabelObjAvailableVars: null,
    LabelObjSelectedVars: null,
};

export const OptScaMCAVariablePlotsDefault: OptScaMCAVariablePlotsType = {
    DimensionsForMultiNom: null,
    SourceVar: null,
    CatPlotsVar: null,
    JointCatPlotsVar: null,
    TransPlotsVar: null,
    InclResidPlots: false,
    DiscMeasuresVar: null,
    DisplayPlot: false,
    UseAllVars: false,
    UseSelectedVars: false,
};

export const OptScaMCADefault: OptScaMCAType = {
    main: OptScaMCAMainDefault,
    defineVariable: OptScaMCADefineVariableDefault,
    discretize: OptScaMCADiscretizeDefault,
    missing: OptScaMCAMissingDefault,
    options: OptScaMCAOptionsDefault,
    output: OptScaMCAOutputDefault,
    save: OptScaMCASaveDefault,
    objectPlots: OptScaMCAObjectPlotsDefault,
    variablePlots: OptScaMCAVariablePlotsDefault,
};
