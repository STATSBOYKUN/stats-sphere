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

interface RunsModalProps {
    onClose: () => void;
}

const RunsModal: React.FC<RunsModalProps> = ({ onClose }) => {
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
    const [medianOption, setMedianOption] = useState<boolean>(true);
    const [modeOption, setModeOption] = useState<boolean>(false);
    const [meanOption, setMeanOption] = useState<boolean>(false);
    const [customOption, setCustomOption] = useState<boolean>(false);
    const [customValue, setCustomValue] = useState<number>(0);

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

    const handleReset = () => {
        setListVariables(initialListVariables);
        setTestVariables([]);
        setHighlightedVariable(null);
        setMedianOption(true);
        setModeOption(false);
        setMeanOption(false);
        setCustomOption(false);
        setCustomValue(0);
    };

    const handleRunTest = () => {
        console.log("Running test with:", { testVariables, medianOption, modeOption, meanOption, customOption, customValue });
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
                <DialogTitle>Runs Test</DialogTitle>
            </DialogHeader>

            <Separator className="my-2" />

            <div className="grid grid-cols-9 gap-2 py-4">
                {/* List Variables */}
                <div
                    className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                    style={{
                        height: "348px"
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
                        minHeight: "348px"
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

                {/* Cut Point */}
                <div className="col-span-7 ">
                    <Label htmlFor="display-options" className="font-semibold text-base">Cut Point</Label>
                    <div className="border p-4 rounded-md flex space-x-4 items-center">
                        <div className="space-x-1">
                            <Checkbox
                                id="median-option"
                                checked={medianOption}
                                onCheckedChange={(checked) => setMedianOption(checked as boolean)}
                            />
                        <label htmlFor="median-option">Median</label>
                        </div>
                        <div className="space-x-1">
                            <Checkbox
                                id="mode-option"
                                checked={modeOption}
                                onCheckedChange={(checked) => setModeOption(checked as boolean)}
                            />
                            <label htmlFor="mode-option">Mode</label>
                        </div>
                        <div className="space-x-1">
                            <Checkbox
                                id="mean-option"
                                checked={meanOption}
                                onCheckedChange={(checked) => setMeanOption(checked as boolean)}
                            />
                            <label htmlFor="mean-option">Mean</label>
                        </div>
                        <div className="space-x-1">
                            <Checkbox
                                id="custom-option"
                                checked={customOption}
                                onCheckedChange={(checked) => setCustomOption(checked as boolean)}
                            />
                            <label htmlFor="custom-option">Custom:</label>
                            <input
                                id="custom-value"
                                type="number"
                                disabled={customOption === false}
                                value={customValue}
                                onChange={(e) => setCustomValue(Number(e.target.value))}
                                className="border rounded p-2"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-center space-x-4">
                <Button onClick={handleRunTest} disabled={testVariables.length === 0 ||
                                                         (medianOption === false &&
                                                          modeOption === false &&
                                                          meanOption === false &&
                                                          customOption === false)
                }>
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

export default RunsModal;