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
    OptScaCatpcaDialogProps,
    OptScaCatpcaMainType,
} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModal } from "@/hooks/useModal";

export const OptScaCatpcaDialog = ({
    isMainOpen,
    setIsMainOpen,
    setIsDefineRangeScaleOpen,
    setIsDefineScaleOpen,
    setIsDiscretizeOpen,
    setIsMissingOpen,
    setIsOptionsOpen,
    setIsOutputOpen,
    setIsSaveOpen,
    setIsBootstrapOpen,
    setIsObjectPlotsOpen,
    setIsCategoryPlotsOpen,
    setIsLoadingPlotsOpen,
    updateFormData,
    data,
    globalVariables,
    onContinue,
    onReset,
}: OptScaCatpcaDialogProps) => {
    const [mainState, setMainState] = useState<OptScaCatpcaMainType>({
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
            ...(mainState.AnalysisVars || []),
            ...(mainState.SuppleVars || []),
            ...(mainState.LabelingVars || []),
        ].filter(Boolean);

        const updatedVariables = globalVariables.filter(
            (variable) => !usedVariables.includes(variable)
        );
        setAvailableVariables(updatedVariables);
    }, [mainState]);

    const handleChange = (
        field: keyof OptScaCatpcaMainType,
        value: number | string | null
    ) => {
        setMainState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDrop = (target: string, variable: string) => {
        setMainState((prev) => {
            const updatedState = { ...prev };
            if (target === "AnalysisVars") {
                updatedState.AnalysisVars = [
                    ...(updatedState.AnalysisVars || []),
                    variable,
                ];
            } else if (target === "SuppleVars") {
                updatedState.SuppleVars = [
                    ...(updatedState.SuppleVars || []),
                    variable,
                ];
            } else if (target === "LabelingVars") {
                updatedState.LabelingVars = [
                    ...(updatedState.LabelingVars || []),
                    variable,
                ];
            }
            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setMainState((prev) => {
            const updatedState = { ...prev };
            if (target === "AnalysisVars") {
                updatedState.AnalysisVars = (
                    updatedState.AnalysisVars || []
                ).filter((item) => item !== variable);
            } else if (target === "SuppleVars") {
                updatedState.SuppleVars = (
                    updatedState.SuppleVars || []
                ).filter((item) => item !== variable);
            } else if (target === "LabelingVars") {
                updatedState.LabelingVars = (
                    updatedState.LabelingVars || []
                ).filter((item) => item !== variable);
            }
            return updatedState;
        });
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaCatpcaMainType, value);
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
            <Dialog open={isMainOpen} onOpenChange={setIsMainOpen}>
                {/*<DialogTrigger asChild>*/}
                {/*    <Button variant="outline">Categorical Principal Components</Button>*/}
                {/*</DialogTrigger>*/}
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            Categorical Principal Components
                        </DialogTitle>
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
                                <div className="flex flex-col gap-4 p-2">
                                    <div className="flex flex-col gap-1">
                                        <div className="w-full">
                                            <Label className="font-bold">
                                                Analysis Variables:{" "}
                                            </Label>
                                            <div
                                                onDragOver={(e) =>
                                                    e.preventDefault()
                                                }
                                                onDrop={(e) => {
                                                    const variable =
                                                        e.dataTransfer.getData(
                                                            "text"
                                                        );
                                                    handleDrop(
                                                        "AnalysisVars",
                                                        variable
                                                    );
                                                }}
                                            >
                                                <Label className="font-bold">
                                                    Independents:
                                                </Label>
                                                <div className="w-full h-[100px] p-2 border rounded overflow-hidden">
                                                    <ScrollArea>
                                                        <div className="w-full h-[100px]">
                                                            {mainState.AnalysisVars &&
                                                            mainState
                                                                .AnalysisVars
                                                                .length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {mainState.AnalysisVars.map(
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
                                                                                        "AnalysisVars",
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
                                                        mainState.AnalysisVars ??
                                                        ""
                                                    }
                                                    name="Independents"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={openDialog(
                                                    setIsDefineRangeScaleOpen
                                                )}
                                            >
                                                Define Range and Scale...
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="w-full">
                                            <Label className="font-bold">
                                                Supplementary Variables:{" "}
                                            </Label>
                                            <div
                                                onDragOver={(e) =>
                                                    e.preventDefault()
                                                }
                                                onDrop={(e) => {
                                                    const variable =
                                                        e.dataTransfer.getData(
                                                            "text"
                                                        );
                                                    handleDrop(
                                                        "SuppleVars",
                                                        variable
                                                    );
                                                }}
                                            >
                                                <Label className="font-bold">
                                                    Independents:
                                                </Label>
                                                <div className="w-full h-[100px] p-2 border rounded overflow-hidden">
                                                    <ScrollArea>
                                                        <div className="w-full h-[100px]">
                                                            {mainState.SuppleVars &&
                                                            mainState.SuppleVars
                                                                .length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {mainState.SuppleVars.map(
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
                                                                                        "SuppleVars",
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
                                                        mainState.SuppleVars ??
                                                        ""
                                                    }
                                                    name="Independents"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={openDialog(
                                                    setIsDefineScaleOpen
                                                )}
                                            >
                                                Define Scale...
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="w-full">
                                            <Label className="font-bold">
                                                Labeling Variables:{" "}
                                            </Label>
                                            <div
                                                onDragOver={(e) =>
                                                    e.preventDefault()
                                                }
                                                onDrop={(e) => {
                                                    const variable =
                                                        e.dataTransfer.getData(
                                                            "text"
                                                        );
                                                    handleDrop(
                                                        "LabelingVars",
                                                        variable
                                                    );
                                                }}
                                            >
                                                <Label className="font-bold">
                                                    Independents:
                                                </Label>
                                                <div className="w-full h-[100px] p-2 border rounded overflow-hidden">
                                                    <ScrollArea>
                                                        <div className="w-full h-[100px]">
                                                            {mainState.LabelingVars &&
                                                            mainState
                                                                .LabelingVars
                                                                .length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {mainState.LabelingVars.map(
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
                                                                                        "LabelingVars",
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
                                                        mainState.LabelingVars ??
                                                        ""
                                                    }
                                                    name="Independents"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Label className="w-[150px]">
                                                Dimension in Solution:
                                            </Label>
                                            <div className="w-[75px]">
                                                <Input
                                                    id="Dimensions"
                                                    type="number"
                                                    placeholder=""
                                                    value={
                                                        mainState.Dimensions ??
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "Dimensions",
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
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
                                            setIsDiscretizeOpen
                                        )}
                                    >
                                        Discretize...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsMissingOpen)}
                                    >
                                        Missing...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsOptionsOpen)}
                                    >
                                        Options...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsOutputOpen)}
                                    >
                                        Output...
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
                                        onClick={openDialog(setIsBootstrapOpen)}
                                    >
                                        Bootstrap...
                                    </Button>
                                    <Separator className="my-2" />
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(
                                            setIsObjectPlotsOpen
                                        )}
                                    >
                                        Object...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(
                                            setIsCategoryPlotsOpen
                                        )}
                                    >
                                        Category...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(
                                            setIsLoadingPlotsOpen
                                        )}
                                    >
                                        Loading...
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
