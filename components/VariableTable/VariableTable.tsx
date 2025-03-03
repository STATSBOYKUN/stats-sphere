"use client";

import React, { useRef, useEffect, useMemo } from "react";
import Handsontable from "handsontable";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { colHeaders, columns } from "./tableConfig";
import { useVariableStore } from "@/stores/useVariableStore";
import { Variable } from "@/lib/db";

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
    console.log("[handleBeforeChange] Source:", source);
    if (source === "loadData" || !changes) return;

    const { getVariableByColumnIndex, addVariable, updateVariable } = useVariableStore.getState();
    const changesByRow: Record<number, Handsontable.CellChange[]> = {};

    // Kelompokkan perubahan berdasarkan row (indeks variabel)
    changes.forEach(change => {
        if (!change) return;
        const [row, prop, oldValue, newValue] = change;
        if (newValue === oldValue) return;
        if (typeof row !== "number") return;
        if (!changesByRow[row]) changesByRow[row] = [];
        changesByRow[row].push(change);
    });
    console.log("[handleBeforeChange] Changes grouped by row:", changesByRow);

    // Proses perubahan per baris
    Object.keys(changesByRow).forEach(rowKey => {
        const row = Number(rowKey); // row index sebagai columnIndex variabel
        const rowChanges = changesByRow[row];
        console.log(`[handleBeforeChange] Processing row ${row} with changes:`, rowChanges);
        let variable = getVariableByColumnIndex(row);
        console.log(`[handleBeforeChange] Retrieved variable for row ${row}:`, variable);

        if (variable && variable.name.trim() !== "") {
            // Jika variabel sudah ada, update field-nya
            rowChanges.forEach(change => {
                const [rowIndex, prop, oldValue, newValue] = change;
                const field = fieldMapping[Number(prop)] || prop;
                if (newValue === oldValue) return;
                console.log(`[handleBeforeChange] Updating variable at row ${rowIndex}, field "${field}" from "${oldValue}" to "${newValue}"`);
                updateVariable(row, field as keyof Variable, newValue);
            });
        } else {
            // Jika variabel belum ada, buat variabel baru berdasarkan perubahan di baris ini
            let newName = "";
            let newType: Variable["type"] = "NUMERIC";
            let width = 8;
            let decimals = 2;
            rowChanges.forEach(change => {
                const [rowIndex, prop, oldValue, newValue] = change;
                const field = fieldMapping[Number(prop)] || prop;
                console.log(`[handleBeforeChange] Processing change at row ${rowIndex}, field "${field}": from "${oldValue}" to "${newValue}"`);
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
                console.log(`[handleBeforeChange] Generated unique variable name: ${newName}`);
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
            console.log(`[handleBeforeChange] Adding new variable at row ${row}:`, defaultVariable);
            addVariable(defaultVariable);
            rowChanges.forEach(change => {
                const [rowIndex, prop, oldValue, newValue] = change;
                const field = fieldMapping[Number(prop)] || prop;
                if (field !== "name") {
                    console.log(`[handleBeforeChange] Updating new variable at row ${row}, field "${field}" from "${oldValue}" to "${newValue}"`);
                    updateVariable(row, field as keyof Variable, newValue);
                }
            });
        }
    });
};




export default function VariableTable() {
    const containerRef = useRef<HTMLDivElement>(null);
    const hotInstance = useRef<Handsontable | null>(null);
    const { variables, loadVariables } = useVariableStore();
    useEffect(() => { loadVariables(); }, [loadVariables]);
    const settings = useMemo(() => ({
        data: getDisplayVariable(variables),
        colHeaders,
        columns,
        rowHeaders: true,
        width: "100%",
        height: "100%",
        autoWrapRow: true,
        autoWrapCol: true,
        contextMenu: true,
        licenseKey: "non-commercial-and-evaluation",
        minSpareRows: 1,
        beforeChange: handleBeforeChange
    }), [variables]);
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
        return () => { if (hotInstance.current) { hotInstance.current.destroy(); hotInstance.current = null; } };
    }, []);
    return (
        <div className="h-full w-full">
            <div ref={containerRef} className="h-full w-full z-0" />
        </div>
    );
}
