"use client";

import React, { useState } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DefineDatesProps {
    onClose: () => void;
}

const DefineDatesModal: React.FC<DefineDatesProps> = ({ onClose }) => {
    // State untuk meniru data di "Cases Are"
    const [casesAreOptions] = useState<string[]>([
        "Years, quarters",
        "Years, quarters, months",
        "Days",
        "Weeks, days",
        "Weeks, work days(5)",
        "Weeks, work days(6)",
        "Hours",
        "Days, hours",
    ]);
    const [selectedCase, setSelectedCase] = useState<string>("Years, quarters");

    // State untuk meniru “First Case Is”
    const [year, setYear] = useState<number>(1900);
    const [quarter, setQuarter] = useState<number>(1);
    const [periodicity, setPeriodicity] = useState<number>(4);

    // Event handler untuk tombol OK
    const handleOk = () => {
        // Logika penyimpanan dan penutupan modal
        onClose();
    };

    // Event handler untuk tombol Reset
    const handleReset = () => {
        // Kembalikan nilai state ke default
        setSelectedCase("Years, quarters");
        setYear(1900);
        setQuarter(1);
        setPeriodicity(4);
    };

    return (
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle>Define Dates</DialogTitle>
            </DialogHeader>

            <div className="flex gap-4">
                {/* Bagian kiri: Cases Are */}
                <div className="flex-1">
                    <p className="font-semibold mb-2">Cases Are:</p>
                    <ul className="border h-48 p-2 overflow-auto">
                        {casesAreOptions.map((option) => (
                            <li
                                key={option}
                                className={`p-1 cursor-pointer hover:bg-gray-100 ${
                                    selectedCase === option ? "bg-gray-200" : ""
                                }`}
                                onClick={() => setSelectedCase(option)}
                            >
                                {option}
                            </li>
                        ))}
                    </ul>
                    {/* Current Dates (hanya sebagai info, sesuai screenshot) */}
                    <div className="mt-4">
                        <p className="font-semibold">Current Dates:</p>
                        <p>Hour(5)Minute(30;60)</p>
                    </div>
                </div>

                {/* Bagian kanan: First Case Is */}
                <div className="flex-1">
                    <p className="font-semibold mb-2">First Case Is:</p>
                    <div className="mb-4">
                        <label className="block mb-1">Year:</label>
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="border p-1 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Quarter:</label>
                        <input
                            type="number"
                            value={quarter}
                            onChange={(e) => setQuarter(Number(e.target.value))}
                            className="border p-1 w-full"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Periodicity at higher level:</label>
                        <input
                            type="number"
                            value={periodicity}
                            onChange={(e) => setPeriodicity(Number(e.target.value))}
                            className="border p-1 w-full"
                        />
                    </div>
                </div>
            </div>

            <DialogFooter className="mt-4">
                <Button variant="outline" onClick={handleReset}>
                    Reset
                </Button>
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleOk}>OK</Button>
                <Button variant="outline" onClick={() => alert("Help dialog here")}>
                    Help
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default DefineDatesModal;
