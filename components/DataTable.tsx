// components/DataTable.tsx

"use client";

import React, { useMemo, useRef, useEffect } from 'react';
import { HotTable, HotTableClass } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import { useDataStore } from '@/stores/useDataStore';
import { useVariableStore, VariableRow } from '@/stores/useVariableStore';
import Handsontable from 'handsontable';
import { registerAllModules } from 'handsontable/registry';

registerAllModules();

export default function DataTable() {
    const hotTableRef = useRef<HotTableClass | null>(null);

    const data = useDataStore((state) => state.data);
    const updateCell = useDataStore((state) => state.updateCell);
    const loadData = useDataStore((state) => state.loadData);

    const variables = useVariableStore((state) => state.variables);
    const addVariable = useVariableStore((state) => state.addVariable);
    const getVariableByColumnIndex = useVariableStore((state) => state.getVariableByColumnIndex);
    const loadVariables = useVariableStore((state) => state.loadVariables);

    useEffect(() => {
        loadData().then(r => r);
        loadVariables().then(r => r);
    }, [loadData, loadVariables]);

    const colHeaders = useMemo(() => {
        const totalCols = data[0]?.length || 0;
        return Array.from({ length: totalCols }, (_, index) => {
            const variable = getVariableByColumnIndex(index);
            return variable?.name || `Var${index + 1}`;
        });
    }, [data, getVariableByColumnIndex]);

    const columns = useMemo(() => {
        const totalCols = data[0]?.length || 0;
        return Array.from({ length: totalCols }, (_, index) => {
            const variable = getVariableByColumnIndex(index);
            const columnConfig: Handsontable.ColumnSettings = {
                data: index,
            };

            if (variable) {
                if (variable.type === 'Numeric') {
                    columnConfig.type = 'numeric';

                    const decimals = variable.decimals || 0;
                    let pattern = '0';
                    if (decimals > 0) {
                        pattern += '.' + '0'.repeat(decimals);
                    }
                    columnConfig.numericFormat = {
                        pattern: pattern,
                    };

                    const maxLength = variable.width || null;
                    if (maxLength) {
                        columnConfig.validator = (value: any, callback: Function) => {
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
                        columnConfig.validator = (value: any, callback: Function) => {
                            if (value && value.length > maxLength) {
                                callback(false);
                            } else {
                                callback(true);
                            }
                        };
                    }
                } else {
                    columnConfig.type = 'text';
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
            } else {
                columnConfig.type = 'text';
            }

            return columnConfig;
        });
    }, [data, getVariableByColumnIndex]);

    const handleAfterValidate = (
        isValid: boolean,
        value: any,
        row: number,
        prop: string | number,
        source: Handsontable.ChangeSource
    ) => {
        if (!isValid) {
            const hot = hotTableRef.current?.hotInstance;
            if (hot) {
                const oldValue = hot.getDataAtCell(row, prop as number);
                setTimeout(() => {
                    hot.setDataAtCell(row, prop as number, oldValue, 'invalid'); // Gunakan source 'invalid' untuk menghindari loop
                }, 0);
            }
        }
    };

    const handleAfterChange = (
        changes: Handsontable.CellChange[] | null,
        source: Handsontable.ChangeSource
    ) => {
        // @ts-ignore
        if (source === 'loadData' || !changes || source === 'invalid') {
            return;
        }

        changes.forEach(([row, col, oldValue, newValue]) => {
            if (newValue !== oldValue) {
                const colIndex = col as number;
                const variable = getVariableByColumnIndex(colIndex);

                if (!variable) {
                    const isNumeric = !isNaN(Number(newValue));
                    const valueLength = newValue ? newValue.toString().length : 0;

                    const defaultVariable: VariableRow = {
                        columnIndex: colIndex,
                        name: `Var${colIndex + 1}`,
                        type: isNumeric ? 'Numeric' : 'String',
                        width: valueLength > 8 ? valueLength : 8,
                        decimals: isNumeric ? 2 : 0,
                        label: '',
                        values: '',
                        missing: '',
                        columns: 200,
                        align: isNumeric ? 'right' : 'left',
                        measure: isNumeric ? 'Scale' : 'unknown',
                    };

                    addVariable(defaultVariable).then(r => r);

                }

                updateCell(row, colIndex, newValue as string);
            }
        });
    };

    return (
        <div className="flex-grow z-0 h-full w-full">
            <HotTable
                ref={hotTableRef}
                data={data}
                colHeaders={colHeaders}
                columns={columns}
                rowHeaders={true}
                width="100%"
                height="100%"
                autoWrapRow={true}
                autoWrapCol={true}
                dropdownMenu={true}
                multiColumnSorting={true}
                filters={true}
                manualRowMove={true}
                customBorders={true}
                contextMenu={true}
                licenseKey="non-commercial-and-evaluation"
                afterChange={handleAfterChange}
                afterValidate={handleAfterValidate}
                className="h-full w-full"
            />
        </div>
    );
}
