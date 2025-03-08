"use client";

import React, { useState } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SortVariablesModalProps {
    onClose: () => void;
}

const SortVariablesModal: React.FC<SortVariablesModalProps> = ({ onClose }) => {
    // Daftar kolom Variable View yang bisa dipilih
    const [columns] = useState<string[]>([
        "Name",
        "Type",
        "Width",
        "Decimals",
        "Label",
        "Values",
        "Missing",
        "Columns",
        "Align",
        "Measure",
    ]);

    // Kolom yang dipilih untuk diurutkan
    const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

    // Sort order: "asc" atau "desc"
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // State untuk opsi “Save the current (pre-sorted) variable order...”
    const [savePreSortedOrder, setSavePreSortedOrder] = useState<boolean>(false);
    const [attributeName, setAttributeName] = useState<string>("");

    // Event handler untuk memilih kolom
    const handleSelectColumn = (column: string) => {
        setSelectedColumn(column);
    };

    // Tombol OK
    const handleOk = () => {
        // Logika sorting
        // ...
        onClose();
    };

    // Tombol Reset
    const handleReset = () => {
        setSelectedColumn(null);
        setSortOrder("asc");
        setSavePreSortedOrder(false);
        setAttributeName("");
    };

    return (
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Sort Variables</DialogTitle>
            </DialogHeader>

            {/* Daftar “Variable View Columns” */}
            <div className="mb-4">
                <p className="font-semibold mb-2">Variable View Columns</p>
                <ul className="border p-2 h-40 overflow-auto">
                    {columns.map((col) => (
                        <li
                            key={col}
                            className={`p-1 cursor-pointer hover:bg-gray-100 ${
                                selectedColumn === col ? "bg-gray-200" : ""
                            }`}
                            onClick={() => handleSelectColumn(col)}
                        >
                            {col}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Sort Order */}
            <div className="mb-4">
                <p className="font-semibold mb-2">Sort Order</p>
                <div className="flex items-center gap-4">
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

            {/* Save the current (pre-sorted) variable order */}
            <div className="mb-4 border p-2 rounded">
                <label className="flex items-center gap-2 mb-2">
                    <input
                        type="checkbox"
                        checked={savePreSortedOrder}
                        onChange={() => setSavePreSortedOrder((prev) => !prev)}
                    />
                    Save the current (pre-sorted) variable order in a new attribute
                </label>
                {savePreSortedOrder && (
                    <div className="mt-2">
                        <label className="block mb-1">Attribute name:</label>
                        <input
                            type="text"
                            value={attributeName}
                            onChange={(e) => setAttributeName(e.target.value)}
                            className="border p-1 w-full"
                        />
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <DialogFooter>
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

export default SortVariablesModal;
