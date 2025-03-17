"use client";

import React, { useState, FC } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {useDataStore} from "@/stores/useDataStore";
import {useVariableStore} from "@/stores/useVariableStore";
import { Variable } from "@/types/Variable";

interface ReadCSVFileProps {
    onClose: () => void;
    fileName: string;
    fileContent: string;
}

const ReadCSVFile: FC<ReadCSVFileProps> = ({ onClose, fileName, fileContent }) => {
    const { updateCell, resetData } = useDataStore();
    const { resetVariables } = useVariableStore();
    const [firstLineContains, setFirstLineContains] = useState<boolean>(false);
    const [removeLeading, setRemoveLeading] = useState<boolean>(false);
    const [removeTrailing, setRemoveTrailing] = useState<boolean>(false);

    const [delimiter, setDelimiter] = useState<string>("comma");
    const [decimal, setDecimal] = useState<string>("period");
    const [textQualifier, setTextQualifier] = useState<string>("doubleQuote");

    const handleOk = async () => {
        await resetData();
        await resetVariables();

        let delim = ',';
        if (delimiter === 'semicolon') delim = ';';
        else if (delimiter === 'tab') delim = '\t';

        let parsedRows = fileContent
            .split('\n')
            .map(line => line.split(delim));

        let headerRow: string[] | undefined;
        if (firstLineContains) {
            headerRow = parsedRows.shift();
        }

        const store = useVariableStore.getState();
        const { addVariable, getVariableByColumnIndex, updateVariable, variables } = store;
        const numCols = parsedRows.length > 0 ? parsedRows[0].length : 0;

        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            const colData = parsedRows.map(row => row[colIndex] || '');

            const isNumeric = colData.every(val => {
                const num = parseFloat(val);
                return !isNaN(num) && isFinite(num);
            });

            const maxLength = isNumeric ? 8 : Math.max(...colData.map(val => val.length));

            const variableName = firstLineContains && headerRow
                ? headerRow[colIndex]
                : `VAR${colIndex + 1}`;

            const variable: Variable = {
                columnIndex: colIndex,
                name: variableName,
                type: isNumeric ? 'NUMERIC' : 'STRING',
                width: isNumeric ? 8 : maxLength,
                decimals: isNumeric ? 2 : 0,
                label: '',
                values: [],
                missing: [],
                columns: 200,
                align: 'right',
                measure: 'nominal',
                role: 'input'
            };

            const existingVariable = getVariableByColumnIndex(colIndex);
            if (existingVariable) {
                const rowIndex = variables.findIndex(v => v.columnIndex === colIndex);
                if (rowIndex !== -1) {
                    const keys = Object.keys(variable) as (keyof Variable)[];
                    for (const field of keys) {
                        await updateVariable(rowIndex, field, variable[field]);
                    }
                }
            } else {
                await addVariable(variable);
            }
        }

        parsedRows.forEach((row, rowIndex) => {
            row.forEach((value, colIndex) => {
                updateCell(rowIndex, colIndex, value);
            });
        });

        onClose();
    };
    const handleReset = () => { };
    const handleCancel = () => { onClose(); };
    const handleHelp = () => { };

    return (
        <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
                <DialogTitle>Read CSV File</DialogTitle>
            </DialogHeader>
            <div className="mb-4">
                <strong>File:</strong> {fileName}
            </div>
            <div className="border rounded-md p-2 mb-4 h-60 overflow-y-auto bg-gray-50">
                <pre className="whitespace-pre-wrap text-sm">{fileContent}</pre>
            </div>
            <div className="space-y-2 mb-4">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={firstLineContains}
                        onChange={(e) => setFirstLineContains(e.target.checked)}
                    />
                    <span>First line contains variable names</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={removeLeading}
                        onChange={(e) => setRemoveLeading(e.target.checked)}
                    />
                    <span>Remove leading spaces from string values</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={removeTrailing}
                        onChange={(e) => setRemoveTrailing(e.target.checked)}
                    />
                    <span>Remove trailing spaces from string values</span>
                </label>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col">
                    <label className="mb-1">Delimiter:</label>
                    <select
                        value={delimiter}
                        onChange={(e) => setDelimiter(e.target.value)}
                        className="border rounded-md p-2"
                    >
                        <option value="comma">Comma (,)</option>
                        <option value="semicolon">Semicolon (;)</option>
                        <option value="tab">Tab (↹)</option>
                    </select>
                </div>
                <div className="flex flex-col">
                    <label className="mb-1">Decimal:</label>
                    <select
                        value={decimal}
                        onChange={(e) => setDecimal(e.target.value)}
                        className="border rounded-md p-2"
                    >
                        <option value="period">Period (.)</option>
                        <option value="comma">Comma (,)</option>
                    </select>
                </div>
                <div className="flex flex-col">
                    <label className="mb-1">Text Qualifier:</label>
                    <select
                        value={textQualifier}
                        onChange={(e) => setTextQualifier(e.target.value)}
                        className="border rounded-md p-2"
                    >
                        <option value="doubleQuote">Double Quote (&quot;)</option>
                        <option value="singleQuote">Single Quote (&apos;)</option>
                        <option value="none">None</option>
                    </select>
                </div>
            </div>
            <DialogFooter className="space-x-2">
                <Button onClick={handleOk}>OK</Button>
                <Button variant="outline" onClick={handleReset}>Reset</Button>
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button variant="outline" onClick={handleHelp}>Help</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default ReadCSVFile;