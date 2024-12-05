// components/Modals/OneSampleTTestModal.tsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface OneSampleTTestModalProps {
    onClose: () => void;
}

const OneSampleTTestModal: React.FC<OneSampleTTestModalProps> = ({ onClose }) => {
    const initialListVariables = [
        "VAR00001",
        "VAR00002",
        "VAR00003",
        "VAR00004",
        "VAR00005",
        "VAR00006",
        "VAR00007",
    ];

    const [listVariables, setListVariables] = useState<string[]>(initialListVariables);
    const [testVariables, setTestVariables] = useState<string[]>([]);
    const [testValue, setTestValue] = useState<number>(0);

    const handleAddVariable = (variable: string) => {
        setListVariables((prev) => prev.filter((v) => v !== variable));
        setTestVariables((prev) => [...prev, variable]);
    };

    const handleRemoveVariable = (variable: string) => {
        setTestVariables((prev) => prev.filter((v) => v !== variable));
        setListVariables((prev) =>
            [...prev, variable].sort(
                (a, b) => initialListVariables.indexOf(a) - initialListVariables.indexOf(b)
            )
        );
    };

    const handleRunTest = () => {
        console.log("Running test with variables:", testVariables, "and test value:", testValue);
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>One-Sample T Test</DialogTitle>
                <DialogDescription>
                    Configure your test variable(s) and test value, then click &quot;OK&quot; to proceed.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* List Variables Column */}
                    <div>
                        <Label>List Variable(s)</Label>
                        <div
                            className="border rounded p-2 overflow-y-auto scrollbar-thin"
                            style={{
                                width: "260px", // Fixed width
                                height: "200px", // Fixed height
                                boxSizing: "border-box",
                            }}
                        >
                            {listVariables.length > 0 ? (
                                listVariables.map((variable) => (
                                    <div
                                        key={variable}
                                        className="flex justify-between items-center py-1"
                                    >
                                        <span>{variable}</span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleAddVariable(variable)}
                                        >
                                            +
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No variables available</p>
                            )}
                        </div>
                    </div>

                    {/* Test Variables Column */}
                    <div>
                        <Label>Test Variable(s)</Label>
                        <div
                            className="border rounded p-2 overflow-y-auto scrollbar-thin"
                            style={{
                                width: "260px", // Fixed width
                                height: "200px", // Fixed height
                                boxSizing: "border-box",
                            }}
                        >
                            {testVariables.length > 0 ? (
                                testVariables.map((variable) => (
                                    <div
                                        key={variable}
                                        className="flex justify-between items-center py-1"
                                    >
                                        <span>{variable}</span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRemoveVariable(variable)}
                                        >
                                            -
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No variables selected</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Test Value */}
                <div>
                    <Label htmlFor="test-value">Test Value</Label>
                    <input
                        id="test-value"
                        type="number"
                        value={testValue}
                        onChange={(e) => setTestValue(Number(e.target.value))}
                        className="border rounded w-full p-2"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleRunTest} disabled={testVariables.length === 0}>
                    OK
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default OneSampleTTestModal;
