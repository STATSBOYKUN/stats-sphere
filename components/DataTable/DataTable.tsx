"use client";

import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import Handsontable from 'handsontable';
import { ContextMenu } from 'handsontable/plugins/contextMenu';

import { useDataStore } from '@/stores/useDataStore';
import { useVariableStore } from '@/stores/useVariableStore';
import { Variable } from '@/types/Variable';

const DEFAULT_ROWS = 100;
const DEFAULT_MIN_COLUMNS = 45;
const DEFAULT_COLUMN_WIDTH = 64;

registerAllModules();

const getColumnConfig = (variable: Variable) => {
    const baseConfig = {
        width: variable.columns || DEFAULT_COLUMN_WIDTH,
        className: variable.align === 'right'
            ? 'htRight'
            : variable.align === 'left'
                ? 'htLeft'
                : 'htCenter'
    };

    switch (variable.type) {
        case 'NUMERIC':
            return {
                ...baseConfig,
                type: 'numeric',
                numericFormat: {
                    pattern: `0,0.${'0'.repeat(variable.decimals || 0)}`,
                    culture: 'en-US'
                },
                allowInvalid: false,
                validator: (value: any, callback: (valid: boolean) => void) => {
                    const valid = value === '' ||
                        (typeof value === 'number' && !isNaN(value)) ||
                        (typeof value === 'string' && !isNaN(Number(value)));
                    callback(valid);
                }
            };
        case 'DATE':
            return {
                ...baseConfig,
                type: 'date',
                dateFormat: 'MM/DD/YYYY',
                allowInvalid: false,
                validator: 'date'
            };
        case 'STRING':
        default:
            return {
                ...baseConfig,
                type: 'text',
                ...(variable.width && {
                    validator: (value: any, callback: (valid: boolean) => void) => {
                        callback(value === '' || String(value).length <= variable.width!);
                    },
                    allowInvalid: false
                })
            };
    }
};

const getDisplayMatrix = (
    stateData: (string | number)[][],
    varCount: number
): (string | number)[][] => {
    const defaultCols = Math.max(DEFAULT_MIN_COLUMNS, varCount);
    const stateRows = stateData?.length || 0;
    const stateCols = stateRows && stateData[0] ? stateData[0].length : 0;

    const newRows = Math.max(DEFAULT_ROWS, stateRows);
    const newCols = Math.max(defaultCols, stateCols);

    return Array.from({ length: newRows }, (_, rowIndex) => {
        if (rowIndex < stateRows) {
            const row = stateData[rowIndex];
            if (row.length < newCols) {
                return row.concat(Array(newCols - row.length).fill(''));
            }
            return row.slice(0, newCols);
        }
        return Array(newCols).fill('');
    });
};

