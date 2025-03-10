"use client";

import React, { useState, FC } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ModalType, useModal } from "@/hooks/useModal";
import { useVariableStore } from "@/stores/useVariableStore";
import { useDataStore } from "@/stores/useDataStore";

interface OpenDataProps {
    onClose: () => void;
}

// Helper function to map SPSS format types to our interface types
const mapSPSSTypeToInterface = (formatType: string): string => {
    const typeMap: { [key: string]: string } = {
        "F": "NUMERIC",
        "COMMA": "COMMA",
        "E": "SCIENTIFIC",
        "DATE": "DATE",
        "ADATE": "ADATE",
        "EDATE": "EDATE",
        "SDATE": "SDATE",
        "JDATE": "JDATE",
        "QYR": "QYR",
        "MOYR": "MOYR",
        "WKYR": "WKYR",
        "DATETIME": "DATETIME",
        "TIME": "TIME",
        "DTIME": "DTIME",
        "WKDAY": "WKDAY",
        "MONTH": "MONTH",
        "DOLLAR": "DOLLAR",
        "A": "STRING",
        "CCA": "CCA",
        "CCB": "CCB",
        "CCC": "CCC",
        "CCD": "CCD",
        "CCE": "CCE"
    };

    return typeMap[formatType] || "NUMERIC";
};

const OpenData: FC<OpenDataProps> = ({ onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [meta, setMeta] = useState<any>(null);
    const [rows, setRows] = useState<any[]>([]);

    const { closeModal } = useModal();
    const { overwriteVariables, resetVariables } = useVariableStore();
    const { setDataAndSync, resetData } = useDataStore();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] || null;
        setFile(selected);
    };

    const handleSubmit = async () => {
        if (file) {
            const formData = new FormData();
            formData.append("file", file);

            setLoading(true);
            setError(null);

            try {
                await resetData();
                await resetVariables();

                const response = await fetch("http://localhost:5000/api/sav/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Failed to process file");
                }

                const result = await response.json();
                console.log("Metadata:", result.meta);
                console.log("Data rows:", result.rows);

                setMeta(result.meta);
                setRows(result.rows);

                const numCases = result.meta.header.n_cases;
                const numVars = result.meta.header.n_vars;
                const sysvars = result.meta.sysvars;

                const variables = sysvars.map((varInfo: any, colIndex: number) => {
                    const variableName = varInfo.name || `VAR${colIndex + 1}`;
                    const formatType = varInfo.printFormat.typestr;
                    const isString = formatType === "A" || varInfo.type === 1;

                    const valueLabelsObj = result.meta.valueLabels?.find(
                        (vl: any) => vl.appliesToNames.includes(variableName)
                    );

                    const valueLabels = valueLabelsObj ?
                        valueLabelsObj.entries.map((entry: any) => ({
                            id: undefined,
                            variableName,
                            value: entry.val,
                            label: entry.label
                        })) : [];

                    return {
                        columnIndex: colIndex,
                        name: variableName,
                        type: mapSPSSTypeToInterface(formatType),
                        width: varInfo.printFormat.width,
                        decimals: varInfo.printFormat.nbdec,
                        label: varInfo.label || "",
                        values: valueLabels,
                        missing: varInfo.missing ? [varInfo.missing] : [],
                        columns: 200,
                        align: isString ? "left" : "right",
                        measure: isString ? "nominal" : "scale",
                        role: "input"
                    };
                });

                const dataMatrix = Array(numCases).fill(0).map((_, rowIndex) => {
                    const rowData = result.rows[rowIndex] || {};
                    return Array(numVars).fill(0).map((_, colIndex) => {
                        const colName = sysvars[colIndex]?.name;
                        return rowData[colName] !== undefined ? rowData[colName] : "";
                    });
                });

                await overwriteVariables(variables);
                await setDataAndSync(dataMatrix);

                closeModal();
            } catch (error) {
                console.error("Error uploading or processing file:", error);
                setError("Error uploading or processing file");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Open Data</DialogTitle>
                <DialogDescription>
                    Upload a new .sav file and read its content.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <input
                    type="file"
                    accept=".sav"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="mt-2 w-full border border-gray-300 p-2 rounded"
                />
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                    Batal
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Processing..." : "Upload"}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default OpenData;
