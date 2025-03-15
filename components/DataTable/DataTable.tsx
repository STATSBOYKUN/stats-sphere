"use client";

import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import Handsontable from 'handsontable';
import { ContextMenu } from 'handsontable/plugins/contextMenu';

// Internal imports
import { useDataStore } from '@/stores/useDataStore';
import { useVariableStore } from '@/stores/useVariableStore';
import { Variable } from '@/types/Variable';

// Constants
const DEFAULT_ROWS = 100;
const DEFAULT_MIN_COLUMNS = 45;
const DEFAULT_COLUMN_WIDTH = 64;

// Register all Handsontable modules
registerAllModules();

/**
 * Creates column configuration based on variable type and properties
 */
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
                }
            };
        case 'DATE':
            return {
                ...baseConfig,
                type: 'date',
                dateFormat: 'MM/DD/YYYY'
            };
        case 'STRING':
        default:
            return {
                ...baseConfig,
                type: 'text'
            };
    }
};

/**
 * Creates a display matrix with proper dimensions based on data and variable count
 */
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

/**
 * DataTable component that displays and manages tabular data with Handsontable
 */
export default function DataTable() {
    // Refs
    const hotTableRef = useRef<any>(null);
    const isSelectionProgrammatic = useRef<boolean>(false);

    // Store hooks
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

    // Grid dimensions calculation
    const stateCols = data[0]?.length || 0;
    const variableCount = variables.length > 0
        ? Math.max(...variables.map(v => v.columnIndex)) + 1
        : 0;
    const numColumns = Math.max(stateCols, variableCount, DEFAULT_MIN_COLUMNS - 1) + 1;

    // Column headers generation
    const colHeaders = useMemo(() => {
        return Array.from({ length: numColumns }, (_, index) => {
            const variable = getVariableByColumnIndex(index);
            return variable?.name || 'var';
        });
    }, [numColumns, variables, getVariableByColumnIndex]);

    // Data matrix generation
    const displayMatrix = useMemo(() =>
            getDisplayMatrix(data, variableCount),
        [data, variableCount]);

    // Column configuration generation
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
    }, [numColumns, getVariableByColumnIndex]);

    /**
     * Handles data changes before they're applied to the grid
     */
    const handleBeforeChange = useCallback((
        changes: (Handsontable.CellChange | null)[],
        source: Handsontable.ChangeSource
    ): boolean | void => {
        if (source === 'loadData' || !changes) return;

        const changesByCol: Record<number, Handsontable.CellChange[]> = {};
        let highestColumn = -1;
        let maxRow = -1;

        // Group changes by column and find max dimensions
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

        // Check for columns without variables
        const missingColumns: number[] = [];
        for (let i = 0; i <= highestColumn; i++) {
            if (!getVariableByColumnIndex(i)) {
                missingColumns.push(i);
            }
        }

        // Create missing variables
        if (missingColumns.length > 0) {
            const newVariables = missingColumns.map(colIndex => {
                const hasChanges = changesByCol[colIndex] && changesByCol[colIndex].length > 0;
                let type: Variable['type'] = 'STRING';

                // Try to determine column type
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

            // Handle variable creation asynchronously but don't return a promise
            addMultipleVariables(newVariables).catch(error => {
                console.error('Failed to create variables:', error);
            });
        }

        // Ensure matrix has appropriate dimensions
        const highestVarIndex = variables.length > 0
            ? Math.max(...variables.map(v => v.columnIndex))
            : -1;

        ensureMatrixDimensions(maxRow, Math.max(highestColumn, highestVarIndex));

        // Process cell updates
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
                    // Allow empty values or valid numbers
                    if (newValue === '' || !isNaN(Number(newValue))) {
                        cellUpdates.push({ row, col, value: newValue });
                    }
                } else if (variable.type === 'STRING') {
                    // Truncate text if exceeds width
                    let text = newValue ? newValue.toString() : '';
                    if (text.length > variable.width) {
                        text = text.substring(0, variable.width);
                    }
                    cellUpdates.push({ row, col, value: text });
                } else {
                    cellUpdates.push({ row, col, value: newValue });
                }
            }
        }

        // Batch update cells (don't return the promise)
        if (cellUpdates.length > 0) {
            updateBulkCells(cellUpdates).catch(error => {
                console.error('Failed to update cells:', error);
            });
        }
    }, [
        getVariableByColumnIndex,
        updateBulkCells,
        addMultipleVariables,
        ensureMatrixDimensions,
        variables
    ]);

    /**
     * Handles selection events
     */
    const handleAfterSelectionEnd = useCallback((row: number, column: number) => {
        if (!isSelectionProgrammatic.current) {
            selectCell(row, column);
        }
    }, [selectCell]);

    /**
     * Handles row creation
     */
    const handleAfterCreateRow = useCallback((index: number, amount: number) => {
        for (let i = 0; i < amount; i++) {
            addRow(index + i);
        }
    }, [addRow]);

    /**
     * Handles column creation
     */
    const handleAfterCreateCol = useCallback((index: number, amount: number) => {
        for (let i = 0; i < amount; i++) {
            const insertIndex = index + i;
            addColumn(insertIndex);
            addVariable({
                columnIndex: insertIndex
            });
        }
    }, [addColumn, addVariable]);

    /**
     * Handles row deletion
     */
    const handleAfterRemoveRow = useCallback((index: number, amount: number) => {
        for (let i = 0; i < amount; i++) {
            deleteRow(index);
        }
    }, [deleteRow]);

    /**
     * Handles column deletion
     */
    const handleAfterRemoveCol = useCallback((index: number, amount: number) => {
        for (let i = 0; i < amount; i++) {
            deleteColumn(index);
            deleteVariable(index);
        }
    }, [deleteColumn, deleteVariable]);

    /**
     * Handles column resizing
     */
    const handleAfterColumnResize = useCallback((newSize: number, column: number) => {
        const variable = getVariableByColumnIndex(column);
        if (variable) {
            updateVariable(column, 'columns', newSize);
        }
    }, [getVariableByColumnIndex, updateVariable]);

    /**
     * Handles applying alignment to the selected columns
     */
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

    // Context menu configuration
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

    // Effect to handle selected cell changes
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
                isSelectionProgrammatic.current = true;
                hotInstance.selectCell(row, col);

                // Reset flag after selection is complete
                setTimeout(() => {
                    isSelectionProgrammatic.current = false;
                }, 0);
            }
        }
    }, [selectedCell]);

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
            />
        </div>
    );
}