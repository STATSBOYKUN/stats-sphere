"use client";

import React, { useState } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

enum SplitFileMethod {
    ALL_CASES = "all_cases",
    COMPARE_GROUPS = "compare_groups",
    ORGANIZE_GROUPS = "organize_groups",
}

interface SplitFileModalProps {
    onClose: () => void;
}

const SplitFileModal: React.FC<SplitFileModalProps> = ({ onClose }) => {
    // Daftar variabel yang tersedia (sisi kiri)
    const [availableVariables, setAvailableVariables] = useState<string[]>([
        "Identifier [id]",
        "Nama [name]",
        "HOUR, not periodic",
        "MINUTE, period 60",
        "Date. Format: \"HH:mm:ss\"",
    ]);

    // Variabel yang dijadikan dasar grouping
    const [groupVariables, setGroupVariables] = useState<string[]>([]);

    // Metode split file yang dipilih
    const [analysisMethod, setAnalysisMethod] = useState<SplitFileMethod>(
        SplitFileMethod.ALL_CASES
    );

    // Opsi sorting
    const [sortFile, setSortFile] = useState<boolean>(true);

    // Fungsi memindahkan variabel dari availableVariables ke groupVariables
    const moveToGroup = (variable: string) => {
        setAvailableVariables((prev) => prev.filter((v) => v !== variable));
        setGroupVariables((prev) => [...prev, variable]);
    };

    // Fungsi memindahkan variabel dari groupVariables kembali ke availableVariables
    const moveToAvailable = (variable: string) => {
        setGroupVariables((prev) => prev.filter((v) => v !== variable));
        setAvailableVariables((prev) => [...prev, variable]);
    };

    // Current Status
    const currentStatus = (() => {
        if (analysisMethod === SplitFileMethod.ALL_CASES) {
            return "Analysis by groups is off";
        }
        if (groupVariables.length === 0) {
            return "No grouping variables selected";
        }
        return `Analysis by groups on: ${groupVariables.join(", ")}`;
    })();

    // Tombol OK
    const handleOk = () => {
        // Logika untuk menerapkan Split File
        // ...
        onClose();
    };

    // Tombol Reset
    const handleReset = () => {
        setAvailableVariables([
            "Identifier [id]",
            "Nama [name]",
            "HOUR, not periodic",
            "MINUTE, period 60",
            "Date. Format: \"HH:mm:ss\"",
        ]);
        setGroupVariables([]);
        setAnalysisMethod(SplitFileMethod.ALL_CASES);
        setSortFile(true);
    };

    return (
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Split File</DialogTitle>
            </DialogHeader>

            <DialogDescription>
                Current Status: {currentStatus}
            </DialogDescription>

            <div className="flex gap-4 mt-4">
                {/* Daftar Variabel (kiri) */}
                <div className="flex-1">
                    <p className="font-semibold mb-2">Variables:</p>
                    <ul className="border p-2 h-40 overflow-auto">
                        {availableVariables.map((variable) => (
                            <li
                                key={variable}
                                className="cursor-pointer hover:bg-gray-100 p-1"
                                onClick={() => moveToGroup(variable)}
                            >
                                {variable}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Tombol Panah (tengah) - opsional */}
                <div className="flex flex-col items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            // Pindahkan semua ke groupVariables
                            setGroupVariables([...groupVariables, ...availableVariables]);
                            setAvailableVariables([]);
                        }}
                    >
                        ➡
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            // Pindahkan semua ke availableVariables
                            setAvailableVariables([...availableVariables, ...groupVariables]);
                            setGroupVariables([]);
                        }}
                    >
                        ⬅
                    </Button>
                </div>

                {/* Groups Based on (kanan) */}
                <div className="flex-1">
                    <p className="font-semibold mb-2">Groups Based on:</p>
                    <ul className="border p-2 h-40 overflow-auto">
                        {groupVariables.map((variable) => (
                            <li
                                key={variable}
                                className="cursor-pointer hover:bg-gray-100 p-1"
                                onClick={() => moveToAvailable(variable)}
                            >
                                {variable}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Opsi Metode Split File */}
            <div className="mt-4 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="analysisMethod"
                        checked={analysisMethod === SplitFileMethod.ALL_CASES}
                        onChange={() => setAnalysisMethod(SplitFileMethod.ALL_CASES)}
                    />
                    Analyze all cases, do not create groups
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="analysisMethod"
                        checked={analysisMethod === SplitFileMethod.COMPARE_GROUPS}
                        onChange={() => setAnalysisMethod(SplitFileMethod.COMPARE_GROUPS)}
                    />
                    Compare groups
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="analysisMethod"
                        checked={analysisMethod === SplitFileMethod.ORGANIZE_GROUPS}
                        onChange={() => setAnalysisMethod(SplitFileMethod.ORGANIZE_GROUPS)}
                    />
                    Organize output by groups
                </label>
            </div>

            {/* Opsi Sorting */}
            {analysisMethod !== SplitFileMethod.ALL_CASES && (
                <div className="mt-4 space-y-2 border p-2 rounded">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="sortOption"
                            checked={sortFile}
                            onChange={() => setSortFile(true)}
                        />
                        Sort the file by grouping variables
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="sortOption"
                            checked={!sortFile}
                            onChange={() => setSortFile(false)}
                        />
                        File is already sorted
                    </label>
                </div>
            )}

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

export default SplitFileModal;
