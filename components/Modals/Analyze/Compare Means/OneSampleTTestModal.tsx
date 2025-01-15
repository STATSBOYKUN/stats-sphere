import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { CornerDownLeft, CornerDownRight } from "lucide-react";

interface OneSampleTTestModalProps {
    onClose: () => void;
}

const OneSampleTTestModal: React.FC<OneSampleTTestModalProps> = ({ onClose }) => {
    const initialListVariables = [
        "Age in years [age]",
        "Marital status [marital]",
        "Income before the program [incbef]",
        "Income after the program [incaft]",
        "Level of education [ed]",
        "Gender [gender]",
        "Number of people in household [household]",
        "Program status [prog]",
    ];

    const [listVariables, setListVariables] = useState<string[]>(initialListVariables);
    const [testVariables, setTestVariables] = useState<string[]>([]);
    const [highlightedVariable, setHighlightedVariable] = useState<string | null>(null);
    const [testValue, setTestValue] = useState<number>(0);
    const [estimateEffectSize, setEstimateEffectSize] = useState<boolean>(true);

    const handleSelectedVariable = (variable: string) => {
        if (highlightedVariable === variable) {
            setTestVariables((prev) => [...prev, highlightedVariable]);
            setListVariables((prev) => prev.filter((item) => item !== variable));
            setHighlightedVariable(null);
        } else {
            setHighlightedVariable(variable);
            
        }
    };
    
    const handleDeselectVariable = (variable: string) => {
        if (highlightedVariable === variable) {
            setListVariables((prev) => [...prev, highlightedVariable].sort((a, b) => initialListVariables.indexOf(a) - initialListVariables.indexOf(b)));
            setTestVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            setHighlightedVariable(null);
        } else {
            setHighlightedVariable(variable);
        }
    };

    const handleSelectVariable = () => {
        if (highlightedVariable) {
            if (listVariables.includes(highlightedVariable)) {
                setTestVariables((prev) => [...prev, highlightedVariable]);
                setListVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            } else if (testVariables.includes(highlightedVariable)) {
                setListVariables((prev) => [...prev, highlightedVariable].sort((a, b) => initialListVariables.indexOf(a) - initialListVariables.indexOf(b)));
                setTestVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            }
            setHighlightedVariable(null);
        }
    };

    const handleReset = () => {
        setListVariables(initialListVariables);
        setTestVariables([]);
        setTestValue(0);
        setHighlightedVariable(null);
        setEstimateEffectSize(true);
    };

    const handleRunTest = () => {
        console.log("Running test with:", { testVariables, testValue, estimateEffectSize });
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
                <DialogTitle>One-Sample T Test</DialogTitle>
            </DialogHeader>

            <Separator className="my-0" />

            <div className="grid grid-cols-9 gap-2 py-4">
                {/* List Variables */}
                <div
                    className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                    style={{
                        width: "250px", // Fixed width
                        minHeight: "422px", // Minimum height
                        maxHeight: "422px", // Maximum height
                    }}
                >
                    <label className="font-semibold">List Variables</label>
                    <div className="space-y-2">
                        {listVariables.map((variable) => (
                            <div
                                key={variable}
                                className={`p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${
                                    highlightedVariable === variable
                                        ? "bg-blue-100 border-blue-500"
                                        : "border-gray-300"
                                }`}
                                onClick={() => handleSelectedVariable(variable)}
                            >
                                {variable}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Move Button */}
                <div className="col-span-1 flex flex-col items-center justify-center space-y-10">
                    <Button
                        variant="link"
                        onClick={handleSelectVariable}
                        disabled={!highlightedVariable}
                    >
                        {highlightedVariable && listVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} />
                        ) : highlightedVariable && testVariables.includes(highlightedVariable) ? (
                            <CornerDownLeft size={24} />
                        ) : (
                            <CornerDownLeft size={24} />
                        )}
                    </Button>
                </div>
                
                <div className="grid grid-rows-1 gap-2 col-span-3">
                    {/* Test Variables */}
                    <div className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                        style={{
                            width: "250px", // Fixed width
                            minHeight: "300px", // Minimum height
                            maxHeight: "300px", // Maximum height
                        }}
                    >
                        <label className="font-semibold">Test Variables</label>
                        <div className="space-y-2">
                            {testVariables.map((variable) => (
                                <div
                                    key={variable}
                                    className={`p-2 border cursor-pointer rounded-md hover:bg-blue-100 ${
                                        highlightedVariable === variable
                                            ? "bg-blue-100 border-blue-500"
                                            : "border-gray-300"
                                    }`}
                                    onClick={() => handleDeselectVariable(variable)}
                                >
                                    {variable}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Test Value and Effect Sizes */}
                    <div className="col-span-3">
                        <label htmlFor="test-value" className="font-semibold">
                            Test Value
                        </label>
                        <input
                            id="test-value"
                            type="number"
                            value={testValue}
                            onChange={(e) => setTestValue(Number(e.target.value))}
                            className="border rounded w-full p-2"
                        />
                    </div>
                    <div className="col-span-3 flex items-center space-x-4 py-2">
                        <Checkbox
                            id="estimate-effect-sizes"
                            checked={estimateEffectSize}
                            onCheckedChange={(checked) => setEstimateEffectSize(checked as boolean)}
                        />
                        <label htmlFor="estimate-effect-sizes">Estimate effect sizes</label>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="col-span-2 flex flex-col justify-start space-y-4 p-4">
                    <Button variant="outline">Options...</Button>
                    <Button variant="outline">Bootstrap...</Button>
                </div>
            </div>

            

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-center space-x-4">
                <Button onClick={handleRunTest} disabled={testVariables.length === 0}>OK</Button>
                <Button variant="outline">Paste</Button>
                <Button variant="outline" onClick={handleReset}>Reset</Button>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="outline">Help</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default OneSampleTTestModal;