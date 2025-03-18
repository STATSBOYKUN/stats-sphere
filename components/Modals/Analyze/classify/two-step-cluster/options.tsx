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
    TwoStepClusterOptionsProps,
    TwoStepClusterOptionsType,
} from "@/models/classify/two-step-cluster/two-step-cluster";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const TwoStepClusterOptions = ({
    isOptionsOpen,
    setIsOptionsOpen,
    updateFormData,
    data,
}: TwoStepClusterOptionsProps) => {
    const [optionsState, setOptionsState] = useState<TwoStepClusterOptionsType>(
        { ...data }
    );
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);

    useEffect(() => {
        if (isOptionsOpen) {
            setOptionsState({ ...data });
            setAvailableVariables(data.SrcVar ?? []);
        }
    }, [isOptionsOpen, data]);

    useEffect(() => {
        const usedVariables = [...(optionsState.TargetVar || [])].filter(
            Boolean
        );

        if (!(optionsState.SrcVar === null)) {
            const updatedVariables = optionsState.SrcVar.filter(
                (variable) => !usedVariables.includes(variable)
            );
            setAvailableVariables(updatedVariables);
        }
    }, [optionsState]);

    const handleChange = (
        field: keyof TwoStepClusterOptionsType,
        value: CheckedState | number | string | null
    ) => {
        setOptionsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDrop = (target: string, variable: string) => {
        setOptionsState((prev) => {
            const updatedState = { ...prev };
            if (target === "TargetVar") {
                updatedState.TargetVar = [
                    ...(updatedState.TargetVar || []),
                    variable,
                ];
            }
            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setOptionsState((prev) => {
            const updatedState = { ...prev };
            if (target === "TargetVar") {
                updatedState.TargetVar = (updatedState.TargetVar || []).filter(
                    (item) => item !== variable
                );
            }
            return updatedState;
        });
    };

    const handleContinue = () => {
        Object.entries(optionsState).forEach(([key, value]) => {
            updateFormData(key as keyof TwoStepClusterOptionsType, value);
        });
        setIsOptionsOpen(false);
    };

    return (
        <>
            {/* Options Dialog */}
            <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            TwoStep Cluster Analysis: Options
                        </DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <ResizablePanelGroup
                            direction="vertical"
                            className="min-h-[235px] max-w-2xl rounded-lg border md:min-w-[200px]"
                        >
                            <ResizablePanel defaultSize={42}>
                                <ResizablePanelGroup direction="horizontal">
                                    <ResizablePanel defaultSize={50}>
                                        <div className="flex flex-col gap-2 p-2">
                                            <Label className="font-bold">
                                                Outlier Treatment
                                            </Label>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="Noise"
                                                    checked={optionsState.Noise}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "Noise",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="Noise"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Use Noise Handling
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2 pl-6">
                                                <Label className="w-[150px]">
                                                    Percentage:
                                                </Label>
                                                <div className="w-[75px]">
                                                    <Input
                                                        id="NoiseCluster"
                                                        type="number"
                                                        placeholder=""
                                                        value={
                                                            optionsState.NoiseCluster ??
                                                            ""
                                                        }
                                                        disabled={
                                                            !optionsState.Noise
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "NoiseCluster",
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </ResizablePanel>
                                    <ResizableHandle />
                                    <ResizablePanel defaultSize={50}>
                                        <div className="flex flex-col gap-2 p-2">
                                            <Label className="font-bold text-gray-500">
                                                Memory Allocation
                                            </Label>
                                            <div className="flex items-center space-x-2">
                                                <Label className="w-[100px] text-gray-500">
                                                    Maximum (MB):
                                                </Label>
                                                <div className="w-[150px]">
                                                    <Input
                                                        id="MemoryValue"
                                                        type="number"
                                                        placeholder=""
                                                        value={
                                                            optionsState.MemoryValue ??
                                                            ""
                                                        }
                                                        disabled={true}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "MemoryValue",
                                                                Number(
                                                                    e.target
                                                                        .value
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
                            <ResizablePanel defaultSize={58}>
                                <div className="flex flex-col gap-2 p-2">
                                    <Label className="font-bold">
                                        Standardization of Continuous Variables
                                    </Label>
                                    <ResizablePanelGroup direction="horizontal">
                                        <ResizablePanel defaultSize={50}>
                                            <div
                                                className="flex flex-col w-full gap-2"
                                                onDragOver={(e) =>
                                                    e.preventDefault()
                                                }
                                                onDrop={(e) => {
                                                    const variable =
                                                        e.dataTransfer.getData(
                                                            "text"
                                                        );
                                                    handleDrop(
                                                        "TargetVar",
                                                        variable
                                                    );
                                                }}
                                            >
                                                <Label>
                                                    Assumed Standardized:{" "}
                                                </Label>
                                                <div className="w-full h-[150px] p-2 border rounded overflow-hidden">
                                                    <ScrollArea>
                                                        <div className="w-full h-[150px]">
                                                            {optionsState.TargetVar &&
                                                            optionsState
                                                                .TargetVar
                                                                .length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {optionsState.TargetVar.map(
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
                                                                                        "TargetVar",
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
                                                        optionsState.TargetVar ??
                                                        ""
                                                    }
                                                    name="TargetVar"
                                                />
                                            </div>
                                        </ResizablePanel>
                                        <ResizableHandle />
                                        <ResizablePanel defaultSize={50}>
                                            <div className="flex flex-col gap-2">
                                                <Label>
                                                    To Be Standardized:
                                                </Label>
                                                <ScrollArea>
                                                    <div className="flex flex-col justify-start items-start h-[150px] p-2 border rounded overflow-hidden">
                                                        {availableVariables.map(
                                                            (
                                                                variable: string,
                                                                index: number
                                                            ) => (
                                                                <Badge
                                                                    key={index}
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
                                                                    {variable}
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="font-bold">
                                    Advanced
                                </AccordionTrigger>
                                <AccordionContent>
                                    <ScrollArea className="h-[175px] md:min-w-[200px]">
                                        <ResizablePanelGroup
                                            direction="vertical"
                                            className="min-h-[225px] rounded-lg border md:min-w-[200px]"
                                        >
                                            {/* Advanced Options */}
                                            <ResizablePanel defaultSize={53}>
                                                <div className="flex flex-col gap-1 p-2">
                                                    <Label className="font-bold">
                                                        CF Tree Tuning Criteria
                                                    </Label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center space-x-2">
                                                                <Label className="w-[150px]">
                                                                    Initial
                                                                    Distance
                                                                    Change
                                                                    Treshold:
                                                                </Label>
                                                                <div className="w-[150px]">
                                                                    <Input
                                                                        id="NoiseThreshold"
                                                                        type="number"
                                                                        placeholder=""
                                                                        value={
                                                                            optionsState.NoiseThreshold ??
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleChange(
                                                                                "NoiseThreshold",
                                                                                Number(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Label className="w-[150px]">
                                                                    Maximum
                                                                    Branch:
                                                                </Label>
                                                                <div className="w-[150px]">
                                                                    <Input
                                                                        id="MxBranch"
                                                                        type="number"
                                                                        placeholder=""
                                                                        value={
                                                                            optionsState.MxBranch ??
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleChange(
                                                                                "MxBranch",
                                                                                Number(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center space-x-2">
                                                                <Label className="w-[150px]">
                                                                    Maximum
                                                                    Depth:
                                                                </Label>
                                                                <div className="w-[150px]">
                                                                    <Input
                                                                        id="MxDepth"
                                                                        type="number"
                                                                        placeholder=""
                                                                        value={
                                                                            optionsState.MxDepth ??
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleChange(
                                                                                "MxDepth",
                                                                                Number(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Label className="w-[150px]">
                                                                    Maximum
                                                                    Number of
                                                                    Nodes:
                                                                </Label>
                                                                <div className="w-[150px]">
                                                                    <Input
                                                                        id="MaxNodes"
                                                                        type="number"
                                                                        placeholder=""
                                                                        value={
                                                                            optionsState.MaxNodes ??
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleChange(
                                                                                "MaxNodes",
                                                                                Number(
                                                                                    e
                                                                                        .target
                                                                                        .value
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
                                            <ResizableHandle />
                                            <ResizablePanel defaultSize={47}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label className="font-bold">
                                                        Cluster Model Update
                                                    </Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="ImportCFTree"
                                                            checked={
                                                                optionsState.ImportCFTree
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                handleChange(
                                                                    "ImportCFTree",
                                                                    checked
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor="ImportCFTree"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Import CF Tree XML
                                                            File
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-2 pl-6">
                                                        <Label className="w-[150px]">
                                                            CF Tree Name:
                                                        </Label>
                                                        <div>
                                                            <Input
                                                                id="CFTreeName"
                                                                type="file"
                                                                placeholder=""
                                                                disabled={
                                                                    !optionsState.ImportCFTree
                                                                }
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        "CFTreeName",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </ScrollArea>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
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
