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
    OptScaCatpcaLoadingPlotsProps,
    OptScaCatpcaLoadingPlotsType,
} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const OptScaCatpcaLoadingPlots = ({
    isLoadingPlotsOpen,
    setIsLoadingPlotsOpen,
    updateFormData,
    data,
}: OptScaCatpcaLoadingPlotsProps) => {
    const [loadingPlotsState, setLoadingPlotsState] =
        useState<OptScaCatpcaLoadingPlotsType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);
    const [availableLoadingVariables, setAvailableLoadingVariables] = useState<
        string[]
    >([]);
    const [
        availableIncludeCentroidVariables,
        setAvailableIncludeCentroidVariables,
    ] = useState<string[]>([]);

    useEffect(() => {
        if (isLoadingPlotsOpen) {
            setLoadingPlotsState({ ...data });
            setAvailableLoadingVariables(data.LoadingAvailableVars ?? []);
            setAvailableIncludeCentroidVariables(
                data.IncludeCentroidsAvailableVars ?? []
            );
        }
    }, [isLoadingPlotsOpen, data]);

    useEffect(() => {
        const usedLoadingVariables = [
            ...(loadingPlotsState.LoadingSelectedVars || []),
        ].filter(Boolean);

        if (!(loadingPlotsState.LoadingAvailableVars === null)) {
            const updatedVariables =
                loadingPlotsState.LoadingAvailableVars.filter(
                    (variable) => !usedLoadingVariables.includes(variable)
                );
            setAvailableLoadingVariables(updatedVariables);
        }

        const usedIncludeCentroidVariables = [
            ...(loadingPlotsState.IncludeCentroidsSelectedVars || []),
        ].filter(Boolean);

        if (!(loadingPlotsState.IncludeCentroidsAvailableVars === null)) {
            const updatedVariables =
                loadingPlotsState.IncludeCentroidsAvailableVars.filter(
                    (variable) =>
                        !usedIncludeCentroidVariables.includes(variable)
                );
            setAvailableIncludeCentroidVariables(updatedVariables);
        }
    }, [loadingPlotsState]);

    const handleChange = (
        field: keyof OptScaCatpcaLoadingPlotsType,
        value: CheckedState | number | string | null
    ) => {
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
            IncludeCentroidsIncludeAllVars:
                value === "IncludeCentroidsIncludeAllVars",
            IncludeCentroidsIncludeSelectedVars:
                value === "IncludeCentroidsIncludeSelectedVars",
        }));
    };

    const handleDrop = (target: string, variable: string) => {
        setLoadingPlotsState((prev) => {
            const updatedState = { ...prev };
            if (target === "LoadingSelectedVars") {
                updatedState.LoadingSelectedVars = [
                    ...(updatedState.LoadingSelectedVars || []),
                    variable,
                ];
            } else if (target === "IncludeCentroidsSelectedVars") {
                updatedState.IncludeCentroidsSelectedVars = [
                    ...(updatedState.IncludeCentroidsSelectedVars || []),
                    variable,
                ];
            }
            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setLoadingPlotsState((prev) => {
            const updatedState = { ...prev };
            if (target === "LoadingSelectedVars") {
                updatedState.LoadingSelectedVars = (
                    updatedState.LoadingSelectedVars || []
                ).filter((item) => item !== variable);
            } else if (target === "IncludeCentroidsSelectedVars") {
                updatedState.IncludeCentroidsSelectedVars = (
                    updatedState.IncludeCentroidsSelectedVars || []
                ).filter((item) => item !== variable);
            }
            return updatedState;
        });
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
            <Dialog
                open={isLoadingPlotsOpen}
                onOpenChange={setIsLoadingPlotsOpen}
            >
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            Categorical Principal Components: Loading Plots
                        </DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="h-[450px] flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="Variance"
                                checked={loadingPlotsState.Variance}
                                onCheckedChange={(checked) =>
                                    handleChange("Variance", checked)
                                }
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
                                onCheckedChange={(checked) =>
                                    handleChange("DisplayCompLoadings", checked)
                                }
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
                                        <Label className="font-bold">
                                            Loading Variables
                                        </Label>
                                        <ResizablePanelGroup direction="horizontal">
                                            <ResizablePanel defaultSize={65}>
                                                <div className="grid grid-cols-2 gap-2 p-2">
                                                    <div className="flex flex-col gap-2">
                                                        <Label>
                                                            Label By:{" "}
                                                        </Label>
                                                        <RadioGroup
                                                            value={
                                                                loadingPlotsState.LoadingIncludeAllVars
                                                                    ? "LoadingIncludeAllVars"
                                                                    : "LoadingIncludeSelectedVars"
                                                            }
                                                            disabled={
                                                                !loadingPlotsState.DisplayCompLoadings
                                                            }
                                                            onValueChange={
                                                                handleLoadingGrp
                                                            }
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="LoadingIncludeAllVars"
                                                                    id="LoadingIncludeAllVars"
                                                                />
                                                                <Label htmlFor="LoadingIncludeAllVars">
                                                                    All
                                                                    Variables
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="LoadingIncludeSelectedVars"
                                                                    id="LoadingIncludeSelectedVars"
                                                                />
                                                                <Label htmlFor="LoadingIncludeSelectedVars">
                                                                    Selected
                                                                    Variable
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label>
                                                            Available:{" "}
                                                        </Label>
                                                        <ScrollArea>
                                                            <div className="flex flex-col justify-start items-start h-[150px] p-2 border rounded overflow-hidden">
                                                                {availableLoadingVariables.map(
                                                                    (
                                                                        variable: string,
                                                                        index: number
                                                                    ) => (
                                                                        <Badge
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="w-full text-start text-sm font-light p-2 cursor-pointer"
                                                                            variant="outline"
                                                                            draggable
                                                                            onDragStart={(
                                                                                e
                                                                            ) =>
                                                                                e.dataTransfer.setData(
                                                                                    "text",
                                                                                    variable
                                                                                )
                                                                            }
                                                                        >
                                                                            {
                                                                                variable
                                                                            }
                                                                        </Badge>
                                                                    )
                                                                )}
                                                            </div>
                                                        </ScrollArea>
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle withHandle />
                                            <ResizablePanel defaultSize={35}>
                                                <div
                                                    className="flex flex-col w-full gap-2 p-2"
                                                    onDragOver={(e) =>
                                                        e.preventDefault()
                                                    }
                                                    onDrop={(e) => {
                                                        const variable =
                                                            e.dataTransfer.getData(
                                                                "text"
                                                            );
                                                        handleDrop(
                                                            "LoadingSelectedVars",
                                                            variable
                                                        );
                                                    }}
                                                >
                                                    <Label className="font-bold">
                                                        <Label>
                                                            Selected:{" "}
                                                        </Label>
                                                    </Label>
                                                    <div className="w-full h-[150px] p-2 border rounded overflow-hidden">
                                                        <ScrollArea>
                                                            <div className="w-full h-[150px]">
                                                                {loadingPlotsState.LoadingSelectedVars &&
                                                                loadingPlotsState
                                                                    .LoadingSelectedVars
                                                                    .length >
                                                                    0 ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {loadingPlotsState.LoadingSelectedVars.map(
                                                                            (
                                                                                variable,
                                                                                index
                                                                            ) => (
                                                                                <Badge
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    className="text-start text-sm font-light p-2 cursor-pointer"
                                                                                    variant="outline"
                                                                                    onClick={() =>
                                                                                        handleRemoveVariable(
                                                                                            "LoadingSelectedVars",
                                                                                            variable
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        variable
                                                                                    }
                                                                                </Badge>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm font-light text-gray-500">
                                                                        Drop
                                                                        variables
                                                                        here.
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </ScrollArea>
                                                    </div>
                                                    <input
                                                        type="hidden"
                                                        value={
                                                            loadingPlotsState.LoadingSelectedVars ??
                                                            ""
                                                        }
                                                        name="Independents"
                                                    />
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={50}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Centroids
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="IncludeCentroids"
                                                checked={
                                                    loadingPlotsState.IncludeCentroids
                                                }
                                                disabled={
                                                    !loadingPlotsState.DisplayCompLoadings
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "IncludeCentroids",
                                                        checked
                                                    )
                                                }
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
                                                        <Label>
                                                            Label By:{" "}
                                                        </Label>
                                                        <RadioGroup
                                                            value={
                                                                loadingPlotsState.IncludeCentroidsIncludeAllVars
                                                                    ? "IncludeCentroidsIncludeAllVars"
                                                                    : "IncludeCentroidsIncludeSelectedVars"
                                                            }
                                                            disabled={
                                                                !loadingPlotsState.DisplayCompLoadings
                                                            }
                                                            onValueChange={
                                                                handleCentrGrp
                                                            }
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="IncludeCentroidsIncludeAllVars"
                                                                    id="IncludeCentroidsIncludeAllVars"
                                                                />
                                                                <Label htmlFor="IncludeCentroidsIncludeAllVars">
                                                                    All
                                                                    Variables
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="IncludeCentroidsIncludeSelectedVars"
                                                                    id="IncludeCentroidsIncludeSelectedVars"
                                                                />
                                                                <Label htmlFor="IncludeCentroidsIncludeSelectedVars">
                                                                    Selected
                                                                    Variable
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label>
                                                            Available:{" "}
                                                        </Label>
                                                        <ScrollArea>
                                                            <div className="flex flex-col justify-start items-start h-[150px] p-2 border rounded overflow-hidden">
                                                                {availableIncludeCentroidVariables.map(
                                                                    (
                                                                        variable: string,
                                                                        index: number
                                                                    ) => (
                                                                        <Badge
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="w-full text-start text-sm font-light p-2 cursor-pointer"
                                                                            variant="outline"
                                                                            draggable
                                                                            onDragStart={(
                                                                                e
                                                                            ) =>
                                                                                e.dataTransfer.setData(
                                                                                    "text",
                                                                                    variable
                                                                                )
                                                                            }
                                                                        >
                                                                            {
                                                                                variable
                                                                            }
                                                                        </Badge>
                                                                    )
                                                                )}
                                                            </div>
                                                        </ScrollArea>
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle withHandle />
                                            <ResizablePanel defaultSize={35}>
                                                <div
                                                    className="flex flex-col w-full gap-2 p-2"
                                                    onDragOver={(e) =>
                                                        e.preventDefault()
                                                    }
                                                    onDrop={(e) => {
                                                        const variable =
                                                            e.dataTransfer.getData(
                                                                "text"
                                                            );
                                                        handleDrop(
                                                            "IncludeCentroidsSelectedVars",
                                                            variable
                                                        );
                                                    }}
                                                >
                                                    <Label>Selected:</Label>
                                                    <div className="w-full h-[150px] p-2 border rounded overflow-hidden">
                                                        <ScrollArea>
                                                            <div className="w-full h-[150px]">
                                                                {loadingPlotsState.IncludeCentroidsSelectedVars &&
                                                                loadingPlotsState
                                                                    .IncludeCentroidsSelectedVars
                                                                    .length >
                                                                    0 ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {loadingPlotsState.IncludeCentroidsSelectedVars.map(
                                                                            (
                                                                                variable,
                                                                                index
                                                                            ) => (
                                                                                <Badge
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    className="text-start text-sm font-light p-2 cursor-pointer"
                                                                                    variant="outline"
                                                                                    onClick={() =>
                                                                                        handleRemoveVariable(
                                                                                            "IncludeCentroidsSelectedVars",
                                                                                            variable
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        variable
                                                                                    }
                                                                                </Badge>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm font-light text-gray-500">
                                                                        Drop
                                                                        variables
                                                                        here.
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </ScrollArea>
                                                    </div>
                                                    <input
                                                        type="hidden"
                                                        value={
                                                            loadingPlotsState.IncludeCentroidsSelectedVars ??
                                                            ""
                                                        }
                                                        name="Independents"
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
                            onClick={() => setIsLoadingPlotsOpen(false)}
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
