import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { CornerDownLeft, CornerDownRight } from "lucide-react";

interface ExploreModalProps {
    onClose: () => void;
}

const ExploreModal: React.FC<ExploreModalProps> = ({ onClose }) => {
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
    const [factorList, setFactorList] = useState<string[]>([]);
    const [labelCaseVariable, setLabelCaseVariable] = useState<string | null>(null);
    const [highlightedVariable, setHighlightedVariable] = useState<string | null>(null);
    const [displayOption, setDisplayOption] = useState<string>("Both");

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

    const handleMoveFactorList = () => {
        if (highlightedVariable) {
            if (listVariables.includes(highlightedVariable)) {
                setFactorList((prev) => [...prev, highlightedVariable]);
                setListVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            } else if (factorList.includes(highlightedVariable)) {
                setListVariables((prev) => [...prev, highlightedVariable].sort((a, b) => initialListVariables.indexOf(a) - initialListVariables.indexOf(b)));
                setFactorList((prev) => prev.filter((item) => item !== highlightedVariable));
            }
            setHighlightedVariable(null);
        }
    };

    const handleMoveLabelCaseVariable = () => {
        if (highlightedVariable) {
            if (listVariables.includes(highlightedVariable)) {
                setLabelCaseVariable(highlightedVariable);
                setListVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            } else if (labelCaseVariable && labelCaseVariable.includes(highlightedVariable)) {
                setListVariables((prev) => [...prev, highlightedVariable].sort((a, b) => initialListVariables.indexOf(a) - initialListVariables.indexOf(b)));
                setLabelCaseVariable(null);
            }
            setHighlightedVariable(null);
        }
    };

    const handleReset = () => {
        setListVariables(initialListVariables);
        setDependentList([]);
        setFactorList([]);
        setLabelCaseVariable(null);
        setHighlightedVariable(null);
        setDisplayOption("Both");
    };

    const handleRunTest = () => {
        console.log("Running test with:", { dependentList, factorList, labelCaseVariable, displayOption });
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
                <DialogTitle>Explore</DialogTitle>
            </DialogHeader>

            <Separator className="my-2" />

            <div className="grid grid-cols-9 gap-2 py-4">
                {/* List Variables */}
                <div
                    className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                    style={{
                        width: "250px", // Fixed width
                        minHeight: "462px", // Minimum height
                        maxHeight: "462px", // Maximum height
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
                <div className="col-span-1 flex flex-col items-center justify-center space-y-32">
                    {/* Tombol Dependent List */}
                    <Button
                        variant="link"
                        onClick={handleMoveDependentList}
                        disabled={
                            !highlightedVariable || // Jika tidak ada variable yang disorot
                            (labelCaseVariable === highlightedVariable)||
                            (factorList.includes(highlightedVariable))
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

                    {/* Tombol Factor List */}
                    <Button
                        variant="link"
                        onClick={handleMoveFactorList}
                        disabled={
                            !highlightedVariable || // Jika tidak ada variable yang disorot
                            (labelCaseVariable === highlightedVariable) ||
                            (dependentList.includes(highlightedVariable))
                        }
                    >
                        {highlightedVariable && listVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} />
                        ) : highlightedVariable && factorList.includes(highlightedVariable) ? (
                            <CornerDownLeft size={24} />
                        ) : (
                            <CornerDownLeft size={24} />
                        )}
                    </Button>

                    {/* Tombol Label Case */}
                    <Button
                        variant="link"
                        onClick={handleMoveLabelCaseVariable}
                        disabled={
                            !highlightedVariable ||
                            (listVariables.includes(highlightedVariable) && labelCaseVariable !== null) ||
                            dependentList.includes(highlightedVariable) ||
                            factorList.includes(highlightedVariable)
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
                    {/* Dependent List */}
                    <div className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                        style={{
                            width: "250px", // Fixed width
                            minHeight: "161px", // Minimum height
                            maxHeight: "161px", // Maximum height
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
                    
                    {/* Factor List */}
                    <div className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                        style={{
                            width: "250px", // Fixed width
                            minHeight: "161px", // Minimum height
                            maxHeight: "161px", // Maximum height
                        }}
                    >
                        <label className="font-semibold">Factor List</label>
                        <div className="space-y-2">
                            {factorList.map((variable) => (
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

                    {/* Label Case */}
                    <div className="col-span-3 flex flex-col border p-4 rounded-md"
                        style={{
                            width: "250px", // Fixed width
                            minHeight: "124px", // Minimum height
                            maxHeight: "124px", // Maximum height
                        }}
                    >
                        <label className="font-semibold">Label Case</label>
                        {labelCaseVariable ? (
                            <div
                                className={`p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${
                                    highlightedVariable === labelCaseVariable
                                        ? "bg-blue-100 border-blue-500"
                                        : "border-gray-300"
                                }`}
                                onClick={() => setHighlightedVariable(labelCaseVariable)}
                            >
                                {labelCaseVariable}
                            </div>
                        ) : (
                            <div className="p-2 text-gray-500">None selected</div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="col-span-2 flex flex-col justify-start space-y-4 p-4">
                    <Button variant="outline" disabled={displayOption === "Plots"}>Statistics...</Button>
                    <Button variant="outline" disabled={displayOption === "Statistics"}>Plots...</Button>
                    <Button variant="outline">Options...</Button>
                    <Button variant="outline">Bootstrap...</Button>
                </div>

                {/* Display */}
                <div className="col-span-7 ">
                    <Label htmlFor="display-options" className="font-semibold text-base">Display</Label>
                    <RadioGroup
                        className="border p-4 rounded-md flex space-x-4"
                        value={displayOption}
                        onValueChange={(value) => setDisplayOption(value)}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem id="both" value="Both" />
                            <Label htmlFor="both" className="text-sm">Both</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem id="statistics" value="Statistics" />
                            <Label htmlFor="statistics" className="text-sm">Statistics</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem id="plots" value="Plots" />
                            <Label htmlFor="plots" className="text-sm">Plots</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-center space-x-4">
                <Button onClick={handleRunTest} disabled={dependentList.length === 0}>OK</Button>
                <Button variant="outline">Paste</Button>
                <Button variant="outline" onClick={handleReset}>Reset</Button>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="outline">Help</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default ExploreModal;
