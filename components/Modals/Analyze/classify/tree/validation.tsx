import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {TreeValidationProps, TreeValidationType} from "@/models/classify/tree/tree";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";

export const TreeValidation = ({ isValidationOpen, setIsValidationOpen, updateFormData, data }: TreeValidationProps) => {
    const [validationState, setValidationState] = useState<TreeValidationType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isValidationOpen) {
            setValidationState({ ...data });
        }
    }, [isValidationOpen, data]);

    const handleChange = (field: keyof TreeValidationType, value: number | string | null) => {
        setValidationState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleValidationGrp = (value: string) => {
        setValidationState((prevState) => ({
            ...prevState,
            None: value === "None",
            CrossValidation: value === "CrossValidation",
            SplitSample: value === "SplitSample",
        }));
    };

    const handleCaseGrp = (value: string) => {
        setValidationState((prevState) => ({
            ...prevState,
            UseRandom: value === "UseRandom",
            UseVariable: value === "UseVariable",
        }));
    };

    const handleDisplayGrp = (value: string) => {
        setValidationState((prevState) => ({
            ...prevState,
            Training: value === "Training",
            TestSample: value === "TestSample",
        }));
    };

    const handleContinue = () => {
        Object.entries(validationState).forEach(([key, value]) => {
            updateFormData(key as keyof TreeValidationType, value);
        });
        setIsValidationOpen(false);
    };

    return (
        <>
            {/* Validation Dialog */}
            <Dialog open={isValidationOpen} onOpenChange={setIsValidationOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Decision Tree: Validation</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <RadioGroup
                        value={validationState.None ? "None" : validationState.CrossValidation ? "CrossValidation" : "SplitSample"}
                        onValueChange={handleValidationGrp}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="None" id="None"/>
                            <Label htmlFor="None">
                                None
                            </Label>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="CrossValidation" id="CrossValidation"/>
                                <Label htmlFor="CrossValidation">
                                    Cross Validation
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 pl-6">
                                <Label className="w-[200px]">Number of Sample Folds:</Label>
                                <div className="w-[75px]">
                                    <Input
                                        id="NumberOfSample"
                                        type="number"
                                        placeholder=""
                                        value={validationState.NumberOfSample ?? 0}
                                        onChange={(e) => handleChange("NumberOfSample", Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="text-sm text-justify pl-6">
                                Crossvalidation is not available for CRT and Quest methods if pruning is selected.
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="SplitSample" id="SplitSample"/>
                                <Label htmlFor="SplitSample">
                                    Split Sample Validation
                                </Label>
                            </div>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[300px] max-w-xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={75}>
                                    <RadioGroup
                                        value={validationState.UseRandom ? "UseRandom" : "UseVariable"}
                                        onValueChange={handleCaseGrp}
                                    >
                                        <div className="p-2">
                                            <div className="flex flex-col gap-2">
                                                <Label className="font-bold">Case Allocation</Label>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="UseRandom" id="UseRandom"/>
                                                    <Label htmlFor="UseRandom">
                                                        Use Random Assignment
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 pl-6">
                                                    <Label className="w-[150px]">Training Sample (%):</Label>
                                                    <div className="w-[75px]">
                                                        <Input
                                                            id="TrainingSample"
                                                            type="number"
                                                            placeholder=""
                                                            value={validationState.TrainingSample ?? 0}
                                                            onChange={(e) => handleChange("TrainingSample", Number(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="UseVariable" id="UseVariable"/>
                                                    <Label htmlFor="UseVariable">
                                                        Use Variable
                                                    </Label>
                                                </div>
                                                <div className="grid grid-cols-2 pl-6 gap-2">
                                                    <div>
                                                        <Label>Variables:</Label>
                                                        <Input
                                                            id="SrcVar"
                                                            type="text"
                                                            className="min-h-[75px] w-full"
                                                            placeholder=""
                                                            value={validationState.SrcVar ?? ""}
                                                            onChange={(e) => handleChange("SrcVar", e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Split Sample By:</Label>
                                                        <Input
                                                            id="TargetVar"
                                                            type="text"
                                                            className="w-full"
                                                            placeholder=""
                                                            value={validationState.TargetVar ?? ""}
                                                            onChange={(e) => handleChange("TargetVar", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={25}>
                                    <RadioGroup
                                        value={validationState.Training ? "Training" : "TestSample"}
                                        onValueChange={handleDisplayGrp}
                                    >
                                        <div className="flex flex-col gap-2 p-2">
                                            <Label className="font-bold">Display Result For</Label>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Training" id="Training"/>
                                                <Label htmlFor="Training">
                                                    Training and Test Sample
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="TestSample" id="TestSample"/>
                                                <Label htmlFor="TestSample">
                                                    Test Sample Only
                                                </Label>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </div>
                    </RadioGroup>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsValidationOpen(false)}>
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
