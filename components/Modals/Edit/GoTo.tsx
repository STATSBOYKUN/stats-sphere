"use client";

import React, { useState } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export enum GoToMode {
    CASE = "case",
    VARIABLE = "variable",
}

interface GoToModalProps {
    onClose: () => void;
    defaultMode?: GoToMode;
}

// Daftar variabel contoh untuk tab "Variable"
const mockVariables = ["DATE_", "HOUR_", "MINUTE_", "NAME_", "ID_"];

const GoToModal: React.FC<GoToModalProps> = ({
                                                 onClose,
                                                 defaultMode = GoToMode.CASE,
                                             }) => {
    // State untuk mengatur tab yang aktif
    const [activeTab, setActiveTab] = useState<"case" | "variable">(
        defaultMode === GoToMode.VARIABLE ? "variable" : "case"
    );

    // State untuk input case number
    const [caseNumber, setCaseNumber] = useState<number>(0);

    // State untuk variable yang dipilih
    const [selectedVariable, setSelectedVariable] = useState<string>("");

    // Handler untuk tombol "Go"
    const handleGo = () => {
        if (activeTab === "case") {
            if (!caseNumber) {
                alert("Masukkan nomor case yang valid.");
                return;
            }
            console.log(`Go to case number: ${caseNumber}`);
        } else {
            if (!selectedVariable) {
                alert("Pilih salah satu variable.");
                return;
            }
            console.log(`Go to variable: ${selectedVariable}`);
        }
        // onClose(); // Opsional: Tutup modal setelah aksi "Go"
    };

    return (
        <DialogContent className="max-w-sm">
            <DialogHeader>
                <DialogTitle>Go To</DialogTitle>
            </DialogHeader>

            {/* Tab Navigation */}
            <div role="tablist" className="flex space-x-2 border-b mb-4">
                {(["case", "variable"] as const).map((tab) => (
                    <button
                        key={tab}
                        role="tab"
                        aria-selected={activeTab === tab}
                        className={`py-2 px-4 rounded-t focus:outline-none focus:ring ${
                            activeTab === tab
                                ? "bg-gray-300 font-bold text-black"
                                : "bg-white text-black hover:bg-gray-100"
                        }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Isi Tab "Case" */}
            {activeTab === "case" && (
                <div role="tabpanel" className="space-y-2">
                    <label className="font-semibold text-black" htmlFor="case-number">
                        Go to case number:
                    </label>
                    <input
                        id="case-number"
                        type="number"
                        value={caseNumber}
                        onChange={(e) => setCaseNumber(Number(e.target.value))}
                        className="border border-gray-300 p-2 w-full rounded focus:ring focus:border-gray-500 bg-white text-black"
                    />
                    <div>
                        <Button variant="outline" onClick={handleGo}>
                            Go
                        </Button>
                    </div>
                </div>
            )}

            {/* Isi Tab "Variable" */}
            {activeTab === "variable" && (
                <div role="tabpanel" className="space-y-2">
                    <label className="font-semibold text-black" htmlFor="variable-select">
                        Go to variable:
                    </label>
                    <select
                        id="variable-select"
                        value={selectedVariable}
                        onChange={(e) => setSelectedVariable(e.target.value)}
                        className="border border-gray-300 p-2 w-full rounded focus:ring focus:border-gray-500 bg-white text-black"
                    >
                        <option value="">-- Select a variable --</option>
                        {mockVariables.map((variable) => (
                            <option key={variable} value={variable}>
                                {variable}
                            </option>
                        ))}
                    </select>
                    <div>
                        <Button variant="outline" onClick={handleGo}>
                            Go
                        </Button>
                    </div>
                </div>
            )}

            <DialogFooter className="mt-4 flex justify-end space-x-2">
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

export default GoToModal;
