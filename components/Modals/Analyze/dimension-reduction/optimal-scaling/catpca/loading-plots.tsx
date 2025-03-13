import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    OptScaCatpcaLoadingPlotsProps,
    OptScaCatpcaLoadingPlotsType
} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import {ScrollArea} from "@/components/ui/scroll-area";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Input} from "@/components/ui/input";
import {CheckedState} from "@radix-ui/react-checkbox";

export const OptScaCatpcaLoadingPlots = ({ isLoadingPlotsOpen, setIsLoadingPlotsOpen, updateFormData, data }: OptScaCatpcaLoadingPlotsProps) => {
    const [loadingPlotsState, setLoadingPlotsState] = useState<OptScaCatpcaLoadingPlotsType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isLoadingPlotsOpen) {
            setLoadingPlotsState({ ...data });
        }
    }, [isLoadingPlotsOpen, data]);

    const handleChange = (field: keyof OptScaCatpcaLoadingPlotsType, value: CheckedState | number | string | null) => {
        setLoadingPlotsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleLoadingGrp = (value: string) => {
        setLoadingPlotsState((prevState) => ({
            ...prevState,
            LoadingIncludeAllVars: value === "LoadingIncludeAllVars",
            LoadingIncludeSelectedVars: value === "LoadingIncludeSelectedVars",
        }));
    };

    const handleCentrGrp = (value: string) => {
        setLoadingPlotsState((prevState) => ({
            ...prevState,
            IncludeCentroidsIncludeAllVars: value === "IncludeCentroidsIncludeAllVars",
            IncludeCentroidsIncludeSelectedVars: value === "IncludeCentroidsIncludeSelectedVars",
        }));
    };

    const handleContinue = () => {
        Object.entries(loadingPlotsState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaCatpcaLoadingPlotsType, value);
        });
        setIsLoadingPlotsOpen(false);
    };

    return (
        <>
            {/* Loading Plots Dialog */}
            <Dialog open={isLoadingPlotsOpen} onOpenChange={setIsLoadingPlotsOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Categorical Principal Components: Loading Plots</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="h-[450px] flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="Variance"
                                checked={loadingPlotsState.Variance}
                                onCheckedChange={(checked) => handleChange("Variance", checked)}
                            />
                            <label
                                htmlFor="Variance"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Variance Accounted For
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="DisplayCompLoadings"
                                checked={loadingPlotsState.DisplayCompLoadings}
                                onCheckedChange={(checked) => handleChange("DisplayCompLoadings", checked)}
                            />
                            <label
                                htmlFor="DisplayCompLoadings"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Display Component Loadings
                            </label>
                        </div>
                        <ScrollArea>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[500px] max-w-xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={50}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Loading Variables</Label>
                                        <ResizablePanelGroup direction="horizontal">
                                            <ResizablePanel defaultSize={65}>
                                                <div className="grid grid-cols-2 gap-2 p-2">
                                                    <div className="flex flex-col gap-2">
                                                        <Label>Label By: </Label>
                                                        <RadioGroup
                                                            value={loadingPlotsState.LoadingIncludeAllVars ? "LoadingIncludeAllVars" : "LoadingIncludeSelectedVars"}
                                                            onValueChange={handleLoadingGrp}
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="LoadingIncludeAllVars"
                                                                                id="LoadingIncludeAllVars"/>
                                                                <Label htmlFor="LoadingIncludeAllVars">
                                                                    All Variables
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="LoadingIncludeSelectedVars"
                                                                                id="LoadingIncludeSelectedVars"/>
                                                                <Label htmlFor="LoadingIncludeSelectedVars">
                                                                    Selected Variable
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label>Available: </Label>
                                                        <Input
                                                            id="LoadingAvailableVars"
                                                            type="text"
                                                            className="w-full min-h-[150px]"
                                                            placeholder=""
                                                            value={loadingPlotsState.LoadingAvailableVars ?? ""}
                                                            onChange={(e) => handleChange("LoadingAvailableVars", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle withHandle/>
                                            <ResizablePanel defaultSize={35}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label>Selected: </Label>
                                                    <Input
                                                        id="LoadingSelectedVars"
                                                        type="text"
                                                        className="w-full min-h-[150px]"
                                                        placeholder=""
                                                        value={loadingPlotsState.LoadingSelectedVars ?? ""}
                                                        onChange={(e) => handleChange("LoadingSelectedVars", e.target.value)}
                                                    />
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={50}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Centroids</Label>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="IncludeCentroids"
                                                checked={loadingPlotsState.IncludeCentroids}
                                                onCheckedChange={(checked) => handleChange("IncludeCentroids", checked)}
                                            />
                                            <label
                                                htmlFor="IncludeCentroids"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Include Centroids
                                            </label>
                                        </div>
                                        <ResizablePanelGroup direction="horizontal">
                                            <ResizablePanel defaultSize={65}>
                                                <div className="grid grid-cols-2 gap-2 p-2">
                                                    <div className="flex flex-col gap-2">
                                                        <Label>Label By: </Label>
                                                        <RadioGroup
                                                            value={loadingPlotsState.IncludeCentroidsIncludeAllVars ? "IncludeCentroidsIncludeAllVars" : "IncludeCentroidsIncludeSelectedVars"}
                                                            onValueChange={handleCentrGrp}
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="IncludeCentroidsIncludeAllVars"
                                                                                id="IncludeCentroidsIncludeAllVars"/>
                                                                <Label htmlFor="IncludeCentroidsIncludeAllVars">
                                                                    All Variables
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="IncludeCentroidsIncludeSelectedVars"
                                                                    id="IncludeCentroidsIncludeSelectedVars"/>
                                                                <Label htmlFor="IncludeCentroidsIncludeSelectedVars">
                                                                    Selected Variable
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label>Available: </Label>
                                                        <Input
                                                            id="IncludeCentroidsAvailableVars"
                                                            type="text"
                                                            className="w-full min-h-[150px]"
                                                            placeholder=""
                                                            value={loadingPlotsState.IncludeCentroidsAvailableVars ?? ""}
                                                            onChange={(e) => handleChange("IncludeCentroidsAvailableVars", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle withHandle/>
                                            <ResizablePanel defaultSize={35}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label>Selected: </Label>
                                                    <Input
                                                        id="IncludeCentroidsSelectedVars"
                                                        type="text"
                                                        className="w-full min-h-[150px]"
                                                        placeholder=""
                                                        value={loadingPlotsState.IncludeCentroidsSelectedVars ?? ""}
                                                        onChange={(e) => handleChange("IncludeCentroidsSelectedVars", e.target.value)}
                                                    />
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ScrollArea>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsLoadingPlotsOpen(false)}>
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
