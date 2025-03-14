"use client"

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MissingValuesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (missingValues: (number | string)[]) => void;
    initialMissingValues: (number | string)[];
    variableType: string;
}

export const MissingValuesDialog: React.FC<MissingValuesDialogProps> = ({
                                                                            open,
                                                                            onOpenChange,
                                                                            onSave,
                                                                            initialMissingValues,
                                                                            variableType = "NUMERIC" // Default to NUMERIC if not specified
                                                                        }) => {
    const [option, setOption] = useState<string>("none");
    const [discreteValues, setDiscreteValues] = useState<string[]>(["", "", ""]);
    const [rangeStart, setRangeStart] = useState<string>("");
    const [rangeEnd, setRangeEnd] = useState<string>("");
    const [discreteValue, setDiscreteValue] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const isStringType = variableType === "STRING";

    useEffect(() => {
        if (!initialMissingValues || initialMissingValues.length === 0) {
            // Default to no missing values
            setOption("none");
            setDiscreteValues(["", "", ""]);
            setRangeStart("");
            setRangeEnd("");
            setDiscreteValue("");
            return;
        }

        // Check if it's likely a range with optional discrete value
        // A range is indicated by exactly 2 or 3 values with a special structure
        // In SPSS, ranges are only for numeric types
        if (!isStringType && initialMissingValues.length >= 2 && initialMissingValues.length <= 3) {
            // Check if first two values form a range (low <= high)
            if (typeof initialMissingValues[0] === 'number' &&
                typeof initialMissingValues[1] === 'number' &&
                initialMissingValues[0] <= initialMissingValues[1]) {

                setOption("range");
                setRangeStart(initialMissingValues[0].toString());
                setRangeEnd(initialMissingValues[1].toString());

                // Check if there's an optional discrete value
                if (initialMissingValues.length === 3) {
                    setDiscreteValue(initialMissingValues[2].toString());
                } else {
                    setDiscreteValue("");
                }
                return;
            }
        }

        // Otherwise, treat as discrete values (up to 3)
        setOption("discrete");
        const values = [
            initialMissingValues[0]?.toString() || "",
            initialMissingValues[1]?.toString() || "",
            initialMissingValues[2]?.toString() || ""
        ];
        setDiscreteValues(values);
        setRangeStart("");
        setRangeEnd("");
        setDiscreteValue("");

        setError(null);
    }, [initialMissingValues, isStringType]);

    const handleDiscreteValueChange = (index: number, value: string) => {
        // Don't trim the value - we want to allow a single space character
        const rawValue = value;

        // For string variables, check byte length <= 8
        if (isStringType && new TextEncoder().encode(rawValue).length > 8) {
            setError("String missing values cannot exceed 8 bytes");
            return;
        }

        const newValues = [...discreteValues];
        newValues[index] = rawValue;
        setDiscreteValues(newValues);
        setError(null);
    };

    const validateRangeValues = (): boolean => {
        if (!rangeStart || !rangeEnd) {
            setError("Range values cannot be empty");
            return false;
        }

        // Ranges must be numeric values
        if (isNaN(Number(rangeStart)) || isNaN(Number(rangeEnd))) {
            setError("Range values must be numeric");
            return false;
        }

        if (Number(rangeStart) > Number(rangeEnd)) {
            setError("Low value must be less than or equal to high value");
            return false;
        }

        // If discrete value is provided, it must be numeric
        if (discreteValue !== "" && isNaN(Number(discreteValue))) {
            setError("Discrete value must be numeric");
            return false;
        }

        // If discrete value is in the range, warn the user
        if (discreteValue !== "" &&
            Number(discreteValue) >= Number(rangeStart) &&
            Number(discreteValue) <= Number(rangeEnd)) {
            setError("Discrete value should be outside the range");
            return false;
        }

        return true;
    };

    const handleSave = () => {
        let result: (number | string)[] = [];

        if (option === "none") {
            // Return empty array for no missing values
            onSave([]);
            onOpenChange(false);
            return;
        }

        if (option === "discrete") {
            // Get non-empty discrete values (but allow spaces as valid values)
            result = discreteValues
                .filter(v => v !== "") // Don't trim - allow a single space
                .map(v => {
                    // For numeric types, convert strings to numbers (except spaces)
                    if (!isStringType && v !== " " && !isNaN(Number(v))) {
                        return Number(v);
                    }
                    return v;
                });

            // Max 3 discrete values
            if (result.length > 3) {
                result = result.slice(0, 3);
            }
        } else if (option === "range" && !isStringType) {
            if (!validateRangeValues()) {
                return;
            }

            // Ensure low <= high for range
            const low = Number(rangeStart);
            const high = Number(rangeEnd);

            // For range values, SPSS expects a specific structure
            // The first two values are the range (low, high)
            result = [low, high];

            // If there's a discrete value, add it as the third value
            if (discreteValue !== "") {
                const discrete = Number(discreteValue);
                result.push(discrete);
            }

            // Tag the array with metadata to indicate it's a range
            // This will be used in the VariableTable to properly display it
            Object.defineProperty(result, 'isRange', {
                value: true,
                enumerable: false
            });
        }

        onSave(result);
        onOpenChange(false);
    };

    const handleRangeStartChange = (value: string) => {
        if (!isStringType && value !== "" && isNaN(Number(value))) {
            return; // Only allow numeric input for non-string types
        }
        setRangeStart(value);
        setError(null);
    };

    const handleRangeEndChange = (value: string) => {
        if (!isStringType && value !== "" && isNaN(Number(value))) {
            return; // Only allow numeric input for non-string types
        }
        setRangeEnd(value);
        setError(null);
    };

    const handleDiscreteOptionChange = (value: string) => {
        if (!isStringType && value !== "" && isNaN(Number(value))) {
            return; // Only allow numeric input for non-string types
        }
        setDiscreteValue(value);
        setError(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white shadow-md rounded-none p-0 overflow-hidden">
                <DialogHeader className="bg-gray-200 p-2 border-b border-gray-300">
                    <DialogTitle className="text-md font-medium text-gray-800">Missing Values</DialogTitle>
                </DialogHeader>

                <div className="p-4 space-y-4">
                    {error && (
                        <div className="text-xs text-red-500 font-medium border-l-2 border-red-500 pl-2 py-1 bg-red-50">
                            {error}
                        </div>
                    )}

                    <RadioGroup value={option} onValueChange={setOption} className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="none" id="none" className="border-gray-400 text-gray-800" />
                            <Label htmlFor="none" className="text-gray-800 font-medium">
                                No missing values
                            </Label>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="discrete" id="discrete" className="border-gray-400 text-gray-800" />
                                <Label htmlFor="discrete" className="text-gray-800 font-medium">
                                    Discrete missing values
                                </Label>
                            </div>
                            <div className="grid grid-cols-3 gap-2 pl-6">
                                {discreteValues.map((value, index) => (
                                    <div key={index} className="relative">
                                        <Input
                                            value={value}
                                            onChange={(e) => handleDiscreteValueChange(index, e.target.value)}
                                            disabled={option !== "discrete"}
                                            className="h-7 border-gray-300"
                                            placeholder={isStringType ? "Text or space" : "Numeric"}
                                        />
                                        {value === " " && (
                                            <div className="absolute right-2 top-1 text-xs bg-blue-100 px-1 rounded text-blue-800">
                                                Space
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {isStringType && (
                                <div className="pl-6 text-xs text-gray-500">
                                    Tip: Enter a single space to define blank values as missing.
                                    <br />
                                    A "Space" indicator will appear when a space is entered.
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="range"
                                    id="range"
                                    className="border-gray-400 text-gray-800"
                                    disabled={isStringType}
                                />
                                <Label
                                    htmlFor="range"
                                    className={`${isStringType ? 'text-gray-400' : 'text-gray-800'} font-medium`}
                                >
                                    Range plus one optional discrete missing value
                                    {isStringType && <span className="text-xs ml-2">(Unavailable for string variables)</span>}
                                </Label>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pl-6">
                                <div className="space-y-1">
                                    <Label htmlFor="low" className={`${isStringType ? 'text-gray-400' : 'text-gray-700'} text-sm`}>
                                        Low:
                                    </Label>
                                    <Input
                                        id="low"
                                        value={rangeStart}
                                        onChange={(e) => handleRangeStartChange(e.target.value)}
                                        disabled={option !== "range" || isStringType}
                                        className="h-7 border-gray-300"
                                        placeholder="Numeric"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="high" className={`${isStringType ? 'text-gray-400' : 'text-gray-700'} text-sm`}>
                                        High:
                                    </Label>
                                    <Input
                                        id="high"
                                        value={rangeEnd}
                                        onChange={(e) => handleRangeEndChange(e.target.value)}
                                        disabled={option !== "range" || isStringType}
                                        className="h-7 border-gray-300"
                                        placeholder="Numeric"
                                    />
                                </div>
                            </div>
                            <div className="pl-6 space-y-1">
                                <Label htmlFor="discrete-val" className={`${isStringType ? 'text-gray-400' : 'text-gray-700'} text-sm`}>
                                    Discrete value:
                                </Label>
                                <Input
                                    id="discrete-val"
                                    value={discreteValue}
                                    onChange={(e) => handleDiscreteOptionChange(e.target.value)}
                                    disabled={option !== "range" || isStringType}
                                    className="h-7 border-gray-300"
                                    placeholder="Numeric"
                                />
                            </div>
                        </div>
                    </RadioGroup>
                </div>

                <DialogFooter className="flex justify-center space-x-2 p-2 bg-gray-200 border-t border-gray-300">
                    <Button
                        onClick={handleSave}
                        variant="secondary"
                        className="bg-gray-200 border-gray-300 text-gray-800 hover:bg-gray-300 rounded-sm h-7 px-4 text-xs"
                    >
                        OK
                    </Button>
                    <Button
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                        className="bg-gray-200 border-gray-300 text-gray-800 hover:bg-gray-300 rounded-sm h-7 px-4 text-xs"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="secondary"
                        className="bg-gray-200 border-gray-300 text-gray-800 hover:bg-gray-300 rounded-sm h-7 px-4 text-xs"
                    >
                        Help
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};