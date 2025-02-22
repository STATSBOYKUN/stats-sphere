"use client";

import React, { useState } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WeightCasesModalProps {
    onClose: () => void;
}

const WeightCasesModal: React.FC<WeightCasesModalProps> = ({ onClose }) => {
    // Daftar variabel (sisi kiri)
    const [variables] = useState<string[]>([
        "Identifier [id]",
        "HOUR, not periodic",
        "MINUTE, period 60",
        "Date. Format: \"HH:mm:ss\"",
    ]);

    // State untuk metode weighting: "none" atau "byVariable"
    const [weightMethod, setWeightMethod] = useState<"none" | "byVariable">("none");

    // Variabel yang dipilih sebagai frequency variable
    const [frequencyVariable, setFrequencyVariable] = useState<string>("");

    // Fungsi untuk memilih variable dari daftar
    const handleSelectVariable = (variable: string) => {
        setFrequencyVariable(variable);
        setWeightMethod("byVariable");
    };

    // Mengembalikan status saat ini
    const currentStatus =
        weightMethod === "none"
            ? "Do not weight cases"
            : `Weight cases by: ${frequencyVariable || "(not selected)"}`;

    // Tombol OK
    const handleOk = () => {
        // Logika “Weight Cases” di sini
        // ...
        onClose();
    };

    // Tombol Reset
    const handleReset = () => {
        setWeightMethod("none");
        setFrequencyVariable("");
    };

    return (
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Weight Cases</DialogTitle>
            </DialogHeader>

            <div className="flex gap-4">
                {/* Daftar Variabel (kiri) */}
                <div className="flex-1">
                    <p className="font-semibold mb-2">Variables:</p>
                    <ul className="border p-2 h-40 overflow-auto">
                        {variables.map((variable) => (
                            <li
                                key={variable}
                                className="cursor-pointer hover:bg-gray-100 p-1"
                                onClick={() => handleSelectVariable(variable)}
                            >
                                {variable}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Opsi Weight Cases (kanan) */}
                <div className="flex-1 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="weightMethod"
                            checked={weightMethod === "none"}
                            onChange={() => setWeightMethod("none")}
                        />
                        Do not weight cases
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="weightMethod"
                            checked={weightMethod === "byVariable"}
                            onChange={() => setWeightMethod("byVariable")}
                        />
                        Weight cases by
                    </label>
                    <div className="ml-6">
                        <input
                            type="text"
                            placeholder="Frequency Variable"
                            value={frequencyVariable}
                            onChange={(e) => setFrequencyVariable(e.target.value)}
                            disabled={weightMethod === "none"}
                            className="border p-1 w-full"
                        />
                    </div>

                    <div className="text-sm text-gray-600 mt-2">
                        Current Status: {currentStatus}
                    </div>
                </div>
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

export default WeightCasesModal;
