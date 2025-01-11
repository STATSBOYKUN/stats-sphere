import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CornerDownLeft, CornerDownRight } from "lucide-react"; // Import icons from lucide-react

interface FrequenciesModalProps {
    onClose: () => void;
}

const FrequenciesModal: React.FC<FrequenciesModalProps> = ({ onClose }) => {
    const [availableVariables, setLeftVariables] = useState<string[]>(["Variable 1", "Variable 2", "Variable 3", "Variable 4", "Variable 5"]);
    const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
    const [highlightedVariable, setHighlightedVariable] = useState<string | null>(null);

    // Handle selecting/deselecting variables
    const handleSelectLeft = (variable: string) => {
        if (highlightedVariable === variable) {
            setSelectedVariables((prev) => [...prev, variable]);
            setLeftVariables((prev) => prev.filter((item) => item !== variable));
            setHighlightedVariable(null);
        } else {
            setHighlightedVariable(variable);
        }
    };

    const handleDeselectRight = (variable: string) => {
        if (highlightedVariable === variable) {
            setLeftVariables((prev) => [...prev, variable]);
            setSelectedVariables((prev) => prev.filter((item) => item !== variable));
            setHighlightedVariable(null);
        } else {
            setHighlightedVariable(variable);
        }
    };

    const handleMoveVariable = () => {
        if (highlightedVariable) {
            // Move the variable based on which list it's highlighted from
            if (availableVariables.includes(highlightedVariable)) {
                setSelectedVariables((prev) => [...prev, highlightedVariable]);
                setLeftVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            } else if (selectedVariables.includes(highlightedVariable)) {
                setLeftVariables((prev) => [...prev, highlightedVariable]);
                setSelectedVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            }
            setHighlightedVariable(null);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
                <DialogTitle>Frequencies</DialogTitle>
            </DialogHeader>

            <Separator className="my-0" />

            <div className="grid grid-cols-9 gap-2 py-2">
                <div className="col-span-3 flex flex-col border p-4 rounded-md max-h-[300px] overflow-y-auto">
                    <label className="font-semibold">Available Variables</label>
                    <div className="space-y-2">
                        {availableVariables.map((variable) => (
                            <div
                                key={variable}
                                className={`p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${highlightedVariable === variable ? "bg-blue-100 border-blue-500" : "border-gray-300"}`}
                                onClick={() => handleSelectLeft(variable)}
                            >
                                {variable}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Move Button (1/8 width) */}
                <div className="col-span-1 flex flex-col items-center justify-center space-y-10">
                    <Button
                        variant="link"
                        onClick={handleMoveVariable}
                        disabled={!highlightedVariable}
                    >
                        {highlightedVariable && availableVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} /> // Move to selected variables (right)
                        ) : highlightedVariable && selectedVariables.includes(highlightedVariable) ? (
                            <CornerDownLeft size={24} /> // Move to available variables (left)
                        ) : (
                            <CornerDownLeft size={24} /> // Default, but can be disabled
                        )}
                    </Button>
                </div>

                {/* Right Selected Variables List (3/8 width) */}
                <div className="col-span-3 flex flex-col border p-4 rounded-md max-h-[300px] overflow-y-auto">
                    <label className="font-semibold">Selected Variables</label>
                    <div className="space-y-2">
                        {selectedVariables.map((variable) => (
                            <div
                                key={variable}
                                className={`p-2 border cursor-pointer rounded-md hover:bg-blue-100 ${highlightedVariable === variable ? "bg-blue-100 border-blue-500" : "border-gray-300"}`}
                                onClick={() => handleDeselectRight(variable)}
                            >
                                {variable}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar for Buttons (1/8 width) */}
                <div className="col-span-2 flex flex-col justify-start space-y-4 p-4">
                    <Button variant="outline">Statistics</Button>
                    <Button variant="outline">Charts</Button>
                    <Button variant="outline">Format</Button>
                    <Button variant="outline">Style</Button>
                    <Button variant="outline">Bootstrap</Button>
                </div>
            </div>

            {/* Display Frequency Table Option */}
            <div className="items-top flex space-x-2">
                <Checkbox id="terms1" />
                <div className="grid gap-1.5 leading-none">
                    <label
                        htmlFor="terms1"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Display frequency tables
                    </label>
                </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-center space-x-4">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleClose}>OK</Button>
                <Button variant="outline">Paste</Button>
                <Button variant="outline">Reset</Button>
                <Button variant="outline">Help</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default FrequenciesModal;
