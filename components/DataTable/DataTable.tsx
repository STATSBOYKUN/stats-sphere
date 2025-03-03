import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import { generateColumnConfig } from './ColumnConfig';
import { registerAllModules } from 'handsontable/registry';
import { useDataStore } from '@/stores/useDataStore';
import { useVariableStore } from '@/stores/useVariableStore';
import { Variable } from '@/lib/db';

registerAllModules();

function getColumnConfig(
    variable:
        | Variable
        | { columnIndex: number; name: string; type: "STRING"; columns: number; decimals: number; align: "center" }
) {
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

function getDisplayMatrix(stateData: (string | number)[][]): (string | number)[][] {
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


function generateUniqueVarName(): string {
    let varIndex = 1;
    const { variables } = useVariableStore.getState();
    while (variables.some(v => v.name.toLowerCase() === `var${varIndex}`)) {
        varIndex++;
    }
    return `var${varIndex}`;
}

const handleBeforeChange = (
    changes: (Handsontable.CellChange | null)[],
    source: Handsontable.ChangeSource
): void | boolean => {
    if (source === 'loadData' || !changes) return;

    const { getVariableByColumnIndex, addVariable } = useVariableStore.getState();
    const { updateCell } = useDataStore.getState();

    // Kelompokkan perubahan berdasarkan indeks kolom
    const changesByCol: Record<number, Handsontable.CellChange[]> = {};
    changes.forEach(change => {
        if (!change) return;
        const [row, col, oldValue, newValue] = change;
        if (newValue === oldValue) return;
        if (typeof col !== 'number') return;
        const colNumber = col as number; // pastikan tipe number

        if (!changesByCol[colNumber]) {
            changesByCol[colNumber] = [];
        }
        changesByCol[colNumber].push(change);
    });

    // Debug: tampilkan log perubahan per kolom
    console.log('[beforeChange] Kelompok perubahan per kolom:', changesByCol);

    // Proses setiap kelompok perubahan per kolom
    Object.keys(changesByCol).forEach(colKey => {
        const col = Number(colKey);
        const colChanges = changesByCol[col];
        console.log(`[beforeChange] Memproses kolom ${col} dengan perubahan:`, colChanges);
        const variable = getVariableByColumnIndex(col);

        if (variable && variable.name) {
            console.log(`[beforeChange] Variabel ditemukan untuk kolom ${col}:`, variable);
            // Jika variabel sudah ada, lakukan validasi berdasarkan tipe
            colChanges.forEach(change => {
                const [row, , oldValue, newValue] = change;
                if (variable.type === 'NUMERIC') {
                    if (newValue === '' || !isNaN(Number(newValue))) {
                        console.log(`[beforeChange] Kolom ${col} baris ${row} (NUMERIC) valid, update ke:`, newValue);
                        updateCell(row, col, newValue);
                    } else {
                        console.log(`[beforeChange] Kolom ${col} baris ${row} (NUMERIC) tidak valid, mengembalikan ke nilai lama:`, oldValue);
                        // updateCell(row, col, oldValue);
                    }
                } else if (variable.type === 'STRING') {
                    let text = newValue ? newValue.toString() : '';
                    if (text.length > variable.width) {
                        text = text.substring(0, variable.width);
                        console.log(`[beforeChange] Kolom ${col} baris ${row} (STRING) terpotong ke:`, text);
                    } else {
                        console.log(`[beforeChange] Kolom ${col} baris ${row} (STRING) valid, update ke:`, text);
                    }
                    updateCell(row, col, text);
                } else {
                    console.log(`[beforeChange] Kolom ${col} baris ${row} tipe lain, update ke:`, newValue);
                    updateCell(row, col, newValue);
                }
            });
        } else {
            // Jika variabel belum ada, lakukan pengecekan agregat untuk kolom ini
            console.log(`[beforeChange] Tidak ada variabel untuk kolom ${col}, melakukan pengecekan agregat.`);
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
            console.log(`[beforeChange] Hasil pengecekan untuk kolom ${col}: isNumeric = ${isNumeric}, width = ${width}`);
            const newName = generateUniqueVarName();
            const defaultVariable: Variable = {
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
            console.log(`[beforeChange] Menambahkan variabel baru untuk kolom ${col}:`, defaultVariable);
            addVariable(defaultVariable);

            // Proses masing-masing perubahan dengan variabel baru
            colChanges.forEach(change => {
                const [row, , oldValue, newValue] = change;
                if (isNumeric) {
                    if (newValue === '' || !isNaN(Number(newValue))) {
                        console.log(`[beforeChange] Kolom ${col} baris ${row} (NUMERIC baru) valid, update ke:`, newValue);
                        updateCell(row, col, newValue);
                    } else {
                        console.log(`[beforeChange] Kolom ${col} baris ${row} (NUMERIC baru) tidak valid, mengembalikan ke nilai lama:`, oldValue);
                        // updateCell(row, col, oldValue);
                    }
                } else {
                    let text = newValue ? newValue.toString() : '';
                    if (text.length > width) {
                        text = text.substring(0, width);
                        console.log(`[beforeChange] Kolom ${col} baris ${row} (STRING baru) terpotong ke:`, text);
                    } else {
                        console.log(`[beforeChange] Kolom ${col} baris ${row} (STRING baru) valid, update ke:`, text);
                    }
                    updateCell(row, col, text);
                }
            });
        }
    });
};




export default function DataTable() {
    const containerRef = useRef<HTMLDivElement>(null);
    const hotInstance = useRef<Handsontable | null>(null);

    const { data, updateCell } = useDataStore();
    const { getVariableByColumnIndex } = useVariableStore();

    const stateCols = data[0]?.length || 0;
    const numColumns = Math.max(stateCols, 45);

    const colHeaders = useMemo(() => {
        return Array.from({ length: numColumns }, (_, index) => {
            const variable = getVariableByColumnIndex(index);
            return variable?.name || `var${index + 1}`;
        });
    }, [numColumns, getVariableByColumnIndex]);

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
            contextMenu: ['row_above', 'row_below', 'remove_row', 'clear_column', 'alignment'] as any,
            licenseKey: 'non-commercial-and-evaluation',
            minSpareRows: 50,
            minSpareCols: 1,
            startRows: 100,
            startCols: 50,
            beforeChange: handleBeforeChange,
        }),
        [displayMatrix, colHeaders, columns]
    );

    // Inisialisasi dan update instance Handsontable
    useEffect(() => {
        if (containerRef.current) {
            if (!hotInstance.current) {
                hotInstance.current = new Handsontable(containerRef.current, settings);
            } else if (!hotInstance.current.isDestroyed) {
                hotInstance.current.updateSettings(settings);
            }
        }
    }, [settings]);

    // Cleanup saat komponen unmount
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
