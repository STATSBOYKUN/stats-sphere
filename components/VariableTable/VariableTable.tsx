"use client";

import React, { useRef, useMemo } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { colHeaders, columns } from "./tableConfig";
import { useVariableStore } from "@/stores/useVariableStore";
import { Variable } from "@/types/Variable";
import Handsontable from "handsontable";

registerAllModules();

function getDisplayVariable(variables: Variable[]): (string | number)[][] {
    const maxIndex = variables.reduce((acc, v) => Math.max(acc, v.columnIndex + 1), 0);
    const newCount = Math.max(45, maxIndex);
    const variableLookup: { [key: number]: Variable } = {};
    variables.forEach(variable => {
        if (variable.name.trim() !== "") variableLookup[variable.columnIndex] = variable;
    });
    return Array.from({ length: newCount }, (_, index) => {
        const variable = variableLookup[index];
        const isDefault = !variable || variable.name.trim() === "";
        return [
            isDefault ? "" : variable!.name,
            isDefault ? "" : variable!.type,
            isDefault ? "" : variable!.width,
            isDefault ? "" : variable!.decimals,
            isDefault ? "" : variable!.label || "",
            isDefault
                ? ""
                : Array.isArray(variable!.values) && variable!.values.length > 0
                    ? variable!.values.map((vl: any) => `${vl.value}: ${vl.label}`).join(", ")
                    : "",
            isDefault
                ? ""
                : Array.isArray(variable!.missing) && variable!.missing.length > 0
                    ? variable!.missing.join(", ")
                    : "",
            isDefault ? "" : variable!.columns,
            isDefault ? "" : variable!.align,
            isDefault ? "" : variable!.measure,
        ];
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
    "measure"
];

const handleBeforeChange = (
    changes: (Handsontable.CellChange | null)[],
    source: Handsontable.ChangeSource
): void | boolean => {
    if (source === "loadData" || !changes) return;

    const { getVariableByColumnIndex, addVariable, updateVariable } = useVariableStore.getState();
    const changesByRow: Record<number, Handsontable.CellChange[]> = {};

    changes.forEach(change => {
        if (!change) return;
        const [row, prop, oldValue, newValue] = change;
        if (newValue === oldValue) return;
        if (typeof row !== "number") return;
        if (!changesByRow[row]) changesByRow[row] = [];
        changesByRow[row].push(change);
    });

    Object.keys(changesByRow).forEach(rowKey => {
        const row = Number(rowKey);
        const rowChanges = changesByRow[row];
        let variable = getVariableByColumnIndex(row);

        if (variable && variable.name.trim() !== "") {
            rowChanges.forEach(change => {
                const [rowIndex, prop, oldValue, newValue] = change;
                const field = fieldMapping[Number(prop)] || prop;
                if (newValue === oldValue) return;
                updateVariable(row, field as keyof Variable, newValue);
            });
        } else {
            let newName = "";
            let newType: Variable["type"] = "NUMERIC";
            let width = 8;
            let decimals = 2;
            rowChanges.forEach(change => {
                const [rowIndex, prop, oldValue, newValue] = change;
                const field = fieldMapping[Number(prop)] || prop;
                switch (field) {
                    case "name":
                        newName = newValue.toString().trim();
                        break;
                    case "type":
                        newType = newValue.toString() as Variable["type"];
                        if (newType !== "NUMERIC") {
                            width = Math.max(width, newValue.toString().length);
                            decimals = 0;
                        }
                        break;
                    default:
                        break;
                }
            });
            if (newName === "") {
                newName = generateUniqueVarName();
            }
            const defaultVariable: Variable = {
                columnIndex: row,
                name: newName,
                type: newType,
                width,
                decimals,
                label: "",
                values: [],
                missing: [],
                columns: 200,
                align: newType === "NUMERIC" ? "right" : "left",
                measure: newType === "NUMERIC" ? "scale" : "nominal",
                role: "input"
            };
            addVariable(defaultVariable);
            rowChanges.forEach(change => {
                const [rowIndex, prop, oldValue, newValue] = change;
                const field = fieldMapping[Number(prop)] || prop;
                if (field !== "name") {
                    updateVariable(row, field as keyof Variable, newValue);
                }
            });
        }
    });
};

export default function VariableTable() {
    const hotTableRef = useRef(null);
    const { variables, loadVariables } = useVariableStore();

    const tableData = useMemo(() => getDisplayVariable(variables), [variables]);

    return (
        <div className="h-full w-full relative z-0">
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
                />
            </div>
        </div>
    );
}