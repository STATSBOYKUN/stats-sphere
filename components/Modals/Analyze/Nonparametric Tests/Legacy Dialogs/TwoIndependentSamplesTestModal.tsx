import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { CornerDownLeft, CornerDownRight } from "lucide-react";

interface TwoIndependentSamplesTestModalProps {
    onClose: () => void;
}

const TwoIndependentSamplesTestModal: React.FC<TwoIndependentSamplesTestModalProps> = ({ onClose }) => {
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
    const [groupingVariable, setGroupingVariable] = useState<string | null>(null);
    const [highlightedVariable, setHighlightedVariable] = useState<string | null>(null);
    const [mannWhitneyUOption, setMannWhitneyUOption] = useState<boolean>(true);
    const [kolmogorovSmirnovZOption, setKolmogorovSmirnovZOption] = useState<boolean>(false);
    const [mosesExtremeReactionsOption, setMosesExtremeReactionsOption] = useState<boolean>(false);
    const [waldWolfowitzRunsOption, setWaldWolfowitzRunsOption] = useState<boolean>(false);

    const handleMoveTestVariables = () => {
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

    const handleMoveGroupingVariable = () => {
        if (highlightedVariable) {
            if (listVariables.includes(highlightedVariable)) {
                setGroupingVariable(highlightedVariable);
                setListVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            } else if (groupingVariable && groupingVariable.includes(highlightedVariable)) {
                setListVariables((prev) => [...prev, highlightedVariable].sort((a, b) => initialListVariables.indexOf(a) - initialListVariables.indexOf(b)));
                setGroupingVariable(null);
            }
            setHighlightedVariable(null);
        }
    };

    const handleReset = () => {
        setListVariables(initialListVariables);
        setTestVariables([]);
        setGroupingVariable(null);
        setHighlightedVariable(null);
        setMannWhitneyUOption(true);
        setKolmogorovSmirnovZOption(false);
        setMosesExtremeReactionsOption(false);
        setWaldWolfowitzRunsOption(false);
    };

    const handleRunTest = () => {
        console.log("Running test with:", { testVariables, groupingVariable, mannWhitneyUOption, kolmogorovSmirnovZOption, mosesExtremeReactionsOption, waldWolfowitzRunsOption });
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
                <DialogTitle>Two-Independent-Samples Test</DialogTitle>
            </DialogHeader>

            <Separator className="my-2" />

            <div className="grid grid-cols-9 gap-2 py-4">
                {/* List Variables */}
                <div
                    className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                    style={{
                        width: "250px", // Fixed width
                        height: "442px",
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
                <div className="col-span-1 flex flex-col items-center justify-center space-y-44">
                    {/* Tombol pertama */}
                    <Button
                        variant="link"
                        onClick={handleMoveTestVariables}
                        disabled={
                            !highlightedVariable || // Jika tidak ada variable yang disorot
                            (groupingVariable === highlightedVariable)
                        }
                    >
                        {highlightedVariable && listVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} />
                        ) : highlightedVariable && testVariables.includes(highlightedVariable) ? (
                            <CornerDownLeft size={24} />
                        ) : (
                            <CornerDownLeft size={24} />
                        )}
                    </Button>

                    {/* Tombol kedua */}
                    <Button
                        variant="link"
                        onClick={handleMoveGroupingVariable}
                        disabled={
                            !highlightedVariable ||
                            (listVariables.includes(highlightedVariable) && groupingVariable !== null) ||
                            testVariables.includes(highlightedVariable)
                        }
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
                            minHeight: "234px", // Minimum height
                            maxHeight: "234px", // Maximum height
                        }}
                    >
                        <label className="font-semibold">Test Variable List</label>
                        <div className="space-y-2">
                            {testVariables.map((variable) => (
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
                    
                    {/* Grouping Variable */}
                    <div className="col-span-3 flex flex-col border p-4 rounded-md mt-4"
                        style={{
                            width: "250px", // Fixed width
                            minHeight: "124px", // Minimum height
                            maxHeight: "124px", // Maximum height
                        }}
                    >
                        <label className="font-semibold">Grouping Variable</label>
                        {groupingVariable ? (
                            <div
                                className={`p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${
                                    highlightedVariable === groupingVariable
                                        ? "bg-blue-100 border-blue-500"
                                        : "border-gray-300"
                                }`}
                                onClick={() => setHighlightedVariable(groupingVariable)}
                            >
                                {groupingVariable}
                            </div>
                        ) : (
                            <div className="p-2 text-gray-500">None selected</div>
                        )}
                    </div>
                    <div className="col-span-3 flex items-center space-x-4 px-6 py-2">
                        <Button variant="outline">Define Groups...</Button>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="col-span-2 flex flex-col justify-start space-y-4 p-4">
                    <Button variant="outline">Exact...</Button>
                    <Button variant="outline">Options...</Button>
                </div>

                {/* Cut Point */}
                <div className="col-span-7 ">
                    <Label htmlFor="display-options" className="font-semibold text-base">Test Type</Label>
                    <div className="grid grid-cols-2 border p-4 rounded-md space-x-4 items-center">
                        <div className="col-span-1">
                            <div className="space-x-1">
                                <Checkbox
                                    id="mann-whitney-u-option"
                                    checked={mannWhitneyUOption}
                                    onCheckedChange={(checked) => setMannWhitneyUOption(checked as boolean)}
                                />
                            <label htmlFor="mann-whitney-u-option">Mann-Whitney U</label>
                            </div>
                            <div className="space-x-1">
                                <Checkbox
                                    id="kolmogorov-smirnov-z-option"
                                    checked={kolmogorovSmirnovZOption}
                                    onCheckedChange={(checked) => setKolmogorovSmirnovZOption(checked as boolean)}
                                />
                                <label htmlFor="kolmogorov-smirnov-z-option">Kolmogorov-Smirnov Z</label>
                            </div>
                        </div>
                        <div className="col-span-1">
                            <div className="space-x-1">
                                <Checkbox
                                    id="moses-extreme-reactions-option"
                                    checked={mosesExtremeReactionsOption}
                                    onCheckedChange={(checked) => setMosesExtremeReactionsOption(checked as boolean)}
                                />
                                <label htmlFor="moses-extreme-reactions-option">Moses extreme reactions</label>
                            </div>
                            <div className="space-x-1">
                                <Checkbox
                                    id="wald-wolfowitz-runs-option"
                                    checked={waldWolfowitzRunsOption}
                                    onCheckedChange={(checked) => setWaldWolfowitzRunsOption(checked as boolean)}
                                />
                                <label htmlFor="wald-wolfowitz-runs-option">Wald-Wolfowitz runs</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-center space-x-4">
                <Button onClick={handleRunTest} disabled={testVariables.length === 0 ||
                                                          !groupingVariable ||
                                                          mannWhitneyUOption === false ||
                                                          kolmogorovSmirnovZOption === false ||
                                                          mosesExtremeReactionsOption === false ||
                                                          waldWolfowitzRunsOption === false}
                >
                    OK
                </Button>
                <Button variant="outline">Paste</Button>
                <Button variant="outline" onClick={handleReset}>Reset</Button>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="outline">Help</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default TwoIndependentSamplesTestModal;