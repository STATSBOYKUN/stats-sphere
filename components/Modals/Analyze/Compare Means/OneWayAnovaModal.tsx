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

interface OneWayAnovaModalProps {
    onClose: () => void;
}

const OneWayAnovaModal: React.FC<OneWayAnovaModalProps> = ({ onClose }) => {
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
    const [dependentList, setDependentList] = useState<string[]>([]);
    const [factorVariable, setFactorVariable] = useState<string | null>(null);
    const [highlightedVariable, setHighlightedVariable] = useState<string | null>(null);
    const [estimateEffectSize, setEstimateEffectSize] = useState<boolean>(false);

    const handleMoveDependentList = () => {
        if (highlightedVariable) {
            if (listVariables.includes(highlightedVariable)) {
                setDependentList((prev) => [...prev, highlightedVariable]);
                setListVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            } else if (dependentList.includes(highlightedVariable)) {
                setListVariables((prev) => [...prev, highlightedVariable].sort((a, b) => initialListVariables.indexOf(a) - initialListVariables.indexOf(b)));
                setDependentList((prev) => prev.filter((item) => item !== highlightedVariable));
            }
            setHighlightedVariable(null);
        }
    };

    const handleMoveFactorVariable = () => {
        if (highlightedVariable) {
            if (listVariables.includes(highlightedVariable)) {
                setFactorVariable(highlightedVariable);
                setListVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            } else if (factorVariable && factorVariable.includes(highlightedVariable)) {
                setListVariables((prev) => [...prev, highlightedVariable].sort((a, b) => initialListVariables.indexOf(a) - initialListVariables.indexOf(b)));
                setFactorVariable(null);
            }
            setHighlightedVariable(null);
        }
    };

    const handleReset = () => {
        setListVariables(initialListVariables);
        setDependentList([]);
        setFactorVariable(null);
        setHighlightedVariable(null);
        setEstimateEffectSize(false);
    };

    const handleRunTest = () => {
        console.log("Running test with:", { dependentList, factorVariable, estimateEffectSize });
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
                <DialogTitle>One-Way ANOVA</DialogTitle>
            </DialogHeader>

            <Separator className="my-2" />

            <div className="grid grid-cols-9 gap-2 py-4">
                {/* List Variables */}
                <div
                    className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                    style={{
                        width: "250px", // Fixed width
                        minHeight: "556px", // Minimum height
                        maxHeight: "556px", // Maximum height
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
                                onClick={() => setHighlightedVariable(variable)}
                            >
                                {variable}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Move Buttons */}
                <div className="col-span-1 flex flex-col items-center justify-center space-y-60">
                    {/* Tombol pertama */}
                    <Button
                        variant="link"
                        onClick={handleMoveDependentList}
                        disabled={
                            !highlightedVariable || // Jika tidak ada variable yang disorot
                            (factorVariable === highlightedVariable)
                        }
                    >
                        {highlightedVariable && listVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} />
                        ) : highlightedVariable && dependentList.includes(highlightedVariable) ? (
                            <CornerDownLeft size={24} />
                        ) : (
                            <CornerDownLeft size={24} />
                        )}
                    </Button>

                    {/* Tombol kedua */}
                    <Button
                        variant="link"
                        onClick={handleMoveFactorVariable}
                        disabled={
                            !highlightedVariable ||
                            (listVariables.includes(highlightedVariable) && factorVariable !== null) ||
                            dependentList.includes(highlightedVariable)
                        }
                    >
                        {highlightedVariable && listVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} />
                        ) : highlightedVariable && dependentList.includes(highlightedVariable) ? (
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
                            minHeight: "336px", // Minimum height
                            maxHeight: "336px", // Maximum height
                        }}
                    >
                        <label className="font-semibold">Dependent List</label>
                        <div className="space-y-2">
                            {dependentList.map((variable) => (
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
                    
                    {/* Factor Variable */}
                    <div className="col-span-3 flex flex-col border p-4 rounded-md mt-4"
                        style={{
                            width: "250px", // Fixed width
                            minHeight: "124px", // Minimum height
                            maxHeight: "124px", // Maximum height
                        }}
                    >
                        <label className="font-semibold">Factor</label>
                        {factorVariable ? (
                            <div
                                className={`p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${
                                    highlightedVariable === factorVariable
                                        ? "bg-blue-100 border-blue-500"
                                        : "border-gray-300"
                                }`}
                                onClick={() => setHighlightedVariable(factorVariable)}
                            >
                                {factorVariable}
                            </div>
                        ) : (
                            <div className="p-2 text-gray-500">None selected</div>
                        )}
                    </div>

                    {/* Options */}
                    <div className="col-span-3 flex items-center space-x-4 py-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="estimate-effect-sizes"
                                checked={estimateEffectSize}
                                onCheckedChange={(checked) => setEstimateEffectSize(checked as boolean)}
                            />
                            <label htmlFor="estimate-effect-sizes">Estimate effect sizes for overall tests</label>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="col-span-2 flex flex-col justify-start space-y-4 p-4">
                    <Button variant="outline">Contrasts...</Button>
                    <Button variant="outline">Post Hoc...</Button>
                    <Button variant="outline">Options...</Button>
                    <Button variant="outline">Bootstrap...</Button>
                </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-center space-x-4">
                <Button onClick={handleRunTest} disabled={dependentList.length === 0 || !factorVariable}>OK</Button>
                <Button variant="outline">Paste</Button>
                <Button variant="outline" onClick={handleReset}>Reset</Button>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="outline">Help</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default OneWayAnovaModal;