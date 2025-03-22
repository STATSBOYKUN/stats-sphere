import React, {
    useEffect,
    useState,
    useImperativeHandle,
    forwardRef,
} from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import {
    OptScaMCADialogProps,
    OptScaMCAMainType,
    OptScaMCADefineVariableType,
    DialogHandlers,
    VariableInfoType,
} from "@/models/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModal } from "@/hooks/useModal";

export const OptScaMCADialog = forwardRef<DialogHandlers, OptScaMCADialogProps>(
    (
        {
            isMainOpen,
            setIsMainOpen,
            setIsDefineVariableOpen,
            setIsDiscretizeOpen,
            setIsMissingOpen,
            setIsOptionsOpen,
            setIsOutputOpen,
            setIsSaveOpen,
            setIsObjectPlotsOpen,
            setIsVariablePlotsOpen,
            updateFormData,
            data,
            globalVariables,
            onContinue,
            onReset,
        },
        ref
    ) => {
        const [mainState, setMainState] = useState<OptScaMCAMainType>({
            ...data,
        });
        const [availableVariables, setAvailableVariables] = useState<string[]>(
            []
        );

        // State for selected variable tracking
        const [selectedVariable, setSelectedVariable] = useState<string | null>(
            null
        );
        const [selectedTarget, setSelectedTarget] = useState<string | null>(
            null
        );
        const [formattedVariables, setFormattedVariables] = useState<{
            [key: string]: string;
        }>({});

        // State for storing variable information including weights
        const [variableInfo, setVariableInfo] = useState<VariableInfoType>({});

        const { closeModal } = useModal();

        useEffect(() => {
            setMainState({ ...data });
            setAvailableVariables(globalVariables);
        }, [data, globalVariables]);

        useEffect(() => {
            const newFormattedVariables: { [key: string]: string } = {};

            // Format all variables that exist in variableInfo with their weights
            Object.keys(variableInfo).forEach((variable) => {
                const info = variableInfo[variable];
                newFormattedVariables[variable] = `${variable} (${
                    info.weight || 1
                })`;
            });

            setFormattedVariables(newFormattedVariables);
        }, [variableInfo]);

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
        }, [mainState, globalVariables]);

        const handleChange = (
            field: keyof OptScaMCAMainType,
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

            // Clear selection if the removed variable was selected
            if (variable === selectedVariable && target === selectedTarget) {
                setSelectedVariable(null);
                setSelectedTarget(null);
            }
        };

        const handleContinue = () => {
            // Create a deep copy of mainState
            const enhancedMainState = { ...mainState };

            // Format Analysis Variables with their weights
            if (
                enhancedMainState.AnalysisVars &&
                enhancedMainState.AnalysisVars.length > 0
            ) {
                enhancedMainState.AnalysisVars =
                    enhancedMainState.AnalysisVars.map((variable) => {
                        // Use the formatted variable if available, otherwise format it
                        if (formattedVariables[variable]) {
                            return formattedVariables[variable];
                        } else {
                            // Use default formatting if no specific info exists
                            const info = variableInfo[variable] || {
                                weight: 1,
                            };
                            return `${variable} (${info.weight || 1})`;
                        }
                    });
            }

            // Update form data
            Object.entries(enhancedMainState).forEach(([key, value]) => {
                updateFormData(key as keyof OptScaMCAMainType, value);
            });

            // Close the dialog
            setIsMainOpen(false);

            // Pass the enhanced state to the parent component
            onContinue(enhancedMainState);
        };

        const openDialog =
            (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
                Object.entries(mainState).forEach(([key, value]) => {
                    updateFormData(key as keyof OptScaMCAMainType, value);
                });
                setter(true);
            };

        // Format variable for display with weight
        const formatVariable = (variable: string) => {
            if (formattedVariables[variable]) {
                return formattedVariables[variable];
            }

            // Fallback to original formatting if not found in cached values
            const info = variableInfo[variable] || {
                weight: 1,
            };

            return `${variable} (${info.weight || 1})`;
        };

        // Handle variable click to select it
        const handleVariableClick = (target: string, variable: string) => {
            setSelectedVariable(variable);
            setSelectedTarget(target);
        };

        // Update variable weight when define variable dialog is closed
        const handleDefineVariableContinue = (
            defineVariableData: OptScaMCADefineVariableType
        ) => {
            if (selectedVariable && selectedTarget === "AnalysisVars") {
                const newVariableInfo = {
                    ...variableInfo,
                    [selectedVariable]: {
                        weight: defineVariableData.VariableWeight || 1,
                    },
                };

                setVariableInfo(newVariableInfo);

                // Keep the variable selected after updating
                setSelectedVariable(selectedVariable);
                setSelectedTarget("AnalysisVars");
            }
        };

        const handleDialog = () => {
            setIsMainOpen(false);
            closeModal();
        };

        // Expose handler functions for container
        useImperativeHandle(ref, () => ({
            handleDefineVariableContinue,
        }));

        return (
            <>
                {/* Main Dialog */}
                <Dialog open={isMainOpen} onOpenChange={handleDialog}>
                    <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>
                                Multiple Correspondence Analysis
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
                                                        Analysis Variables:{" "}
                                                    </Label>
                                                    <div className="w-full h-[100px] p-2 border rounded overflow-hidden">
                                                        <ScrollArea>
                                                            <div className="w-full h-[100px]">
                                                                {mainState.AnalysisVars &&
                                                                mainState
                                                                    .AnalysisVars
                                                                    .length >
                                                                    0 ? (
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
                                                                                    variant={
                                                                                        selectedVariable ===
                                                                                            variable &&
                                                                                        selectedTarget ===
                                                                                            "AnalysisVars"
                                                                                            ? "default"
                                                                                            : "outline"
                                                                                    }
                                                                                    onClick={() =>
                                                                                        handleVariableClick(
                                                                                            "AnalysisVars",
                                                                                            variable
                                                                                        )
                                                                                    }
                                                                                    onContextMenu={(
                                                                                        e
                                                                                    ) => {
                                                                                        e.preventDefault();
                                                                                        handleRemoveVariable(
                                                                                            "AnalysisVars",
                                                                                            variable
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    {formatVariable(
                                                                                        variable
                                                                                    )}
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
                                                        setIsDefineVariableOpen
                                                    )}
                                                    disabled={
                                                        !selectedVariable ||
                                                        selectedTarget !==
                                                            "AnalysisVars"
                                                    }
                                                >
                                                    Define Variable Weight...
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="w-full">
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
                                                        Supplementary Variables:{" "}
                                                    </Label>
                                                    <div className="w-full h-[100px] p-2 border rounded overflow-hidden">
                                                        <ScrollArea>
                                                            <div className="w-full h-[100px]">
                                                                {mainState.SuppleVars &&
                                                                mainState
                                                                    .SuppleVars
                                                                    .length >
                                                                    0 ? (
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
                                                                                    variant={
                                                                                        selectedVariable ===
                                                                                            variable &&
                                                                                        selectedTarget ===
                                                                                            "SuppleVars"
                                                                                            ? "default"
                                                                                            : "outline"
                                                                                    }
                                                                                    onClick={() =>
                                                                                        handleVariableClick(
                                                                                            "SuppleVars",
                                                                                            variable
                                                                                        )
                                                                                    }
                                                                                    onContextMenu={(
                                                                                        e
                                                                                    ) => {
                                                                                        e.preventDefault();
                                                                                        handleRemoveVariable(
                                                                                            "SuppleVars",
                                                                                            variable
                                                                                        );
                                                                                    }}
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
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="w-full">
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
                                                        Labeling Variables:{" "}
                                                    </Label>
                                                    <div className="w-full h-[100px] p-2 border rounded overflow-hidden">
                                                        <ScrollArea>
                                                            <div className="w-full h-[100px]">
                                                                {mainState.LabelingVars &&
                                                                mainState
                                                                    .LabelingVars
                                                                    .length >
                                                                    0 ? (
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
                                                                                    variant={
                                                                                        selectedVariable ===
                                                                                            variable &&
                                                                                        selectedTarget ===
                                                                                            "LabelingVars"
                                                                                            ? "default"
                                                                                            : "outline"
                                                                                    }
                                                                                    onClick={() =>
                                                                                        handleVariableClick(
                                                                                            "LabelingVars",
                                                                                            variable
                                                                                        )
                                                                                    }
                                                                                    onContextMenu={(
                                                                                        e
                                                                                    ) => {
                                                                                        e.preventDefault();
                                                                                        handleRemoveVariable(
                                                                                            "LabelingVars",
                                                                                            variable
                                                                                        );
                                                                                    }}
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
                                                                    e.target
                                                                        .value
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
                                            onClick={openDialog(
                                                setIsMissingOpen
                                            )}
                                        >
                                            Missing...
                                        </Button>
                                        <Button
                                            className="w-full"
                                            type="button"
                                            variant="secondary"
                                            onClick={openDialog(
                                                setIsOptionsOpen
                                            )}
                                        >
                                            Options...
                                        </Button>
                                        <Button
                                            className="w-full"
                                            type="button"
                                            variant="secondary"
                                            onClick={openDialog(
                                                setIsOutputOpen
                                            )}
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
                                                setIsVariablePlotsOpen
                                            )}
                                        >
                                            Variable...
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
    }
);
