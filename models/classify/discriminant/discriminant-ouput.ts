// Definisi interface untuk data statistik input
export interface JsonData {
    case_processing_summary: {
        valid_count: number;
        valid_percent: number;
        excluded_missing_group: number;
        excluded_missing_group_percent: number;
        excluded_missing_var: number;
        excluded_missing_var_percent: number;
        excluded_both: number;
        excluded_both_percent: number;
        excluded_total: number;
        excluded_total_percent: number;
        total_count: number;
        total_percent: number;
    };
    group_statistics: {
        group_values: number[];
        variable_names: string[];
        means: number[][];
        std_deviations: number[][];
        unweighted_counts: number[];
        weighted_counts: number[];
        total_means: number[];
        total_std_deviations: number[];
        total_unweighted_count: number;
        total_weighted_count: number;
    };
    wilks_lambda: {
        f: number;
        lambda: number;
        df1: number;
        df2: number;
        sig: number;
    }[];
    pooled_covariance: number[][];
    pooled_correlation: number[][];
    group_covariance: number[][][];
    total_covariance: number[][];
    box_m: {
        m: number;
        f: number;
        df1: number;
        df2: number;
        p_value: number;
        log_determinants: [number, number][];
        pooled_log_determinant: number;
    };
    eigen_stats?: {
        eigenvalue: number;
        pct_of_variance: number;
        cumulative_pct: number;
        canonical_correlation: number;
    }[];
    functions_lambda?: {
        chi_square: number;
        df: number;
        p_value: number;
    }[];
    std_coefficients?: number[][];
    structure_matrix?: number[][];
    group_centroids?: number[][];
    classification_functions?: number[][];
    classification_results?: {
        original_count: number[][];
        original_percentage: number[][];
        cross_val_count: number[][];
        cross_val_percentage: number[][];
        original_correct_pct: number;
        cross_val_correct_pct: number;
    };
    stepwise_statistics?: {
        method: string;
        criteria: {
            criteria_type: string;
            entry: number;
            removal: number;
            v_to_enter: number;
        };
        display: {
            summary_steps: boolean;
            pairwise_distances: boolean;
        };
        steps: {
            step: number;
            variable_index: number;
            variable_name: string;
            action: string;
            statistic: number;
            df1: number;
            df2: number;
            df3: number;
            wilks_lambda: number;
            wilks_df1: number;
            wilks_df2: number;
            exact_f: number;
            exact_f_df1: number;
            exact_f_df2: number;
            significance: number;
        }[];
        variables_in_analysis: {
            step: number;
            variable_index: number;
            variable_name: string;
            tolerance: number;
            f_to_remove: number;
        }[];
        variables_not_in_analysis: {
            step: number;
            variable_index: number;
            variable_name: string;
            tolerance: number;
            min_tolerance: number;
            f_to_enter: number;
            wilks_lambda: number;
        }[];
        wilks_lambda_steps: {
            step: number;
            variable_index: number;
            variable_name: string;
            action: string;
            statistic: number;
            df1: number;
            df2: number;
            df3: number;
            wilks_lambda: number;
            wilks_df1: number;
            wilks_df2: number;
            exact_f: number;
            exact_f_df1: number;
            exact_f_df2: number;
            significance: number;
        }[];
        pairwise_comparisons: {
            step: number;
            group1: number;
            group2: number;
            f_value: number;
            significance: number;
        }[];
        max_steps: number;
        tolerance: number;
    };
    group_values: number[];
    variable_names: string[];
    group_name: string; // Nama kolom grup (mis. "incbef")
}

// Definisi interface untuk struktur tabel output
export interface TableHeader {
    header: string;
}

export interface TableRow {
    rowHeader: (string | null)[];
    [key: string]: any; // Untuk properti dinamis sesuai dengan header
}

export interface Table {
    title: string;
    columnHeaders: TableHeader[];
    rows: TableRow[];
}

export interface ResultJson {
    tables: Table[];
}

export interface PairwiseComparison {
    step: number;
    group1: number;
    group2: number;
    f_value: number;
    significance: number;
}

export interface PairwiseValue {
    f: string | null;
    sig: string | null;
}

export type PairwiseDataMap = Record<
    string,
    Record<string, Record<string, PairwiseValue>>
>;
