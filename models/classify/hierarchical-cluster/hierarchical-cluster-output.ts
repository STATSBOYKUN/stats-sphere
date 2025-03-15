export interface JsonData {
    agglomeration_schedule?: {
        steps: Array<{
            step: number;
            cluster1: number;
            cluster2: number;
            coefficient: number;
            stage_cluster1_first_appears: number;
            stage_cluster2_first_appears: number;
            next_stage: number;
        }>;
        method: string;
        distance_metric: string;
        standardization: string;
    };
    proximity_matrix?: number[][];
    evaluation?: {
        silhouette?: number;
        sse?: number;
        ssb?: number;
        predictor_importance?: (number | null)[];
    };
    dendrogram_data?: {
        heights: number[];
        merges: [number, number][];
        labels: string[];
    };
}

export interface ResultJson {
    tables: Table[];
    method?: string;
}

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
