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

interface ChiSquareModalProps {
    onClose: () => void;
}

const ChiSquareModal: React.FC<ChiSquareModalProps> = ({ onClose }) => {
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
    const [expectedRangeOption, setExpectedRangeOption] = useState<string>("Get from data");
    const [lowerValue, setLowerValue] = useState<number | null>(null);
    const [upperValue, setUpperValue] = useState<number | null>(null);
    const [expectedValueOption, setExpectedValueOption] = useState<string>("All categories equal");
    const [expectedValueList, setExpectedValueList] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState<number | null>(null);

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

    const handleAddExpectedValue = () => {
        if (inputValue !== null && inputValue !== 0) {
            const stringValue = inputValue.toString(); // Konversi inputValue ke string
            setExpectedValueList((prev) => [...prev, stringValue]); // Tambahkan stringValue ke expectedValueList
            setInputValue(null); // Reset inputValue
        }
    };    

    const handleRemoveExpectedValue = () => {
        if (highlightedVariable !== null || (inputValue !== null && inputValue !== 0)) {
            setExpectedValueList((prev) =>
                prev.filter((value) => value !== highlightedVariable)
            );
            setHighlightedVariable(null);
        }
    };

    const handleChangeExpectedValue = () => {
        if (highlightedVariable !== null && inputValue !== null) {
            const stringValue = inputValue.toString(); // Konversi inputValue ke string
            setExpectedValueList((prev) =>
                prev.map((value) =>
                    value === highlightedVariable ? stringValue : value
                )
            );
            setHighlightedVariable(null);
            setInputValue(null);
        }
    };    

    const handleReset = () => {
        setListVariables(initialListVariables);
        setTestVariables([]);
        setHighlightedVariable(null);
        setExpectedRangeOption("Get from data");
        setLowerValue(null);
        setUpperValue(null);
        setExpectedValueOption("All categories equal");
        setExpectedValueList([]);
        setInputValue(null);
    };

    const handleRunTest = () => {
        console.log("Running test with:", { testVariables, expectedRangeOption, lowerValue, upperValue, expectedValueOption, expectedValueList });
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
                <DialogTitle>Chi-square Test</DialogTitle>
            </DialogHeader>

            <Separator className="my-2" />

            <div className="grid grid-cols-9 gap-2 py-4">
                {/* List Variables */}
                <div
                    className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                    style={{
                        height: "244px"
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
                    <Button
                        variant="link"
                        onClick={handleMoveTestVariables}
                        disabled={
                            !highlightedVariable // Jika tidak ada variable yang disorot
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

                {/* Test Variables */}
                <div className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                    style={{
                        minHeight: "244px"
                    }}
                >
                    <label className="font-semibold">Variables</label>
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

                {/* Right Sidebar */}
                <div className="col-span-2 m-fit flex flex-col justify-start space-y-4 p-4">
                    <Button variant="outline">Exact...</Button>
                    <Button variant="outline">Options...</Button>
                </div>

                {/* Expected Range */}
                <div className="col-span-3 ">
                    <Label htmlFor="expected-range" className="font-semibold text-base">Expected Range</Label>
                    <div className="border p-4 rounded-md flex space-x-4 items-start" style={{height: "280px"}}>
                        <RadioGroup
                            value={expectedRangeOption}
                            onValueChange={(value) => setExpectedRangeOption(value)}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id="get-from-data" value="Get from data" />
                                <Label htmlFor="get-from-data" className="text-sm">Get from data</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id="use-spesified-range" value="Use spesified range" />
                                <Label htmlFor="use-spesified-range" className="text-sm">Use spesified range</Label>
                            </div>
                            <div className="grid grid-cols-9 gap-2">
                                <div className="col-span-1"></div>
                                <div className="col-span-8 flex items-center">
                                    <label htmlFor="lower-value">
                                        Lower:
                                    </label>
                                    <input
                                        id="lower-value"
                                        type="number"
                                        disabled={expectedRangeOption === "Get from data"}
                                        value={lowerValue !== null ? lowerValue : ""}
                                        onChange={(e) => setLowerValue(Number(e.target.value))}
                                        className="border rounded w-full p-2 ml-2"
                                    />
                                </div>
                                <div className="col-span-1"></div>
                                <div className="col-span-8 flex items-center">
                                    <label htmlFor="upper-value">
                                        Upper:
                                    </label>
                                    <input
                                        id="upper-value"
                                        type="number"
                                        disabled={expectedRangeOption === "Get from data"}
                                        value={upperValue !== null ? upperValue : ""}
                                        onChange={(e) => setUpperValue(Number(e.target.value))}
                                        className="border rounded w-full p-2 ml-2"
                                    />
                                </div>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
                <div className="col-span-1"></div>
                <div className="col-span-3 ">
                    <Label htmlFor="expected-value" className="font-semibold text-base">Expected Value</Label>
                    <div className="border p-4 rounded-md flex space-x-4 items-center">
                        <RadioGroup
                            value={expectedValueOption}
                            onValueChange={(value) => setExpectedValueOption(value)}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id="all-categories-equal" value="All categories equal" />
                                <Label htmlFor="all-categories-equal" className="text-sm">All categories equal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem id="custom" value="Custom" />
                                <Label htmlFor="custom" className="text-sm">Value:</Label>
                                <input
                                    id="input-value"
                                    type="number"
                                    min="0.0001" // Batas minimum
                                    max="99999" // Batas maksimum
                                    step="0.0001" // Resolusi angka yang diperbolehkan
                                    disabled={expectedValueOption === "All categories equal"}
                                    value={inputValue !== null ? inputValue : ""}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        if (value >= 0 && value <= 99999) {
                                            setInputValue(value); // Set nilai jika valid
                                        } else {
                                            setInputValue(null); // Set ke null jika tidak valid
                                        }
                                    }}
                                    className="border rounded w-full p-2 ml-2"
                                />
                            </div>
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-1"></div>
                                <div className="col-span-4 flex flex-col justify-center space-y-1">
                                    <Button
                                        variant="outline"
                                        disabled={inputValue === null || inputValue === 0}
                                        onClick={handleAddExpectedValue}>
                                        Add
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={highlightedVariable === null || !expectedValueList.includes(highlightedVariable)}
                                        onClick={handleChangeExpectedValue}>
                                        Change
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={highlightedVariable === null || !expectedValueList.includes(highlightedVariable)}
                                        onClick={handleRemoveExpectedValue}>
                                        Remove
                                    </Button>
                                </div>
                                <div className="col-span-7 flex flex-col border p-4 rounded-md overflow-y-auto" style={{
                                    height: "168px"
                                }}>
                                    <div className="space-y-1">
                                        {expectedValueList.map((variable) => (
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
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-center space-x-4">
                <Button
                    onClick={handleRunTest}
                    disabled={
                        testVariables === null || // Ketika testVariables null
                        (expectedRangeOption === "Use spesified range" && (lowerValue === null || upperValue === null)) || // Kondisi range spesifik
                        (expectedValueOption === "Custom" && expectedValueList.length < 2) // Kondisi custom value
                    }
                >
                    OK
                </Button>
                <Button variant="outline">Paste</Button>
                <Button variant="outline" onClick={handleReset}>
                    Reset</Button>
                <Button variant="outline" onClick={onClose}>
                    Cancel</Button>
                <Button variant="outline">Help</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default ChiSquareModal;