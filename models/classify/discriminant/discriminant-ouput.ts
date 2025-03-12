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
