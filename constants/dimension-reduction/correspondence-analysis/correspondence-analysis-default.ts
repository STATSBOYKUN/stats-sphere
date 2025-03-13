import {
    CorrespondenceType,
    CorrespondenceDefineRangeColumnType,
    CorrespondenceDefineRangeRowType,
    CorrespondenceMainType,
    CorrespondenceModelType,
    CorrespondencePlotsType,
    CorrespondenceStatisticsType,
} from "@/models/dimension-reduction/correspondence-analysis/correspondence-analysis";

export const CorrespondenceMainDefault: CorrespondenceMainType = {
    RowTargetVar: null,
    ColTargetVar: null,
};

export const CorrespondenceDefineRangeRowDefault: CorrespondenceDefineRangeRowType =
    {
        MinValue: null,
        MaxValue: null,
        ConstraintsList: null,
        None: false,
        CategoryEqual: false,
        CategorySupplemental: false,
        DefaultListModel: null,
    };

export const CorrespondenceDefineRangeColumnDefault: CorrespondenceDefineRangeColumnType =
    {
        MinValue: null,
        MaxValue: null,
        ConstraintsList: null,
        None: false,
        CategoryEqual: false,
        CategorySupplemental: false,
        DefaultListModel: null,
    };

export const CorrespondenceModelDefault: CorrespondenceModelType = {
    ChiSquare: false,
    Euclidean: false,
    RNCRemoved: false,
    RowRemoved: false,
    ColRemoved: false,
    RowTotals: false,
    ColTotals: false,
    Symmetrical: false,
    RowPrincipal: false,
    Custom: false,
    Principal: false,
    ColPrincipal: false,
    Dimensions: null,
    CustomDimensions: null,
};

export const CorrespondenceStatisticsDefault: CorrespondenceStatisticsType = {
    CorrTable: false,
    StatRowPoints: false,
    StatColPoints: false,
    PermutationTest: false,
    MaxPermutations: null,
    RowProfile: false,
    ColProfile: false,
    RowPoints: false,
    ColPoints: false,
};

export const CorrespondencePlotsDefault: CorrespondencePlotsType = {
    Biplot: false,
    RowPts: false,
    ColPts: false,
    IdScatter: null,
    TransRow: false,
    TransCol: false,
    IdLine: null,
    DisplayAll: false,
    RestrictDim: false,
    Lowest: null,
    Highest: null,
};

export const CorrespondenceDefault: CorrespondenceType = {
    main: CorrespondenceMainDefault,
    defineRangeRow: CorrespondenceDefineRangeRowDefault,
    defineRangeColumn: CorrespondenceDefineRangeColumnDefault,
    model: CorrespondenceModelDefault,
    statistics: CorrespondenceStatisticsDefault,
    plots: CorrespondencePlotsDefault,
};
