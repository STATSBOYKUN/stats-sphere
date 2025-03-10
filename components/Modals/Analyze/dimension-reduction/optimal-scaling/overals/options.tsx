import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    OptScaOveralsOptionsProps,
    OptScaOveralsOptionsType
} from "@/models/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {CheckedState} from "@radix-ui/react-checkbox";

export const OptScaOveralsOptions = ({ isOptionsOpen, setIsOptionsOpen, updateFormData, data }: OptScaOveralsOptionsProps) => {
    const [optionsState, setOptionsState] = useState<OptScaOveralsOptionsType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isOptionsOpen) {
            setOptionsState({ ...data });
        }
    }, [isOptionsOpen, data]);

    const handleChange = (field: keyof OptScaOveralsOptionsType, value: CheckedState | number | string | null) => {
        setOptionsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(optionsState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaOveralsOptionsType, value);
        });
        setIsOptionsOpen(false);
    };

    return (
        <>
            {/* Options Dialog */}
            <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>OVERALS: Options</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="h-[450px] flex flex-col gap-2">
                        <ScrollArea>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[450px] max-w-lg rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={35}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Display</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="Freq"
                                                        checked={optionsState.Freq}
                                                        onCheckedChange={(checked) => handleChange("Freq", checked)}
                                                    />
                                                    <label
                                                        htmlFor="Freq"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Frequencies
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="Centroid"
                                                        checked={optionsState.Centroid}
                                                        onCheckedChange={(checked) => handleChange("Centroid", checked)}
                                                    />
                                                    <label
                                                        htmlFor="Centroid"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Centroids
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="IterHistory"
                                                        checked={optionsState.IterHistory}
                                                        onCheckedChange={(checked) => handleChange("IterHistory", checked)}
                                                    />
                                                    <label
                                                        htmlFor="IterHistory"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Iteration History
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="WeightCompload"
                                                        checked={optionsState.WeightCompload}
                                                        onCheckedChange={(checked) => handleChange("WeightCompload", checked)}
                                                    />
                                                    <label
                                                        htmlFor="WeightCompload"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Weights and Component Loadings
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="SingMult"
                                                        checked={optionsState.SingMult}
                                                        onCheckedChange={(checked) => handleChange("SingMult", checked)}
                                                    />
                                                    <label
                                                        htmlFor="SingMult"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Single and Multiple Fit
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="CategoryQuant"
                                                        checked={optionsState.CategoryQuant}
                                                        onCheckedChange={(checked) => handleChange("CategoryQuant", checked)}
                                                    />
                                                    <label
                                                        htmlFor="CategoryQuant"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Category Quantifications
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="ObjScore"
                                                        checked={optionsState.ObjScore}
                                                        onCheckedChange={(checked) => handleChange("ObjScore", checked)}
                                                    />
                                                    <label
                                                        htmlFor="ObjScore"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Object Scores
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={25}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Plot</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="CategCoord"
                                                        checked={optionsState.CategCoord}
                                                        onCheckedChange={(checked) => handleChange("CategCoord", checked)}
                                                    />
                                                    <label
                                                        htmlFor="CategCoord"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Category Coordinates
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="PlotObjScore"
                                                        checked={optionsState.PlotObjScore}
                                                        onCheckedChange={(checked) => handleChange("PlotObjScore", checked)}
                                                    />
                                                    <label
                                                        htmlFor="PlotObjScore"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Plot Object Scores
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="Compload"
                                                        checked={optionsState.Compload}
                                                        onCheckedChange={(checked) => handleChange("Compload", checked)}
                                                    />
                                                    <label
                                                        htmlFor="Compload"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Component Loadings
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="CategCentroid"
                                                        checked={optionsState.CategCentroid}
                                                        onCheckedChange={(checked) => handleChange("CategCentroid", checked)}
                                                    />
                                                    <label
                                                        htmlFor="CategCentroid"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Category Centroids
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="Trans"
                                                        checked={optionsState.Trans}
                                                        onCheckedChange={(checked) => handleChange("Trans", checked)}
                                                    />
                                                    <label
                                                        htmlFor="Trans"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Transformation
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={10}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="SaveObjscore"
                                                        checked={optionsState.SaveObjscore}
                                                        onCheckedChange={(checked) => handleChange("SaveObjscore", checked)}
                                                    />
                                                    <label
                                                        htmlFor="SaveObjscore"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Save Object Scores
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="UseRandconf"
                                                        checked={optionsState.UseRandconf}
                                                        onCheckedChange={(checked) => handleChange("UseRandconf", checked)}
                                                    />
                                                    <label
                                                        htmlFor="UseRandconf"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Use Random Initial Configuration
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={30}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Criteria</Label>
                                        <div className="flex items-center space-x-2 pl-6">
                                            <Label className="w-[150px]">Maximum Iterations:</Label>
                                            <div className="w-[100px]">
                                                <Input
                                                    id="MaxIter"
                                                    type="number"
                                                    placeholder=""
                                                    value={optionsState.MaxIter || ""}
                                                    onChange={(e) => handleChange("MaxIter", Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 pl-6">
                                            <Label className="w-[150px]">Convergence:</Label>
                                            <div className="w-[100px]">
                                                <Input
                                                    id="Conv"
                                                    type="number"
                                                    placeholder=""
                                                    value={optionsState.Conv || ""}
                                                    onChange={(e) => handleChange("Conv", Number(e.target.value))}
                                                />
                                            </div>
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
