import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {HierClusPlotsProps, HierClusPlotsType} from "@/models/classify/hierarchical-cluster/hierarchical-cluster";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Checkbox} from "@/components/ui/checkbox";
import {CheckedState} from "@radix-ui/react-checkbox";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

export const HierClusPlots = ({ isPlotsOpen, setIsPlotsOpen, updateFormData, data }: HierClusPlotsProps) => {
    const [plotsState, setPlotsState] = useState<HierClusPlotsType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isPlotsOpen) {
            setPlotsState({ ...data });
        }
    }, [isPlotsOpen, data]);

    const handleChange = (field: keyof HierClusPlotsType, value: CheckedState | boolean | number | string | null) => {
        setPlotsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleIcicleGrp = (value: string) => {
        setPlotsState((prevState) => ({
            ...prevState,
            AllClusters: value === "AllClusters",
            RangeClusters: value === "RangeClusters",
            NoneClusters: value === "NoneClusters",
        }));
    };

    const handleOrienGrp = (value: string) => {
        setPlotsState((prevState) => ({
            ...prevState,
            VertOrien: value === "VertOrien",
            HoriOrien: value === "HoriOrien",
        }));
    };

    const handleContinue = () => {
        Object.entries(plotsState).forEach(([key, value]) => {
            updateFormData(key as keyof HierClusPlotsType, value);
        });
        setIsPlotsOpen(false);
    };

    return (
        <>
            {/* Plots Dialog */}
            <Dialog open={isPlotsOpen} onOpenChange={setIsPlotsOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hierarchical Cluster Analysis: Plots</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col items-start gap-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="Dendrograms"
                                checked={plotsState.Dendrograms}
                                onCheckedChange={(checked) => handleChange("Dendrograms", checked)}
                            />
                            <label
                                htmlFor="Dendrograms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Dendrogram
                            </label>
                        </div>
                        <ResizablePanelGroup
                            direction="vertical"
                            className="min-h-[325px] max-w-md rounded-lg border md:min-w-[200px]"
                        >
                            <ResizablePanel defaultSize={75}>
                                <div className="flex flex-col gap-2 w-full p-2">
                                    <Label className="font-bold">Icicle</Label>
                                    <RadioGroup
                                        value={plotsState.AllClusters ? "AllClusters" : plotsState.RangeClusters ? "RangeClusters" : "NoneClusters"}
                                        onValueChange={handleIcicleGrp}
                                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="AllClusters" id="AllClusters"/>
                                                <Label htmlFor="AllClusters">
                                                    All Clusters
                                                </Label>
                                            </div>
                                            <div className="flex flex-col gap-2 space-x-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="RangeClusters" id="RangeClusters"/>
                                                    <Label htmlFor="RangeClusters">
                                                        Specified Range of Clusters
                                                    </Label>
                                                </div>
                                                <div className="flex items-center pl-4 space-x-2">
                                                    <label
                                                        htmlFor="StartCluster"
                                                        className="w-[100px] text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Start Cluster:
                                                    </label>
                                                    <div className="w-[100px]">
                                                        <Input
                                                            id="StartCluster"
                                                            type="number"
                                                            placeholder=""
                                                            value={plotsState.StartCluster ?? ""}
                                                            onChange={(e) => handleChange("StartCluster", Number(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center pl-4 space-x-2">
                                                    <label
                                                        htmlFor="StopCluster"
                                                        className="w-[100px] text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Stop Cluster:
                                                    </label>
                                                    <div className="w-[100px]">
                                                        <Input
                                                            id="StopCluster"
                                                            type="number"
                                                            placeholder=""
                                                            value={plotsState.StopCluster ?? ""}
                                                            onChange={(e) => handleChange("StopCluster", Number(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center pl-4 space-x-2">
                                                    <label
                                                        htmlFor="StepByCluster"
                                                        className="w-[100px] text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        By:
                                                    </label>
                                                    <div className="w-[100px]">
                                                        <Input
                                                            id="StepByCluster"
                                                            type="number"
                                                            placeholder=""
                                                            value={plotsState.StepByCluster ?? ""}
                                                            onChange={(e) => handleChange("StepByCluster", Number(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="NoneClusters" id="NoneClusters"/>
                                                <Label htmlFor="NoneClusters">
                                                    None
                                                </Label>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle/>
                            <ResizablePanel defaultSize={25}>
                                <div className="flex flex-col gap-2 p-2">
                                    <RadioGroup
                                        value={plotsState.VertOrien ? "VertOrien" : "HoriOrien"}
                                        onValueChange={handleOrienGrp}
                                    >
                                        <div className="flex flex-col gap-2">
                                            <Label className="font-bold">Orientation</Label>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="VertOrien" id="VertOrien"/>
                                                <Label htmlFor="VertOrien">
                                                    Vertical Orientation
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="HoriOrien" id="HoriOrien"/>
                                                <Label htmlFor="HoriOrien">
                                                    Horizontal Orientation
                                                </Label>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsPlotsOpen(false)}>
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
