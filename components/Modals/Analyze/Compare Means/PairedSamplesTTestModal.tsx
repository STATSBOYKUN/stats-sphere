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
import { CornerDownRight, ArrowUp, ArrowDown, CornerDownLeft } from "lucide-react";

interface PairedSamplesTTestModalProps {
    onClose: () => void;
}

const PairedSamplesTTestModal: React.FC<PairedSamplesTTestModalProps> = ({ onClose }) => {
    const initialListVariables = [
        "Age in years [age]",
        "Marital status [marital]",
        "Income before the program [incbef]",
        "Income after the program [incaft]",
        "Level of education [ed]",
        "Number of people in household [household]",
        "Program status [prog]",
    ];

    const [listVariables, setListVariables] = useState<string[]>(initialListVariables);
    const [pairedVariables, setPairedVariables] = useState<{ variable1: string | null; variable2: string | null }[]>([
        { variable1: null, variable2: null },
    ]);
    const [highlightedVariable, setHighlightedVariable] = useState<string | null>(null);
    const [estimateEffectSize, setEstimateEffectSize] = useState<boolean>(false);

    const handleAddPair = () => {
        setPairedVariables((prev) => [...prev, { variable1: null, variable2: null }]);
    };

    const handleMoveVariable = (pairIndex: number, position: "variable1" | "variable2") => {
        if (highlightedVariable) {
            setPairedVariables((prev) =>
                prev.map((pair, index) =>
                    index === pairIndex
                        ? { ...pair, [position]: highlightedVariable }
                        : pair
                )
            );
            setListVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            setHighlightedVariable(null);
        }
    };

    const handleRemovePair = (pairIndex: number) => {
        setPairedVariables((prev) => {
            const removedPair = prev[pairIndex];
            if (removedPair.variable1) setListVariables((prevList) => [...prevList, removedPair.variable1]);
            if (removedPair.variable2) setListVariables((prevList) => [...prevList, removedPair.variable2]);
            return prev.filter((_, index) => index !== pairIndex);
        });
    };

    const handleReset = () => {
        setListVariables(initialListVariables);
        setPairedVariables([{ variable1: null, variable2: null }]);
        setHighlightedVariable(null);
        setEstimateEffectSize(false);
    };

    const handleRunTest = () => {
        console.log("Running paired-samples t-test with:", { pairedVariables, estimateEffectSize });
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
                <DialogTitle>Paired-Samples T Test</DialogTitle>
                <DialogDescription>
                    Configure your paired variables, then click &quot;OK&quot; to run the test.
                </DialogDescription>
            </DialogHeader>

            <Separator className="my-2" />

            <div className="grid grid-cols-9 gap-2 py-4">
                {/* List Variables */}
                <div className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto">
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
                                onClick={() => setHighlightedVariable(variable)}
                            >
                                {variable}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Move Buttons */}
                <div className="col-span-1 flex items-center justify-center">
                    <Button
                        variant="link"
                        onClick={handleAddPair}
                        disabled={listVariables.length === 0}
                    >
                        <CornerDownRight size={24} />
                    </Button>
                </div>

                {/* Paired Variables */}
                <div className="col-span-5 flex flex-col border p-4 rounded-md overflow-y-auto">
                    <label className="font-semibold">Paired Variables</label>
                    <div className="space-y-4">
                        {pairedVariables.map((pair, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <div
                                    className={`p-2 border cursor-pointer rounded-md flex-1 text-center ${
                                        pair.variable1
                                            ? "bg-blue-50 border-blue-500"
                                            : "border-gray-300"
                                    }`}
                                    onClick={() => handleMoveVariable(index, "variable1")}
                                >
                                    {pair.variable1 || "Select Variable 1"}
                                </div>
                                <CornerDownLeft size={16} />
                                <div
                                    className={`p-2 border cursor-pointer rounded-md flex-1 text-center ${
                                        pair.variable2
                                            ? "bg-blue-50 border-blue-500"
                                            : "border-gray-300"
                                    }`}
                                    onClick={() => handleMoveVariable(index, "variable2")}
                                >
                                    {pair.variable2 || "Select Variable 2"}
                                </div>
                                <Button
                                    variant="link"
                                    onClick={() => handleRemovePair(index)}
                                    className="ml-2"
                                >
                                    <ArrowUp size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Options */}
            <div className="flex items-center space-x-4 py-2">
                <Checkbox
                    id="estimate-effect-sizes"
                    checked={estimateEffectSize}
                    onCheckedChange={(checked) => setEstimateEffectSize(checked as boolean)}
                />
                <label htmlFor="estimate-effect-sizes">Estimate effect sizes</label>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-center space-x-4">
                <Button onClick={handleRunTest} disabled={pairedVariables.every((pair) => !pair.variable1 || !pair.variable2)}>
                    OK
                </Button>
                <Button variant="outline" onClick={handleReset}>
                    Reset
                </Button>
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default PairedSamplesTTestModal;
