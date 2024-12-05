// components/Modals/IndependentSamplesTTestModal.tsx

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

interface IndependentSamplesTTestModalProps {
    onClose: () => void;
}

const IndependentSamplesTTestModal: React.FC<IndependentSamplesTTestModalProps> = ({ onClose }) => {
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
    const [group1Variables, setGroup1Variables] = useState<string[]>([]);
    const [group2Variables, setGroup2Variables] = useState<string[]>([]);

    const handleAddVariableToGroup = (variable: string, group: "group1" | "group2") => {
        if (group === "group1") {
            setGroup1Variables((prev) => [...prev, variable]);
        } else {
            setGroup2Variables((prev) => [...prev, variable]);
        }
        setListVariables((prev) => prev.filter((v) => v !== variable));
    };

    const handleRemoveVariableFromGroup = (variable: string, group: "group1" | "group2") => {
        if (group === "group1") {
            setGroup1Variables((prev) => prev.filter((v) => v !== variable));
        } else {
            setGroup2Variables((prev) => prev.filter((v) => v !== variable));
        }
        setListVariables((prev) => [...prev, variable].sort((a, b) => initialListVariables.indexOf(a) - initialListVariables.indexOf(b)));
    };

    const handleRunTest = () => {
        console.log("Running Independent-Samples T Test with:");
        console.log("Group 1 Variables:", group1Variables);
        console.log("Group 2 Variables:", group2Variables);
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>Independent-Samples T Test</DialogTitle>
                <DialogDescription>
                    Configure your group variables, then click &quot;OK&quot; to proceed with the test.
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
                                            onClick={() => handleAddVariableToGroup(variable, "group1")}
                                        >
                                            Add to Group 1
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleAddVariableToGroup(variable, "group2")}
                                        >
                                            Add to Group 2
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No variables available</p>
                            )}
                        </div>
                    </div>

                    {/* Group 1 Variables Column */}
                    <div>
                        <Label>Group 1 Variables</Label>
                        <div
                            className="border rounded p-2 overflow-y-auto scrollbar-thin"
                            style={{
                                width: "260px", // Fixed width
                                height: "200px", // Fixed height
                                boxSizing: "border-box",
                            }}
                        >
                            {group1Variables.length > 0 ? (
                                group1Variables.map((variable) => (
                                    <div
                                        key={variable}
                                        className="flex justify-between items-center py-1"
                                    >
                                        <span>{variable}</span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRemoveVariableFromGroup(variable, "group1")}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No variables selected for Group 1</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Group 2 Variables Column */}
                <div>
                    <Label>Group 2 Variables</Label>
                    <div
                        className="border rounded p-2 overflow-y-auto scrollbar-thin"
                        style={{
                            width: "260px", // Fixed width
                            height: "200px", // Fixed height
                            boxSizing: "border-box",
                        }}
                    >
                        {group2Variables.length > 0 ? (
                            group2Variables.map((variable) => (
                                <div
                                    key={variable}
                                    className="flex justify-between items-center py-1"
                                >
                                    <span>{variable}</span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRemoveVariableFromGroup(variable, "group2")}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No variables selected for Group 2</p>
                        )}
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    onClick={handleRunTest}
                    disabled={group1Variables.length === 0 || group2Variables.length === 0}
                >
                    OK
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default IndependentSamplesTTestModal;
