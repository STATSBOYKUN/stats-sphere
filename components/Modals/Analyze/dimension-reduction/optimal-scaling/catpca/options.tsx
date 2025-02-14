import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    OptScaCatpcaOptionsProps,
    OptScaCatpcaOptionsType
} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {DISCRETIZEMETHOD} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-sca-method";
import {Checkbox} from "@/components/ui/checkbox";
import {CheckedState} from "@radix-ui/react-checkbox";

export const OptScaCatpcaOptions = ({ isOptionsOpen, setIsOptionsOpen, updateFormData, data }: OptScaCatpcaOptionsProps) => {
    const [optionsState, setOptionsState] = useState<OptScaCatpcaOptionsType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    useEffect(() => {
        if (isOptionsOpen) {
            setOptionsState({ ...data });
        }
    }, [isOptionsOpen, data]);

    const handleChange = (field: keyof OptScaCatpcaOptionsType, value: CheckedState | number | string | null) => {
        setOptionsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleMethodGrp = (value: string) => {
        setOptionsState((prevState) => ({
            ...prevState,
            None: value === "None",
            Quartimax: value === "Quartimax",
            Varimax: value === "Varimax",
            Equimax: value === "Equimax",
            Oblimin: value === "Oblimin",
            Promax: value === "Promax",
        }));
    };

    const handleSuppObjGrp = (value: string) => {
        setOptionsState((prevState) => ({
            ...prevState,
            RangeOfCases: value === "RangeOfCases",
            SingleCase: value === "SingleCase",
        }));
    };

    const handlePlotDimGrp = (value: string) => {
        setOptionsState((prevState) => ({
            ...prevState,
            PlotDimDisplayAll: value === "PlotDimDisplayAll",
            PlotDimRestrict: value === "PlotDimRestrict",
        }));
    };

    const handleLabelGrp = (value: string) => {
        setOptionsState((prevState) => ({
            ...prevState,
            VariableLabels: value === "VariableLabels",
            VariableNames: value === "VariableNames",
        }));
    }

    const handleContinue = () => {
        Object.entries(optionsState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaCatpcaOptionsType, value);
        });
        setIsOptionsOpen(false);
    };

    return (
        <>
            {/* Options Dialog */}
            <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Categorical Principal Components: Options</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col items-start gap-2">
                        <ResizablePanelGroup
                            direction="vertical"
                            className="min-h-[485px] max-w-xl rounded-lg border md:min-w-[250px]"
                        >
                            <ResizablePanel defaultSize={100}>
                                <ResizablePanelGroup direction="horizontal">
                                    <ResizablePanel defaultSize={50}>
                                        <ResizablePanelGroup direction="vertical">
                                            <ResizablePanel defaultSize={50}>
                                                <RadioGroup
                                                    value={
                                                        optionsState.RangeOfCases ? "RangeOfCases" : optionsState.SingleCase ? "SingleCase" : ""
                                                    }
                                                    onValueChange={handleSuppObjGrp}
                                                >
                                                    <div className="flex flex-col gap-2 p-2">
                                                        <Label className="font-bold">Supplementary Objects</Label>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="RangeOfCases" id="RangeOfCases"/>
                                                            <Label htmlFor="RangeOfCases">
                                                                Range of Cases
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 pl-6">
                                                            <Label className="w-[75px]">First:</Label>
                                                            <div className="w-[75px]">
                                                                <Input
                                                                    id="First"
                                                                    type="number"
                                                                    placeholder=""
                                                                    value={optionsState.First || ""}
                                                                    onChange={(e) => handleChange("First", Number(e.target.value))}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2 pl-6">
                                                            <Label className="w-[75px]">Last:</Label>
                                                            <div className="w-[75px]">
                                                                <Input
                                                                    id="Last"
                                                                    type="number"
                                                                    placeholder=""
                                                                    value={optionsState.Last || ""}
                                                                    onChange={(e) => handleChange("Last", Number(e.target.value))}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="SingleCase" id="SingleCase"/>
                                                            <Label htmlFor="SingleCase">
                                                                Single Case
                                                            </Label>
                                                            <Input
                                                                id="SingleCaseValue"
                                                                type="number"
                                                                placeholder=""
                                                                value={optionsState.SingleCaseValue || ""}
                                                                onChange={(e) => handleChange("SingleCaseValue", Number(e.target.value))}
                                                            />
                                                        </div>
                                                        <div className="w-full">
                                                            <Input
                                                                id="SingleCaseValue"
                                                                type="text"
                                                                className="w-full min-h-[45px]"
                                                                placeholder=""
                                                                value={optionsState.SingleCaseValue ?? ""}
                                                                onChange={(e) => handleChange("SingleCaseValue", e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </RadioGroup>
                                            </ResizablePanel>
                                            <ResizableHandle/>
                                            <ResizablePanel defaultSize={35}>
                                                <RadioGroup
                                                    value={
                                                        optionsState.PlotDimDisplayAll ? "PlotDimDisplayAll" : optionsState.PlotDimRestrict ? "PlotDimRestrict" : ""
                                                    }
                                                    onValueChange={handlePlotDimGrp}
                                                >
                                                    <div className="flex flex-col gap-2 p-2">
                                                        <Label className="font-bold">Plot Dimensions</Label>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="PlotDimDisplayAll"
                                                                            id="PlotDimDisplayAll"/>
                                                            <Label htmlFor="PlotDimDisplayAll">
                                                                Display All Dimensions
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="PlotDimRestrict"
                                                                            id="PlotDimRestrict"/>
                                                            <Label htmlFor="PlotDimRestrict">
                                                                Restrict the Number of Dimensions
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 pl-6">
                                                            <Label className="w-[75px]">Lowest Dimension:</Label>
                                                            <div className="w-[75px]">
                                                                <Input
                                                                    id="PlotDimLoDim"
                                                                    type="number"
                                                                    placeholder=""
                                                                    value={optionsState.PlotDimLoDim || ""}
                                                                    onChange={(e) => handleChange("PlotDimLoDim", Number(e.target.value))}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2 pl-6">
                                                            <Label className="w-[75px]">Highest Dimension:</Label>
                                                            <div className="w-[75px]">
                                                                <Input
                                                                    id="PlotDimHiDim"
                                                                    type="number"
                                                                    placeholder=""
                                                                    value={optionsState.PlotDimHiDim || ""}
                                                                    onChange={(e) => handleChange("PlotDimHiDim", Number(e.target.value))}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </RadioGroup>
                                            </ResizablePanel>
                                            <ResizableHandle/>
                                            <ResizablePanel defaultSize={15}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label className="font-bold">Configuration</Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Select
                                                            value={optionsState.ConfigurationMethod ?? ""}
                                                            onValueChange={(value) => handleChange("ConfigurationMethod", value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue/>
                                                            </SelectTrigger>
                                                            <SelectContent
                                                                className="w-[150px]"
                                                            >
                                                                <SelectGroup>
                                                                    {DISCRETIZEMETHOD.map((method, index) => (
                                                                        <SelectItem key={index}
                                                                                    value={method}>{capitalize(method) + "'s Method"}</SelectItem>
                                                                    ))}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                        <Input
                                                            id="ConfigFile"
                                                            type="file"
                                                            className="w-full"
                                                            placeholder=""
                                                            onChange={(e) => handleChange("ConfigFile", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </ResizablePanel>
                                    <ResizableHandle/>
                                    <ResizablePanel defaultSize={50}>
                                        <ResizablePanelGroup direction="vertical">
                                            <ResizablePanel defaultSize={23}>
                                                <div className="flex flex-col gap-1 p-2">
                                                    <Label className="font-bold">Normalization Method</Label>
                                                    <div className="w-full">
                                                        <Select
                                                            value={optionsState.NormalizationMethod ?? ""}
                                                            onValueChange={(value) => handleChange("NormalizationMethod", value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue/>
                                                            </SelectTrigger>
                                                            <SelectContent
                                                                className="w-[150px]"
                                                            >
                                                                <SelectGroup>
                                                                    {DISCRETIZEMETHOD.map((method, index) => (
                                                                        <SelectItem key={index}
                                                                                    value={method}>{capitalize(method) + "'s Method"}</SelectItem>
                                                                    ))}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Label className="w-[100px]">Custom Value:</Label>
                                                        <div className="w-[75px]">
                                                            <Input
                                                                id="NormCustomValue"
                                                                type="number"
                                                                placeholder=""
                                                                value={optionsState.NormCustomValue || ""}
                                                                onChange={(e) => handleChange("NormCustomValue", Number(e.target.value))}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle/>
                                            <ResizablePanel defaultSize={23}>
                                                <div className="flex flex-col gap-1 p-2">
                                                    <Label className="font-bold">Criteria</Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Label className="w-[100px]">Convergence:</Label>
                                                        <div className="w-[75px]">
                                                            <Input
                                                                id="Convergence"
                                                                type="number"
                                                                placeholder=""
                                                                value={optionsState.Convergence || ""}
                                                                onChange={(e) => handleChange("Convergence", Number(e.target.value))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Label className="w-[100px]">Maximum Iterations:</Label>
                                                        <div className="w-[75px]">
                                                            <Input
                                                                id="MaximumIterations"
                                                                type="number"
                                                                placeholder=""
                                                                value={optionsState.MaximumIterations || ""}
                                                                onChange={(e) => handleChange("MaximumIterations", Number(e.target.value))}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle/>
                                            <ResizablePanel defaultSize={20}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label className="font-bold">Label Plots By</Label>
                                                    <RadioGroup
                                                        value={
                                                            optionsState.VariableLabels ? "VariableLabels" : optionsState.VariableNames ? "VariableNames" : ""
                                                        }
                                                        onValueChange={handleLabelGrp}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="VariableLabels" id="VariableLabels"/>
                                                            <Label className="w-[150px]" htmlFor="VariableLabels">
                                                                Variable Labels. Limit:
                                                            </Label>
                                                            <Input
                                                                id="LimitForLabel"
                                                                className="w-[65px]"
                                                                type="number"
                                                                placeholder=""
                                                                value={optionsState.LimitForLabel || ""}
                                                                onChange={(e) => handleChange("LimitForLabel", Number(e.target.value))}
                                                            />
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="VariableNames" id="VariableNames"/>
                                                            <Label htmlFor="VariableNames">
                                                                Variable Names or Values
                                                            </Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle/>
                                            <ResizablePanel defaultSize={34}>
                                                <div className="flex flex-col gap-1 p-2">
                                                    <Label className="font-bold">Rotation</Label>
                                                    <RadioGroup
                                                        value={
                                                            optionsState.None ? "None" : optionsState.Quartimax ? "Quartimax" : optionsState.Varimax ? "Varimax" : optionsState.Equimax ? "Equimax" : optionsState.Oblimin ? "Oblimin" : optionsState.Promax ? "Promax" : ""}
                                                        onValueChange={handleMethodGrp}
                                                    >
                                                        <div className="grid grid-cols-2 gap-1">
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="None" id="None"/>
                                                                    <Label htmlFor="None">
                                                                        None
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="Varimax" id="Varimax"/>
                                                                    <Label htmlFor="Varimax">
                                                                        Varimax
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="Oblimin" id="Oblimin"/>
                                                                    <Label htmlFor="Oblimin">
                                                                        Direct Oblimin
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2 pl-6">
                                                                    <Label className="w-[75px]">Delta:</Label>
                                                                    <div className="w-[75px]">
                                                                        <Input
                                                                            id="Delta"
                                                                            type="number"
                                                                            placeholder=""
                                                                            value={optionsState.Delta || ""}
                                                                            onChange={(e) => handleChange("Delta", Number(e.target.value))}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="Quartimax" id="Quartimax"/>
                                                                    <Label htmlFor="Quartimax">
                                                                        Quartimax
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="Equimax" id="Equimax"/>
                                                                    <Label htmlFor="Equimax">
                                                                        Equimax
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="Promax" id="Promax"/>
                                                                    <Label htmlFor="Promax">
                                                                        Promax
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2 pl-6">
                                                                    <Label className="w-[75px]">Kappa:</Label>
                                                                    <div className="w-[75px]">
                                                                        <Input
                                                                            id="Kappa"
                                                                            type="number"
                                                                            placeholder=""
                                                                            value={optionsState.Kappa || ""}
                                                                            onChange={(e) => handleChange("Kappa", Number(e.target.value))}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </RadioGroup>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="Kaiser"
                                                            checked={optionsState.Kaiser}
                                                            onCheckedChange={(checked) => handleChange("Kaiser", checked)}
                                                        />
                                                        <label
                                                            htmlFor="Kaiser"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Kaiser Normalization
                                                        </label>
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            </ResizablePanel>
                        </ResizablePanelGroup>
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
