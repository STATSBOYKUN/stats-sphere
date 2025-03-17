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
    KMeansClusterDialogProps,
    KMeansClusterMainType,
} from "@/models/classify/k-means-cluster/k-means-cluster";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { useModal } from "@/hooks/useModal";

export const KMeansClusterDialog = ({
    isMainOpen,
    setIsMainOpen,
    setIsIterateOpen,
    setIsSaveOpen,
    setIsOptionsOpen,
    updateFormData,
    data,
    globalVariables,
    onContinue,
    onReset,
}: KMeansClusterDialogProps) => {
    const [mainState, setMainState] = useState<KMeansClusterMainType>({
        ...data,
    });
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);

    const { closeModal } = useModal();

    useEffect(() => {
        setMainState({ ...data });
        setAvailableVariables(globalVariables);
    }, [data, globalVariables]);

    useEffect(() => {
        const usedVariables = [
            ...(mainState.TargetVar || []),
            mainState.CaseTarget,
        ].filter(Boolean);

        const updatedVariables = globalVariables.filter(
            (variable) => !usedVariables.includes(variable)
        );
        setAvailableVariables(updatedVariables);
    }, [mainState]);

    const handleChange = (
        field: keyof KMeansClusterMainType,
        value: CheckedState | number | boolean | string | null
    ) => {
        setMainState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDrop = (target: string, variable: string) => {
        setMainState((prev) => {
            const updatedState = { ...prev };
            if (target === "CaseTarget") {
                updatedState.CaseTarget = variable;
            } else if (target === "TargetVar") {
                updatedState.TargetVar = [
                    ...(updatedState.TargetVar || []),
                    variable,
                ];
            }
            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setMainState((prev) => {
            const updatedState = { ...prev };
            if (target === "CaseTarget") {
                updatedState.CaseTarget = "";
            } else if (target === "TargetVar") {
                updatedState.TargetVar = (updatedState.TargetVar || []).filter(
                    (item) => item !== variable
                );
            }
            return updatedState;
        });
    };

    const handleMethodGrp = (value: string) => {
        setMainState((prevState) => ({
            ...prevState,
            IterateClassify: value === "IterateClassify",
            ClassifyOnly: value === "ClassifyOnly",
        }));
    };

    const handleReadGrp = (value: string) => {
        setMainState((prevState) => ({
            ...prevState,
            OpenDataset: value === "OpenDataset",
            ExternalDatafile: value === "ExternalDatafile",
        }));
    };

    const handleWriteGrp = (value: string) => {
        setMainState((prevState) => ({
            ...prevState,
            NewDataset: value === "NewDataset",
            DataFile: value === "DataFile",
        }));
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof KMeansClusterMainType, value);
        });

        setIsMainOpen(false);

        onContinue(mainState);
    };

    const openDialog =
        (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
            Object.entries(mainState).forEach(([key, value]) => {
                updateFormData(key as keyof KMeansClusterMainType, value);
            });
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
                    <Button variant="outline">K-Means Cluster</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>K-Means Cluster Analysis</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col items-center gap-2">
                        <ResizablePanelGroup
                            direction="horizontal"
                            className="min-h-[200px] rounded-lg border md:min-w-[200px]"
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
                                <div className="flex flex-col h-full w-full items-start justify-start gap-2 p-2">
                                    <div
                                        className="flex flex-col gap-2 w-full"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            const variable =
                                                e.dataTransfer.getData("text");
                                            handleDrop("TargetVar", variable);
                                        }}
                                    >
                                        <Label className="font-bold">
                                            Variables:
                                        </Label>
                                        <div className="w-full h-[225px] p-2 border rounded overflow-hidden">
                                            <ScrollArea>
                                                <div className="w-full h-[225px]">
                                                    {mainState.TargetVar &&
                                                    mainState.TargetVar.length >
                                                        0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {mainState.TargetVar.map(
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
                                            value={mainState.TargetVar ?? ""}
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
                                                            "CaseTarget",
                                                            e.dataTransfer.getData(
                                                                "text"
                                                            )
                                                        );
                                                    }}
                                                    onDragOver={(e) =>
                                                        e.preventDefault()
                                                    }
                                                >
                                                    {mainState.CaseTarget ? (
                                                        <Badge
                                                            className="text-start text-sm font-light p-2 cursor-pointer"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleRemoveVariable(
                                                                    "CaseTarget"
                                                                )
                                                            }
                                                        >
                                                            {
                                                                mainState.CaseTarget
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
                                                        mainState.CaseTarget ??
                                                        ""
                                                    }
                                                    name="CaseTarget"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="font-bold">
                                                Method
                                            </Label>
                                            <RadioGroup
                                                value={
                                                    mainState.IterateClassify
                                                        ? "IterateClassify"
                                                        : "ClassifyOnly"
                                                }
                                                onValueChange={handleMethodGrp}
                                            >
                                                <div className="flex flex-row gap-2">
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem
                                                            value="IterateClassify"
                                                            id="IterateClassify"
                                                        />
                                                        <Label htmlFor="IterateClassify">
                                                            Iterate and Classify
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem
                                                            value="ClassifyOnly"
                                                            id="ClassifyOnly"
                                                        />
                                                        <Label htmlFor="ClassifyOnly">
                                                            Variables
                                                        </Label>
                                                    </div>
                                                </div>
                                            </RadioGroup>
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
                                        onClick={openDialog(setIsIterateOpen)}
                                    >
                                        Iterate...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsSaveOpen)}
                                    >
                                        Save...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsOptionsOpen)}
                                    >
                                        Options...
                                    </Button>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="font-bold">
                                    Cluster Centers
                                </AccordionTrigger>
                                <AccordionContent>
                                    <ResizablePanelGroup
                                        direction="vertical"
                                        className="min-h-[100px] rounded-lg border md:min-w-[200px]"
                                    >
                                        {/* Cluster Centers */}
                                        <ResizablePanel defaultSize={100}>
                                            <ScrollArea className="h-[100px] md:min-w-[200px]">
                                                <div className="flex flex-col gap-1 p-2">
                                                    <div className="flex flex-row gap-2 items-center">
                                                        <Label className="w-[300px]">
                                                            Number of Clusters:
                                                        </Label>
                                                        <Input
                                                            id="Cluster"
                                                            type="number"
                                                            placeholder=""
                                                            value={
                                                                mainState.Cluster ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "Cluster",
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="ReadInitial"
                                                                checked={
                                                                    mainState.ReadInitial
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleChange(
                                                                        "ReadInitial",
                                                                        checked
                                                                    )
                                                                }
                                                            />
                                                            <label
                                                                htmlFor="ReadInitial"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Read Initial
                                                            </label>
                                                        </div>
                                                        <div className="pl-6">
                                                            <RadioGroup
                                                                value={
                                                                    mainState.OpenDataset
                                                                        ? "OpenDataset"
                                                                        : "ExternalDatafile"
                                                                }
                                                                disabled={
                                                                    !mainState.ReadInitial
                                                                }
                                                                onValueChange={
                                                                    handleReadGrp
                                                                }
                                                            >
                                                                <div className="flex flex-row gap-2">
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem
                                                                            value="OpenDataset"
                                                                            id="OpenDataset"
                                                                        />
                                                                        <Label
                                                                            className="w-[175px]"
                                                                            htmlFor="OpenDataset"
                                                                        >
                                                                            Open
                                                                            Dataset
                                                                        </Label>
                                                                        <Input
                                                                            id="OpenDatasetMethod"
                                                                            type="text"
                                                                            className="min-w-2xl w-full"
                                                                            placeholder=""
                                                                            value={
                                                                                mainState.OpenDatasetMethod ??
                                                                                ""
                                                                            }
                                                                            disabled={
                                                                                !mainState.OpenDataset
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                handleChange(
                                                                                    "OpenDatasetMethod",
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-row gap-2">
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem
                                                                            value="ExternalDatafile"
                                                                            id="ExternalDatafile"
                                                                        />
                                                                        <Label
                                                                            className="w-[175px]"
                                                                            htmlFor="ExternalDatafile"
                                                                        >
                                                                            External
                                                                            Datafile
                                                                        </Label>
                                                                        <Input
                                                                            id="InitialData"
                                                                            type="file"
                                                                            className="min-w-2xl w-full"
                                                                            placeholder=""
                                                                            value={
                                                                                mainState.InitialData ??
                                                                                ""
                                                                            }
                                                                            disabled={
                                                                                !mainState.ExternalDatafile
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                handleChange(
                                                                                    "InitialData",
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </RadioGroup>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="WriteFinal"
                                                                checked={
                                                                    mainState.WriteFinal
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleChange(
                                                                        "WriteFinal",
                                                                        checked
                                                                    )
                                                                }
                                                            />
                                                            <label
                                                                htmlFor="WriteFinal"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Write Final
                                                            </label>
                                                        </div>
                                                        <div className="pl-6">
                                                            <RadioGroup
                                                                value={
                                                                    mainState.NewDataset
                                                                        ? "NewDataset"
                                                                        : "DataFile"
                                                                }
                                                                disabled={
                                                                    !mainState.WriteFinal
                                                                }
                                                                onValueChange={
                                                                    handleWriteGrp
                                                                }
                                                            >
                                                                <div className="flex flex-row gap-2">
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem
                                                                            value="NewDataset"
                                                                            id="NewDataset"
                                                                        />
                                                                        <Label
                                                                            className="w-[175px]"
                                                                            htmlFor="NewDataset"
                                                                        >
                                                                            New
                                                                            Dataset
                                                                        </Label>
                                                                        <Input
                                                                            id="NewData"
                                                                            type="text"
                                                                            className="min-w-2xl w-full"
                                                                            placeholder=""
                                                                            value={
                                                                                mainState.NewData ??
                                                                                ""
                                                                            }
                                                                            disabled={
                                                                                !mainState.NewDataset
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                handleChange(
                                                                                    "NewData",
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-row gap-1">
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem
                                                                            value="DataFile"
                                                                            id="DataFile"
                                                                        />
                                                                        <Label
                                                                            className="w-[175px]"
                                                                            htmlFor="DataFile"
                                                                        >
                                                                            Data
                                                                            File
                                                                        </Label>
                                                                        <Input
                                                                            id="FinalData"
                                                                            type="file"
                                                                            className="min-w-2xl w-full"
                                                                            placeholder=""
                                                                            value={
                                                                                mainState.FinalData ??
                                                                                ""
                                                                            }
                                                                            disabled={
                                                                                !mainState.DataFile
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                handleChange(
                                                                                    "FinalData",
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </RadioGroup>
                                                        </div>
                                                    </div>
                                                </div>
                                            </ScrollArea>
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
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
