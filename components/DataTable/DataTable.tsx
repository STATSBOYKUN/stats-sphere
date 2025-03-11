import React, { useRef, useEffect, useMemo } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import { generateColumnConfig } from './ColumnConfig';
import { registerAllModules } from 'handsontable/registry';
import { useDataStore } from '@/stores/useDataStore';
import { useVariableStore } from '@/stores/useVariableStore';
import { useModalStore } from "@/stores/useModalStore";
import { Variable } from '@/types/Variable';

registerAllModules();

function getColumnConfig(variable) {
    const baseConfig = {
        width: variable.columns || 100,
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
}

function getDisplayMatrix(stateData) {
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
}

function generateUniqueVarName() {
    let varIndex = 1;
    const { variables } = useVariableStore.getState();
    while (variables.some(v => v.name.toLowerCase() === `var${varIndex}`)) {
        varIndex++;
    }
    return `var${varIndex}`;
}

const handleBeforeChange = (changes, source) => {
    const { isStatisticProgress } = useModalStore.getState();
    if (source === 'loadData' || !changes || isStatisticProgress) return;
    const { getVariableByColumnIndex, addVariable } = useVariableStore.getState();
    const { updateCell } = useDataStore.getState();
    const changesByCol = {};
    changes.forEach(change => {
        if (!change) return;
        const [row, col, oldValue, newValue] = change;
        if (newValue === oldValue) return;
        if (typeof col !== 'number') return;
        const colNumber = col;
        if (!changesByCol[colNumber]) {
            changesByCol[colNumber] = [];
        }
        changesByCol[colNumber].push(change);
    });
    Object.keys(changesByCol).forEach(colKey => {
        const col = Number(colKey);
        const colChanges = changesByCol[col];
        const variable = getVariableByColumnIndex(col);
        if (variable && variable.name) {
            colChanges.forEach(change => {
                const [row, , oldValue, newValue] = change;
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
        } else {
            let allNumeric = true;
            let maxTextLength = 0;
            colChanges.forEach(change => {
                const [, , , newValue] = change;
                const text = newValue ? newValue.toString() : '';
                maxTextLength = Math.max(maxTextLength, text.length);
                if (newValue !== '' && isNaN(Number(newValue))) {
                    allNumeric = false;
                }
            });
            const isNumeric = allNumeric;
            const width = isNumeric ? 8 : maxTextLength;
            const newName = generateUniqueVarName();
            const defaultVariable = {
                columnIndex: col,
                name: newName,
                type: isNumeric ? 'NUMERIC' : 'STRING',
                width: width,
                decimals: isNumeric ? 2 : 0,
                label: '',
                values: [],
                missing: [],
                columns: 200,
                align: isNumeric ? 'right' : 'left',
                measure: isNumeric ? 'scale' : 'nominal',
                role: 'input'
            };
            addVariable(defaultVariable);
            colChanges.forEach(change => {
                const [row, , oldValue, newValue] = change;
                if (isNumeric) {
                    if (newValue === '' || !isNaN(Number(newValue))) {
                        updateCell(row, col, newValue);
                    }
                } else {
                    let text = newValue ? newValue.toString() : '';
                    if (text.length > width) {
                        text = text.substring(0, width);
                    }
                    updateCell(row, col, text);
                }
            });
        }
    });
};

export default function DataTable() {
    const containerRef = useRef(null);
    const hotInstance = useRef(null);
    const { data } = useDataStore();
    const { variables, getVariableByColumnIndex } = useVariableStore();
    const stateCols = data[0]?.length || 0;
    const numColumns = Math.max(stateCols, 45);
    const colHeaders = useMemo(() => {
        return Array.from({ length: numColumns }, (_, index) => {
            const variable = getVariableByColumnIndex(index);
            return variable?.name || `var${index + 1}`;
        });
    }, [numColumns, variables]);
    const displayMatrix = useMemo(() => getDisplayMatrix(data), [data]);
    const columns = useMemo(() => {
        return Array.from({ length: numColumns }, (_, i) => {
            const variable =
                getVariableByColumnIndex(i) || {
                    columnIndex: i,
                    name: '',
                    type: 'STRING',
                    columns: 100,
                    decimals: 0,
                    align: 'center'
                };
            return getColumnConfig(variable);
        });
    }, [numColumns, getVariableByColumnIndex, data]);
    const settings = useMemo(
        () => ({
            data: displayMatrix,
            colHeaders,
            columns,
            rowHeaders: true,
            width: '100%',
            height: '100%',
            autoWrapRow: true,
            autoWrapCol: true,
            dropdownMenu: true,
            multiColumnSorting: true,
            filters: true,
            manualRowMove: true,
            customBorders: true,
            contextMenu
                : true,
            licenseKey: 'non-commercial-and-evaluation',
            minSpareRows: 50,
            minSpareCols: 1,
            startRows: 100,
            startCols: 50,
            copyPaste: true,
            beforeChange: handleBeforeChange
        }),
        [displayMatrix, colHeaders, columns]
    );
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
        return () => {
            if (hotInstance.current) {
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