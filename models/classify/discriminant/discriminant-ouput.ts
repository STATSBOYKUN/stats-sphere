export interface ResultJson {
    tables: Table[];
}

export interface Table {
    key: string;
    title: string;
    columnHeaders: ColumnHeader[];
    rows: Row[];
}

export interface ColumnHeader {
    header: string;
}

export interface Row {
    rowHeader: (string | null)[];
    [key: string]: any;
}
