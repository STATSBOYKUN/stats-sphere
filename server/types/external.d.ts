declare module 'sav-reader' {
    export class SavBufferReader {
        constructor(buffer: Buffer);
        open(): Promise<void>;
        meta: any;
        readAllRows(): Promise<any[]>;
    }
}

declare module 'sav-writer' {
    export const VariableType: {
        Numeric: number;
        String: number;
        Date: number;
        DateTime: number;
    };

    export const VariableAlignment: {
        Left: number;
        Centre: number;
        Right: number;
    };

    export const VariableMeasure: {
        Nominal: number;
        Ordinal: number;
        Continuous: number;
    };

    export function saveToFile(filePath: string, data: any[], variables: any[]): void;
}