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
    ChiSquare: true,
    Euclidean: false,
    RNCRemoved: true,
    RowRemoved: false,
    ColRemoved: false,
    RowTotals: false,
    ColTotals: false,
    Symmetrical: true,
    RowPrincipal: false,
    Custom: false,
    Principal: false,
    ColPrincipal: false,
    Dimensions: 2,
    CustomDimensions: 0,
};

export const CorrespondenceStatisticsDefault: CorrespondenceStatisticsType = {
    CorrTable: true,
    StatRowPoints: true,
    StatColPoints: true,
    PermutationTest: false,
    MaxPermutations: 1,
    RowProfile: false,
    ColProfile: false,
    RowPoints: false,
    ColPoints: false,
};

export const CorrespondencePlotsDefault: CorrespondencePlotsType = {
    Biplot: true,
    RowPts: false,
    ColPts: false,
    IdScatter: 20,
    TransRow: false,
    TransCol: false,
    IdLine: 20,
    DisplayAll: true,
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
