"use client";

import React, { useState, FC, useEffect } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/stores/useDataStore";
import { useVariableStore, VariableRow } from "@/stores/useVariableStore";
import * as XLSX from "xlsx";
import { HotTable } from "@handsontable/react";

interface ReadExcelFileProps {
    onClose: () => void;
    fileName: string;
    fileContent: string;
}

const ReadExcelFile: FC<ReadExcelFileProps> = ({ onClose, fileName, fileContent }) => {
    const { updateCell } = useDataStore();
    const [removeLeading, setRemoveLeading] = useState<boolean>(false);
    const [removeTrailing, setRemoveTrailing] = useState<boolean>(false);
    const [ignoreHidden, setIgnoreHidden] = useState<boolean>(false);
    const [columns, setColumns] = useState<number>(50);
    const [rows, setRows] = useState<number>(100);

    const [worksheet, setWorksheet] = useState<string | undefined>(undefined);
    const [range, setRange] = useState<string>("A1:D34");
    const [data, setData] = useState<any[]>([]);
    const [firstLineContains, setFirstLineContains] = useState<boolean>(false);
    const [workbook, setWorkbook] = useState<any>(null);

    const handleOk = async () => {
        const sheet = workbook.Sheets[worksheet!];
        const dataRange = range.split(":");

        const startCell = dataRange[0] || "A1";
        const endCell = dataRange[1] || "Z100";

        const sheetData = XLSX.utils.sheet_to_json(sheet, {
            range: `${startCell}:${endCell}`,
            header: 1,
            defval: "",
        });

        const headerRow: string[] | undefined = firstLineContains ? sheetData.shift() as string[] : undefined;

        const previewData = firstLineContains ? sheetData.slice(1) : sheetData;

        setData(previewData);

        const store = useVariableStore.getState();
        const { addVariable, getVariableByColumnIndex, updateVariable, variables } = store;

        const numCols = previewData[0]?.length || 0;

        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            const colData = previewData.map((row) => row[colIndex] || "");
            const isNumeric = colData.every((val) => !isNaN(parseFloat(val)));

            const maxLength = isNumeric ? 8 : Math.max(...colData.map((val) => val.length));
            const variableName = firstLineContains && headerRow ? headerRow[colIndex] : `VAR${colIndex + 1}`;

            const variable: VariableRow = {
                columnIndex: colIndex,
                name: variableName,
                type: isNumeric ? "Numeric" : "String",
                width: isNumeric ? 8 : maxLength,
                decimals: isNumeric ? 2 : 0,
                label: "",
                values: "None",
                missing: "None",
                columns: 200,
                align: "Right",
                measure: "Nominal",
            };

            const existingVariable = getVariableByColumnIndex(colIndex);
            if (existingVariable) {
                const rowIndex = variables.findIndex((v) => v.columnIndex === colIndex);
                if (rowIndex !== -1) {
                    const keys = Object.keys(variable) as (keyof VariableRow)[];
                    for (const field of keys) {
                        await updateVariable(rowIndex, field, variable[field]);
                    }
                }
            } else {
                await addVariable(variable);
            }
        }

        previewData.forEach((row, rowIndex) => {
            row.forEach((value, colIndex) => {
                updateCell(rowIndex, colIndex, value);
            });
        });

        onClose();
    };

    const handleReset = () => {
        setWorksheet("");
        setRange("");
        setFirstLineContains(false);
        setRemoveLeading(false);
        setRemoveTrailing(false);
        setIgnoreHidden(false);
        setData([]);
    };

    const handleCancel = () => {
        onClose();
    };

    const handleHelp = () => {
        alert("Help content here");
    };

    useEffect(() => {
        if (!fileContent) return;

        const wb = XLSX.read(fileContent, { type: "binary" });
        setWorkbook(wb);

        const sheetNames = wb.SheetNames;
        setWorksheet(sheetNames[0]);

        const sheet = wb.Sheets[sheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const rowCount = sheetData.length;
        const colCount = sheetData[0]?.length || 0;
        setRange(`A1:${String.fromCharCode(65 + colCount - 1)}${rowCount}`);

        setData(sheetData.slice(0, 100).map((row: any[]) => row.slice(0, 50)));
    }, [fileContent]);

    const handleWorksheetChange = (newWorksheet: string) => {
        setWorksheet(newWorksheet);
        updatePreview(newWorksheet, range, firstLineContains);
    };

    const handleRangeChange = (newRange: string) => {
        setRange(newRange);
        updatePreview(worksheet, newRange, firstLineContains);
    };

    const handleFirstLineChange = (checked: boolean) => {
        setFirstLineContains(checked);
        updatePreview(worksheet, range, checked);
    };

    const updatePreview = (worksheet: string | undefined, range: string, firstLineContains: boolean) => {
        if (!worksheet || !workbook) return;

        const sheet = workbook.Sheets[worksheet];
        const sheetData = XLSX.utils.sheet_to_json(sheet, {
            range: range,
            header: 1,
            defval: "",
        });

        let headerRow: string[] | undefined;
        if (firstLineContains) {
            headerRow = sheetData.shift() as string[];
        }

        const previewData = firstLineContains ? sheetData : sheetData;

        setData(previewData);

        if (firstLineContains) {
            setColumnHeaders(headerRow || []);
        }
    };

    const [columnHeaders, setColumnHeaders] = useState<string[]>([]);

    return (
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Read Excel File</DialogTitle>
            </DialogHeader>
            <div>
                <strong>File:</strong> {fileName}
            </div>
            <div className="flex items-center space-x-2">
                <strong>Worksheet:</strong>
                <select
                    value={worksheet}
                    onChange={(e) => handleWorksheetChange(e.target.value)}
                    className="w-full px-2 py-1 border rounded-md"
                >
                    {workbook && workbook.SheetNames.map((sheetName, index) => (
                        <option key={index} value={sheetName}>
                            {sheetName}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex items-center space-x-2">
                <strong>Input Range:</strong>
                <input
                    type="text"
                    value={range}
                    onChange={(e) => handleRangeChange(e.target.value)}
                    className="w-1/2 text-sm p-1 border rounded"
                    placeholder="e.g. A1:Z100"
                />
            </div>
            <div className="space-y-1 mb-2">
                <label className="flex items-center space-x-1 text-sm">
                    <input
                        type="checkbox"
                        checked={firstLineContains}
                        onChange={(e) => handleFirstLineChange(e.target.checked)}
                    />
                    <span>Read variable names from first row of data</span>
                </label>
                <label className="flex items-center space-x-1 text-sm">
                    <input
                        type="checkbox"
                        checked={ignoreHidden}
                        onChange={(e) => setIgnoreHidden(e.target.checked)}
                    />
                    <span>Ignore hidden rows and columns</span>
                </label>
                <label className="flex items-center space-x-1 text-sm">
                    <input
                        type="checkbox"
                        checked={removeLeading}
                        onChange={(e) => setRemoveLeading(e.target.checked)}
                    />
                    <span>Remove leading spaces from string values</span>
                </label>
                <label className="flex items-center space-x-1 text-sm">
                    <input
                        type="checkbox"
                        checked={removeTrailing}
                        onChange={(e) => setRemoveTrailing(e.target.checked)}
                    />
                    <span>Remove trailing spaces from string values</span>
                </label>
            </div>
                <strong className="text-sm">Preview (first 100 rows, 50 columns):</strong>
                <HotTable
                    data={data}
                    colHeaders={columnHeaders}
                    columns={data[0]?.map((_, i) => ({
                        data: i,
                        readOnly: true
                    }))}
                    width="100%"
                    height="200px"
                    stretchH="all"
                    licenseKey="non-commercial-and-evaluation"
                    className="handsontable-preview"
                    afterChange={(changes) => {
                        // Handle live updates here
                        if (changes) {
                            changes.forEach(([row, col, oldValue, newValue]) => {
                                console.log(`Cell at [${row}, ${col}] changed from ${oldValue} to ${newValue}`);
                                updateCell(row, col, newValue); // Update state/store with the new value
                            });
                        }
                    }}
                />
            <p className="text-xs text-gray-500">
                Disclaimer: Preview hanya menampilkan 100 baris pertama dan 50 kolom pertama.
            </p>
            <DialogFooter className="space-x-2">
                <Button onClick={handleOk} size="sm">OK</Button>
                <Button variant="outline" onClick={handleReset} size="sm">Reset</Button>
                <Button variant="outline" onClick={handleCancel} size="sm">Cancel</Button>
                <Button variant="outline" onClick={handleHelp} size="sm">Help</Button>
            </DialogFooter>
        </DialogContent>

    );
};

export default ReadExcelFile;
