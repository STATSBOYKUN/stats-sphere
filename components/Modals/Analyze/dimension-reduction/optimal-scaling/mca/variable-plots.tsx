import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    OptScaMCAVariablePlotsProps,
    OptScaMCAVariablePlotsType
} from "@/models/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca";
import { ScrollArea } from "@/components/ui/scroll-area";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {CheckedState} from "@radix-ui/react-checkbox";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

export const OptScaMCAVariablePlots = ({
                                           isVariablePlotsOpen,
                                           setIsVariablePlotsOpen,
                                           updateFormData,
                                           data
                                       }: OptScaMCAVariablePlotsProps) => {
    const [variablePlotsState, setVariablePlotsState] = useState<OptScaMCAVariablePlotsType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isVariablePlotsOpen) {
            setVariablePlotsState({...data});
        }
    }, [isVariablePlotsOpen, data]);

    const handleChange = (field: keyof OptScaMCAVariablePlotsType, value: CheckedState | number | string | null) => {
        setVariablePlotsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDiscGrp = (value: string) => {
        setVariablePlotsState((prevState) => ({
            ...prevState,
            UseAllVars: value === "UseAllVars",
            UseSelectedVars: value === "UseSelectedVars",
        }));
    };

    const handleContinue = () => {
        Object.entries(variablePlotsState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaMCAVariablePlotsType, value);
        });
        setIsVariablePlotsOpen(false);
    };

    return (
        <>
            {/* Variable Plots Dialog */}
            <Dialog open={isVariablePlotsOpen} onOpenChange={setIsVariablePlotsOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Multiple Correspondence Analysis: Variable Plots</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="h-[450px] flex flex-col gap-2">
                        <ScrollArea>
                            <ResizablePanelGroup
                                direction="horizontal"
                                className="min-h-[450px] max-w-xl rounded-lg border md:min-w-[200px]"
                            >
                                {/* Variable List */}
                                <ResizablePanel defaultSize={25}>
                                    <div className="flex h-full items-center justify-center p-2">
                                        <span className="font-semibold">List Variabel</span>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle withHandle/>

                                {/* Defining Variable */}
                                <ResizablePanel defaultSize={75}>
                                    <div className="flex flex-col p-2">
                                        <div className="w-full">
                                            <Label>Category Plots: </Label>
                                            <Input
                                                id="CatPlotsVar"
                                                type="text"
                                                className="w-full min-h-[65px]"
                                                placeholder=""
                                                value={variablePlotsState.CatPlotsVar ?? ""}
                                                onChange={(e) => handleChange("CatPlotsVar", e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full">
                                            <Label>Joint Category Plots: </Label>
                                            <Input
                                                id="JointCatPlotsVar"
                                                type="text"
                                                className="w-full min-h-[65px]"
                                                placeholder=""
                                                value={variablePlotsState.JointCatPlotsVar ?? ""}
                                                onChange={(e) => handleChange("JointCatPlotsVar", e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="w-full">
                                                <Label>Transformation Plots: </Label>
                                                <Input
                                                    id="TransPlotsVar"
                                                    type="text"
                                                    className="w-full min-h-[65px]"
                                                    placeholder=""
                                                    value={variablePlotsState.TransPlotsVar ?? ""}
                                                    onChange={(e) => handleChange("TransPlotsVar", e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Label className="w-[225px]">Dimensions for Multiple Nominal:</Label>
                                                <div className="w-[75px]">
                                                    <Input
                                                        id="DimensionsForMultiNom"
                                                        type="number"
                                                        placeholder=""
                                                        value={variablePlotsState.DimensionsForMultiNom || ""}
                                                        onChange={(e) => handleChange("DimensionsForMultiNom", Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="InclResidPlots"
                                                    checked={variablePlotsState.InclResidPlots}
                                                    onCheckedChange={(checked) => handleChange("InclResidPlots", checked)}
                                                />
                                                <label
                                                    htmlFor="InclResidPlots"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Include Residual Plots
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 pt-2 w-full">
                                            <Label className="font-bold">Discriminant Measures</Label>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="DisplayPlot"
                                                    checked={variablePlotsState.DisplayPlot}
                                                    onCheckedChange={(checked) => handleChange("DisplayPlot", checked)}
                                                />
                                                <label
                                                    htmlFor="DisplayPlot"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Display Plot
                                                </label>
                                            </div>
                                            <RadioGroup
                                                value={variablePlotsState.UseAllVars ? "UseAllVars" : "UseSelectedVars"}
                                                onValueChange={handleDiscGrp}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="UseAllVars" id="UseAllVars"/>
                                                    <Label htmlFor="UseAllVars">
                                                        Use All Variables
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="UseSelectedVars" id="UseSelectedVars"/>
                                                    <Label htmlFor="UseSelectedVars">
                                                        Use Selected Variables
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                            <Input
                                                id="DiscMeasuresVar"
                                                type="text"
                                                className="w-full min-h-[65px]"
                                                placeholder=""
                                                value={variablePlotsState.DiscMeasuresVar ?? ""}
                                                onChange={(e) => handleChange("DiscMeasuresVar", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ScrollArea>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsVariablePlotsOpen(false)}>
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
