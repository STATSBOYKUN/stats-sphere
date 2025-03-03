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
import VariablePropertiesModal from "./VariablePropertiesModalProps";

interface DefineVariableProps {
    onClose: () => void;
}

const DefineVariableModal: React.FC<DefineVariableProps> = ({ onClose }) => {
    // State untuk menampung variabel yang tersedia dan variabel yang dipilih
    const [availableVariables, setAvailableVariables] = useState<string[]>([
        "Identifier [id]",
        "Nama [name]",
        "HOUR, not periodic",
        "MINUTE, period 60",
        "Date. Format: \"HH:mm:ss\"",
    ]);
    const [selectedVariables, setSelectedVariables] = useState<string[]>([]);

    // State untuk limit cases dan limit values
    const [limitCases, setLimitCases] = useState<number>(0);
    const [limitValues, setLimitValues] = useState<number>(200);

    // State untuk mengontrol tampilan modal Variable Properties
    const [showVariableProperties, setShowVariableProperties] = useState(false);

    // Fungsi untuk memindahkan variabel ke daftar “Variables to Scan”
    const moveToSelected = (variable: string) => {
        setAvailableVariables((prev) => prev.filter((item) => item !== variable));
        setSelectedVariables((prev) => [...prev, variable]);
    };

    // Fungsi untuk memindahkan variabel kembali ke daftar “Variables”
    const moveToAvailable = (variable: string) => {
        setSelectedVariables((prev) => prev.filter((item) => item !== variable));
        setAvailableVariables((prev) => [...prev, variable]);
    };

    const handleContinue = () => {
        // Alih-alih langsung memanggil onClose(), buka modal VariablePropertiesModal
        setShowVariableProperties(true);
    };

    // Jika showVariableProperties true, tampilkan VariablePropertiesModal
    if (showVariableProperties) {
        return <VariablePropertiesModal onClose={onClose} />;
    }

    return (
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>Define Variable Properties</DialogTitle>
                <DialogDescription>
                    Use this facility to label variable values and set other properties
                    after scanning the data. Select the variables to scan. They should be
                    categorical (nominal or ordinal) for best results.
                </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 mt-4">
                {/* Daftar Variables */}
                <div>
                    <p className="font-semibold mb-2">Variables:</p>
                    <ul className="border h-32 p-2 overflow-auto">
                        {availableVariables.map((variable) => (
                            <li
                                key={variable}
                                className="cursor-pointer hover:bg-gray-100"
                                onClick={() => moveToSelected(variable)}
                            >
                                {variable}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Daftar Variables to Scan */}
                <div>
                    <p className="font-semibold mb-2">Variables to Scan:</p>
                    <ul className="border h-32 p-2 overflow-auto">
                        {selectedVariables.map((variable) => (
                            <li
                                key={variable}
                                className="cursor-pointer hover:bg-gray-100"
                                onClick={() => moveToAvailable(variable)}
                            >
                                {variable}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Opsi Tambahan */}
            <div className="mt-4 space-y-2">
                <div>
                    <label className="mr-2">
                        <input
                            type="checkbox"
                            onChange={(e) => {
                                setLimitCases(e.target.checked ? 100 : 0);
                            }}
                        />
                        Limit number of cases scanned to:
                    </label>
                    {limitCases > 0 && (
                        <input
                            type="number"
                            value={limitCases}
                            onChange={(e) => setLimitCases(Number(e.target.value))}
                            className="border p-1 w-20 ml-2"
                        />
                    )}
                </div>

                <div>
                    <label className="mr-2">
                        <input
                            type="checkbox"
                            checked={limitValues > 0}
                            onChange={(e) => {
                                setLimitValues(e.target.checked ? 200 : 0);
                            }}
                        />
                        Limit number of values displayed to:
                    </label>
                    {limitValues > 0 && (
                        <input
                            type="number"
                            value={limitValues}
                            onChange={(e) => setLimitValues(Number(e.target.value))}
                            className="border p-1 w-20 ml-2"
                        />
                    )}
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleContinue}>Continue</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default DefineVariableModal;
