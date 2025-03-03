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

// Sample interface; extend it based on your actual needs
interface VariablePropertiesModalProps {
    onClose: () => void;
}

const VariablePropertiesModal: React.FC<VariablePropertiesModalProps> = ({ onClose }) => {
    // Example data for the "Value Label" grid
    const [valueLabels, setValueLabels] = useState<
        Array<{ changed: string; missing: string; count: string; label: string }>
    >([
        { changed: "1", missing: "", count: "", label: "Alice" },
        { changed: "2", missing: "", count: "", label: "Bob" },
        { changed: "3", missing: "", count: "", label: "Cici" },
        { changed: "4", missing: "", count: "", label: "Asfa" },
    ]);

    // Basic form states
    const [currentVariable, setCurrentVariable] = useState("name");
    const [label, setLabel] = useState("Nama");
    const [measurementLevel, setMeasurementLevel] = useState("Nominal");
    const [type, setType] = useState("String");
    const [width, setWidth] = useState(24);
    const [role, setRole] = useState("Input");
    const [unlabeledValues, setUnlabeledValues] = useState(9);

    // Example function to handle "OK" or "Continue"
    const handleSubmit = () => {
        // TODO: Your logic here, e.g., save form data, call an API, etc.
        onClose();
    };

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Define Variable Properties</DialogTitle>
                <DialogDescription>
                    Use this facility to label variable values and set other properties after
                    scanning the data. Modify the fields below as needed.
                </DialogDescription>
            </DialogHeader>

            {/* Main Body */}
            <div className="mt-4 space-y-4">
                {/* Row 1: Current Variable, Label, Measurement Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Current Variable:
                        </label>
                        <input
                            type="text"
                            value={currentVariable}
                            onChange={(e) => setCurrentVariable(e.target.value)}
                            className="w-full border p-1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Label:</label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="w-full border p-1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Measurement Level:
                        </label>
                        <select
                            value={measurementLevel}
                            onChange={(e) => setMeasurementLevel(e.target.value)}
                            className="w-full border p-1"
                        >
                            <option>Nominal</option>
                            <option>Ordinal</option>
                            <option>Scale</option>
                        </select>
                    </div>
                </div>

                {/* Row 2: Type, Width, Role, Unlabeled Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Type:</label>
                            <input
                                type="text"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full border p-1"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Width:</label>
                            <input
                                type="number"
                                value={width}
                                onChange={(e) => setWidth(Number(e.target.value))}
                                className="w-full border p-1"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Role:</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full border p-1"
                            >
                                <option>Input</option>
                                <option>Target</option>
                                <option>Partition</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">
                                Unlabeled Values:
                            </label>
                            <input
                                type="number"
                                value={unlabeledValues}
                                onChange={(e) => setUnlabeledValues(Number(e.target.value))}
                                className="w-full border p-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Value Label Grid */}
                <div>
                    <p className="font-semibold mb-2">Value Label grid:</p>
                    <p className="text-sm text-gray-600">
                        Enter or edit labels in the grid. You can enter additional values at the
                        bottom.
                    </p>
                    <div className="overflow-auto border mt-2">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="p-2 border-r">Changed</th>
                                <th className="p-2 border-r">Missing</th>
                                <th className="p-2 border-r">Count</th>
                                <th className="p-2">Label</th>
                            </tr>
                            </thead>
                            <tbody>
                            {valueLabels.map((row, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                    <td className="p-2 border-r">{row.changed}</td>
                                    <td className="p-2 border-r">{row.missing}</td>
                                    <td className="p-2 border-r">{row.count}</td>
                                    <td className="p-2">{row.label}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bottom info row */}
                <div className="flex justify-between items-center text-sm">
                    <div>
                        <Button variant="outline" className="mr-2">
                            Copy Properties
                        </Button>
                        <Button variant="outline" className="mr-2">
                            From Another Variable...
                        </Button>
                        <Button variant="outline" className="mr-2">
                            To Other Variables...
                        </Button>
                        <Button variant="outline">Automatic Labels</Button>
                    </div>
                    <div className="text-gray-600">
                        <span className="mr-4">Scanned cases: 100</span>
                        <span>Total item list: 200</span>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="outline">Help</Button>
                <Button variant="outline">Reset</Button>
                <Button variant="outline">Paste</Button>
                <Button onClick={handleSubmit}>OK</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default VariablePropertiesModal;
