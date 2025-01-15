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

interface KRelatedSamplesTestModalProps {
    onClose: () => void;
}

const KRelatedSamplesTestModal: React.FC<KRelatedSamplesTestModalProps> = ({ onClose }) => {
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
    const [friedmanOption, setFriedmanOption] = useState<boolean>(true);
    const [kendallsWOption, setKendallsWOption] = useState<boolean>(false);
    const [cochransQOption, setCochransQOption] = useState<boolean>(false);

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
        setFriedmanOption(true);
        setKendallsWOption(false);
        setCochransQOption(false);
    };

    const handleRunTest = () => {
        console.log("Running test with:", { testVariables, friedmanOption, kendallsWOption, cochransQOption });
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
                <DialogTitle>Tests for Several Related Samples</DialogTitle>
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
                    <Button variant="outline">Statistics...</Button>
                </div>

                {/* Cut Point */}
                <div className="col-span-7 ">
                    <Label htmlFor="display-options" className="font-semibold text-base">Cut Point</Label>
                    <div className="border p-4 rounded-md flex space-x-4 items-center">
                        <div className="space-x-1">
                            <Checkbox
                                id="friedman-option"
                                checked={friedmanOption}
                                onCheckedChange={(checked) => setFriedmanOption(checked as boolean)}
                            />
                        <label htmlFor="friedman-option">Friedman</label>
                        </div>
                        <div className="space-x-1">
                            <Checkbox
                                id="kendalls-w-option"
                                checked={kendallsWOption}
                                onCheckedChange={(checked) => setKendallsWOption(checked as boolean)}
                            />
                            <label htmlFor="kendalls-w-option">Kendall&rsquo;s W</label>
                        </div>
                        <div className="space-x-1">
                            <Checkbox
                                id="cochrans-q-option"
                                checked={cochransQOption}
                                onCheckedChange={(checked) => setCochransQOption(checked as boolean)}
                            />
                            <label htmlFor="cochrans-q-option">Cochran&rsquo;s Q</label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-center space-x-4">
                <Button onClick={handleRunTest} disabled={testVariables.length < 2 ||
                                                         (friedmanOption === false &&
                                                          kendallsWOption === false &&
                                                          cochransQOption === false)
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

export default KRelatedSamplesTestModal;