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

interface BivariateModalProps {
    onClose: () => void;
}

const BivariateModal: React.FC<BivariateModalProps> = ({ onClose }) => {
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
    const [pearsonOption, setPearsonOption] = useState<boolean>(true);
    const [kendallsTauBOption, setKendallsTauBOption] = useState<boolean>(false);
    const [spearmanOption, setSpearmanOption] = useState<boolean>(false);
    const [testOfSignificance, setTestOfSignificance] = useState<string>("Two-tailed");
    const [flagSignificantCorrelations, setFlagSignificantCorrelations] = useState<boolean>(true);
    const [lowerTriangle, setLowerTriangle] = useState<boolean>(false);
    const [diagonalOption, setDiagonalOption] = useState<boolean>(true);

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
        setPearsonOption(true);
        setKendallsTauBOption(false);
        setSpearmanOption(false);
        setTestOfSignificance("Two-tailed");
        setFlagSignificantCorrelations(true);
        setLowerTriangle(false);
        setDiagonalOption(true);
    };

    const handleRunTest = () => {
        console.log("Running test with:", { testVariables, pearsonOption, kendallsTauBOption, spearmanOption, testOfSignificance, flagSignificantCorrelations, lowerTriangle, diagonalOption });
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[900px]">
            <DialogHeader>
                <DialogTitle>Bivariate Correlations</DialogTitle>
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
                    <Button variant="outline">Options...</Button>
                    <Button variant="outline">Style...</Button>
                    <Button variant="outline">Bootstrap...</Button>
                    <Button variant="outline" disabled={pearsonOption === false && spearmanOption === false}>Confidence interval...</Button>
                </div>

                {/* Correlation Coefficients */}
                <div className="col-span-7 ">
                    <Label htmlFor="display-options" className="font-semibold text-base">Correlation Coefficients</Label>
                    <div className="border p-4 rounded-md flex space-x-4">
                        <div className="space-x-1">
                            <Checkbox
                                id="pearson-option"
                                checked={pearsonOption}
                                onCheckedChange={(checked) => setPearsonOption(checked as boolean)}
                            />
                        <label htmlFor="pearson-option">Pearson</label>
                        </div>
                        <div className="space-x-1">
                            <Checkbox
                                id="kendall's-tau-b-option"
                                checked={kendallsTauBOption}
                                onCheckedChange={(checked) => setKendallsTauBOption(checked as boolean)}
                            />
                            <label htmlFor="kendall's-tau-b-option">Kendall&rsquo;s tau-b</label>
                        </div>
                        <div className="space-x-1">
                            <Checkbox
                                id="spearman-option"
                                checked={spearmanOption}
                                onCheckedChange={(checked) => setSpearmanOption(checked as boolean)}
                            />
                            <label htmlFor="spearman-option">Spearman</label>
                        </div>
                    </div>
                </div>

                {/* Test of Significance */}
                <div className="col-span-7 ">
                    <Label htmlFor="display-options" className="font-semibold text-base">Display</Label>
                    <RadioGroup
                        className="border p-4 rounded-md flex space-x-4"
                        value={testOfSignificance}
                        onValueChange={(value) => setTestOfSignificance(value)}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem id="Two-tailed" value="Two-tailed" />
                            <Label htmlFor="Two-tailed" className="text-sm">Two-tailed</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem id="One-tailed" value="One-tailed" />
                            <Label htmlFor="One-tailed" className="text-sm">One-tailed</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="col-span-7 flex flex-row space-x-8">
                    <div className="space-x-1">
                        <Checkbox
                            id="flag-significant-correlations"
                            checked={flagSignificantCorrelations}
                            onCheckedChange={(checked) => setFlagSignificantCorrelations(checked as boolean)}
                        />
                        <label htmlFor="flag-significant-correlations">Flag significant correlations</label>
                    </div>
                    <div className="space-x-1">
                        <Checkbox
                            id="lower-triangle"
                            checked={lowerTriangle}
                            onCheckedChange={(checked) => setLowerTriangle(checked as boolean)}
                        />
                        <label htmlFor="lower-triangle">Show only the lower triangle</label>
                    </div>
                    <div className="space-x-1">
                        <Checkbox
                            id="diagonal-option"
                            checked={diagonalOption}
                            disabled={lowerTriangle === false}
                            onCheckedChange={(checked) => setDiagonalOption(checked as boolean)}
                        />
                        <label htmlFor="diagonal-option">Show diagonal</label>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-center space-x-4">
                <Button onClick={handleRunTest} disabled={testVariables.length < 2}>
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

export default BivariateModal;