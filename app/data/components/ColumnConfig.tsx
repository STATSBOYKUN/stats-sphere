// components/ColumnConfig.tsx
import Handsontable from 'handsontable';

interface Variable {
    type: 'Numeric' | 'String';
    decimals?: number;
    width?: number;
    columns?: number;
    align?: string;
    name?: string;
}

type DataRow = string[];

export const generateColumnConfig = (
    data: DataRow[],
    getVariableByColumnIndex: (index: number) => Variable | undefined
): Handsontable.ColumnSettings[] => {
    return data[0]?.map((_: string, index: number) => {
        const variable = getVariableByColumnIndex(index);
        let columnConfig: Handsontable.ColumnSettings = {
            data: index,
            type: 'text',
        };

        if (variable) {
            if (variable.type === 'Numeric') {
                columnConfig.type = 'numeric';
                const decimals = variable.decimals || 0;
                let pattern = '0';
                if (decimals > 0) {
                    pattern += '.' + '0'.repeat(decimals);
                }
                columnConfig.numericFormat = { pattern };

                const maxLength = variable.width || null;
                if (maxLength) {
                    columnConfig.validator = (value: any, callback: (result: boolean) => void) => {
                        if (value && value.toString().replace('.', '').length > maxLength) {
                            callback(false);
                        } else {
                            callback(true);
                        }
                    };
                }
            } else if (variable.type === 'String') {
                columnConfig.type = 'text';
                const maxLength = variable.width || null;
                if (maxLength) {
                    columnConfig.validator = (value: any, callback: (result: boolean) => void) => {
                        if (value && value.length > maxLength) {
                            callback(false);
                        } else {
                            callback(true);
                        }
                    };
                }
            }

            if (variable.columns) {
                columnConfig.width = variable.columns;
            }

            if (variable.align) {
                const alignValue = variable.align.toLowerCase();
                if (['left', 'center', 'right'].includes(alignValue)) {
                    columnConfig.className = `ht${alignValue.charAt(0).toUpperCase() + alignValue.slice(1)}`;
                }
            }
        }

        return columnConfig;
    }) || [];
};
