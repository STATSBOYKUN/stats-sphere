import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {UnivariateOptionsProps, UnivariateOptionsType} from "@/models/general-linear-model/univariate/univariate";
import {ScrollArea} from "@/components/ui/scroll-area";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {CheckedState} from "@radix-ui/react-checkbox";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

export const UnivariateOptions = ({isOptionsOpen, setIsOptionsOpen, updateFormData, data}: UnivariateOptionsProps) => {
    const [optionsState, setOptionsState] = useState<UnivariateOptionsType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isOptionsOpen) {
            setOptionsState({...data});
        }
    }, [isOptionsOpen, data]);

    const handleChange = (field: keyof UnivariateOptionsType, value: CheckedState | number | boolean | null) => {
        setOptionsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleStdErrGrp = (value: string) => {
        setOptionsState((prevState) => ({
            ...prevState,
            HC0: value === "HC0",
            HC1: value === "HC1",
            HC2: value === "HC2",
            HC3: value === "HC3",
            HC4: value === "HC4",
        }));
    };

    const handleContinue = () => {
        Object.entries(optionsState).forEach(([key, value]) => {
            updateFormData(key as keyof UnivariateOptionsType, value);
        });
        setIsOptionsOpen(false);
    };

    return (
        <>
            {/* Options Dialog */}
            <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Univariate: Options</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="flex h-[450px] flex-col gap-2">
                        <ScrollArea>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[450px] max-w-xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={40}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Display</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="DescStats"
                                                        checked={optionsState.DescStats}
                                                        onCheckedChange={(checked) => handleChange("DescStats", checked)}
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
                                                        checked={optionsState.EstEffectSize}
                                                        onCheckedChange={(checked) => handleChange("EstEffectSize", checked)}
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
                                                        checked={optionsState.ObsPower}
                                                        onCheckedChange={(checked) => handleChange("ObsPower", checked)}
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
                                                        checked={optionsState.ParamEst}
                                                        onCheckedChange={(checked) => handleChange("ParamEst", checked)}
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
                                                        id="CoefficientMatrix"
                                                        checked={optionsState.CoefficientMatrix}
                                                        onCheckedChange={(checked) => handleChange("CoefficientMatrix", checked)}
                                                    />
                                                    <label
                                                        htmlFor="CoefficientMatrix"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Contrast Coefficient Matrix
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="HomogenTest"
                                                        checked={optionsState.HomogenTest}
                                                        onCheckedChange={(checked) => handleChange("HomogenTest", checked)}
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
                                                        checked={optionsState.SprVsLevel}
                                                        onCheckedChange={(checked) => handleChange("SprVsLevel", checked)}
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
                                                        checked={optionsState.ResPlot}
                                                        onCheckedChange={(checked) => handleChange("ResPlot", checked)}
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
                                                        checked={optionsState.LackOfFit}
                                                        onCheckedChange={(checked) => handleChange("LackOfFit", checked)}
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
                                                        checked={optionsState.GeneralFun}
                                                        onCheckedChange={(checked) => handleChange("GeneralFun", checked)}
                                                    />
                                                    <label
                                                        htmlFor="GeneralFun"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        General Estimable Function(s)
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={22}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Heteroscedasticity Tests</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="ModBruschPagan"
                                                        checked={optionsState.ModBruschPagan}
                                                        onCheckedChange={(checked) => handleChange("ModBruschPagan", checked)}
                                                    />
                                                    <label
                                                        htmlFor="ModBruschPagan"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Modified Brusch-Pagan Test
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="BruschPagan"
                                                        checked={optionsState.BruschPagan}
                                                        onCheckedChange={(checked) => handleChange("BruschPagan", checked)}
                                                    />
                                                    <label
                                                        htmlFor="BruschPagan"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Brusch-Pagan Test
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="FTest"
                                                        checked={optionsState.FTest}
                                                        onCheckedChange={(checked) => handleChange("FTest", checked)}
                                                    />
                                                    <label
                                                        htmlFor="FTest"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        F Test
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="WhiteTest"
                                                        checked={optionsState.WhiteTest}
                                                        onCheckedChange={(checked) => handleChange("WhiteTest", checked)}
                                                    />
                                                    <label
                                                        htmlFor="WhiteTest"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        White&apos;s Test
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={38}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="ParamEstRobStdErr"
                                                checked={optionsState.ParamEstRobStdErr}
                                                onCheckedChange={(checked) => handleChange("ParamEstRobStdErr", checked)}
                                            />
                                            <label
                                                htmlFor="ParamEstRobStdErr"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Parameter Estimates with Robust Standard Errors
                                            </label>
                                        </div>
                                        <RadioGroup
                                            value={
                                                optionsState.HC0 ? "HC0"
                                                    : optionsState.HC1 ? "HC1"
                                                        : optionsState.HC2 ? "HC2"
                                                            : optionsState.HC3 ? "HC3"
                                                                : optionsState.HC4 ? "HC4" : ""
                                            }
                                            onValueChange={handleStdErrGrp}
                                        >
                                            <div className="flex items-center space-x-2 pl-6">
                                                <RadioGroupItem value="HC0" id="HC0"/>
                                                <Label htmlFor="HC0">
                                                    HC0
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2 pl-6">
                                                <RadioGroupItem value="HC1" id="HC1"/>
                                                <Label htmlFor="HC1">
                                                    HC1
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2 pl-6">
                                                <RadioGroupItem value="HC2" id="HC2"/>
                                                <Label htmlFor="HC2">
                                                    HC2
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2 pl-6">
                                                <RadioGroupItem value="HC3" id="HC3"/>
                                                <Label htmlFor="HC3">
                                                    HC3
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2 pl-6">
                                                <RadioGroupItem value="HC4" id="HC4"/>
                                                <Label htmlFor="HC4">
                                                    HC4
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ScrollArea>
                        <div className="flex items-center space-x-2">
                            <Label className="w-[150px]">Significance Level:</Label>
                            <div className="w-[75px]">
                                <Input
                                    id="SigLevel"
                                    type="number"
                                    placeholder=""
                                    value={optionsState.SigLevel ?? ""}
                                    onChange={(e) => handleChange("SigLevel", Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsOptionsOpen(false)}>
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
