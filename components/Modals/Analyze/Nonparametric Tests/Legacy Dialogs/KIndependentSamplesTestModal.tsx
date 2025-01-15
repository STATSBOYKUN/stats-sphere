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

interface KIndependentSamplesTestModalProps {
    onClose: () => void;
}

const KIndependentSamplesTestModal: React.FC<KIndependentSamplesTestModalProps> = ({ onClose }) => {
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
    const [kruskallWallisHOption, setKruskallWallisHOption] = useState<boolean>(true);
    const [jonckheereTerpstraOption, setJonckheereTerpstraOption] = useState<boolean>(false);
    const [medianOption, setMedianOption] = useState<boolean>(false);

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
        setKruskallWallisHOption(true);
        setJonckheereTerpstraOption(false);
        setMedianOption(false);
    };

    const handleRunTest = () => {
        console.log("Running test with:", { testVariables, groupingVariable, kruskallWallisHOption, jonckheereTerpstraOption, medianOption });
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
                <DialogTitle>Test for Several Independent Samples</DialogTitle>
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
                        <label className="font-semibold">Grouping Range</label>
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
                    <div className="grid grid-cols-2 border p-4 rounded-md space-x-4">
                        <div className="col-span-1">
                            <div className="space-x-1">
                                <Checkbox
                                    id="kruskall-wallis-h-option"
                                    checked={kruskallWallisHOption}
                                    onCheckedChange={(checked) => setKruskallWallisHOption(checked as boolean)}
                                />
                            <label htmlFor="kruskall-wallis-h-option">Kruskall-Wallis H</label>
                            </div>
                            <div className="space-x-1">
                                <Checkbox
                                    id="jonckheere-terpstra-option"
                                    checked={jonckheereTerpstraOption}
                                    onCheckedChange={(checked) => setJonckheereTerpstraOption(checked as boolean)}
                                />
                                <label htmlFor="jonckheere-terpstra-option">Jonckheere-Terpstra</label>
                            </div>
                        </div>
                        <div className="col-span-1">
                            <div className="space-x-1">
                                <Checkbox
                                    id="median-option"
                                    checked={medianOption}
                                    onCheckedChange={(checked) => setMedianOption(checked as boolean)}
                                />
                                <label htmlFor="median-option">Median</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-center space-x-4">
                <Button onClick={handleRunTest} disabled={testVariables.length === 0 ||
                                                          !groupingVariable ||
                                                          kruskallWallisHOption === false ||
                                                          jonckheereTerpstraOption === false ||
                                                          medianOption === false}
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

export default KIndependentSamplesTestModal;