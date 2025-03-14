"use client";

import React, { useRef, useState, useEffect } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { colHeaders, columns } from "./tableConfig";
import { useVariableStore } from "@/stores/useVariableStore";
import { useDataStore } from "@/stores/useDataStore";
import { Variable } from "@/types/Variable";
import { ValueLabel } from "@/types/ValueLabel";
import Handsontable from "handsontable";
import { VariableTypeDialog } from "./VariableTypeDialog";
import { ValueLabelsDialog } from "./ValueLabelsDialog";
import { MissingValuesDialog } from "./MissingValuesDialog";

registerAllModules();

function getDisplayVariable(variables: Variable[]): (string | number)[][] {
    const maxColumnIndex = variables.length > 0
        ? Math.max(...variables.map(v => v.columnIndex))
        : -1;

    const rowCount = Math.max(45, maxColumnIndex + 1);

    return Array.from({ length: rowCount }, (_, index) => {
        const variable = variables.find(v => v.columnIndex === index);

        if (variable) {
            // Format missing values display based on type
            let missingDisplay = "";
            if (Array.isArray(variable.missing) && variable.missing.length > 0) {
                // Check if it's a range (for numeric types)
                if (variable.missing.length >= 2 &&
                    variable.type !== "STRING" &&
                    typeof variable.missing[0] === 'number' &&
                    typeof variable.missing[1] === 'number' &&
                    variable.missing[0] <= variable.missing[1]) {

                    // It's a range
                    missingDisplay = `${variable.missing[0]} thru ${variable.missing[1]}`;

                    // Add optional discrete value if present
                    if (variable.missing.length > 2) {
                        missingDisplay += `, ${variable.missing[2]}`;
                    }
                } else {
                    // It's discrete values
                    missingDisplay = variable.missing.map(m => {
                        // Special handling for space character
                        if (m === " ") return "'[Space]'";
                        return m;
                    }).join(", ");
                }
            }

            return [
                variable.name,
                variable.type,
                variable.width,
                variable.decimals,
                variable.label || "",
                Array.isArray(variable.values) && variable.values.length > 0
                    ? variable.values.map((vl: any) => `${vl.value === " " ? "[Space]" : vl.value}: ${vl.label}`).join(", ")
                    : "",
                missingDisplay,
                variable.columns,
                variable.align,
                variable.measure,
                variable.role
            ];
        } else {
            return ["", "", "", "", "", "", "", "", "", "", ""];
        }
    });
}

