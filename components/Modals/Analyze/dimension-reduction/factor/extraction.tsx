import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {FactorExtractionProps, FactorExtractionType} from "@/models/dimension-reduction/factor/factor";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {EXTRACTIONMETHOD} from "@/constants/dimension-reduction/factor/factor-method";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {CheckedState} from "@radix-ui/react-checkbox";

export const FactorExtraction = ({
                                     isExtractionOpen,
                                     setIsExtractionOpen,
                                     updateFormData,
                                     data
                                 }: FactorExtractionProps) => {
    const [extractionState, setExtractionState] = useState<FactorExtractionType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    useEffect(() => {
        if (isExtractionOpen) {
            setExtractionState({...data});
        }
    }, [isExtractionOpen, data]);

    const handleChange = (field: keyof FactorExtractionType, value: CheckedState | number | string | null) => {
        setExtractionState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleAnalyzeGrp = (value: string) => {
        setExtractionState((prevState) => ({
            ...prevState,
            Correlation: value === "Correlation",
            Covariance: value === "Covariance",
        }));
    };

    const handleExtractGrp = (value: string) => {
        setExtractionState((prevState) => ({
            ...prevState,
            Eigen: value === "Eigen",
            Factor: value === "Factor",
        }));
    };

    const handleContinue = () => {
        Object.entries(extractionState).forEach(([key, value]) => {
            updateFormData(key as keyof FactorExtractionType, value);
        });
        setIsExtractionOpen(false);
    };

    return (
        <>
            {/* Extraction Dialog */}
            <Dialog open={isExtractionOpen} onOpenChange={setIsExtractionOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Factor Analysis: Extraction</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="flex flex-col gap-2">
                        <div className="w-full">
                            <Label className="font-bold">Growing Method: </Label>
                            <Select
                                value={extractionState.Method ?? ""}
                                onValueChange={(value) => handleChange("Method", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {EXTRACTIONMETHOD.map((method, index) => (
                                            <SelectItem key={index}
                                                        value={method}>{capitalize(method) + "'s Method"}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <ResizablePanelGroup
                            direction="vertical"
                            className="min-h-[250px] max-w-xl rounded-lg border md:min-w-[200px]"
                        >
                            <ResizablePanel defaultSize={33}>
                                <ResizablePanelGroup direction="horizontal">
                                    <ResizablePanel defaultSize={50}>
                                        <div className="flex flex-col gap-2 p-2">
                                            <Label className="font-bold">Analyze</Label>
                                            <RadioGroup
                                                value={extractionState.Correlation ? "Correlation" : "Covariance"}
                                                onValueChange={handleAnalyzeGrp}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Correlation" id="Correlation"/>
                                                    <Label htmlFor="Correlation">
                                                        Correlation Matrix
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Covariance" id="Covariance"/>
                                                    <Label htmlFor="Covariance">
                                                        Covariance Matrix
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </ResizablePanel>
                                    <ResizableHandle/>
                                    <ResizablePanel defaultSize={50}>
                                        <div className="flex flex-col gap-2 p-2">
                                            <Label className="font-bold">Display</Label>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="Unrotated"
                                                    checked={extractionState.Unrotated}
                                                    onCheckedChange={(checked) => handleChange("Unrotated", checked)}
                                                />
                                                <label
                                                    htmlFor="Unrotated"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Unrotated Factor Solution
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="Scree"
                                                    checked={extractionState.Scree}
                                                    onCheckedChange={(checked) => handleChange("Scree", checked)}
                                                />
                                                <label
                                                    htmlFor="Scree"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Scree Plot
                                                </label>
                                            </div>
                                        </div>
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            </ResizablePanel>
                            <ResizableHandle/>
                            <ResizablePanel defaultSize={67}>
                                <div className="flex flex-col gap-2 p-2">
                                    <Label className="font-bold">Extract</Label>
                                    <RadioGroup
                                        value={extractionState.Eigen ? "Eigen" : "Factor"}
                                        onValueChange={handleExtractGrp}
                                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Eigen" id="Eigen"/>
                                                <Label htmlFor="Eigen">
                                                    Based on Eigenvalues
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2 pl-6">
                                                <Label className="w-[150px]">Eigenvalues Greater than:</Label>
                                                <div className="w-[75px]">
                                                    <Input
                                                        id="EigenVal"
                                                        type="number"
                                                        placeholder=""
                                                        value={extractionState.EigenVal || ""}
                                                        onChange={(e) => handleChange("EigenVal", Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Factor" id="Factor"/>
                                                <Label htmlFor="Factor">
                                                    Fixed Number of Factors
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2 pl-6">
                                                <Label className="w-[150px]">Factor to Extract:</Label>
                                                <div className="w-[75px]">
                                                    <Input
                                                        id="MaxFactors"
                                                        type="number"
                                                        placeholder=""
                                                        value={extractionState.MaxFactors || ""}
                                                        onChange={(e) => handleChange("MaxFactors", Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                        <div className="flex items-center space-x-2">
                            <Label className="w-[250px]">Maximum Iterations for Convergence:</Label>
                            <div className="w-[75px]">
                                <Input
                                    id="MaxIter"
                                    type="number"
                                    placeholder=""
                                    value={extractionState.MaxIter || ""}
                                    onChange={(e) => handleChange("MaxIter", Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsExtractionOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="secondary">
                            Help
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
