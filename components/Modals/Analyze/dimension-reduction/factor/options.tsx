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
    FactorOptionsProps,
    FactorOptionsType,
} from "@/models/dimension-reduction/factor/factor";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CheckedState } from "@radix-ui/react-checkbox";

export const FactorOptions = ({
    isOptionsOpen,
    setIsOptionsOpen,
    updateFormData,
    data,
}: FactorOptionsProps) => {
    const [optionsState, setOptionsState] = useState<FactorOptionsType>({
        ...data,
    });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    useEffect(() => {
        if (isOptionsOpen) {
            setOptionsState({ ...data });
        }
    }, [isOptionsOpen, data]);

    const handleChange = (
        field: keyof FactorOptionsType,
        value: CheckedState | number | string | null
    ) => {
        setOptionsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleMissGrp = (value: string) => {
        setOptionsState((prevState) => ({
            ...prevState,
            ExcludeListWise: value === "ExcludeListWise",
            ExcludePairWise: value === "ExcludePairWise",
            ReplaceMean: value === "ReplaceMean",
        }));
    };

    const handleContinue = () => {
        Object.entries(optionsState).forEach(([key, value]) => {
            updateFormData(key as keyof FactorOptionsType, value);
        });
        setIsOptionsOpen(false);
    };

    return (
        <>
            {/* Options Dialog */}
            <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Factor Analysis: Options</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[240px] max-w-md rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={45}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">
                                    Missing Values
                                </Label>
                                <RadioGroup
                                    value={
                                        optionsState.ExcludeListWise
                                            ? "ExcludeListWise"
                                            : optionsState.ExcludePairWise
                                            ? "ExcludePairWise"
                                            : "ReplaceMean"
                                    }
                                    onValueChange={handleMissGrp}
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="ExcludeListWise"
                                                id="ExcludeListWise"
                                            />
                                            <Label htmlFor="ExcludeListWise">
                                                Exclude Cases List-wise
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="ExcludePairWise"
                                                id="ExcludePairWise"
                                            />
                                            <Label htmlFor="ExcludePairWise">
                                                Exclude Cases Pair-wise
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="ReplaceMean"
                                                id="ReplaceMean"
                                            />
                                            <Label htmlFor="ReplaceMean">
                                                Replace with Mean
                                            </Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={55}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">
                                    Coefficient Display Format
                                </Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="SortSize"
                                        checked={optionsState.SortSize}
                                        onCheckedChange={(checked) =>
                                            handleChange("SortSize", checked)
                                        }
                                    />
                                    <label
                                        htmlFor="SortSize"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Sorted by Size
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="SuppressValues"
                                        checked={optionsState.SuppressValues}
                                        onCheckedChange={(checked) =>
                                            handleChange(
                                                "SuppressValues",
                                                checked
                                            )
                                        }
                                    />
                                    <label
                                        htmlFor="SuppressValues"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Suppress Small Coefficients
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2 pl-6">
                                    <Label className="w-[150px]">
                                        Absolute Value below:
                                    </Label>
                                    <div className="w-[75px]">
                                        <Input
                                            id="SuppressValuesNum"
                                            type="number"
                                            placeholder=""
                                            value={
                                                optionsState.SuppressValuesNum ??
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "SuppressValuesNum",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
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
