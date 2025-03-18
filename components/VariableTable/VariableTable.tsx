"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.min.css";

import { VariableTypeDialog } from "./VariableTypeDialog";
import { ValueLabelsDialog } from "./ValueLabelsDialog";
import { MissingValuesDialog } from "./MissingValuesDialog";

import { colHeaders, columns } from "./tableConfig";

import { useVariableStore } from "@/stores/useVariableStore";
import { useDataStore } from "@/stores/useDataStore";

import { Variable } from "@/types/Variable";
import { ValueLabel } from "@/types/ValueLabel";

const DEFAULT_MIN_ROWS = 45;
const DEFAULT_VARIABLE_TYPE = "NUMERIC";
const DEFAULT_VARIABLE_WIDTH = 8;
const DEFAULT_VARIABLE_DECIMALS = 2;

const FIELD_MAPPING = [
    "name",
    "type",
    "width",
    "decimals",
    "label",
    "values",
    "missing",
    "columns",
    "align",
    "measure",
    "role"
];

const TYPE_COLUMN_INDEX = 1;
const VALUES_COLUMN_INDEX = 5;
const MISSING_COLUMN_INDEX = 6;

registerAllModules();

function getDisplayVariable(variables: Variable[]): (string | number)[][] {
    const maxColumnIndex = variables.length > 0
        ? Math.max(...variables.map(v => v.columnIndex))
        : -1;

    const rowCount = Math.max(DEFAULT_MIN_ROWS, maxColumnIndex + 1);

    return Array.from({ length: rowCount }, (_, index) => {
        const variable = variables.find(v => v.columnIndex === index);

        if (!variable) {
            return ["", "", "", "", "", "", "", "", "", "", ""];
        }

        const missingDisplay = formatMissingValuesDisplay(variable);
        const valuesDisplay = formatValueLabelsDisplay(variable);

        return [
            variable.name || "",
            variable.type || "",
            variable.width || "",
            variable.decimals || "",
            variable.label || "",
            valuesDisplay,
            missingDisplay,
            variable.columns || "",
            variable.align || "",
            variable.measure || "",
            variable.role || ""
        ];
    });
}

function formatMissingValuesDisplay(variable: Variable): string {
    if (!Array.isArray(variable.missing) || variable.missing.length === 0) {
        return "";
    }

    if (
        variable.missing.length >= 2 &&
        variable.type !== "STRING" &&
        typeof variable.missing[0] === 'number' &&
        typeof variable.missing[1] === 'number' &&
        variable.missing[0] <= variable.missing[1]
    ) {
        let display = `${variable.missing[0]} thru ${variable.missing[1]}`;
        if (variable.missing.length > 2) {
            display += `, ${variable.missing[2]}`;
        }
        return display;
    }

    return variable.missing.map(m => {
        if (m === " ") return "'[Space]'";
        return m;
    }).join(", ");
}

function formatValueLabelsDisplay(variable: Variable): string {
    if (!Array.isArray(variable.values) || variable.values.length === 0) {
        return "";
    }

    return variable.values.map((vl: ValueLabel) =>
        `${vl.value === " " ? "[Space]" : vl.value}: ${vl.label}`
    ).join(", ");
}

