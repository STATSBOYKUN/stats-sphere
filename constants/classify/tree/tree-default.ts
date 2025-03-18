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
    TreeOutput: true,
    TopDown: true,
    L2R: false,
    R2L: false,
    Table: true,
    Chart: false,
    TableAndChart: false,
    Automatic: true,
    Custom: false,
    Percent: null,
    IndVarStats: true,
    NodeDef: true,
    TreeInTableFormat: false,
};

export const TreeOutputStatsDefault: TreeOutputStatsType = {
    Summary: true,
    Risk: true,
    ClassTable: true,
    CPSP: false,
    ImpToModel: false,
    Surrogates: false,
    SummaryNP: true,
    TargetCategory: true,
    RowsMethod: "TERMINAL",
    SortOrderMethod: "DESCENDING",
    PercentIncMethod: 10,
    Display: false,
};

export const TreeOutputRulesDefault: TreeOutputRulesType = {
    GenRules: false,
    Spss: true,
    Sql: false,
    SimpleText: false,
    ValLbl: true,
    ValToCases: true,
    SelectCases: false,
    IncSurrogates: true,
    TerminalNodes: true,
    BestTerminal: false,
    NumberOfNodes: null,
    BestTerminalPercent: false,
    TermPercent: null,
    BestTerminalMinIndex: false,
    MinIndex: null,
    AllNodes: true,
    ExportRules: false,
    FileEdit: null,
};

export const TreeValidationDefault: TreeValidationType = {
    None: true,
    CrossValidation: false,
    NumberOfSample: 10,
    SplitSample: false,
    UseRandom: true,
    TrainingSample: 50,
    UseVariable: false,
    SrcVar: null,
    TargetVar: null,
    Training: true,
    TestSample: false,
};

export const TreeCriteriaGrowthDefault: TreeCriteriaGrowthType = {
    Automatic: true,
    Custom: false,
    Value: null,
    ParentNode: 100,
    ChildNode: 50,
};

export const TreeCriteriaCHAIDDefault: TreeCriteriaCHAIDType = {
    Split: 0.05,
    MergCate: 0.05,
    Pearson: true,
    LikeliHood: false,
    MaxNoText: 100,
    MinChange: 0.001,
    AdjustSign: true,
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
    EqualCrossCate: true,
    Custom: false,
    DupLowMatrix: false,
    DupUppMatrix: false,
    UseAvg: false,
};

export const TreeOptionsProfitsDefault: TreeOptionsProfitsType = {
    NoneProfits: true,
    CustomProfits: false,
};

export const TreeDefault: TreeType = {
    main: TreeMainDefault,
    categories: TreeCategoriesDefault,
    output: {
        ...TreeOutputTreeDefault,
        ...TreeOutputStatsDefault,
        ...TreeOutputRulesDefault,
    },
    validation: TreeValidationDefault,
    criteria: {
        ...TreeCriteriaGrowthDefault,
        ...TreeCriteriaCHAIDDefault,
        ...TreeCriteriaIntervalsDefault,
    },
    save: TreeSaveDefault,
    options: {
        ...TreeOptionsMissCostsDefault,
        ...TreeOptionsProfitsDefault,
    },
};
