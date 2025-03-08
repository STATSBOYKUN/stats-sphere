"use client";

import React, { useState } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SortCasesModalProps {
    onClose: () => void;
}

const SortCasesModal: React.FC<SortCasesModalProps> = ({ onClose }) => {
    // Daftar variabel yang tersedia
    const [variables, setVariables] = useState<string[]>([
        "Identifier [id]",
        "Nama [name]",
        "HOUR, not periodic",
        "MINUTE, period 60",
        "Date. Format: \"HH:mm:ss\"",
    ]);

    // Variabel yang dipilih untuk Sort By
    const [sortBy, setSortBy] = useState<string | null>(null);

    // Sort Order: "asc" atau "desc"
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Opsi Save Sorted Data
    const [saveSortedData, setSaveSortedData] = useState<boolean>(false);
    const [fileName, setFileName] = useState<string>("");
    const [createIndex, setCreateIndex] = useState<boolean>(false);

    // Fungsi untuk memindahkan variabel ke "Sort by"
    const handleSelectVariable = (variable: string) => {
        setSortBy(variable);
    };

    // Event handler tombol OK
    const handleOk = () => {
        // Logika sorting dan penyimpanan data
        // ...
        onClose();
    };

    // Event handler tombol Reset
    const handleReset = () => {
        setSortBy(null);
        setSortOrder("asc");
        setSaveSortedData(false);
        setFileName("");
        setCreateIndex(false);
    };

    return (
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Sort Cases</DialogTitle>
            </DialogHeader>

            <div className="flex gap-4">
                {/* Bagian Kiri: Daftar Variabel */}
                <div className="flex-1">
                    <p className="font-semibold mb-2">Variables:</p>
                    <ul className="border p-2 h-40 overflow-auto">
                        {variables.map((variable) => (
                            <li
                                key={variable}
                                className={`p-1 cursor-pointer hover:bg-gray-100 ${
                                    variable === sortBy ? "bg-gray-200" : ""
                                }`}
                                onClick={() => handleSelectVariable(variable)}
                            >
                                {variable}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Bagian Kanan: Sort by + Sort Order */}
                <div className="flex-1">
                    <p className="font-semibold mb-2">Sort by:</p>
                    <div className="border h-10 flex items-center justify-center mb-4">
                        {sortBy ? sortBy : "No variable selected"}
                    </div>
                    <div className="mb-4">
                        <p className="font-semibold">Sort Order:</p>
                        <div className="flex items-center gap-2 mt-2">
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="sortOrder"
                                    checked={sortOrder === "asc"}
                                    onChange={() => setSortOrder("asc")}
                                />
                                Ascending
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="sortOrder"
                                    checked={sortOrder === "desc"}
                                    onChange={() => setSortOrder("desc")}
                                />
                                Descending
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Sorted Data */}
            <div className="mt-4 border p-2 rounded">
                <label className="flex items-center gap-2 mb-2">
                    <input
                        type="checkbox"
                        checked={saveSortedData}
                        onChange={() => setSaveSortedData((prev) => !prev)}
                    />
                    Save file with sorted data
                </label>
                {saveSortedData && (
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                // Buka dialog file picker, misalnya:
                                const fakeFile = "sorted_data.csv";
                                setFileName(fakeFile);
                            }}
                            className="mb-2"
                        >
                            File...
                        </Button>
                        {fileName && <p>Selected File: {fileName}</p>}
                    </>
                )}
                <label className="flex items-center gap-2 mt-2">
                    <input
                        type="checkbox"
                        checked={createIndex}
                        onChange={() => setCreateIndex((prev) => !prev)}
                    />
                    Create an index
                </label>
            </div>

            <DialogFooter className="mt-4">
                <Button variant="outline" onClick={handleOk}>
                    OK
                </Button>
                <Button variant="outline" onClick={() => alert("Paste syntax here")}>
                    Paste
                </Button>
                <Button variant="outline" onClick={handleReset}>
                    Reset
                </Button>
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="outline" onClick={() => alert("Help dialog here")}>
                    Help
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default SortCasesModal;
