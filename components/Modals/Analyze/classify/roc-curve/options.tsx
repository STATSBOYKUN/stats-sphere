import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    RocCurveOptionsProps,
    RocCurveOptionsType,
} from "@/models/classify/roc-curve/roc-curve";
import { CheckedState } from "@radix-ui/react-checkbox";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DISTRIBUTIONMETHODS } from "@/constants/classify/roc-analysis/roc-analysis-distribution";

export const RocCurveOptions = ({
    isOptionsOpen,
    setIsOptionsOpen,
    updateFormData,
    data,
}: RocCurveOptionsProps) => {
    const [optionsState, setOptionsState] = useState<RocCurveOptionsType>({
        ...data,
    });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    useEffect(() => {
        if (isOptionsOpen) {
            setOptionsState({ ...data });
        }
    }, [isOptionsOpen, data]);

    const handleChange = (
        field: keyof RocCurveOptionsType,
        value: CheckedState | number | boolean | string | null
    ) => {
        setOptionsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleClassGrp = (value: string) => {
        setOptionsState((prevState) => ({
            ...prevState,
            IncludeCutoff: value === "IncludeCutOff",
            ExcludeCutoff: value === "ExcludeCutOff",
        }));
    };

    const handleTestDirGrp = (value: string) => {
        setOptionsState((prevState) => ({
            ...prevState,
            LargerTest: value === "LargerTest",
            SmallerTest: value === "SmallerTest",
        }));
    };

    const handleMissingValuesGrp = (value: string) => {
        setOptionsState((prevState) => ({
            ...prevState,
            ExcludeMissValue: value === "ExcludeMissValue",
            MissValueAsValid: value === "MissValueAsValid",
        }));
    };

    const handleContinue = () => {
        Object.entries(optionsState).forEach(([key, value]) => {
            updateFormData(key as keyof RocCurveOptionsType, value);
        });
        setIsOptionsOpen(false);
    };

    return (
        <>
            {/* Options Dialog */}
            <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>ROC Curve: Options</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[400px] max-w-xl rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={22}>
                            <RadioGroup
                                value={
                                    optionsState.IncludeCutoff
                                        ? "IncludeCutOff"
                                        : "ExcludeCutOff"
                                }
                                onValueChange={(value) => handleClassGrp(value)}
                            >
                                <div className="flex flex-col gap-2 p-2">
                                    <Label className="font-bold">
                                        Classification
                                    </Label>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="IncludeCutOff"
                                            id="IncludeCutOff"
                                        />
                                        <Label htmlFor="IncludeCutOff">
                                            Include Cutoff Value for Positive
                                            Classification
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="ExcludeCutOff"
                                            id="ExcludeCutOff"
                                        />
                                        <Label htmlFor="ExcludeCutOff">
                                            Exclude Cutoff Value for Positive
                                            Classification
                                        </Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={22}>
                            <RadioGroup
                                value={
                                    optionsState.LargerTest
                                        ? "LargerTest"
                                        : "SmallerTest"
                                }
                                onValueChange={(value) =>
                                    handleTestDirGrp(value)
                                }
                            >
                                <div className="flex flex-col gap-2 p-2">
                                    <Label className="font-bold">
                                        Test Direction
                                    </Label>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="LargerTest"
                                            id="LargerTest"
                                        />
                                        <Label htmlFor="LargerTest">
                                            Larger Test Result Indicates More
                                            Positive Test
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="SmallerTest"
                                            id="SmallerTest"
                                        />
                                        <Label htmlFor="SmallerTest">
                                            Smaller Test Result Indicates More
                                            Positive Test
                                        </Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={34}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">
                                    Parameters for Standard Error of Area
                                </Label>
                                <div className="flex flex-row w-full items-center gap-2">
                                    <Label className="w-[150px]">
                                        Distributin Assumption:{" "}
                                    </Label>
                                    <Select
                                        value={
                                            optionsState.DistAssumptMethod ??
                                            "NONPARAMETRIC"
                                        }
                                        defaultValue={
                                            optionsState.DistAssumptMethod ??
                                            "NONPARAMETRIC"
                                        }
                                        onValueChange={(value) =>
                                            handleChange(
                                                "DistAssumptMethod",
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {DISTRIBUTIONMETHODS.map(
                                                    (method, index) => (
                                                        <SelectItem
                                                            key={index}
                                                            value={method}
                                                        >
                                                            {capitalize(
                                                                method
                                                            ) + "'s Method"}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-row w-full items-center gap-2">
                                    <Label className="w-[150px]">
                                        Confidence Level (%):{" "}
                                    </Label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={optionsState.ConfLevel ?? ""}
                                        onChange={(e) =>
                                            handleChange(
                                                "ConfLevel",
                                                e.target.value
                                            )
                                        }
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={22}>
                            <RadioGroup
                                value={
                                    optionsState.ExcludeMissValue
                                        ? "ExcludeMissValue"
                                        : "MissValueAsValid"
                                }
                                onValueChange={(value) =>
                                    handleMissingValuesGrp(value)
                                }
                            >
                                <div className="flex flex-col gap-2 p-2">
                                    <Label className="font-bold">
                                        Missing Values
                                    </Label>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="ExcludeMissValue"
                                            id="ExcludeMissValue"
                                        />
                                        <Label htmlFor="ExcludeMissValue">
                                            Exclude both User-Missing and System
                                            Missing Values
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="MissValueAsValid"
                                            id="MissValueAsValid"
                                        />
                                        <Label htmlFor="MissValueAsValid">
                                            User-Missing Values Treated as Valid
                                        </Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            disabled={isContinueDisabled}
                            type="button"
                            onClick={handleContinue}
                        >
                            Continue
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsOptionsOpen(false)}
                        >
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
