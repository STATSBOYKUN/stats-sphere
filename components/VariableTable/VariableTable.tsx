"use client";

import React, { useRef, useState, useEffect } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.min.css";

// Component imports
import { VariableTypeDialog } from "./VariableTypeDialog";
import { ValueLabelsDialog } from "./ValueLabelsDialog";
import { MissingValuesDialog } from "./MissingValuesDialog";

// Config imports
import { colHeaders, columns } from "./tableConfig";

// Store imports
import { useVariableStore } from "@/stores/useVariableStore";
import { useDataStore } from "@/stores/useDataStore";

// Type imports
import { Variable } from "@/types/Variable";
import { ValueLabel } from "@/types/ValueLabel";

// Constants
const DEFAULT_MIN_ROWS = 45;
const DEFAULT_VARIABLE_TYPE = "NUMERIC";
const DEFAULT_VARIABLE_WIDTH = 8;
const DEFAULT_VARIABLE_DECIMALS = 2;

// Field mapping for variable properties
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

// Column indexes for special handling
const TYPE_COLUMN_INDEX = 1;
const VALUES_COLUMN_INDEX = 5;
const MISSING_COLUMN_INDEX = 6;

// Register all Handsontable modules
registerAllModules();

/**
 * Converts variables array to a 2D display matrix for HotTable
 */
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

        // Format missing values display
        const missingDisplay = formatMissingValuesDisplay(variable);

        // Format value labels display
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

/**
 * Formats missing values for display
 */
function formatMissingValuesDisplay(variable: Variable): string {
    if (!Array.isArray(variable.missing) || variable.missing.length === 0) {
        return "";
    }

    // Check if it's a range (for numeric types)
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

    // Display as comma-separated list
    return variable.missing.map(m => {
        if (m === " ") return "'[Space]'";
        return m;
    }).join(", ");
}

/**
 * Formats value labels for display
 */
function formatValueLabelsDisplay(variable: Variable): string {
    if (!Array.isArray(variable.values) || variable.values.length === 0) {
        return "";
    }

    return variable.values.map((vl: ValueLabel) =>
        `${vl.value === " " ? "[Space]" : vl.value}: ${vl.label}`
    ).join(", ");
}

/**
 * VariableTable component for displaying and editing variable metadata
 */
