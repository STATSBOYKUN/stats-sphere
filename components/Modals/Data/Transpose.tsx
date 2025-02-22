"use client";

import React, { useState } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TransposeModalProps {
    onClose: () => void;
}

const TransposeModal: React.FC<TransposeModalProps> = ({ onClose }) => {
    // Daftar variabel yang tersedia (sisi kiri)
    const [availableVariables, setAvailableVariables] = useState<string[]>([
        "Identifier [id]",
        "Nama [name]",
        "HOUR, not periodic",
        "MINUTE, period 60",
        "Date. Format: \"HH:mm:ss\"",
    ]);

    // Variabel yang dipilih untuk di-transpose (sisi kanan)
    const [selectedVariables, setSelectedVariables] = useState<string[]>([]);

    // Variabel yang dipilih sebagai Name Variable
    const [nameVariable, setNameVariable] = useState<string>("");

    // Fungsi untuk memindahkan variabel dari sisi kiri ke sisi kanan
    const moveToSelected = (variable: string) => {
        setAvailableVariables((prev) => prev.filter((v) => v !== variable));
        setSelectedVariables((prev) => [...prev, variable]);
    };

    // Fungsi untuk memindahkan variabel dari sisi kanan kembali ke sisi kiri
    const moveToAvailable = (variable: string) => {
        setSelectedVariables((prev) => prev.filter((v) => v !== variable));
        setAvailableVariables((prev) => [...prev, variable]);
    };

    // Handler tombol OK
    const handleOk = () => {
        // Di sini Anda bisa menambahkan logika transpose
        // ...
        onClose();
    };

    // Handler tombol Reset
    const handleReset = () => {
        // Mengembalikan ke keadaan awal
        setAvailableVariables([
            "Identifier [id]",
            "Nama [name]",
            "HOUR, not periodic",
            "MINUTE, period 60",
            "Date. Format: \"HH:mm:ss\"",
        ]);
        setSelectedVariables([]);
        setNameVariable("");
    };

    return (
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Transpose</DialogTitle>
            </DialogHeader>

            <div className="flex gap-4">
                {/* Daftar Variabel (kiri) */}
                <div className="flex-1">
                    <p className="font-semibold mb-2">Variables:</p>
                    <ul className="border p-2 h-40 overflow-auto">
                        {availableVariables.map((variable) => (
                            <li
                                key={variable}
                                className="cursor-pointer hover:bg-gray-100 p-1"
                                onClick={() => moveToSelected(variable)}
                            >
                                {variable}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Tombol Panah (tengah) - Opsional, jika ingin meniru persis */}
                <div className="flex flex-col items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            // Misal, memindahkan semua ke selected
                            setSelectedVariables([...selectedVariables, ...availableVariables]);
                            setAvailableVariables([]);
                        }}
                    >
                        ➡
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            // Misal, memindahkan semua ke available
                            setAvailableVariables([...availableVariables, ...selectedVariables]);
                            setSelectedVariables([]);
                        }}
                    >
                        ⬅
                    </Button>
                </div>

                {/* Variable(s) (kanan) */}
                <div className="flex-1">
                    <p className="font-semibold mb-2">Variable(s):</p>
                    <ul className="border p-2 h-40 overflow-auto">
                        {selectedVariables.map((variable) => (
                            <li
                                key={variable}
                                className="cursor-pointer hover:bg-gray-100 p-1"
                                onClick={() => moveToAvailable(variable)}
                            >
                                {variable}
                            </li>
                        ))}
                    </ul>
                    {/* Name Variable */}
                    <div className="mt-4">
                        <p className="font-semibold mb-2">Name Variable:</p>
                        <input
                            type="text"
                            value={nameVariable}
                            onChange={(e) => setNameVariable(e.target.value)}
                            className="border p-1 w-full"
                            placeholder="(Optional)"
                        />
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

export default TransposeModal;
