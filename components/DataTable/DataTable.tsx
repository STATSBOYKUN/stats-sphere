import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import { registerAllModules } from 'handsontable/registry';
import { useDataStore } from '@/stores/useDataStore';
import { useVariableStore } from '@/stores/useVariableStore';
import { useModalStore } from "@/stores/useModalStore";
import { Variable } from '@/types/Variable';

registerAllModules();

const getColumnConfig = (variable: Variable | { columnIndex: number; name: string; type: "STRING"; columns: number; decimals: number; align: "center"; }) => {
    const baseConfig = {
        width: variable.columns || 64,
        className:
            variable.align === 'right'
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
            return { ...baseConfig, type: 'date', dateFormat: 'MM/DD/YYYY' };
        case 'STRING':
        default:
            return { ...baseConfig, type: 'text' };
    }
};

const getDisplayMatrix = (stateData: string | any[]) => {
    const defaultRows = 100;
    const defaultCols = 45;
    const stateRows = stateData?.length || 0;
    const stateCols = stateRows ? stateData[0].length : 0;
    const newRows = Math.max(defaultRows, stateRows);
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

const createContextMenu = () => ({
    row_above: { name: 'Insert row above' },
    row_below: { name: 'Insert row below' },
    col_left: { name: 'Insert column on the left' },
    col_right: { name: 'Insert column on the right' },
    separator1: { name: '---------' },
    remove_row: { name: 'Remove row' },
    remove_col: { name: 'Remove column' },
    separator2: { name: '---------' },
    alignment: {
        name: 'Alignment',
        submenu: {
            items: [
                { key: 'alignment:left', name: 'Left' },
                { key: 'alignment:center', name: 'Center' },
                { key: 'alignment:right', name: 'Right' }
            ]
        }
    },
    separator3: { name: '---------' },
    undo: { name: 'Undo' },
    redo: { name: 'Redo' }
});

export default function DataTable() {
    const containerRef = useRef(null);
    const hotInstance = useRef(null);
    const isSelectionProgrammatic = useRef(false);

    const {
        data,
        updateCell,
        addRow,
        addColumn,
        deleteRow,
        deleteColumn,
        selectCell,
        selectedCell
    } = useDataStore();

    const {
        variables,
        getVariableByColumnIndex,
        addVariable,
        deleteVariable,
        updateVariable
    } = useVariableStore();

    const { isStatisticProgress } = useModalStore();

    const stateCols = data[0]?.length || 0;
    const numColumns = Math.max(stateCols, 45);

    const colHeaders = useMemo(() => {
        return Array.from({ length: numColumns }, (_, index) => {
            const variable = getVariableByColumnIndex(index);
            return variable?.name || `var`;
        });
    }, [numColumns, variables, getVariableByColumnIndex]);

    const displayMatrix = useMemo(() => getDisplayMatrix(data), [data]);

    const columns = useMemo(() => {
        return Array.from({ length: numColumns }, (_, i) => {
            const variable =
                getVariableByColumnIndex(i) || {
                    columnIndex: i,
                    name: '',
                    type: 'STRING',
                    columns: 64,
                    decimals: 2,
                    align: 'right'
                };
            return getColumnConfig(variable);
        });
    }, [numColumns, getVariableByColumnIndex]);

    const handleBeforeChange = useCallback((changes: any[], source: string) => {
        if (source === 'loadData' || !changes || isStatisticProgress) return;

        const changesByCol = {};
        let highestColumn = -1;

        changes.forEach(change => {
            if (!change) return;
            const [row, col, oldValue, newValue] = change;
            if (newValue === oldValue) return;
            if (typeof col !== 'number') return;

            highestColumn = Math.max(highestColumn, col);

            const colNumber = col;
            if (!changesByCol[colNumber]) {
                changesByCol[colNumber] = [];
            }
            changesByCol[colNumber].push(change);
        });

        const missingColumns = [];

        // Ensure variables exist for all columns up to the highest one changed
        for (let i = 0; i <= highestColumn; i++) {
            if (!getVariableByColumnIndex(i)) {
                missingColumns.push(i);
            }
        }

        if (missingColumns.length > 0) {
            missingColumns.forEach(colIndex => {
                const hasChanges = changesByCol[colIndex] && changesByCol[colIndex].length > 0;

                if (hasChanges) {
                    let allNumeric = true;
                    changesByCol[colIndex].forEach(change => {
                        const [, , , newValue] = change;
                        if (newValue !== '' && isNaN(Number(newValue))) {
                            allNumeric = false;
                        }
                    });

                    if (allNumeric) {
                        addVariable({
                            columnIndex: colIndex,
                            type: 'NUMERIC',
                        });
                    } else {
                        addVariable({
                            columnIndex: colIndex,
                            type: 'STRING',
                        });
                    }
                } else {
                    addVariable({
                        columnIndex: colIndex
                    });
                }
            });
        }

        Object.keys(changesByCol).forEach(colKey => {
            const col = Number(colKey);
            const colChanges = changesByCol[col];
            const variable = getVariableByColumnIndex(col);

            if (variable) {
                colChanges.forEach(change => {
                    const [row, , , newValue] = change;
                    if (variable.type === 'NUMERIC') {
                        if (newValue === '' || !isNaN(Number(newValue))) {
                            updateCell(row, col, newValue);
                        }
                    } else if (variable.type === 'STRING') {
                        let text = newValue ? newValue.toString() : '';
                        if (text.length > variable.width) {
                            text = text.substring(0, variable.width);
                        }
                        updateCell(row, col, text);
                    } else {
                        updateCell(row, col, newValue);
                    }
                });
            }
        });
    }, [getVariableByColumnIndex, updateCell, addVariable, isStatisticProgress]);

    const handleAfterSelectionEnd = useCallback((row, column) => {
        if (!isSelectionProgrammatic.current) {
            selectCell(row, column);
        }
    }, [selectCell]);

    const handleAfterCreateRow = useCallback((index, amount) => {
        for (let i = 0; i < amount; i++) {
            addRow(index + i);
        }
    }, [addRow]);

    const handleAfterCreateCol = useCallback((index, amount) => {
        for (let i = 0; i < amount; i++) {
            const insertIndex = index + i;

            addColumn(insertIndex);

            addVariable({
                columnIndex: insertIndex,
            });
        }
    }, [addColumn, addVariable]);

    const handleAfterRemoveRow = useCallback((index, amount) => {
        for (let i = 0; i < amount; i++) {
            deleteRow(index);
        }
    }, [deleteRow]);

    const handleAfterRemoveCol = useCallback((index, amount) => {
        for (let i = 0; i < amount; i++) {
            deleteColumn(index);

            deleteVariable(index);
        }
    }, [deleteColumn, deleteVariable]);

    const handleAfterColumnResize = useCallback((newSize, column) => {
        const variable = getVariableByColumnIndex(column);
        if (variable) {
            updateVariable(column, 'columns', newSize);
        }
    }, [getVariableByColumnIndex, updateVariable]);

    const handleAfterContextMenuExecute = useCallback((command, args) => {
        if (command.startsWith('alignment:')) {
            const alignment = command.split(':')[1];
            const selectedRange = hotInstance.current.getSelectedRange();

            if (selectedRange && selectedRange.length > 0) {
                const { from: { col: startCol }, to: { col: endCol } } = selectedRange[0];

                for (let col = startCol; col <= endCol; col++) {
                    const variable = getVariableByColumnIndex(col);
                    if (variable) {
                        updateVariable(col, 'align', alignment);
                    }
                }
            }
        }
    }, [getVariableByColumnIndex, updateVariable]);

    const settings = useMemo(() => ({
        data: displayMatrix,
        colHeaders,
        columns,
        width: '100%',
        height: '100%',
        dropdownMenu: true,
        multiColumnSorting: true,
        filters: true,
        rowHeaders: true,
        manualRowMove: true,
        customBorders: true,
        manualColumnResize: true,
        contextMenu: createContextMenu(),
        licenseKey: 'non-commercial-and-evaluation',
        minSpareRows: 1,
        minSpareCols: 1,
        copyPaste: true,
        beforeChange: handleBeforeChange,
        afterSelection: handleAfterSelectionEnd,
        afterCreateRow: handleAfterCreateRow,
        afterCreateCol: handleAfterCreateCol,
        afterRemoveRow: handleAfterRemoveRow,
        afterRemoveCol: handleAfterRemoveCol,
        afterColumnResize: handleAfterColumnResize,
        afterContextMenuExecute: handleAfterContextMenuExecute
    }), [
        displayMatrix,
        colHeaders,
        columns,
        handleBeforeChange,
        handleAfterSelectionEnd,
        handleAfterCreateRow,
        handleAfterCreateCol,
        handleAfterRemoveRow,
        handleAfterRemoveCol,
        handleAfterColumnResize,
        handleAfterContextMenuExecute
    ]);

    useEffect(() => {
        if (containerRef.current) {
            if (!hotInstance.current) {
                hotInstance.current = new Handsontable(containerRef.current, settings);
            } else if (!hotInstance.current.isDestroyed) {
                hotInstance.current.updateSettings(settings);
            }
        }
    }, [settings]);

    useEffect(() => {
        if (hotInstance.current && selectedCell && !hotInstance.current.isDestroyed) {
            const { row, col } = selectedCell;

            const currentSelection = hotInstance.current.getSelected();
            const alreadySelected = currentSelection &&
                currentSelection[0] &&
                currentSelection[0][0] === row &&
                currentSelection[0][1] === col;

            if (!alreadySelected) {
                isSelectionProgrammatic.current = true;
                hotInstance.current.selectCell(row, col);

                setTimeout(() => {
                    isSelectionProgrammatic.current = false;
                }, 0);
            }
        }
    }, [selectedCell]);

    useEffect(() => {
        return () => {
            if (hotInstance.current && !hotInstance.current.isDestroyed) {
                hotInstance.current.destroy();
                hotInstance.current = null;
            }
        };
    }, []);

    return (
        <div className="h-full w-full">
            <div ref={containerRef} className="h-full w-full z-0" />
        </div>
    );
}