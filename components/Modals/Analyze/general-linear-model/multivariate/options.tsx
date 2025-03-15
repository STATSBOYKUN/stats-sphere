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
    MultivariateOptionsProps,
    MultivariateOptionsType,
} from "@/models/general-linear-model/multivariate/multivariate";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Input } from "@/components/ui/input";

export const MultivariateOptions = ({
    isOptionsOpen,
    setIsOptionsOpen,
    updateFormData,
    data,
}: MultivariateOptionsProps) => {
    const [optionsState, setOptionsState] = useState<MultivariateOptionsType>({
        ...data,
    });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    useEffect(() => {
        if (isOptionsOpen) {
            setOptionsState({ ...data });
        }
    }, [isOptionsOpen, data]);

    const handleChange = (
        field: keyof MultivariateOptionsType,
        value: CheckedState | number | string | null
    ) => {
        setOptionsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(optionsState).forEach(([key, value]) => {
            updateFormData(key as keyof MultivariateOptionsType, value);
        });
        setIsOptionsOpen(false);
    };

    return (
        <>
            {/* Options Dialog */}
            <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Multivariate: Options</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <ResizablePanelGroup
                            direction="vertical"
                            className="min-h-[200px] max-w-xl rounded-lg border md:min-w-[200px]"
                        >
                            <ResizablePanel defaultSize={100}>
                                <div className="flex flex-col gap-2 p-2">
                                    <Label className="font-bold">Display</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="DescStats"
                                                    checked={
                                                        optionsState.DescStats
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "DescStats",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="DescStats"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Descriptive Statistics
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="EstEffectSize"
                                                    checked={
                                                        optionsState.EstEffectSize
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "EstEffectSize",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="EstEffectSize"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Estimates of Effect Size
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="ObsPower"
                                                    checked={
                                                        optionsState.ObsPower
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "ObsPower",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="ObsPower"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Observed Power
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="ParamEst"
                                                    checked={
                                                        optionsState.ParamEst
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "ParamEst",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="ParamEst"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Parameter Estimates
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="SscpMat"
                                                    checked={
                                                        optionsState.SscpMat
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "SscpMat",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="SscpMat"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    SSCP Matrices
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="ResSscpMat"
                                                    checked={
                                                        optionsState.ResSscpMat
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "ResSscpMat",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="ResSscpMat"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Residual SSCP Matrix
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="HomogenTest"
                                                    checked={
                                                        optionsState.HomogenTest
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "HomogenTest",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="HomogenTest"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Homogenity Tests
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="SprVsLevel"
                                                    checked={
                                                        optionsState.SprVsLevel
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "SprVsLevel",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="SprVsLevel"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Spread-Vs.-Level Plots
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="ResPlot"
                                                    checked={
                                                        optionsState.ResPlot
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "ResPlot",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="ResPlot"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Residual Plots
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="LackOfFit"
                                                    checked={
                                                        optionsState.LackOfFit
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "LackOfFit",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="LackOfFit"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Lack of Fit Test
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="GeneralFun"
                                                    checked={
                                                        optionsState.GeneralFun
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "GeneralFun",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="GeneralFun"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    General Estimable
                                                    Function(s)
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                        <div className="flex items-center space-x-2">
                            <Label className="w-[150px]">
                                Significance Level:
                            </Label>
                            <div className="w-[75px]">
                                <Input
                                    id="SigLevel"
                                    type="number"
                                    placeholder=""
                                    value={optionsState.SigLevel ?? ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "SigLevel",
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>
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