export default function VariableTable() {
    const hotTableRef = useRef<any>(null);
    const pendingOperations = useRef<Array<{ type: string, payload: any }>>([]);
    const isProcessing = useRef(false);

    const {
        variables,
        updateVariable,
        addVariable,
        deleteVariable,
        selectedVariable,
        selectVariable,
        getVariableByColumnIndex
    } = useVariableStore();

    const {
        addColumn,
        deleteColumn,
        ensureMatrixDimensions,
        validateVariableData
    } = useDataStore();

    const [tableData, setTableData] = useState<(string | number)[][]>([]);
    const [showTypeDialog, setShowTypeDialog] = useState(false);
    const [showValuesDialog, setShowValuesDialog] = useState(false);
    const [showMissingDialog, setShowMissingDialog] = useState(false);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [selectedVariableType, setSelectedVariableType] = useState<string>(DEFAULT_VARIABLE_TYPE);
    const [selectionSource, setSelectionSource] = useState<'user' | 'program' | null>(null);

    useEffect(() => {
        setTableData(getDisplayVariable(variables));
    }, [variables]);

    useEffect(() => {
        if (selectedCell) {
            const variable = variables.find(v => v.columnIndex === selectedCell.row);
            setSelectedVariableType(variable?.type || DEFAULT_VARIABLE_TYPE);

            if (selectionSource !== 'program') {
                selectVariable(selectedCell.row);
            }
        }
    }, [selectedCell, variables, selectVariable, selectionSource]);

    useEffect(() => {
        if (selectedVariable !== null && hotTableRef.current) {
            const hotInstance = hotTableRef.current.hotInstance;
            if (hotInstance) {
                const currentSelection = hotInstance.getSelected();
                const isAlreadySelected = currentSelection &&
                    currentSelection[0] &&
                    currentSelection[0][0] === selectedVariable;

                if (!isAlreadySelected) {
                    setSelectionSource('program');
                    hotInstance.selectCell(selectedVariable, 0);
                    setSelectedCell({ row: selectedVariable, col: 0 });

                    requestAnimationFrame(() => {
                        setSelectionSource(null);
                    });
                }
            }
        }
    }, [selectedVariable]);

    const processPendingOperations = useCallback(async () => {
        if (isProcessing.current || pendingOperations.current.length === 0) return;

        isProcessing.current = true;

        try {
            const operation = pendingOperations.current[0];

            switch (operation.type) {
                case 'CREATE_VARIABLE':
                    await addVariable(operation.payload.variableData);
                    await ensureMatrixDimensions(0, operation.payload.row);
                    break;

                case 'INSERT_VARIABLE':
                    await addVariable(operation.payload.variableData);
                    await addColumn(operation.payload.row);
                    await ensureMatrixDimensions(0, operation.payload.row);
                    break;

                case 'DELETE_VARIABLE':
                    await deleteVariable(operation.payload.row);
                    await deleteColumn(operation.payload.row);
                    break;

                case 'UPDATE_VARIABLE':
                    await updateVariable(
                        operation.payload.row,
                        operation.payload.field,
                        operation.payload.value
                    );
                    if (operation.payload.needsValidation) {
                        await validateVariableData(
                            operation.payload.row,
                            operation.payload.type,
                            operation.payload.width
                        );
                    }
                    break;

                case 'UPDATE_VARIABLE_TYPE':
                    await updateVariable(operation.payload.row, 'type', operation.payload.type);
                    await updateVariable(operation.payload.row, 'width', operation.payload.width);
                    await updateVariable(operation.payload.row, 'decimals', operation.payload.decimals);
                    await validateVariableData(operation.payload.row, operation.payload.type, operation.payload.width);
                    break;

                case 'UPDATE_VARIABLE_VALUES':
                    await updateVariable(operation.payload.row, 'values', operation.payload.values);
                    break;

                case 'UPDATE_VARIABLE_MISSING':
                    await updateVariable(operation.payload.row, 'missing', operation.payload.missing);
                    break;
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
    }, [addVariable, deleteVariable, updateVariable, addColumn, deleteColumn, ensureMatrixDimensions, validateVariableData]);

    const handleDialogVisibility = useCallback((row: number, col: number) => {
        setShowTypeDialog(false);
        setShowValuesDialog(false);
        setShowMissingDialog(false);

        requestAnimationFrame(() => {
            if (col === TYPE_COLUMN_INDEX) {
                setShowTypeDialog(true);
            } else if (col === VALUES_COLUMN_INDEX) {
                setShowValuesDialog(true);
            } else if (col === MISSING_COLUMN_INDEX) {
                setShowMissingDialog(true);
            }
        });
    }, []);

    const handleBeforeChange = useCallback((
        changes: (Handsontable.CellChange | null)[],
        source: Handsontable.ChangeSource
    ): void | boolean => {
        if (source === "loadData" || !changes) return;

        const changesByRow: Record<number, Handsontable.CellChange[]> = {};

        for (const change of changes) {
            if (!change) continue;

            const [row, prop, oldValue, newValue] = change;
            if (newValue === oldValue || typeof row !== "number") continue;

            const propIndex = Number(prop);

            if (propIndex === TYPE_COLUMN_INDEX ||
                propIndex === VALUES_COLUMN_INDEX ||
                propIndex === MISSING_COLUMN_INDEX) {
                setSelectedCell({ row, col: propIndex });
                handleDialogVisibility(row, propIndex);
                return false;
            }

            if (!changesByRow[row]) changesByRow[row] = [];
            changesByRow[row].push(change);
        }

        Object.keys(changesByRow).forEach(rowKey => {
            const row = Number(rowKey);
            const rowChanges = changesByRow[row];
            const variable = getVariableByColumnIndex(row);

            if (variable) {
                let isTypeChanged = false;
                let isWidthChanged = false;
                let newType = variable.type;
                let newWidth = variable.width;

                for (const change of rowChanges) {
                    if (!change) continue;
                    const [, prop, oldValue, newValue] = change;
                    if (newValue === oldValue) continue;

                    const propIndex = Number(prop);
                    const field = FIELD_MAPPING[propIndex] || prop;

                    if (field === 'type') {
                        isTypeChanged = true;
                        newType = newValue as any;
                    } else if (field === 'width') {
                        isWidthChanged = true;
                        newWidth = Number(newValue);
                    }

                    pendingOperations.current.push({
                        type: 'UPDATE_VARIABLE',
                        payload: {
                            row,
                            field,
                            value: newValue,
                            needsValidation: field === 'type' || field === 'width',
                            type: newType,
                            width: newWidth
                        }
                    });
                }
            } else {
                const variableData: Partial<Variable> = {
                    columnIndex: row
                };

                rowChanges.forEach(change => {
                    if (!change) return;
                    const [, prop, , newValue] = change;
                    const field = FIELD_MAPPING[Number(prop)] || prop;
                    variableData[field as keyof Variable] = newValue as any;
                });

                pendingOperations.current.push({
                    type: 'CREATE_VARIABLE',
                    payload: { row, variableData }
                });
            }
        });

        processPendingOperations();
        return true;
    }, [getVariableByColumnIndex, handleDialogVisibility, processPendingOperations]);

    const handleAfterSelectionEnd = useCallback((
        row: number,
        column: number,
        row2: number,
        column2: number,
        selectionLayerLevel: number
    ) => {
        if (selectionSource !== 'program') {
            setSelectedCell({ row, col: column });
            selectVariable(row);

            if (column === TYPE_COLUMN_INDEX ||
                column === VALUES_COLUMN_INDEX ||
                column === MISSING_COLUMN_INDEX) {
                handleDialogVisibility(row, column);
            }
        }
    }, [selectionSource, selectVariable, handleDialogVisibility]);

    const handleInsertVariable = useCallback(() => {
        if (!selectedCell) return;

        const { row } = selectedCell;
        const newVariable: Partial<Variable> = {
            columnIndex: row,
            name: `var${row + 1}`
        };

        pendingOperations.current.push({
            type: 'INSERT_VARIABLE',
            payload: { row, variableData: newVariable }
        });
        processPendingOperations();
    }, [selectedCell, processPendingOperations]);

    const handleDeleteVariable = useCallback(() => {
        if (!selectedCell) return;

        const { row } = selectedCell;
        pendingOperations.current.push({
            type: 'DELETE_VARIABLE',
            payload: { row }
        });
        processPendingOperations();
    }, [selectedCell, processPendingOperations]);

    const handleTypeSelection = useCallback((type: string, width: number, decimals: number) => {
        if (!selectedCell) return;

        const { row } = selectedCell;
        pendingOperations.current.push({
            type: 'UPDATE_VARIABLE_TYPE',
            payload: { row, type, width, decimals }
        });
        processPendingOperations();
    }, [selectedCell, processPendingOperations]);

    const handleValuesSelection = useCallback((values: ValueLabel[]) => {
        if (!selectedCell) return;

        const { row } = selectedCell;
        pendingOperations.current.push({
            type: 'UPDATE_VARIABLE_VALUES',
            payload: { row, values }
        });
        processPendingOperations();
    }, [selectedCell, processPendingOperations]);

    const handleMissingSelection = useCallback((missing: (number | string)[]) => {
        if (!selectedCell) return;

        const { row } = selectedCell;
        pendingOperations.current.push({
            type: 'UPDATE_VARIABLE_MISSING',
            payload: { row, missing }
        });
        processPendingOperations();
    }, [selectedCell, processPendingOperations]);

    const getSelectedVariableName = useCallback((): string => {
        if (!selectedCell) return "";
        const variable = variables.find(v => v.columnIndex === selectedCell.row);
        return variable?.name || `var${selectedCell.row + 1}`;
    }, [selectedCell, variables]);

    const getSelectedVariableValues = useCallback((): ValueLabel[] => {
        if (!selectedCell) return [];
        const variable = variables.find(v => v.columnIndex === selectedCell.row);
        return variable?.values || [];
    }, [selectedCell, variables]);

    const getSelectedVariableMissing = useCallback((): (number | string)[] => {
        if (!selectedCell) return [];
        const variable = variables.find(v => v.columnIndex === selectedCell.row);
        return variable?.missing || [];
    }, [selectedCell, variables]);

    const customContextMenu = {
        items: {
            insert_variable: {
                name: 'Insert Variable',
                callback: handleInsertVariable
            },
            delete_variable: {
                name: 'Delete Variable',
                callback: handleDeleteVariable
            }
        }
    };

    const getCellProperties = useCallback((row: number, col: number) => {
        const cellProperties: any = {};

        if (col === TYPE_COLUMN_INDEX) {
            cellProperties.className = 'type-column';
        } else if (col === VALUES_COLUMN_INDEX) {
            cellProperties.className = 'values-column';
        } else if (col === MISSING_COLUMN_INDEX) {
            cellProperties.className = 'missing-column';
        }

        return cellProperties;
    }, []);

    const handleBeforeKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            event.stopImmediatePropagation();
            event.preventDefault();
            return false;
        }
    }, []);

    const handleBeforeSetRangeEnd = useCallback((coords: any) => {
        const hotInstance = hotTableRef.current?.hotInstance;
        if (!hotInstance) return coords;

        const currentSelection = hotInstance.getSelectedRangeLast();
        if (!currentSelection) return coords;

        const startCol = currentSelection.from.col;
        if (coords.col !== startCol) {
            coords.col = startCol;
        }

        return coords;
    }, []);

    return (
        <div className="h-full w-full relative">
            <div className="h-full w-full relative z-0">
                <HotTable
                    ref={hotTableRef}
                    data={tableData}
                    colHeaders={colHeaders}
                    columns={columns}
                    rowHeaders={true}
                    width="100%"
                    height="100%"
                    autoWrapRow={true}
                    autoWrapCol={true}
                    manualColumnResize={true}
                    contextMenu={customContextMenu}
                    licenseKey="non-commercial-and-evaluation"
                    minSpareRows={1}
                    beforeChange={handleBeforeChange}
                    afterSelectionEnd={handleAfterSelectionEnd}
                    beforeSetRangeEnd={handleBeforeSetRangeEnd}
                    beforeKeyDown={handleBeforeKeyDown}
                    cells={getCellProperties}
                />
            </div>

            <VariableTypeDialog
                open={showTypeDialog}
                onOpenChange={setShowTypeDialog}
                onSave={handleTypeSelection}
                initialType={
                    selectedCell?.row !== undefined && variables.length > 0
                        ? (variables.find(v => v.columnIndex === selectedCell.row)?.type || DEFAULT_VARIABLE_TYPE)
                        : DEFAULT_VARIABLE_TYPE
                }
                initialWidth={
                    selectedCell?.row !== undefined && variables.length > 0
                        ? (variables.find(v => v.columnIndex === selectedCell.row)?.width || DEFAULT_VARIABLE_WIDTH)
                        : DEFAULT_VARIABLE_WIDTH
                }
                initialDecimals={
                    selectedCell?.row !== undefined && variables.length > 0
                        ? (variables.find(v => v.columnIndex === selectedCell.row)?.decimals || DEFAULT_VARIABLE_DECIMALS)
                        : DEFAULT_VARIABLE_DECIMALS
                }
            />

            <ValueLabelsDialog
                open={showValuesDialog}
                onOpenChange={setShowValuesDialog}
                onSave={handleValuesSelection}
                initialValues={getSelectedVariableValues()}
                variableName={getSelectedVariableName()}
                variableType={selectedVariableType}
            />

            <MissingValuesDialog
                open={showMissingDialog}
                onOpenChange={setShowMissingDialog}
                onSave={handleMissingSelection}
                initialMissingValues={getSelectedVariableMissing()}
                variableType={selectedVariableType}
            />
        </div>
    );
}