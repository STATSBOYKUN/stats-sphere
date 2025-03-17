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
import { ValueLabel } from "@/types/ValueLabel";

interface ValueLabelsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (values: ValueLabel[]) => void;
    initialValues: ValueLabel[];
    variableName: string;
    variableType: string;
}

export const ValueLabelsDialog: React.FC<ValueLabelsDialogProps> = ({
                                                                        open,
                                                                        onOpenChange,
                                                                        onSave,
                                                                        initialValues,
                                                                        variableName,
                                                                        variableType = "NUMERIC" // Default to NUMERIC if not specified
                                                                    }) => {
    const [values, setValues] = useState<ValueLabel[]>([]);
    const [currentValue, setCurrentValue] = useState("");
    const [currentLabel, setCurrentLabel] = useState("");
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [originalValue, setOriginalValue] = useState<string | null>(null);
    const [originalLabel, setOriginalLabel] = useState<string | null>(null);

    const isStringType = variableType === "STRING";

    useEffect(() => {
        setValues(initialValues || []);
    }, [initialValues]);

    const validateValue = (value: string): boolean => {
        // Empty string is not valid, but a single space is valid for string variables
        const isSpace = value === " ";
        const isEmpty = value === "" || value === undefined;

        if (isEmpty) {
            setError("Value cannot be empty");
            return false;
        }

        // For non-string types, ensure value is numeric (but allow space for string type)
        if (!isStringType && !isSpace && isNaN(Number(value))) {
            setError("Value must be numeric for this variable type");
            return false;
        }

        // Check for duplicates (if not in editing mode or if editing with a different value)
        const isDuplicate = values.some((v, index) => {
            // Skip comparing with the value being edited
            if (selectedIndex !== null && index === selectedIndex) {
                return false;
            }
            return v.value.toString() === value;
        });

        if (isDuplicate) {
            setError("This value already exists");
            return false;
        }

        setError(null);
        return true;
    };

    const handleAdd = () => {
        if (!validateValue(currentValue)) return;

        // Special handling for space value
        const processedValue = isStringType ? currentValue : Number(currentValue);

        // For the label, handle space character specially
        let valueLabel = currentLabel;
        if (valueLabel === "") {
            valueLabel = currentValue === " " ? "[Space]" : currentValue;
        }

        const newValue: ValueLabel = {
            variableName,
            value: processedValue,
            label: valueLabel
        };

        // Check if label is too long (120 bytes)
        if (new TextEncoder().encode(newValue.label).length > 120) {
            setError("Label cannot exceed 120 bytes");
            return;
        }

        setValues([...values, newValue]);
        setCurrentValue("");
        setCurrentLabel("");
    };

    const handleChange = () => {
        if (selectedIndex === null || !validateValue(currentValue)) return;

        // Check if anything was actually changed
        if (originalValue === currentValue && originalLabel === currentLabel) {
            setError("No changes were made");
            return;
        }

        const processedValue = isStringType ? currentValue : Number(currentValue);

        // For the label, handle space character specially
        let valueLabel = currentLabel;
        if (valueLabel === "") {
            valueLabel = currentValue === " " ? "[Space]" : currentValue;
        }

        const updatedValues = [...values];
        updatedValues[selectedIndex] = {
            ...updatedValues[selectedIndex],
            value: processedValue,
            label: valueLabel
        };

        // Check if label is too long
        if (new TextEncoder().encode(updatedValues[selectedIndex].label).length > 120) {
            setError("Label cannot exceed 120 bytes");
            return;
        }

        setValues(updatedValues);
        setCurrentValue("");
        setCurrentLabel("");
        setSelectedIndex(null);
        setOriginalValue(null);
        setOriginalLabel(null);
    };

    const handleRemove = () => {
        if (selectedIndex === null) return;

        const updatedValues = [...values];
        updatedValues.splice(selectedIndex, 1);

        setValues(updatedValues);
        setCurrentValue("");
        setCurrentLabel("");
        setSelectedIndex(null);
    };

    const handleSelect = (index: number) => {
        const selected = values[index];
        setSelectedIndex(index);
        setCurrentValue(selected.value.toString());
        setCurrentLabel(selected.label);
        // Store original values to detect changes
        setOriginalValue(selected.value.toString());
        setOriginalLabel(selected.label);
        setError(null);
    };

    const handleSave = () => {
        onSave(values);
        onOpenChange(false);
    };

    const isValueChanged = () => {
        if (selectedIndex === null) return false;
        return originalValue !== currentValue || originalLabel !== currentLabel;
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        // If not string type, only allow numeric input (except for space character)
        if (!isStringType && newValue !== " " && newValue !== "" && isNaN(Number(newValue))) {
            return;
        }

        setCurrentValue(newValue);
        setError(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white shadow-md rounded-none p-0 overflow-hidden">
                <DialogHeader className="bg-gray-200 p-2 border-b border-gray-300">
                    <DialogTitle className="text-md font-medium text-gray-800">Value Labels</DialogTitle>
                </DialogHeader>

                <div className="p-4 space-y-3">
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="value" className="text-gray-700 w-16">
                                Value:
                            </Label>
                            <div className="flex-1 relative">
                                <Input
                                    id="value"
                                    value={currentValue}
                                    onChange={handleValueChange}
                                    className="h-8 w-full"
                                    placeholder={isStringType ? "Any text or space" : "Numeric value"}
                                />
                                {currentValue === " " && (
                                    <div className="absolute right-2 top-1 text-xs bg-blue-100 px-1 rounded text-blue-800">
                                        Space
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="label" className="text-gray-700 w-16">
                                Label:
                            </Label>
                            <div className="flex-1">
                                <Input
                                    id="label"
                                    value={currentLabel}
                                    onChange={(e) => {
                                        setCurrentLabel(e.target.value);
                                        setError(null);
                                    }}
                                    className="h-8 w-full"
                                    maxLength={120}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between">
                            {error && <div className="text-xs text-red-500">{error}</div>}
                            <div className="ml-auto">
                                <Button
                                    variant="outline"
                                    className="bg-gray-200 border-gray-300 text-gray-800 hover:bg-gray-300 rounded-sm h-7 px-3 text-xs"
                                >
                                    Spelling...
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-300 rounded-none p-0 h-32 overflow-y-auto bg-white">
                        {values.map((item, index) => (
                            <div
                                key={index}
                                className={`p-1 cursor-pointer ${selectedIndex === index ? 'bg-yellow-100' : 'hover:bg-gray-100'}`}
                                onClick={() => handleSelect(index)}
                            >
                                {item.value === " " ? "[Space]" : item.value} = &quot;{item.label}&quot;
                            </div>
                        ))}
                    </div>

                    <div className="flex space-x-2">
                        <Button
                            onClick={handleAdd}
                            variant="outline"
                            className="bg-gray-200 border-gray-300 text-gray-800 hover:bg-gray-300 rounded-sm h-7 px-4 text-xs"
                            disabled={(currentValue === "" || currentValue === undefined) || selectedIndex !== null}
                        >
                            Add
                        </Button>
                        <Button
                            onClick={handleChange}
                            variant="outline"
                            className="bg-gray-200 border-gray-300 text-gray-800 hover:bg-gray-300 rounded-sm h-7 px-4 text-xs"
                            disabled={selectedIndex === null || !isValueChanged() || currentValue === ""}
                        >
                            Change
                        </Button>
                        <Button
                            onClick={handleRemove}
                            variant="outline"
                            className="bg-gray-200 border-gray-300 text-gray-800 hover:bg-gray-300 rounded-sm h-7 px-4 text-xs"
                            disabled={selectedIndex === null}
                        >
                            Remove
                        </Button>
                    </div>
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