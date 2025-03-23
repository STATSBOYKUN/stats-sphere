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
    Dimensions: 2,
};

export const OptScaMCADefineVariableDefault: OptScaMCADefineVariableType = {
    VariableWeight: 1,
};

export const OptScaMCADiscretizeDefault: OptScaMCADiscretizeType = {
    VariablesList: null,
    Method: "Grouping",
    NumberOfCategories: true,
    NumberOfCategoriesValue: 7,
    DistributionNormal: true,
    DistributionUniform: false,
    EqualIntervals: false,
    EqualIntervalsValue: null,
};

export const OptScaMCAMissingDefault: OptScaMCAMissingType = {
    CurrentTargetList: null,
    AnalysisVariables: null,
    SupplementaryVariables: null,
    MissingValuesExclude: true,
    ExcludeMode: true,
    ExcludeExtraCat: false,
    ExcludeRandomCat: false,
    MissingValuesImpute: false,
    ImputeMode: true,
    ImputeExtraCat: false,
    ImputeRandomCat: false,
    ExcludeObjects: false,
};

export const OptScaMCAOptionsDefault: OptScaMCAOptionsType = {
    RangeOfCases: true,
    First: null,
    Last: null,
    SingleCase: false,
    SingleCaseValue: null,
    NormalizationMethod: "VariablePrincipal",
    NormCustomValue: null,
    Convergence: 0.00001,
    MaximumIterations: 100,
    VariableLabels: true,
    LimitForLabel: 20,
    VariableNames: false,
    PlotDimDisplayAll: true,
    PlotDimRestrict: false,
    PlotDimLoDim: null,
    PlotDimHiDim: null,
    ConfigurationMethod: "None",
    ConfigFile: null,
    None: true,
    Varimax: false,
    Oblimin: false,
    DeltaFloat: 0,
    Quartimax: false,
    Equimax: false,
    Promax: false,
    KappaFloat: 4,
    Kaiser: true,
};

export const OptScaMCAOutputDefault: OptScaMCAOutputType = {
    QuantifiedVars: null,
    LabelingVars: null,
    CatQuantifications: null,
    DescStats: null,
    ObjScoresIncludeCat: null,
    ObjScoresLabelBy: null,
    ObjectScores: false,
    DiscMeasures: true,
    IterationHistory: false,
    CorreOriginalVars: false,
    CorreTransVars: true,
};

export const OptScaMCASaveDefault: OptScaMCASaveType = {
    Discretized: false,
    DiscNewdata: true,
    DiscDataset: null,
    DiscWriteNewdata: false,
    DiscretizedFile: null,
    SaveTrans: false,
    Trans: false,
    TransNewdata: true,
    TransDataset: null,
    TransWriteNewdata: false,
    TransformedFile: null,
    SaveObjScores: false,
    ObjScores: false,
    ObjNewdata: true,
    ObjDataset: null,
    ObjWriteNewdata: false,
    ObjScoresFile: null,
    All: true,
    First: false,
    MultiNomDim: null,
};

export const OptScaMCAObjectPlotsDefault: OptScaMCAObjectPlotsType = {
    ObjectPoints: true,
    Biplot: false,
    BTIncludeAllVars: true,
    BTIncludeSelectedVars: false,
    BTAvailableVars: null,
    BTSelectedVars: null,
    LabelObjLabelByCaseNumber: true,
    LabelObjLabelByVar: false,
    LabelObjAvailableVars: null,
    LabelObjSelectedVars: null,
};

export const OptScaMCAVariablePlotsDefault: OptScaMCAVariablePlotsType = {
    DimensionsForMultiNom: 2,
    SourceVar: null,
    CatPlotsVar: null,
    JointCatPlotsVar: null,
    TransPlotsVar: null,
    InclResidPlots: false,
    DiscMeasuresVar: null,
    DisplayPlot: true,
    UseAllVars: true,
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
