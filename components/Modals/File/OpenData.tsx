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

const OpenData: FC<OpenDataProps> = ({ onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [meta, setMeta] = useState<any>(null);
    const [rows, setRows] = useState<any[]>([]);

    const { closeModal } = useModal();
    const { addVariable, resetVariables } = useVariableStore();
    const { setData, updateCell, resetData } = useDataStore();

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

            await resetData();
            await resetVariables();

            try {
                const response = await fetch("http://localhost:5000/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Failed to process file");
                }

                const result = await response.json();
                console.log("Metadata:", result.meta);
                console.log("Data rows:", result.rows);

                // Menyimpan metadata dan data rows
                setMeta(result.meta);
                setRows(result.rows);

                // Memasukkan variabel dari metadata ke dalam store
                const sysvars = result.meta.sysvars;
                sysvars.forEach(async (varInfo: any, colIndex: number) => {
                    const variableName = varInfo.name || `VAR${colIndex + 1}`;
                    const isNumeric = varInfo.type === 0; // Menyatakan apakah variabel ini numerik (type 0)

                    const maxLength = isNumeric ? 8 : 24;

                    const variable = {
                        columnIndex: colIndex,
                        name: variableName,
                        type: isNumeric ? "NUMERIC" : "STRING",
                        width: maxLength,
                        decimals: isNumeric ? 2 : 0,
                        label: varInfo.label || "",
                        values: "None",
                        missing: "None",
                        columns: 200,
                        align: "Right",
                        measure: "Nominal",
                        role: "Input"
                    };

                    // Tambahkan variabel ke store
                    await addVariable(variable);
                });

                // Memasukkan data rows ke dalam data store
                result.rows.forEach((row: any, rowIndex: number) => {
                    sysvars.forEach((varInfo: any, colIndex: number) => {
                        const colName = varInfo.name;
                        const value = row[colName] !== undefined ? row[colName] : ""; // Jika tidak ada data, kosongkan

                        updateCell(rowIndex, colIndex, value);
                    });
                });

                // Setelah berhasil, tutup modal
                closeModal();
            } catch (error) {
                console.error("Error uploading or processing file:", error);
                setError("Error uploading or processing file");
            } finally {
                setLoading(false);
            }
        }
    };

    // Fungsi untuk memanggil dummy sav writer melalui endpoint /generate dan mengunduh file dummy.sav
    const handleGenerateDummy = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("http://localhost:5000/generate");
            if (!response.ok) {
                throw new Error("Gagal menghasilkan dummy sav file");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "dummy.sav";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error generating dummy file:", error);
            setError("Error generating dummy file");
        } finally {
            setLoading(false);
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

            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Tampilkan metadata dan data hasil upload */}
            {meta && (
                <div>
                    <h3>Metadata</h3>
                    <pre>{JSON.stringify(meta, null, 2)}</pre>
                </div>
            )}

            {rows.length > 0 && (
                <div>
                    <h3>Rows</h3>
                    <pre>{JSON.stringify(rows, null, 2)}</pre>
                </div>
            )}

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
