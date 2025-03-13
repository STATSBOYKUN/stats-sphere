import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import {
    HierClusDialogProps,
    HierClusMainType,
} from "@/models/classify/hierarchical-cluster/hierarchical-cluster";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModal } from "@/hooks/useModal";

export const HierClusDialog = ({
    isMainOpen,
    setIsMainOpen,
    setIsStatisticsOpen,
    setIsPlotsOpen,
    setIsSaveOpen,
    setIsMethodOpen,
    updateFormData,
    data,
    globalVariables,
    onContinue,
    onReset,
}: HierClusDialogProps) => {
    const [mainState, setMainState] = useState<HierClusMainType>({ ...data });
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);

    const { closeModal } = useModal();

    useEffect(() => {
        setMainState({ ...data });
        setAvailableVariables(globalVariables);
    }, [data, globalVariables]);

    useEffect(() => {
        const usedVariables = [
            ...(mainState.Variables || []),
            mainState.LabelCases,
        ].filter(Boolean);

        const updatedVariables = globalVariables.filter(
            (variable) => !usedVariables.includes(variable)
        );
        setAvailableVariables(updatedVariables);
    }, [mainState]);

    const handleChange = (
        field: keyof HierClusMainType,
        value: CheckedState | boolean | string | null
    ) => {
        setMainState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDrop = (target: string, variable: string) => {
        setMainState((prev) => {
            const updatedState = { ...prev };
            if (target === "LabelCases") {
                updatedState.LabelCases = variable;
            } else if (target === "Variables") {
                updatedState.Variables = [
                    ...(updatedState.Variables || []),
                    variable,
                ];
            }
            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setMainState((prev) => {
            const updatedState = { ...prev };
            if (target === "LabelCases") {
                updatedState.LabelCases = "";
            } else if (target === "Variables") {
                updatedState.Variables = (updatedState.Variables || []).filter(
                    (item) => item !== variable
                );
            }
            return updatedState;
        });
    };

    const handleClusterGrp = (value: string) => {
        setMainState((prev) => ({
            ...prev,
            ClusterCases: value === "ClusterCases",
            ClusterVar: value === "ClusterVar",
        }));
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof HierClusMainType, value);
        });

        setIsMainOpen(false);

        onContinue(mainState);
    };

    const openDialog =
        (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
            setter(true);
        };

    const handleDialog = () => {
        setIsMainOpen(false);
        closeModal();
    };

    return (
        <>
            {/* Main Dialog */}
            <Dialog open={isMainOpen} onOpenChange={handleDialog}>
                <DialogTrigger asChild>
                    <Button variant="outline">Hierarchical Cluster</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Hierarchical Cluster Analysis</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex items-center space-x-2">
                        <ResizablePanelGroup
                            direction="horizontal"
                            className="min-h-[400px] rounded-lg border md:min-w-[200px]"
                        >
                            {/* Variable List */}
                            <ResizablePanel defaultSize={25}>
                                <ScrollArea>
                                    <div className="flex flex-col gap-1 justify-start items-start h-[400px] w-full p-2">
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
                                                    onDragStart={(e) =>
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
                            </ResizablePanel>
                            <ResizableHandle withHandle />

                            {/* Defining Variable */}
                            <ResizablePanel defaultSize={55}>
                                <div className="flex flex-col h-full w-full items-start justify-start gap-6 p-2">
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            const variable =
                                                e.dataTransfer.getData("text");
                                            handleDrop("Variables", variable);
                                        }}
                                    >
                                        <Label className="font-bold">
                                            Independents:
                                        </Label>
                                        <div className="w-full h-[100px] p-2 border rounded overflow-hidden">
                                            <ScrollArea>
                                                <div className="w-full h-[100px]">
                                                    {mainState.Variables &&
                                                    mainState.Variables.length >
                                                        0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {mainState.Variables.map(
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
                                                                                "Variables",
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
                                                            Drop variables here.
                                                        </span>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                        <input
                                            type="hidden"
                                            value={mainState.Variables ?? ""}
                                            name="Independents"
                                        />
                                    </div>
                                    <div className="flex flex-col w-full gap-2">
                                        <div>
                                            <Label className="font-bold">
                                                Label Cases by:
                                            </Label>
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-full min-h-[40px] p-2 border rounded"
                                                    onDrop={(e) => {
                                                        handleDrop(
                                                            "LabelCases",
                                                            e.dataTransfer.getData(
                                                                "text"
                                                            )
                                                        );
                                                    }}
                                                    onDragOver={(e) =>
                                                        e.preventDefault()
                                                    }
                                                >
                                                    {mainState.LabelCases ? (
                                                        <Badge
                                                            className="text-start text-sm font-light p-2 cursor-pointer"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleRemoveVariable(
                                                                    "LabelCases"
                                                                )
                                                            }
                                                        >
                                                            {
                                                                mainState.LabelCases
                                                            }
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm font-light text-gray-500">
                                                            Drop variables here.
                                                        </span>
                                                    )}
                                                </div>
                                                <input
                                                    type="hidden"
                                                    value={
                                                        mainState.LabelCases ??
                                                        ""
                                                    }
                                                    name="LabelCases"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="font-bold">
                                                Cluster
                                            </Label>
                                            <RadioGroup
                                                defaultValue="ClusterCases"
                                                value={
                                                    mainState.ClusterCases
                                                        ? "ClusterCases"
                                                        : mainState.ClusterVar
                                                        ? "ClusterVar"
                                                        : "ClusterCases"
                                                }
                                                onValueChange={handleClusterGrp}
                                            >
                                                <div className="flex flex-row gap-2">
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem
                                                            value="ClusterCases"
                                                            id="ClusterCases"
                                                        />
                                                        <Label htmlFor="ClusterCases">
                                                            Cases
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem
                                                            value="ClusterVar"
                                                            id="ClusterVar"
                                                        />
                                                        <Label htmlFor="ClusterVar">
                                                            Variables
                                                        </Label>
                                                    </div>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Label className="font-bold">
                                                Display
                                            </Label>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="DispStats"
                                                    checked={
                                                        mainState.DispStats
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "DispStats",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="DispStats"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Statistics
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="DispPlots"
                                                    checked={
                                                        mainState.DispPlots
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "DispPlots",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="DispPlots"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Plots
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ResizablePanel>

                            {/* Tools Area */}
                            <ResizablePanel defaultSize={20}>
                                <div className="flex flex-col h-full items-start justify-start gap-1 p-2">
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(
                                            setIsStatisticsOpen
                                        )}
                                    >
                                        Statistics...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsPlotsOpen)}
                                    >
                                        Plots...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsMethodOpen)}
                                    >
                                        Method...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsSaveOpen)}
                                    >
                                        Save...
                                    </Button>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button type="button" onClick={handleContinue}>
                            OK
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onReset}
                        >
                            Reset
                        </Button>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="button" variant="secondary">
                            Help
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
