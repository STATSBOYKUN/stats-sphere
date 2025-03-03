import Handsontable from 'handsontable';

interface Variable {
    type:
        | 'NUMERIC'
        | 'COMMA'
        | 'SCIENTIFIC'
        | 'DATE'
        | 'ADATE'
        | 'EDATE'
        | 'SDATE'
        | 'JDATE'
        | 'DOLLAR'
        | 'CUSTOM_CURRENCY'
        | 'STRING'
        | 'RESTRICTED_NUMERIC';
    decimals: number;
    width: number;
    columns: number;
    align: 'right' | 'left' | 'center';
    name: string;
}

type DataRow = string[];

export const generateColumnConfig = (
    data: DataRow[],
    getVariableByColumnIndex: (index: number) => Variable | undefined
): Handsontable.ColumnSettings[] => {
    if (!data[0]) return [];
    return data[0].map((_: string, index: number) => {
        const variable = getVariableByColumnIndex(index);
        const columnConfig: Handsontable.ColumnSettings = {
            data: index,
            type: 'text',
        };
        if (variable) {
            if (variable.columns) {
                columnConfig.width = variable.columns;
            } else {
                columnConfig.width = 100;
            }
            if (variable.align) {
                const alignValue = variable.align.toLowerCase();
                if (['left', 'center', 'right'].includes(alignValue)) {
                    columnConfig.className = `ht${alignValue.charAt(0).toUpperCase() + alignValue.slice(1)}`;
                }
            }
        }
        return columnConfig;
    });
};
