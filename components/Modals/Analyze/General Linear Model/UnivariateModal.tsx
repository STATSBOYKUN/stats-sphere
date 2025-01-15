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

interface UnivariateModalProps {
    onClose: () => void;
}

const UnivariateModal: React.FC<UnivariateModalProps> = ({ onClose }) => {
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
    const [dependentVariable, setDependentVariable] = useState<string | null>(null);
    const [fixedFactors, setFixedFactors] = useState<string[]>([]);
    const [randomFactors, setRandomFactors] = useState<string[]>([]);
    const [covariates, setCovariates] = useState<string[]>([]);
    const [wlsWeightVariable, setWlsWeightVariable] = useState<string | null>(null);
    const [highlightedVariable, setHighlightedVariable] = useState<string | null>(null);

    const handleMoveDependentVariable = () => {
        if (highlightedVariable) {
            if (listVariables.includes(highlightedVariable)) {
                setDependentVariable(highlightedVariable);
                setListVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            } else if (dependentVariable && dependentVariable.includes(highlightedVariable)) {
                setListVariables((prev) => [...prev, highlightedVariable].sort((a, b) => initialListVariables.indexOf(a) - initialListVariables.indexOf(b)));
                setDependentVariable(null);
            }
            setHighlightedVariable(null);
        }
    };

    const handleMoveFixedFactors = () => {
        if (highlightedVariable) {
            if (listVariables.includes(highlightedVariable)) {
                setFixedFactors((prev) => [...prev, highlightedVariable]);
                setListVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            } else if (fixedFactors.includes(highlightedVariable)) {
                setListVariables((prev) => [...prev, highlightedVariable].sort((a, b) => initialListVariables.indexOf(a) - initialListVariables.indexOf(b)));
                setFixedFactors((prev) => prev.filter((item) => item !== highlightedVariable));
            }
            setHighlightedVariable(null);
        }
    };

    const handleMoveRandomFactors = () => {
        if (highlightedVariable) {
            if (listVariables.includes(highlightedVariable)) {
                setRandomFactors((prev) => [...prev, highlightedVariable]);
                setListVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            } else if (randomFactors.includes(highlightedVariable)) {
                setListVariables((prev) => [...prev, highlightedVariable].sort((a, b) => initialListVariables.indexOf(a) - initialListVariables.indexOf(b)));
                setRandomFactors((prev) => prev.filter((item) => item !== highlightedVariable));
            }
            setHighlightedVariable(null);
        }
    };

    const handleMoveCovariates = () => {
        if (highlightedVariable) {
            if (listVariables.includes(highlightedVariable)) {
                setCovariates((prev) => [...prev, highlightedVariable]);
                setListVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            } else if (covariates.includes(highlightedVariable)) {
                setListVariables((prev) => [...prev, highlightedVariable].sort((a, b) => initialListVariables.indexOf(a) - initialListVariables.indexOf(b)));
                setCovariates((prev) => prev.filter((item) => item !== highlightedVariable));
            }
            setHighlightedVariable(null);
        }
    };

    const handleMoveWlsWeightVariable = () => {
        if (highlightedVariable) {
            if (listVariables.includes(highlightedVariable)) {
                setWlsWeightVariable(highlightedVariable);
                setListVariables((prev) => prev.filter((item) => item !== highlightedVariable)
                );
            } else if (wlsWeightVariable && wlsWeightVariable.includes(highlightedVariable)) {
                setListVariables((prev) => [...prev, highlightedVariable].sort((a, b) => initialListVariables.indexOf(a) - initialListVariables.indexOf(b)));
                setWlsWeightVariable(null);
            }
            setHighlightedVariable(null);
        }
    };

    const handleReset = () => {
        setListVariables(initialListVariables);
        setDependentVariable(null);
        setFixedFactors([]);
        setRandomFactors([]);
        setCovariates([]);
        setWlsWeightVariable(null);
        setHighlightedVariable(null);
    };

    const handleRunTest = () => {
        console.log("Running test with:", { dependentVariable, fixedFactors, randomFactors, covariates, wlsWeightVariable });
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
                <DialogTitle>Univariate</DialogTitle>
            </DialogHeader>

            <Separator className="my-2" />

            <div className="grid grid-cols-9 gap-2 py-4 overflow-y-auto"
                style={{
                    minHeight: "580px", // Minimum height
                    maxHeight: "580px", // Maximum height
                }}
            >
                {/* List Variables */}
                <div
                    className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                    style={{
                        width: "250px", // Fixed width
                        minHeight: "763px", // Minimum height
                        maxHeight: "763px", // Maximum height
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
                    {/* Tombol Dependent Variable */}
                    <Button
                        variant="link"
                        onClick={handleMoveDependentVariable}
                        disabled={
                            !highlightedVariable ||
                            (listVariables.includes(highlightedVariable) && dependentVariable !== null) ||
                            fixedFactors.includes(highlightedVariable) ||
                            randomFactors.includes(highlightedVariable) ||
                            covariates.includes(highlightedVariable) ||
                            (wlsWeightVariable === highlightedVariable)
                        }
                    >
                        {highlightedVariable && listVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} />
                        ) : highlightedVariable && fixedFactors.includes(highlightedVariable) ? (
                            <CornerDownLeft size={24} />
                        ) : (
                            <CornerDownLeft size={24} />
                        )}
                    </Button>
                    
                    {/* Tombol Fixed Factors */}
                    <Button
                        variant="link"
                        onClick={handleMoveFixedFactors}
                        disabled={
                            !highlightedVariable || // Jika tidak ada variable yang disorot
                            (dependentVariable === highlightedVariable) ||
                            (randomFactors.includes(highlightedVariable)) ||
                            (covariates.includes(highlightedVariable)) ||
                            (wlsWeightVariable === highlightedVariable)
                            
                        }
                    >
                        {highlightedVariable && listVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} />
                        ) : highlightedVariable && fixedFactors.includes(highlightedVariable) ? (
                            <CornerDownLeft size={24} />
                        ) : (
                            <CornerDownLeft size={24} />
                        )}
                    </Button>

                    {/* Tombol Random Factors */}
                    <Button
                        variant="link"
                        onClick={handleMoveRandomFactors}
                        disabled={
                            !highlightedVariable || // Jika tidak ada variable yang disorot
                            (dependentVariable === highlightedVariable) ||
                            (fixedFactors.includes(highlightedVariable)) ||
                            (covariates.includes(highlightedVariable)) ||
                            (wlsWeightVariable === highlightedVariable)
                            
                        }
                    >
                        {highlightedVariable && listVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} />
                        ) : highlightedVariable && randomFactors.includes(highlightedVariable) ? (
                            <CornerDownLeft size={24} />
                        ) : (
                            <CornerDownLeft size={24} />
                        )}
                    </Button>

                    {/* Tombol Covariates */}
                    <Button
                        variant="link"
                        onClick={handleMoveCovariates}
                        disabled={
                            !highlightedVariable || // Jika tidak ada variable yang disorot
                            (dependentVariable === highlightedVariable) ||
                            (fixedFactors.includes(highlightedVariable)) ||
                            (randomFactors.includes(highlightedVariable)) ||
                            (wlsWeightVariable === highlightedVariable)
                            
                        }
                    >
                        {highlightedVariable && listVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} />
                        ) : highlightedVariable && covariates.includes(highlightedVariable) ? (
                            <CornerDownLeft size={24} />
                        ) : (
                            <CornerDownLeft size={24} />
                        )}
                    </Button>

                    {/* Tombol WLS Weight */}
                    <Button
                        variant="link"
                        onClick={handleMoveWlsWeightVariable}
                        disabled={
                            !highlightedVariable ||
                            (listVariables.includes(highlightedVariable) && wlsWeightVariable !== null) ||
                            (dependentVariable === highlightedVariable) ||
                            (fixedFactors.includes(highlightedVariable)) ||
                            (randomFactors.includes(highlightedVariable)) ||
                            (covariates.includes(highlightedVariable))
                        }
                    >
                        {highlightedVariable && listVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} />
                        ) : highlightedVariable && fixedFactors.includes(highlightedVariable) ? (
                            <CornerDownLeft size={24} />
                        ) : (
                            <CornerDownLeft size={24} />
                        )}
                    </Button>
                </div>

                <div className="grid grid-rows-1 gap-2 col-span-3">
                    {/* Dependent Variable */}
                    <div className="col-span-3 flex flex-col border p-4 rounded-md"
                        style={{
                            width: "250px", // Fixed width
                            minHeight: "124px", // Minimum height
                            maxHeight: "124px", // Maximum height
                        }}
                    >
                        <label className="font-semibold">Dependent Variable</label>
                        {dependentVariable ? (
                            <div
                                className={`p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${
                                    highlightedVariable === dependentVariable
                                        ? "bg-blue-100 border-blue-500"
                                        : "border-gray-300"
                                }`}
                                onClick={() => setHighlightedVariable(dependentVariable)}
                            >
                                {dependentVariable}
                            </div>
                        ) : (
                            <div className="p-2 text-gray-500">None selected</div>
                        )}
                    </div>
                    
                    {/* Fixed Factors */}
                    <div className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                        style={{
                            width: "250px", // Fixed width
                            minHeight: "161px", // Minimum height
                            maxHeight: "161px", // Maximum height
                        }}
                    >
                        <label className="font-semibold">Fixed Factors</label>
                        <div className="space-y-2">
                            {fixedFactors.map((variable) => (
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
                    
                    {/* Random Factors */}
                    <div className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                        style={{
                            width: "250px", // Fixed width
                            minHeight: "161px", // Minimum height
                            maxHeight: "161px", // Maximum height
                        }}
                    >
                        <label className="font-semibold">Random Factors</label>
                        <div className="space-y-2">
                            {randomFactors.map((variable) => (
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

                    {/* Covariates */}
                    <div className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                        style={{
                            width: "250px", // Fixed width
                            minHeight: "161px", // Minimum height
                            maxHeight: "161px", // Maximum height
                        }}
                    >
                        <label className="font-semibold">Covariates</label>
                        <div className="space-y-2">
                            {covariates.map((variable) => (
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
                        <label className="font-semibold">WLS Weight</label>
                        {wlsWeightVariable ? (
                            <div
                                className={`p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${
                                    highlightedVariable === wlsWeightVariable
                                        ? "bg-blue-100 border-blue-500"
                                        : "border-gray-300"
                                }`}
                                onClick={() => setHighlightedVariable(wlsWeightVariable)}
                            >
                                {wlsWeightVariable}
                            </div>
                        ) : (
                            <div className="p-2 text-gray-500">None selected</div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="col-span-2 flex flex-col justify-start space-y-4 p-4">
                    <Button variant="outline">Models...</Button>
                    <Button variant="outline">Contrasts...</Button>
                    <Button variant="outline">Plots...</Button>
                    <Button variant="outline" disabled={covariates.length > 0}>Post Hoc...</Button>
                    <Button variant="outline">EM Means...</Button>
                    <Button variant="outline">Save...</Button>
                    <Button variant="outline">Options...</Button>
                    <Button variant="outline" disabled={randomFactors.length > 0}>Bootstrap...</Button>
                </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-center space-x-4">
                <Button onClick={handleRunTest} disabled={fixedFactors.length === 0}>OK</Button>
                <Button variant="outline">Paste</Button>
                <Button variant="outline" onClick={handleReset}>Reset</Button>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="outline">Help</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default UnivariateModal;