const fieldMapping = [
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

export default function VariableTable() {
    const hotTableRef = useRef<HotTable>(null);
    const { variables, loadVariables, updateVariable, addVariable } = useVariableStore();
    const [tableData, setTableData] = useState<(string | number)[][]>([]);
    const [showTypeDialog, setShowTypeDialog] = useState(false);
    const [showValuesDialog, setShowValuesDialog] = useState(false);
    const [showMissingDialog, setShowMissingDialog] = useState(false);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [selectedVariableType, setSelectedVariableType] = useState<string>("NUMERIC");

    useEffect(() => {
        loadVariables();
    }, [loadVariables]);

    useEffect(() => {
        setTableData(getDisplayVariable(variables));
    }, [variables]);

    // Update selected variable type when selectedCell changes
    useEffect(() => {
        if (selectedCell) {
            const variable = variables.find(v => v.columnIndex === selectedCell.row);
            setSelectedVariableType(variable?.type || "NUMERIC");
        }
    }, [selectedCell, variables]);

    const handleBeforeChange = (
        changes: (Handsontable.CellChange | null)[],
        source: Handsontable.ChangeSource
    ): void | boolean => {
        if (source === "loadData" || !changes) return;

        const { getVariableByColumnIndex } = useVariableStore.getState();
        const { addColumn } = useDataStore.getState();

        const changesByRow: Record<number, Handsontable.CellChange[]> = {};

        changes.forEach(change => {
            if (!change) return;
            const [row, prop, oldValue, newValue] = change;
            if (newValue === oldValue) return;
            if (typeof row !== "number") return;

            // Handle special columns with dialogs
            if (Number(prop) === 1) {
                setSelectedCell({ row, col: Number(prop) });
                setShowTypeDialog(true);
                return false;
            } else if (Number(prop) === 5) {
                setSelectedCell({ row, col: Number(prop) });
                setShowValuesDialog(true);
                return false;
            } else if (Number(prop) === 6) {
                setSelectedCell({ row, col: Number(prop) });
                setShowMissingDialog(true);
                return false;
            }

            if (!changesByRow[row]) changesByRow[row] = [];
            changesByRow[row].push(change);
        });

        Object.keys(changesByRow).forEach(rowKey => {
            const row = Number(rowKey);
            const rowChanges = changesByRow[row];
            let variable = getVariableByColumnIndex(row);

            if (variable) {
                rowChanges.forEach(change => {
                    const [rowIndex, prop, oldValue, newValue] = change;
                    const field = fieldMapping[Number(prop)] || prop;
                    if (newValue === oldValue) return;
                    updateVariable(row, field as keyof Variable, newValue);
                });
            } else {
                const variableData: Partial<Variable> = {
                    columnIndex: row
                };

                rowChanges.forEach(change => {
                    const [rowIndex, prop, oldValue, newValue] = change;
                    const field = fieldMapping[Number(prop)] || prop;
                    variableData[field as keyof Variable] = newValue as any;
                });

                addVariable(variableData).then(() => {
                    for (let i = 0; i <= row; i++) {
                        const exists = getVariableByColumnIndex(i);
                        if (!exists) {
                            addColumn(i);
                        }
                    }
                });
            }
        });
    };

    const handleAfterSelectionEnd = (
        row: number,
        column: number,
        row2: number,
        column2: number,
        selectionLayerLevel: number
    ) => {
        setSelectedCell({ row, col: column });

        if (column === 1) {
            setShowTypeDialog(true);
        } else if (column === 5) {
            setShowValuesDialog(true);
        } else if (column === 6) {
            setShowMissingDialog(true);
        }
    };

    const handleTypeSelection = (type: string, width: number, decimals: number) => {
        if (selectedCell) {
            const { row } = selectedCell;
            const variable = useVariableStore.getState().getVariableByColumnIndex(row);

            if (variable) {
                updateVariable(row, 'type', type as any);
                updateVariable(row, 'width', width);
                updateVariable(row, 'decimals', decimals);
            } else {
                addVariable({
                    columnIndex: row,
                    type: type as any,
                    width,
                    decimals
                });
            }
        }
    };

    const handleValuesSelection = (values: ValueLabel[]) => {
        if (selectedCell) {
            const { row } = selectedCell;
            const variable = useVariableStore.getState().getVariableByColumnIndex(row);

            if (variable) {
                updateVariable(row, 'values', values);
            } else {
                addVariable({
                    columnIndex: row,
                    values
                });
            }
        }
    };

    const handleMissingSelection = (missing: (number | string)[]) => {
        if (selectedCell) {
            const { row } = selectedCell;
            const variable = useVariableStore.getState().getVariableByColumnIndex(row);

            if (variable) {
                updateVariable(row, 'missing', missing);
            } else {
                addVariable({
                    columnIndex: row,
                    missing
                });
            }
        }
    };

    const getSelectedVariableName = (): string => {
        if (selectedCell) {
            const variable = variables.find(v => v.columnIndex === selectedCell.row);
            return variable?.name || `var${selectedCell.row + 1}`;
        }
        return "";
    };

    const getSelectedVariableValues = (): ValueLabel[] => {
        if (selectedCell) {
            const variable = variables.find(v => v.columnIndex === selectedCell.row);
            return variable?.values || [];
        }
        return [];
    };

    const getSelectedVariableMissing = (): (number | string)[] => {
        if (selectedCell) {
            const variable = variables.find(v => v.columnIndex === selectedCell.row);
            return variable?.missing || [];
        }
        return [];
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
                    contextMenu={true}
                    licenseKey="non-commercial-and-evaluation"
                    minSpareRows={1}
                    beforeChange={handleBeforeChange}
                    afterSelectionEnd={handleAfterSelectionEnd}
                    cells={(row, col) => {
                        const cellProperties: any = {};
                        if (col === 1) {
                            cellProperties.className = 'type-column';
                        } else if (col === 5) {
                            cellProperties.className = 'values-column';
                        } else if (col === 6) {
                            cellProperties.className = 'missing-column';
                        }
                        return cellProperties;
                    }}
                />
            </div>

            <VariableTypeDialog
                open={showTypeDialog}
                onOpenChange={setShowTypeDialog}
                onSave={handleTypeSelection}
                initialType={selectedCell?.row !== undefined && variables.length > 0
                    ? (variables.find(v => v.columnIndex === selectedCell.row)?.type || 'NUMERIC')
                    : 'NUMERIC'
                }
                initialWidth={selectedCell?.row !== undefined && variables.length > 0
                    ? (variables.find(v => v.columnIndex === selectedCell.row)?.width || 8)
                    : 8
                }
                initialDecimals={selectedCell?.row !== undefined && variables.length > 0
                    ? (variables.find(v => v.columnIndex === selectedCell.row)?.decimals || 2)
                    : 2
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