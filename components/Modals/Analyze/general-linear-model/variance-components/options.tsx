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
    VarianceCompsOptionsProps,
    VarianceCompsOptionsType,
} from "@/models/general-linear-model/variance-components/variance-components";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";

export const VarianceCompsOptions = ({
    isOptionsOpen,
    setIsOptionsOpen,
    updateFormData,
    data,
}: VarianceCompsOptionsProps) => {
    const [optionsState, setOptionsState] = useState<VarianceCompsOptionsType>({
        ...data,
    });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    useEffect(() => {
        if (isOptionsOpen) {
            setOptionsState({ ...data });
        }
    }, [isOptionsOpen, data]);

    const handleChange = (
        field: keyof VarianceCompsOptionsType,
        value: CheckedState | number | string | null
    ) => {
        setOptionsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleMethodGrp = (value: string) => {
        setOptionsState((prevState) => ({
            ...prevState,
            Minque: value === "Minque",
            Anova: value === "Anova",
            MaxLikelihood: value === "MaxLikelihood",
            ResMaxLikelihood: value === "ResMaxLikelihood",
        }));
    };

    const handleRandEffGrp = (value: string) => {
        setOptionsState((prevState) => ({
            ...prevState,
            Uniform: value === "Uniform",
            Zero: value === "Zero",
        }));
    };

    const handleSSGrp = (value: string) => {
        setOptionsState((prevState) => ({
            ...prevState,
            TypeI: value === "TypeI",
            TypeIII: value === "TypeIII",
        }));
    };

    const handleContinue = () => {
        Object.entries(optionsState).forEach(([key, value]) => {
            updateFormData(key as keyof VarianceCompsOptionsType, value);
        });
        setIsOptionsOpen(false);
    };

    return (
        <>
            {/* Options Dialog */}
            <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Variance Components: Options</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[325px] max-w-lg rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={30}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">Method</Label>
                                <RadioGroup
                                    value={
                                        optionsState.Minque
                                            ? "Minque"
                                            : optionsState.Anova
                                            ? "Anova"
                                            : optionsState.MaxLikelihood
                                            ? "MaxLikelihood"
                                            : optionsState.ResMaxLikelihood
                                            ? "ResMaxLikelihood"
                                            : ""
                                    }
                                    onValueChange={handleMethodGrp}
                                >
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="Minque"
                                                    id="Minque"
                                                />
                                                <Label htmlFor="Minque">
                                                    MINQUE
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="Anova"
                                                    id="Anova"
                                                />
                                                <Label htmlFor="Anova">
                                                    ANOVA
                                                </Label>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="MaxLikelihood"
                                                    id="MaxLikelihood"
                                                />
                                                <Label htmlFor="MaxLikelihood">
                                                    Maximum Likelihood
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="ResMaxLikelihood"
                                                    id="ResMaxLikelihood"
                                                />
                                                <Label htmlFor="ResMaxLikelihood">
                                                    Restricted Maximum
                                                    Likelihood
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={40}>
                            <ResizablePanelGroup direction="horizontal">
                                <ResizablePanel defaultSize={50}>
                                    <ResizablePanelGroup direction="vertical">
                                        <ResizablePanel defaultSize={50}>
                                            <div className="flex flex-col gap-2 p-2">
                                                <Label className="font-bold">
                                                    Random Effect Priors
                                                </Label>
                                                <RadioGroup
                                                    value={
                                                        optionsState.Uniform
                                                            ? "Uniform"
                                                            : optionsState.Zero
                                                            ? "Zero"
                                                            : ""
                                                    }
                                                    onValueChange={
                                                        handleRandEffGrp
                                                    }
                                                >
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem
                                                                value="Uniform"
                                                                id="Uniform"
                                                            />
                                                            <Label htmlFor="Uniform">
                                                                Uniform
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem
                                                                value="Zero"
                                                                id="Zero"
                                                            />
                                                            <Label htmlFor="Zero">
                                                                Zero
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </ResizablePanel>
                                        <ResizableHandle />
                                        <ResizablePanel defaultSize={50}>
                                            <div className="flex flex-col gap-2 p-2">
                                                <Label className="font-bold">
                                                    Sum of Squares
                                                </Label>
                                                <RadioGroup
                                                    value={
                                                        optionsState.TypeI
                                                            ? "TypeI"
                                                            : optionsState.TypeIII
                                                            ? "TypeIII"
                                                            : ""
                                                    }
                                                    onValueChange={handleSSGrp}
                                                >
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem
                                                                value="TypeI"
                                                                id="TypeI"
                                                            />
                                                            <Label htmlFor="TypeI">
                                                                Type I
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem
                                                                value="TypeIII"
                                                                id="TypeIII"
                                                            />
                                                            <Label htmlFor="TypeIII">
                                                                Type III
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={50}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Criteria
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <Label className="w-[100px]">
                                                Convergence:
                                            </Label>
                                            <div className="w-[100px]">
                                                <Input
                                                    id="ConvergenceMethod"
                                                    type="number"
                                                    placeholder=""
                                                    value={
                                                        optionsState.ConvergenceMethod ??
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "ConvergenceMethod",
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Label className="w-[100px]">
                                                Maximum Iterations:
                                            </Label>
                                            <div className="w-[100px]">
                                                <Input
                                                    id="MaxIter"
                                                    type="number"
                                                    placeholder=""
                                                    value={
                                                        optionsState.MaxIter ??
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "MaxIter",
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={30}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">Display</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="SumOfSquares"
                                                checked={
                                                    optionsState.SumOfSquares
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "SumOfSquares",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="SumOfSquares"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Sum of Squares
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="ExpectedMeanSquares"
                                                checked={
                                                    optionsState.ExpectedMeanSquares
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "ExpectedMeanSquares",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="ExpectedMeanSquares"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Expected Mean Squares
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="IterationHistory"
                                                checked={
                                                    optionsState.IterationHistory
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "IterationHistory",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="IterationHistory"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Iteration History
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Label className="w-[100px]">
                                                In Steps Of:
                                            </Label>
                                            <div className="w-[100px]">
                                                <Input
                                                    id="InStepsOf"
                                                    type="number"
                                                    placeholder=""
                                                    value={
                                                        optionsState.InStepsOf ??
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "InStepsOf",
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
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
