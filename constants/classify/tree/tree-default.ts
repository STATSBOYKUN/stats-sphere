import {
    TreeType,
    TreeCategoriesType,
    TreeCriteriaCHAIDType,
    TreeCriteriaGrowthType,
    TreeCriteriaIntervalsType,
    TreeMainType,
    TreeOptionsMissCostsType,
    TreeOptionsProfitsType,
    TreeOutputRulesType,
    TreeOutputStatsType,
    TreeOutputTreeType,
    TreeSaveType,
    TreeValidationType,
} from "@/models/classify/tree/tree";

export const TreeMainDefault: TreeMainType = {
    DependentTargetVar: null,
    IndependentTargetVar: null,
    Force: false,
    InfluenceTargetVar: null,
    GrowingMethod: null,
};

export const TreeCategoriesDefault: TreeCategoriesType = {
    TargetVar: null,
    ModelVar: null,
};

export const TreeOutputTreeDefault: TreeOutputTreeType = {
    TreeOutput: false,
    TopDown: false,
    L2R: false,
    R2L: false,
    Table: false,
    Chart: false,
    TableAndChart: false,
    Automatic: false,
    Custom: false,
    Percent: null,
    IndVarStats: false,
    NodeDef: false,
    TreeInTableFormat: false,
};

export const TreeOutputStatsDefault: TreeOutputStatsType = {
    Summary: false,
    Risk: false,
    ClassTable: false,
    CPSP: false,
    ImpToModel: false,
    Surrogates: false,
    SummaryNP: false,
    TargetCategory: false,
    RowsMethod: null,
    SortOrderMethod: null,
    PercentIncMethod: null,
    Display: false,
};

export const TreeOutputRulesDefault: TreeOutputRulesType = {
    GenRules: false,
    Spss: false,
    Sql: false,
    SimpleText: false,
    ValLbl: false,
    ValToCases: false,
    SelectCases: false,
    IncSurrogates: false,
    TerminalNodes: false,
    BestTerminal: false,
    NumberOfNodes: null,
    BestTerminalPercent: false,
    TermPercent: null,
    BestTerminalMinIndex: false,
    MinIndex: null,
    AllNodes: false,
    ExportRules: false,
    FileEdit: null,
};

export const TreeValidationDefault: TreeValidationType = {
    None: false,
    CrossValidation: false,
    NumberOfSample: null,
    SplitSample: false,
    UseRandom: false,
    TrainingSample: null,
    UseVariable: false,
    SrcVar: null,
    TargetVar: null,
    Training: false,
    TestSample: false,
};

export const TreeCriteriaGrowthDefault: TreeCriteriaGrowthType = {
    Automatic: false,
    Custom: false,
    Value: null,
    ParentNode: null,
    ChildNode: null,
};

export const TreeCriteriaCHAIDDefault: TreeCriteriaCHAIDType = {
    Split: null,
    MergCate: null,
    Pearson: false,
    LikeliHood: false,
    MaxNoText: null,
    MinChange: null,
    AdjustSign: false,
    Allow: false,
};

export const TreeCriteriaIntervalsDefault: TreeCriteriaIntervalsType = {
    FixedNo: false,
    ValueFixed: null,
    CustomInterval: false,
};

export const TreeSaveDefault: TreeSaveType = {
    TerminalNode: false,
    PredictedValue: false,
    PredictedProbabilities: false,
    SampleAssign: false,
    TrainingSample: false,
    TrainingFile: null,
    TestSample: false,
    TestSampleFile: null,
};

export const TreeOptionsMissCostsDefault: TreeOptionsMissCostsType = {
    EqualCrossCate: false,
    Custom: false,
    DupLowMatrix: false,
    DupUppMatrix: false,
    UseAvg: false,
};

export const TreeOptionsProfitsDefault: TreeOptionsProfitsType = {
    NoneProfits: false,
    CustomProfits: false,
};

export const TreeDefault: TreeType = {
    main: TreeMainDefault,
    categories: TreeCategoriesDefault,
    output:
        TreeOutputTreeDefault &&
        TreeOutputStatsDefault &&
        TreeOutputRulesDefault,
    validation: TreeValidationDefault,
    criteria:
        TreeCriteriaGrowthDefault &&
        TreeCriteriaCHAIDDefault &&
        TreeCriteriaIntervalsDefault,
    save: TreeSaveDefault,
    options: TreeOptionsMissCostsDefault && TreeOptionsProfitsDefault,
};
