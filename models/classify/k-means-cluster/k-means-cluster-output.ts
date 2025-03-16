// Interface TypeScript untuk struktur data

// Header kolom dalam tabel
interface ColumnHeader {
    header: string;
    colspan?: number;
}

// Struktur data baris
export interface RowData {
    rowHeader: [string, null | string];
    values?: string[];
    isSubHeader?: boolean;
    isFooter?: boolean;
}

// Struktur tabel yang disederhanakan
export interface Table {
    title: string;
    subtitle?: string;
    sectionTitle?: string;
    columnHeaders: ColumnHeader[];
    rows: RowData[];
}

// Struktur JSON hasil
export interface ResultJson {
    tables: Table[];
}

// Struktur data anova_table
export interface AnovaTable {
    variables: string[];
    cluster_mean_squares: number[];
    cluster_df: number;
    error_mean_squares: number[];
    error_df: number;
    f_values: (number | null)[];
    significance: number[];
}

// Struktur statistik kasus
export interface CaseStatistics {
    cluster_counts: number[];
    valid_count: number;
    missing_count: number;
}

// Struktur informasi keanggotaan
export interface MembershipInfo {
    case_numbers: number[];
    original_data: Record<string, any>[];
    clusters: number[];
    distances: number[];
}

// Struktur matriks jarak
export interface DistanceMatrix {
    num_clusters: number;
    distances: number[][];
}

// Struktur data utama analisis cluster
export interface ClusterAnalysisData {
    initial_centers: number[][];
    final_centers: number[][];
    iterations: number[][];
    cluster_membership: number[];
    distances: number[];
    cluster_sizes: number[];
    anova_table: AnovaTable;
    variable_names: string[];
    iteration_count: number;
    missing_count: number;
    min_distance_initial: number;
    case_statistics: CaseStatistics;
    membership_info: MembershipInfo;
    distance_matrix: DistanceMatrix;
    case_target_data: Record<string, any>[];
}

// Struktur utama JSON input
export interface ClusterAnalysisInput {
    success: boolean;
    warnings: string[];
    data: ClusterAnalysisData;
}