export default function VariableTable() {
    // Refs
    const hotTableRef = useRef<any>(null);
    const isSelectionProgrammatic = useRef(false);

    // Store hooks
    const {
        variables,
        updateVariable,
        addVariable,
        deleteVariable,
        selectedVariable,
        selectVariable
    } = useVariableStore();

    const {
        addColumn,
        deleteColumn,
        ensureMatrixDimensions
    } = useDataStore();

    // State
    const [tableData, setTableData] = useState<(string | number)[][]>([]);
    const [showTypeDialog, setShowTypeDialog] = useState(false);
    const [showValuesDialog, setShowValuesDialog] = useState(false);
    const [showMissingDialog, setShowMissingDialog] = useState(false);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [selectedVariableType, setSelectedVariableType] = useState<string>(DEFAULT_VARIABLE_TYPE);

    // Update table data when variables change
    useEffect(() => {
        setTableData(getDisplayVariable(variables));
    }, [variables]);

    // Handle selected cell changes
    useEffect(() => {
        if (selectedCell) {
            const variable = variables.find(v => v.columnIndex === selectedCell.row);
            setSelectedVariableType(variable?.type || DEFAULT_VARIABLE_TYPE);

            if (!isSelectionProgrammatic.current) {
                selectVariable(selectedCell.row);
            }
        }
    }, [selectedCell, variables, selectVariable]);

    // Synchronize with selected variable from store
    useEffect(() => {
        if (selectedVariable !== null && hotTableRef.current) {
            const hotInstance = hotTableRef.current.hotInstance;
            if (hotInstance) {
                const currentSelection = hotInstance.getSelected();
                const isAlreadySelected = currentSelection &&
                    currentSelection[0] &&
                    currentSelection[0][0] === selectedVariable;

                if (!isAlreadySelected) {
                    isSelectionProgrammatic.current = true;
                    hotInstance.selectCell(selectedVariable, 0);
                    setSelectedCell({ row: selectedVariable, col: 0 });

                    setTimeout(() => {
                        isSelectionProgrammatic.current = false;
                    }, 0);
                }
            }
        }
    }, [selectedVariable]);

    /**
     * Handles data changes before they're applied to the grid
     */
    const handleBeforeChange = (
        changes: (Handsontable.CellChange | null)[],
        source: Handsontable.ChangeSource
    ): void | boolean => {
        if (source === "loadData" || !changes) return;

        const { getVariableByColumnIndex } = useVariableStore.getState();
        const changesByRow: Record<number, Handsontable.CellChange[]> = {};

        // Process changes and check for special column handling
        for (const change of changes) {
            if (!change) continue;

            const [row, prop, oldValue, newValue] = change;
            if (newValue === oldValue || typeof row !== "number") continue;

            const propIndex = Number(prop);

            // Special handling for type, values, and missing columns
            if (propIndex === TYPE_COLUMN_INDEX) {
                setSelectedCell({ row, col: propIndex });
                setShowTypeDialog(true);
                return false;
            } else if (propIndex === VALUES_COLUMN_INDEX) {
                setSelectedCell({ row, col: propIndex });
                setShowValuesDialog(true);
                return false;
            } else if (propIndex === MISSING_COLUMN_INDEX) {
                setSelectedCell({ row, col: propIndex });
                setShowMissingDialog(true);
                return false;
            }

            // Group changes by row
            if (!changesByRow[row]) changesByRow[row] = [];
            changesByRow[row].push(change);
        }

        // Apply changes by row
        Object.keys(changesByRow).forEach(rowKey => {
            const row = Number(rowKey);
            const rowChanges = changesByRow[row];
            let variable = getVariableByColumnIndex(row);

            if (variable) {
                // Update existing variable
                updateExistingVariable(row, rowChanges);
            } else {
                // Create new variable
                createNewVariable(row, rowChanges);
            }
        });
    };

    /**
     * Updates an existing variable with changes
     */
    const updateExistingVariable = async (row: number, changes: Handsontable.CellChange[]) => {
        const variable = useVariableStore.getState().getVariableByColumnIndex(row);
        if (!variable) return;

        let isTypeChanged = false;
        let isWidthChanged = false;
        let newType = variable.type;
        let newWidth = variable.width;

        for (const change of changes) {
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

            updateVariable(row, field as keyof Variable, newValue);
        }

        if (isTypeChanged || isWidthChanged) {
            await useDataStore.getState().validateVariableData(row, newType, newWidth);
        }
    };

    /**
     * Creates a new variable with initial data
     */
    const createNewVariable = (row: number, changes: Handsontable.CellChange[]) => {
        const variableData: Partial<Variable> = {
            columnIndex: row
        };

        changes.forEach(change => {
            if (!change) return;
            const [, prop, , newValue] = change;
            const field = FIELD_MAPPING[Number(prop)] || prop;
            variableData[field as keyof Variable] = newValue as any;
        });

        addVariable(variableData).then(() => {
            ensureMatrixDimensions(-1, row);
        });
    };

    /**
     * Handles selection events
     */
    const handleAfterSelectionEnd = (
        row: number,
        column: number,
        row2: number,
        column2: number,
        selectionLayerLevel: number
    ) => {
        if (!isSelectionProgrammatic.current) {
            setSelectedCell({ row, col: column });
            selectVariable(row);
        }

        // Open appropriate dialog based on column
        if (column === TYPE_COLUMN_INDEX) {
            setShowTypeDialog(true);
        } else if (column === VALUES_COLUMN_INDEX) {
            setShowValuesDialog(true);
        } else if (column === MISSING_COLUMN_INDEX) {
            setShowMissingDialog(true);
        }
    };

    /**
     * Inserts a new variable at the selected position
     */
    const handleInsertVariable = () => {
        if (!selectedCell) return;

        const { row } = selectedCell;
        const newVariable: Partial<Variable> = {
            columnIndex: row,
            name: `var${row + 1}`
        };

        addVariable(newVariable)
            .then(() => {
                addColumn(row);
                ensureMatrixDimensions(0, row);
            })
            .catch(err => {
                console.error("Error inserting variable:", err);
            });
    };

    /**
     * Deletes the selected variable
     */
    const handleDeleteVariable = () => {
        if (!selectedCell) return;

        const { row } = selectedCell;
        deleteVariable(row).then(() => {
            deleteColumn(row);
        });
    };

    /**
     * Updates variable type properties
     */
    const handleTypeSelection = async (type: string, width: number, decimals: number) => {
        if (!selectedCell) return;

        const { row } = selectedCell;
        const variable = useVariableStore.getState().getVariableByColumnIndex(row);

        if (variable) {
            updateVariable(row, 'type', type as any);
            updateVariable(row, 'width', width);
            updateVariable(row, 'decimals', decimals);
            await useDataStore.getState().validateVariableData(row, type, width);
        } else {
            addVariable({
                columnIndex: row,
                type: type as any,
                width,
                decimals
            }).then(() => {
                ensureMatrixDimensions(0, row);
            });
        }
    };

    /**
     * Updates variable value labels
     */
    const handleValuesSelection = (values: ValueLabel[]) => {
        if (!selectedCell) return;

        const { row } = selectedCell;
        const variable = useVariableStore.getState().getVariableByColumnIndex(row);

        if (variable) {
            updateVariable(row, 'values', values);
        } else {
            addVariable({
                columnIndex: row,
                values
            }).then(() => {
                ensureMatrixDimensions(0, row);
            });
        }
    };

    /**
     * Updates variable missing values
     */
    const handleMissingSelection = (missing: (number | string)[]) => {
        if (!selectedCell) return;

        const { row } = selectedCell;
        const variable = useVariableStore.getState().getVariableByColumnIndex(row);

        if (variable) {
            updateVariable(row, 'missing', missing);
        } else {
            addVariable({
                columnIndex: row,
                missing
            }).then(() => {
                ensureMatrixDimensions(0, row);
            });
        }
    };

    /**
     * Gets the name of the currently selected variable
     */
    const getSelectedVariableName = (): string => {
        if (!selectedCell) return "";

        const variable = variables.find(v => v.columnIndex === selectedCell.row);
        return variable?.name || `var${selectedCell.row + 1}`;
    };

    /**
     * Gets the value labels of the currently selected variable
     */
    const getSelectedVariableValues = (): ValueLabel[] => {
        if (!selectedCell) return [];

        const variable = variables.find(v => v.columnIndex === selectedCell.row);
        return variable?.values || [];
    };

    /**
     * Gets the missing values of the currently selected variable
     */
    const getSelectedVariableMissing = (): (number | string)[] => {
        if (!selectedCell) return [];

        const variable = variables.find(v => v.columnIndex === selectedCell.row);
        return variable?.missing || [];
    };

    /**
     * Context menu configuration
     */
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

    /**
     * Cell properties customization
     */
    const getCellProperties = (row: number, col: number) => {
        const cellProperties: any = {};

        if (col === TYPE_COLUMN_INDEX) {
            cellProperties.className = 'type-column';
        } else if (col === VALUES_COLUMN_INDEX) {
            cellProperties.className = 'values-column';
        } else if (col === MISSING_COLUMN_INDEX) {
            cellProperties.className = 'missing-column';
        }

        return cellProperties;
    };

    /**
     * Handles key down events for custom keyboard navigation
     */
    const handleBeforeKeyDown = (event: KeyboardEvent) => {
        if (event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            event.stopImmediatePropagation();
            event.preventDefault();
            return false;
        }
    };

    /**
     * Handles range end for custom selection behavior
     */
    const handleBeforeSetRangeEnd = (coords: any) => {
        const hotInstance = hotTableRef.current?.hotInstance;
        if (!hotInstance) return coords;

        const currentSelection = hotInstance.getSelectedRangeLast();
        if (!currentSelection) return coords;

        const startCol = currentSelection.from.col;
        if (coords.col !== startCol) {
            coords.col = startCol;
        }

        return coords;
    };

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