export default function DataTable() {
    const hotTableRef = useRef<any>(null);
    const pendingOperations = useRef<Array<{ type: string, payload: any }>>([]);
    const isProcessing = useRef(false);
    const [selectionSource, setSelectionSource] = useState<'user' | 'program' | null>(null);

    const {
        data,
        updateCell,
        addRow,
        addColumn,
        deleteRow,
        deleteColumn,
        selectCell,
        selectedCell,
        updateBulkCells,
        ensureMatrixDimensions
    } = useDataStore();

    const {
        variables,
        getVariableByColumnIndex,
        addVariable,
        deleteVariable,
        updateVariable,
        addMultipleVariables
    } = useVariableStore();

    const stateCols = data[0]?.length || 0;
    const variableCount = variables.length > 0
        ? Math.max(...variables.map(v => v.columnIndex)) + 1
        : 0;
    const numColumns = Math.max(stateCols, variableCount, DEFAULT_MIN_COLUMNS - 1) + 1;

    const colHeaders = useMemo(() => {
        return Array.from({ length: numColumns }, (_, index) => {
            const variable = getVariableByColumnIndex(index);
            return variable?.name || `var`;
        });
    }, [getVariableByColumnIndex, numColumns, variables]);

    const displayMatrix = useMemo(() =>
            getDisplayMatrix(data, variableCount),
        [data, variableCount]);

    const columns = useMemo(() => {
        return Array.from({ length: numColumns }, (_, i) => {
            const variable = getVariableByColumnIndex(i);
            return getColumnConfig(variable || {
                columnIndex: i,
                type: 'STRING',
                align: 'right',
                decimals: 0,
                columns: DEFAULT_COLUMN_WIDTH
            } as Variable);
        });
    }, [getVariableByColumnIndex, numColumns]);

    const processCellUpdates = useCallback((data: {
        changesByCol: Record<number, Handsontable.CellChange[]>,
        highestColumn: number,
        maxRow: number
    }) => {
        const { changesByCol, highestColumn, maxRow } = data;

        const highestVarIndex = variables.length > 0
            ? Math.max(...variables.map(v => v.columnIndex))
            : -1;

        ensureMatrixDimensions(maxRow, Math.max(highestColumn, highestVarIndex));

        const cellUpdates = [];

        for (const colKey of Object.keys(changesByCol)) {
            const col = Number(colKey);
            const colChanges = changesByCol[col];
            const variable = getVariableByColumnIndex(col);

            if (!variable) {
                console.warn(`Variable for column ${col} still not found after creation`);
                continue;
            }

            for (const change of colChanges) {
                if (!change) continue;
                const [row, , , newValue] = change;

                if (variable.type === 'NUMERIC') {
                    if (newValue === '' || !isNaN(Number(newValue))) {
                        cellUpdates.push({ row, col, value: newValue });
                    }
                } else if (variable.type === 'STRING') {
                    let text = newValue ? newValue.toString() : '';
                    if (variable.width && text.length > variable.width) {
                        text = text.substring(0, variable.width);
                    }
                    cellUpdates.push({ row, col, value: text });
                } else {
                    cellUpdates.push({ row, col, value: newValue });
                }
            }
        }

        if (cellUpdates.length > 0) {
            updateBulkCells(cellUpdates).catch(error => {
                console.error('Failed to update cells:', error);
            });
        }
    }, [
        variables,
        ensureMatrixDimensions,
        getVariableByColumnIndex,
        updateBulkCells,
    ]);

    const processPendingOperations = useCallback(async () => {
        if (isProcessing.current || pendingOperations.current.length === 0) return;

        isProcessing.current = true;

        try {
            const operation = pendingOperations.current[0];

            if (operation.type === 'CREATE_VARIABLES_AND_UPDATE') {
                const { newVariables, pendingChanges } = operation.payload;
                await addMultipleVariables(newVariables);
                await processCellUpdates(pendingChanges);
            } else if (operation.type === 'UPDATE_CELLS') {
                await processCellUpdates(operation.payload);
            }

            pendingOperations.current.shift();
        } catch (error) {
            console.error('Error processing operation:', error);
        } finally {
            isProcessing.current = false;

            if (pendingOperations.current.length > 0) {
                processPendingOperations();
            }
        }
    }, [addMultipleVariables, processCellUpdates]);

    const handleBeforeChange = useCallback((
        changes: (Handsontable.CellChange | null)[],
        source: Handsontable.ChangeSource
    ): boolean | void => {
        if (source === 'loadData' || !changes) return true;

        for (let i = changes.length - 1; i >= 0; i--) {
            const change = changes[i];
            if (!change) continue;

            const [row, col, oldValue, newValue] = change;
            if (typeof col !== 'number' || typeof row !== 'number') continue;

            const variable = getVariableByColumnIndex(col);
            if (!variable) continue;

            if (variable.type === 'NUMERIC' && newValue !== '' && isNaN(Number(newValue))) {
                changes.splice(i, 1);
            }
        }

        const changesByCol: Record<number, Handsontable.CellChange[]> = {};
        let highestColumn = -1;
        let maxRow = -1;

        changes.forEach((change) => {
            if (!change) return;

            const [row, col, oldValue, newValue] = change;
            if (newValue === oldValue) return;
            if (typeof col !== 'number' || typeof row !== 'number') return;

            highestColumn = Math.max(highestColumn, col);
            maxRow = Math.max(maxRow, row);

            const colNumber = col;
            if (!changesByCol[colNumber]) {
                changesByCol[colNumber] = [];
            }
            changesByCol[colNumber].push(change);
        });

        const pendingChanges = { changesByCol, highestColumn, maxRow };

        const missingColumns: number[] = [];
        for (let i = 0; i <= highestColumn; i++) {
            if (!getVariableByColumnIndex(i)) {
                missingColumns.push(i);
            }
        }

        if (missingColumns.length > 0) {
            const newVariables = missingColumns.map(colIndex => {
                const hasChanges = changesByCol[colIndex] && changesByCol[colIndex].length > 0;
                let type: Variable['type'] = 'STRING';

                if (hasChanges) {
                    const allNumeric = changesByCol[colIndex].every(change => {
                        if (!change) return true;
                        const [, , , newValue] = change;
                        return newValue === '' || !isNaN(Number(newValue));
                    });
                    type = allNumeric ? 'NUMERIC' : 'STRING';
                }

                return {
                    columnIndex: colIndex,
                    type: type
                };
            });

            pendingOperations.current.push({
                type: 'CREATE_VARIABLES_AND_UPDATE',
                payload: { newVariables, pendingChanges }
            });
            processPendingOperations();

            return true;
        } else {
            pendingOperations.current.push({
                type: 'UPDATE_CELLS',
                payload: pendingChanges
            });
            processPendingOperations();

            return true;
        }
    }, [getVariableByColumnIndex, processPendingOperations]);

    useEffect(() => {
        if (Handsontable.validators && typeof Handsontable.validators.registerValidator === 'function') {
            Handsontable.validators.registerValidator('custom.numeric', (value: any, callback: (valid: boolean) => void) => {
                const valid = value === '' ||
                    (typeof value === 'number' && !isNaN(value)) ||
                    (typeof value === 'string' && !isNaN(Number(value)));
                callback(valid);
            });
        }
    }, []);

    const handleAfterSelectionEnd = useCallback((row: number, column: number) => {
        if (selectionSource !== 'program') {
            selectCell(row, column);
        }
    }, [selectCell, selectionSource]);

    const handleAfterCreateRow = useCallback((index: number, amount: number) => {
        for (let i = 0; i < amount; i++) {
            addRow(index + i);
        }
    }, [addRow]);

    const handleAfterCreateCol = useCallback((index: number, amount: number) => {
        for (let i = 0; i < amount; i++) {
            const insertIndex = index + i;
            addColumn(insertIndex);
            addVariable({
                columnIndex: insertIndex
            });
        }
    }, [addColumn, addVariable]);

    const handleAfterRemoveRow = useCallback((index: number, amount: number) => {
        for (let i = 0; i < amount; i++) {
            deleteRow(index);
        }
    }, [deleteRow]);

    const handleAfterRemoveCol = useCallback((index: number, amount: number) => {
        for (let i = 0; i < amount; i++) {
            deleteColumn(index);
            deleteVariable(index);
        }
    }, [deleteColumn, deleteVariable]);

    const handleAfterColumnResize = useCallback((newSize: number, column: number) => {
        const variable = getVariableByColumnIndex(column);
        if (variable) {
            updateVariable(column, 'columns', newSize);
        }
    }, [getVariableByColumnIndex, updateVariable]);

    const applyAlignment = useCallback((alignment: 'left' | 'center' | 'right') => {
        const hotInstance = hotTableRef.current?.hotInstance;
        const selectedRange = hotInstance?.getSelectedRange();

        if (selectedRange && selectedRange.length > 0) {
            const { from: { col: startCol }, to: { col: endCol } } = selectedRange[0];

            for (let col = startCol; col <= endCol; col++) {
                const variable = getVariableByColumnIndex(col);
                if (variable) {
                    updateVariable(col, 'align', alignment);
                }
            }
        }
    }, [getVariableByColumnIndex, updateVariable]);

    const handleAfterValidate = useCallback((isValid: boolean, value: any, row: number, prop: string | number) => {
        if (!isValid) {
            console.log(`Validation failed at row: ${row}, column: ${prop}, value: ${value}`);
        }
    }, []);

    const contextMenuConfig = useMemo(() => {
        return {
            items: {
                row_above: {},
                row_below: {},
                col_left: {},
                col_right: {},
                separator1: ContextMenu.SEPARATOR,
                remove_row: {},
                remove_col: {},
                separator2: ContextMenu.SEPARATOR,
                alignment: {
                    name: 'Alignment',
                    submenu: {
                        items: [
                            {
                                key: 'alignment:left',
                                name: 'Left',
                                callback: function() {
                                    applyAlignment('left');
                                }
                            },
                            {
                                key: 'alignment:center',
                                name: 'Center',
                                callback: function() {
                                    applyAlignment('center');
                                }
                            },
                            {
                                key: 'alignment:right',
                                name: 'Right',
                                callback: function() {
                                    applyAlignment('right');
                                }
                            }
                        ]
                    }
                },
                separator3: ContextMenu.SEPARATOR,
                copy: {},
                cut: {}
            }
        };
    }, [applyAlignment]);

    useEffect(() => {
        if (hotTableRef.current && selectedCell && hotTableRef.current.hotInstance) {
            const { row, col } = selectedCell;
            const hotInstance = hotTableRef.current.hotInstance;

            const currentSelection = hotInstance.getSelected();
            const alreadySelected = currentSelection &&
                currentSelection[0] &&
                currentSelection[0][0] === row &&
                currentSelection[0][1] === col;

            if (!alreadySelected) {
                setSelectionSource('program');
                hotInstance.selectCell(row, col);

                requestAnimationFrame(() => {
                    setSelectionSource(null);
                });
            }
        }
    }, [selectedCell]);

    useEffect(() => {
        const hotInstance = hotTableRef.current?.hotInstance;
        if (hotInstance) {
            hotInstance.updateSettings({
                colHeaders: colHeaders
            }, false);
        }
    }, [colHeaders]);

    return (
        <div className="h-full w-full z-0 relative">
            <HotTable
                ref={hotTableRef}
                data={displayMatrix}
                colHeaders={colHeaders}
                columns={columns}
                width="100%"
                height="100%"
                dropdownMenu={true}
                multiColumnSorting={true}
                filters={true}
                rowHeaders={true}
                manualRowMove={true}
                customBorders={true}
                manualColumnResize={true}
                contextMenu={contextMenuConfig}
                licenseKey="non-commercial-and-evaluation"
                minSpareRows={1}
                minSpareCols={1}
                copyPaste={true}
                beforeChange={handleBeforeChange}
                afterSelection={handleAfterSelectionEnd}
                afterCreateRow={handleAfterCreateRow}
                afterCreateCol={handleAfterCreateCol}
                afterRemoveRow={handleAfterRemoveRow}
                afterRemoveCol={handleAfterRemoveCol}
                afterColumnResize={handleAfterColumnResize}
                afterValidate={handleAfterValidate}
                invalidCellClassName="htInvalid"
                allowInvalid={false}
            />
        </div>
    );
}