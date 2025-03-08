"use client";

import React, { useState, useEffect } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Dialog,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    AlertCircle,
    Ruler,
    Shapes,
    BarChartHorizontal,
    CornerDownRight
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useVariableStore } from "@/stores/useVariableStore";
import { useMetaStore } from "@/stores/useMetaStore";

interface WeightCasesModalProps {
    onClose: () => void;
}

const WeightCasesModal: React.FC<WeightCasesModalProps> = ({ onClose }) => {
    // Use variable store to get variables
    const getAvailableVariables = useVariableStore((state) => state.getAvailableVariables);
    const [storeVariables, setStoreVariables] = useState([]);
    const [availableVariables, setAvailableVariables] = useState([]);

    // Get meta store for weight information
    const meta = useMetaStore((state) => state.meta);
    const setMeta = useMetaStore((state) => state.setMeta);

    // Check console for debugging
    console.log("Current meta state:", meta);
    console.log("Current weight value:", meta.weight, typeof meta.weight);

    // State for weight method: "none" or "byVariable"
    const [weightMethod, setWeightMethod] = useState("none");

    // Selected frequency variable
    const [frequencyVariable, setFrequencyVariable] = useState("");

    // Selected variable for highlighting
    const [highlightedVariable, setHighlightedVariable] = useState(null);

    // Error message for invalid selections
    const [errorMessage, setErrorMessage] = useState(null);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);

    // Load variables from store
    useEffect(() => {
        const loadVariables = async () => {
            const vars = await getAvailableVariables();
            setStoreVariables(vars.filter(v => v.name !== ""));

            // If we have a stored weight variable
            if (meta.weight && meta.weight !== "") {
                console.log("Applying stored weight variable:", meta.weight);
                // Find the variable by name, should be a numeric variable
                const weightVar = vars.find(v => v.name === meta.weight && v.type !== "STRING");
                if (weightVar) {
                    setHighlightedVariable({ id: weightVar.columnIndex.toString() });
                    setFrequencyVariable(meta.weight);
                    setWeightMethod("byVariable");
                }
            }
        };
        loadVariables();
    }, [getAvailableVariables, meta.weight]);

    // Update available variables when store variables are loaded
    useEffect(() => {
        // Filter untuk hanya menampilkan variabel numerik
        const numericVariables = storeVariables.filter(v => v.type !== "STRING");
        setAvailableVariables(numericVariables);
    }, [storeVariables]);

    // Function to display variable name with label if available
    const getDisplayName = (variable) => {
        if (variable.label) {
            return `${variable.label} [${variable.name}]`;
        }
        return variable.name;
    };

    // Function to get appropriate icon based on variable type
    const getVariableIcon = (variable) => {
        if (!variable) return null;

        // Use measure to determine icon
        switch (variable.measure) {
            case "scale":
                return <Ruler size={14} className="text-gray-600 mr-1 flex-shrink-0" />;
            case "nominal":
                return <Shapes size={14} className="text-gray-600 mr-1 flex-shrink-0" />;
            case "ordinal":
                return <BarChartHorizontal size={14} className="text-gray-600 mr-1 flex-shrink-0" />;
            default:
                // Fallback to type-based icons
                return variable.type === "STRING"
                    ? <BarChartHorizontal size={14} className="text-gray-600 mr-1 flex-shrink-0" />
                    : <Ruler size={14} className="text-gray-600 mr-1 flex-shrink-0" />;
        }
    };

    // Function to handle variable selection
    const handleVariableSelect = (columnIndex) => {
        if (highlightedVariable?.id === columnIndex.toString()) {
            setHighlightedVariable(null);
        } else {
            setHighlightedVariable({ id: columnIndex.toString() });
        }
    };

    // Function to select variable as frequency variable
    const handleSelectFrequencyVariable = (variable) => {
        // Since we filter for numeric variables only in the list,
        // this check is mostly for safety
        if (variable.type === "STRING") {
            setErrorMessage("Weight variable must be numeric");
            setErrorDialogOpen(true);
            return;
        }

        setFrequencyVariable(variable.name);
        setWeightMethod("byVariable");
        setHighlightedVariable({ id: variable.columnIndex.toString() });
    };

    // Handle variable double click
    const handleVariableDoubleClick = (variable) => {
        handleSelectFrequencyVariable(variable);
    };

    // Get current status text
    const currentStatus =
        weightMethod === "none"
            ? "Do not weight cases"
            : `Weight cases by: ${frequencyVariable || "(not selected)"}`;

    // Handle OK button click
    const handleOk = () => {
        // Save weight to meta store
        if (weightMethod === "none") {
            setMeta({ weight: "" });
            console.log("Setting weight to empty string");
        } else if (weightMethod === "byVariable" && frequencyVariable) {
            setMeta({ weight: frequencyVariable });
            console.log("Setting weight to:", frequencyVariable);
        }

        // Close the dialog
        onClose();
    };

    // Handle Reset button click
    const handleReset = () => {
        setWeightMethod("none");
        setFrequencyVariable("");
        setHighlightedVariable(null);
    };

    return (
        <>
            <DialogContent className="max-w-[450px] p-3">
                <DialogHeader className="p-0 mb-2">
                    <DialogTitle>Weight Cases</DialogTitle>
                </DialogHeader>
                <Separator className="my-0" />

                <div className="grid grid-cols-7 gap-2 py-2">
                    {/* Left Column - Available Variables */}
                    <div className="col-span-3 flex flex-col">
                        <Label className="text-xs font-semibold mb-1">Variables:</Label>
                        <div className="border p-2 rounded-md h-[200px] overflow-y-auto overflow-x-hidden">
                            <div className="space-y-1">
                                {availableVariables.map((variable) => (
                                    <TooltipProvider key={variable.columnIndex}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={`flex items-center p-1 cursor-pointer border rounded-md hover:bg-gray-100 ${
                                                        highlightedVariable?.id === variable.columnIndex.toString()
                                                            ? "bg-gray-200 border-gray-500"
                                                            : "border-gray-300"
                                                    }`}
                                                    onClick={() => handleVariableSelect(variable.columnIndex)}
                                                    onDoubleClick={() => handleVariableDoubleClick(variable)}
                                                >
                                                    <div className="flex items-center w-full">
                                                        {getVariableIcon(variable)}
                                                        <span className="text-xs truncate">{getDisplayName(variable)}</span>
                                                    </div>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <p className="text-xs">{getDisplayName(variable)}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Middle Column - Arrow Button */}
                    <div className="col-span-1 flex flex-col items-center justify-center">
                        <Button
                            variant="link"
                            onClick={() => {
                                if (highlightedVariable) {
                                    const variable = availableVariables.find(v => v.columnIndex.toString() === highlightedVariable.id);
                                    if (variable) {
                                        handleSelectFrequencyVariable(variable);
                                    }
                                }
                            }}
                            disabled={!highlightedVariable}
                        >
                            <CornerDownRight size={20} />
                        </Button>
                    </div>

                    {/* Right Column - Weight Options */}
                    <div className="col-span-3 space-y-2">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="weightMethod"
                                    className="w-3 h-3"
                                    checked={weightMethod === "none"}
                                    onChange={() => {
                                        setWeightMethod("none");
                                        setFrequencyVariable("");
                                    }}
                                />
                                <span className="text-xs">Do not weight cases</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="weightMethod"
                                    className="w-3 h-3"
                                    checked={weightMethod === "byVariable"}
                                    onChange={() => setWeightMethod("byVariable")}
                                />
                                <span className="text-xs">Weight cases by</span>
                            </label>

                            <div className="pl-5 space-y-1">
                                <div className="text-xs text-gray-600">Frequency Variable:</div>
                                <Input
                                    type="text"
                                    value={frequencyVariable}
                                    onChange={(e) => setFrequencyVariable(e.target.value)}
                                    disabled={weightMethod === "none"}
                                    className="h-6 text-xs w-full"
                                />
                            </div>

                            <div className="border p-2 rounded-md bg-gray-50 mt-4">
                                <div className="text-xs text-gray-700">
                                    <span className="font-semibold">Current Status:</span> {currentStatus}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-center space-x-2 mt-4 p-0">
                    <Button size="sm" className="text-xs h-7" onClick={handleOk}>
                        OK
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => alert("Paste syntax here")}>
                        Paste
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={handleReset}>
                        Reset
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => alert("Help dialog here")}>
                        Help
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Error Dialog */}
            {/* Error Dialog */}
            <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
                <DialogContent className="max-w-[450px] p-3">
                    <DialogHeader className="p-0 mb-2">
                        <DialogTitle>IBM SPSS Statistics</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-4">
                        <AlertCircle className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm mt-2">{errorMessage}</p>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-center mt-4">
                        <Button
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => setErrorDialogOpen(false)}
                        >
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default WeightCasesModal;