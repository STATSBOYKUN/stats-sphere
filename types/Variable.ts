import { ValueLabel } from "./ValueLabel";

export type Variable = {
    id?: number;
    columnIndex: number;
    name: string;
    type: "NUMERIC" | "COMMA" | "DOT" | "SCIENTIFIC" | "DATE" | "ADATE" | "EDATE" | "SDATE" | "JDATE" | "QYR" | "MOYR" | "WKYR" | "DATETIME" | "TIME" | "DTIME" | "WKDAY" | "MONTH" | "DOLLAR" | "CCA" | "CCB" | "CCC" | "CCD" | "CCE" | "STRING" | "RESTRICTED_NUMERIC";
    width: number;
    decimals: number;
    label?: string;
    values: ValueLabel[];
    missing: (number | string)[];
    columns: number;
    align: "right" | "left" | "center";
    measure: "scale" | "ordinal" | "nominal" | "unknown";
    role: "input" | "target" | "both" | "none" | "partition" | "split";
};
