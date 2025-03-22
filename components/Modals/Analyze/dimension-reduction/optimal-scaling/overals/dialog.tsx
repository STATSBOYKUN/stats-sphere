import React, {
    useEffect,
    useState,
    forwardRef,
    useImperativeHandle,
} from "react";
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
    OptScaOveralsDialogProps,
    OptScaOveralsMainType,
    OptScaOveralsDefineRangeType,
    OptScaOveralsDefineRangeScaleType,
    DialogHandlers,
    VariableInfoType,
} from "@/models/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModal } from "@/hooks/useModal";

export const OptScaOveralsDialog = forwardRef<
    DialogHandlers,
    OptScaOveralsDialogProps
>(
    (
        {
            isMainOpen,
            setIsMainOpen,
            setIsDefineRangeScaleOpen,
            setIsDefineRangeOpen,
            setIsOptionsOpen,
            updateFormData,
            data,
            globalVariables,
            onContinue,
            onReset,
        },
        ref
    ) => {
        const [mainState, setMainState] = useState<OptScaOveralsMainType>({
            ...data,
        });
        const [availableVariables, setAvailableVariables] = useState<string[]>(
            []
        );

        // State for selected variable
        const [selectedVariable, setSelectedVariable] = useState<string | null>(
            null
        );
        const [selectedTarget, setSelectedTarget] = useState<string | null>(
            null
        );
        const [formattedVariables, setFormattedVariables] = useState<{
            [key: string]: string;
        }>({});

        // State for variable information
        const [variableInfo, setVariableInfo] = useState<VariableInfoType>({});

        const { closeModal } = useModal();

        useEffect(() => {
            setMainState({ ...data });
            setAvailableVariables(globalVariables);
        }, [data, globalVariables]);

        // Update available variables when used variables change
        useEffect(() => {
            const usedVariables = [
                ...(mainState.SetTargetVariable || []),
                ...(mainState.PlotsTargetVariable || []),
            ].filter(Boolean);

            const updatedVariables = globalVariables.filter(
                (variable) => !usedVariables.includes(variable)
            );
            setAvailableVariables(updatedVariables);
        }, [mainState, globalVariables]);

        // Update formatted variables when variableInfo or mainState changes
        useEffect(() => {
            const newFormattedVariables: { [key: string]: string } = {};

            // First, process all variables in variableInfo
            Object.keys(variableInfo).forEach((variable) => {
                const info = variableInfo[variable];

                // Format variables based on their list membership
                if (
                    mainState.SetTargetVariable &&
                    mainState.SetTargetVariable.includes(variable)
                ) {
                    newFormattedVariables[variable] = `${variable} (${
                        info.measScale || "Ordinal"
                    } ${info.minimum || 1} ${info.maximum || 5})`;
                } else if (
                    mainState.PlotsTargetVariable &&
                    mainState.PlotsTargetVariable.includes(variable)
                ) {
                    newFormattedVariables[variable] = `${variable} (${
                        info.minimum || 1
                    }-${info.maximum || 5})`;
                } else {
                    newFormattedVariables[variable] = `${variable}`;
                }
            });

            // Next, ensure all variables in either list have a formatted version
            // This handles cases where a variable might be in a list but not yet in variableInfo
            if (mainState.SetTargetVariable) {
                mainState.SetTargetVariable.forEach((variable) => {
                    if (!newFormattedVariables[variable]) {
                        newFormattedVariables[
                            variable
                        ] = `${variable} (Ordinal 1 5)`;
                    }
                });
            }

            if (mainState.PlotsTargetVariable) {
                mainState.PlotsTargetVariable.forEach((variable) => {
                    if (!newFormattedVariables[variable]) {
                        newFormattedVariables[variable] = `${variable} (1-5)`;
                    }
                });
            }

            setFormattedVariables(newFormattedVariables);
        }, [
            variableInfo,
            mainState.SetTargetVariable,
            mainState.PlotsTargetVariable,
        ]);

        const handleChange = (
            field: keyof OptScaOveralsMainType,
            value: number | string | null
        ) => {
            setMainState((prevState) => ({
                ...prevState,
                [field]: value,
            }));
        };

        const handleDrop = (target: string, variable: string) => {
            // Update variable info with default values when dropped
            if (target === "SetTargetVariable") {
                // For SetTargetVariable, add default measurement scale info
                const newVariableInfo = {
                    ...variableInfo,
                    [variable]: {
                        measScale: "Ordinal",
                        minimum: 1,
                        maximum: 5,
                    },
                };
                setVariableInfo(newVariableInfo);
            } else if (target === "PlotsTargetVariable") {
                // For PlotsTargetVariable, add default range info
                const newVariableInfo = {
                    ...variableInfo,
                    [variable]: {
                        minimum: 1,
                        maximum: 5,
                    },
                };
                setVariableInfo(newVariableInfo);
            }

            // Update main state with the new variable
            setMainState((prev) => {
                const updatedState = { ...prev };
                if (target === "SetTargetVariable") {
                    updatedState.SetTargetVariable = [
                        ...(updatedState.SetTargetVariable || []),
                        variable,
                    ];
                } else if (target === "PlotsTargetVariable") {
                    updatedState.PlotsTargetVariable = [
                        ...(updatedState.PlotsTargetVariable || []),
                        variable,
                    ];
                }
                return updatedState;
            });
        };

        const handleRemoveVariable = (target: string, variable?: string) => {
            setMainState((prev) => {
                const updatedState = { ...prev };
                if (target === "SetTargetVariable") {
                    updatedState.SetTargetVariable = (
                        updatedState.SetTargetVariable || []
                    ).filter((item) => item !== variable);
                } else if (target === "PlotsTargetVariable") {
                    updatedState.PlotsTargetVariable = (
                        updatedState.PlotsTargetVariable || []
                    ).filter((item) => item !== variable);
                }
                return updatedState;
            });
        };

        // Handle variable click to select it
        const handleVariableClick = (target: string, variable: string) => {
            setSelectedVariable(variable);
            setSelectedTarget(target);
        };

        // Format variable for display
        const formatVariable = (variable: string) => {
            if (formattedVariables[variable]) {
                return formattedVariables[variable];
            }

            // Default formatting if not found in cached values
            const info = variableInfo[variable] || {
                measScale: "Ordinal",
                minimum: 1,
                maximum: 5,
            };

            // Format based on the target list the variable belongs to, not the currently selected target
            if (
                mainState.SetTargetVariable &&
                mainState.SetTargetVariable.includes(variable)
            ) {
                return `${variable} (${info.measScale} ${info.minimum} ${info.maximum})`;
            } else if (
                mainState.PlotsTargetVariable &&
                mainState.PlotsTargetVariable.includes(variable)
            ) {
                return `${variable} (${info.minimum}-${info.maximum})`;
            } else {
                return variable;
            }
        };

        // Update variable when Define Range Scale dialog is closed
        const handleDefineRangeScaleContinue = (
            defineRangeScaleData: OptScaOveralsDefineRangeScaleType
        ) => {
            if (selectedVariable && selectedTarget === "SetTargetVariable") {
                // Determine the selected measurement scale
                let measScale = "Ordinal";
                if (defineRangeScaleData.Ordinal) measScale = "Ordinal";
                else if (defineRangeScaleData.SingleNominal)
                    measScale = "Single Nominal";
                else if (defineRangeScaleData.MultipleNominal)
                    measScale = "Multiple Nominal";
                else if (defineRangeScaleData.DiscreteNumeric)
                    measScale = "Discrete Numeric";

                // Update variable info
                const newVariableInfo = {
                    ...variableInfo,
                    [selectedVariable]: {
                        measScale: measScale,
                        minimum: defineRangeScaleData.Minimum || 1,
                        maximum: defineRangeScaleData.Maximum || 5,
                    },
                };

                setVariableInfo(newVariableInfo);

                // Keep the variable selected
                setSelectedVariable(selectedVariable);
                setSelectedTarget("SetTargetVariable");
            }
        };

        // Update variable when Define Range dialog is closed
        const handleDefineRangeContinue = (
            defineRangeData: OptScaOveralsDefineRangeType
        ) => {
            if (selectedVariable && selectedTarget === "PlotsTargetVariable") {
                // Update variable info for plotting variables
                const newVariableInfo = {
                    ...variableInfo,
                    [selectedVariable]: {
                        ...variableInfo[selectedVariable],
                        minimum: defineRangeData.Minimum || 1,
                        maximum: defineRangeData.Maximum || 5,
                    },
                };

                setVariableInfo(newVariableInfo);

                // Keep the variable selected
                setSelectedVariable(selectedVariable);
                setSelectedTarget("PlotsTargetVariable");
            }
        };

        // Enhanced handleContinue that adds formatting
        const handleContinue = () => {
            // Create a deep copy of mainState
            const enhancedMainState = { ...mainState };

            // Format Set Variables
            if (
                enhancedMainState.SetTargetVariable &&
                enhancedMainState.SetTargetVariable.length > 0
            ) {
                enhancedMainState.SetTargetVariable =
                    enhancedMainState.SetTargetVariable.map((variable) => {
                        if (formattedVariables[variable]) {
                            return formattedVariables[variable];
                        } else {
                            const info = variableInfo[variable] || {
                                measScale: "Ordinal",
                                minimum: 1,
                                maximum: 5,
                            };
                            return `${variable} (${info.measScale} ${info.minimum} ${info.maximum})`;
                        }
                    });
            }

            // Format Plots Variables
            if (
                enhancedMainState.PlotsTargetVariable &&
                enhancedMainState.PlotsTargetVariable.length > 0
            ) {
                enhancedMainState.PlotsTargetVariable =
                    enhancedMainState.PlotsTargetVariable.map((variable) => {
                        if (formattedVariables[variable]) {
                            return formattedVariables[variable];
                        } else {
                            const info = variableInfo[variable] || {
                                minimum: 1,
                                maximum: 5,
                            };
                            return `${variable} (${info.minimum}-${info.maximum})`;
                        }
                    });
            }

            // Update form data
            Object.entries(enhancedMainState).forEach(([key, value]) => {
                updateFormData(key as keyof OptScaOveralsMainType, value);
            });

            // Close the dialog
            setIsMainOpen(false);

            // Pass the enhanced state to the parent component
            onContinue(enhancedMainState);
        };

        const openDialog =
            (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
                Object.entries(mainState).forEach(([key, value]) => {
                    updateFormData(key as keyof OptScaOveralsMainType, value);
                });
                setter(true);
            };

        const handleDialog = () => {
            setIsMainOpen(false);
            closeModal();
        };

        // Expose handlers to parent component
        useImperativeHandle(ref, () => ({
            handleDefineRangeScaleContinue,
            handleDefineRangeContinue,
        }));

        return (
            <>
                {/* Main Dialog */}
                <Dialog open={isMainOpen} onOpenChange={handleDialog}>
                    <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>
                                Nonlinear Canonical Correlation Analysis
                                (OVERALS)
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
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious href="#" />
                                                </PaginationItem>
                                                <PaginationItem>
                                                    <PaginationLink href="#">
                                                        1
                                                    </PaginationLink>
                                                </PaginationItem>
                                                <PaginationItem>
                                                    <PaginationLink
                                                        href="#"
                                                        isActive
                                                    >
                                                        2
                                                    </PaginationLink>
                                                </PaginationItem>
                                                <PaginationItem>
                                                    <PaginationLink href="#">
                                                        3
                                                    </PaginationLink>
                                                </PaginationItem>
                                                <PaginationItem>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                                <PaginationItem>
                                                    <PaginationNext href="#" />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                        <div className="flex flex-col gap-1">
                                            <div className="w-full">
                                                <Label className="font-bold">
                                                    Variables:{" "}
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
                                                            "SetTargetVariable",
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
                                                                {mainState.SetTargetVariable &&
                                                                mainState
                                                                    .SetTargetVariable
                                                                    .length >
                                                                    0 ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {mainState.SetTargetVariable.map(
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
                                                                                            "SetTargetVariable"
                                                                                            ? "default"
                                                                                            : "outline"
                                                                                    }
                                                                                    onClick={() =>
                                                                                        handleVariableClick(
                                                                                            "SetTargetVariable",
                                                                                            variable
                                                                                        )
                                                                                    }
                                                                                    onContextMenu={(
                                                                                        e
                                                                                    ) => {
                                                                                        e.preventDefault();
                                                                                        handleRemoveVariable(
                                                                                            "SetTargetVariable",
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
                                                            mainState.SetTargetVariable ??
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
                                                    disabled={
                                                        !selectedVariable ||
                                                        selectedTarget !==
                                                            "SetTargetVariable"
                                                    }
                                                >
                                                    Define Range and Scale...
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="w-full">
                                                <Label className="font-bold">
                                                    Label Object Score Plot(s)
                                                    by:{" "}
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
                                                            "PlotsTargetVariable",
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
                                                                {mainState.PlotsTargetVariable &&
                                                                mainState
                                                                    .PlotsTargetVariable
                                                                    .length >
                                                                    0 ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {mainState.PlotsTargetVariable.map(
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
                                                                                            "PlotsTargetVariable"
                                                                                            ? "default"
                                                                                            : "outline"
                                                                                    }
                                                                                    onClick={() =>
                                                                                        handleVariableClick(
                                                                                            "PlotsTargetVariable",
                                                                                            variable
                                                                                        )
                                                                                    }
                                                                                    onContextMenu={(
                                                                                        e
                                                                                    ) => {
                                                                                        e.preventDefault();
                                                                                        handleRemoveVariable(
                                                                                            "PlotsTargetVariable",
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
                                                            mainState.PlotsTargetVariable ??
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
                                                        setIsDefineRangeOpen
                                                    )}
                                                    disabled={
                                                        !selectedVariable ||
                                                        selectedTarget !==
                                                            "PlotsTargetVariable"
                                                    }
                                                >
                                                    Define Range...
                                                </Button>
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
                                </ResizablePanel>

                                {/* Tools Area */}
                                <ResizablePanel defaultSize={20}>
                                    <div className="flex flex-col h-full items-start justify-start gap-1 p-2">
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
