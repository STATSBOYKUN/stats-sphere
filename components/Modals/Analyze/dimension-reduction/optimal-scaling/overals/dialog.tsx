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
import { cn } from "@/lib/utils";

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
        // Initialize with data or default values, ensuring SetTargetVariable is a 2D array
        const initialMainState = () => {
            const state = { ...data };
            // Convert single array to 2D array if necessary
            if (state.SetTargetVariable) {
                if (!Array.isArray(state.SetTargetVariable[0])) {
                    // If SetTargetVariable is a 1D array, convert to 2D array
                    state.SetTargetVariable = [
                        state.SetTargetVariable as unknown as string[],
                    ];
                }
            } else {
                state.SetTargetVariable = [[]];
            }
            return state;
        };

        const [mainState, setMainState] = useState<OptScaOveralsMainType>(
            initialMainState()
        );
        const [availableVariables, setAvailableVariables] = useState<string[]>(
            []
        );

        // Pagination state
        const [activePage, setActivePage] = useState<number>(0);
        const [totalPages, setTotalPages] = useState<number>(3);

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
            setMainState(initialMainState());
            setAvailableVariables(globalVariables);
        }, [data, globalVariables]);

        // Update available variables when used variables change
        useEffect(() => {
            // Flatten the 2D array of SetTargetVariable
            const allSetTargetVariables = mainState.SetTargetVariable
                ? mainState.SetTargetVariable.flat()
                : [];

            const usedVariables = [
                ...allSetTargetVariables,
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

                // Check if variable is in any page of SetTargetVariable (flattened array)
                const allSetTargetVariables = mainState.SetTargetVariable
                    ? mainState.SetTargetVariable.flat()
                    : [];

                // Format variables based on their list membership
                if (allSetTargetVariables.includes(variable)) {
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
            // For SetTargetVariable (now a 2D array), we need to iterate through all pages
            if (mainState.SetTargetVariable) {
                mainState.SetTargetVariable.forEach((pageVariables) => {
                    pageVariables.forEach((variable) => {
                        if (!newFormattedVariables[variable]) {
                            newFormattedVariables[
                                variable
                            ] = `${variable} (Ordinal 1 5)`;
                        }
                    });
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
            // First, check if the variable already exists in the target
            if (target === "SetTargetVariable") {
                // Check if the variable already exists in the current page
                if (
                    mainState.SetTargetVariable &&
                    mainState.SetTargetVariable[activePage] &&
                    mainState.SetTargetVariable[activePage].includes(variable)
                ) {
                    // Variable already exists in this page, don't add it again
                    return;
                }
            } else if (target === "PlotsTargetVariable") {
                // Check if the variable already exists in PlotsTargetVariable
                if (
                    mainState.PlotsTargetVariable &&
                    mainState.PlotsTargetVariable.includes(variable)
                ) {
                    // Variable already exists, don't add it again
                    return;
                }
            }

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
                    // Make sure SetTargetVariable is initialized as a 2D array
                    if (!updatedState.SetTargetVariable) {
                        updatedState.SetTargetVariable = [[]];
                    }

                    // Make sure there's enough pages
                    while (
                        updatedState.SetTargetVariable.length <= activePage
                    ) {
                        updatedState.SetTargetVariable.push([]);
                    }

                    // Fix: Create a new array with only unique values
                    const existingVars =
                        updatedState.SetTargetVariable[activePage] || [];
                    // Only add the variable if it doesn't already exist
                    if (!existingVars.includes(variable)) {
                        updatedState.SetTargetVariable[activePage] = [
                            ...existingVars,
                            variable,
                        ];
                    } else {
                        // No change needed if variable already exists
                        updatedState.SetTargetVariable[activePage] = [
                            ...existingVars,
                        ];
                    }
                } else if (target === "PlotsTargetVariable") {
                    const existingPlotVars =
                        updatedState.PlotsTargetVariable || [];
                    if (!existingPlotVars.includes(variable)) {
                        updatedState.PlotsTargetVariable = [
                            ...existingPlotVars,
                            variable,
                        ];
                    } else {
                        updatedState.PlotsTargetVariable = [
                            ...existingPlotVars,
                        ];
                    }
                }

                return updatedState;
            });
        };

        const handleRemoveVariable = (target: string, variable?: string) => {
            setMainState((prev) => {
                const updatedState = { ...prev };

                if (target === "SetTargetVariable") {
                    // For SetTargetVariable, we need to remove the variable from the current page
                    if (
                        updatedState.SetTargetVariable &&
                        updatedState.SetTargetVariable[activePage]
                    ) {
                        updatedState.SetTargetVariable[activePage] =
                            updatedState.SetTargetVariable[activePage].filter(
                                (item) => item !== variable
                            );
                    }
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

            // Check if variable is in any page of SetTargetVariable (flattened array)
            const allSetTargetVariables = mainState.SetTargetVariable
                ? mainState.SetTargetVariable.flat()
                : [];

            // Format based on the target list the variable belongs to
            if (allSetTargetVariables.includes(variable)) {
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

        // Fixed pagination rendering to show limited page numbers
        const renderPagination = () => {
            const maxVisiblePages = 3; // Show at most 3 page numbers
            const pageNumbers = [];

            let startPage = Math.max(
                0,
                activePage - Math.floor(maxVisiblePages / 2)
            );
            let endPage = Math.min(
                totalPages - 1,
                startPage + maxVisiblePages - 1
            );

            // Adjust startPage if endPage is at maximum
            if (endPage === totalPages - 1) {
                startPage = Math.max(0, endPage - maxVisiblePages + 1);
            }

            // Add first page
            if (startPage > 0) {
                pageNumbers.push(
                    <PaginationItem key="first">
                        <PaginationLink
                            onClick={() => handlePageChange(0)}
                            isActive={activePage === 0}
                            className="cursor-pointer"
                        >
                            1
                        </PaginationLink>
                    </PaginationItem>
                );

                // Add ellipsis if there's a gap
                if (startPage > 1) {
                    pageNumbers.push(
                        <PaginationItem key="ellipsis-start">
                            <PaginationEllipsis />
                        </PaginationItem>
                    );
                }
            }

            // Add visible page numbers
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            onClick={() => handlePageChange(i)}
                            isActive={activePage === i}
                            className="cursor-pointer"
                        >
                            {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            // Add last page if not already included
            if (endPage < totalPages - 1) {
                // Add ellipsis if there's a gap
                if (endPage < totalPages - 2) {
                    pageNumbers.push(
                        <PaginationItem key="ellipsis-end">
                            <PaginationEllipsis />
                        </PaginationItem>
                    );
                }

                pageNumbers.push(
                    <PaginationItem key="last">
                        <PaginationLink
                            onClick={() => handlePageChange(totalPages - 1)}
                            isActive={activePage === totalPages - 1}
                            className="cursor-pointer"
                        >
                            {totalPages}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            return pageNumbers;
        };

        // Handle pagination navigation
        const handlePageChange = (page: number) => {
            // If user selects a page that doesn't exist yet, create it
            setMainState((prev) => {
                const updatedState = { ...prev };

                if (!updatedState.SetTargetVariable) {
                    updatedState.SetTargetVariable = [[]];
                }

                // Ensure all pages up to the selected one exist
                while (updatedState.SetTargetVariable.length <= page) {
                    updatedState.SetTargetVariable.push([]);
                }

                return updatedState;
            });

            // Update active page
            setActivePage(page);

            // Update total pages if needed
            if (page >= totalPages - 1) {
                setTotalPages((prev) => Math.max(prev, page + 2)); // Always keep at least one empty page
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
        // Enhanced handleContinue that adds formatting
        const handleContinue = () => {
            // Create a deep copy of mainState
            const enhancedMainState = { ...mainState };

            // Format Set Variables - maintain 2D array structure
            if (
                enhancedMainState.SetTargetVariable &&
                enhancedMainState.SetTargetVariable.length > 0
            ) {
                // Remove any empty pages
                const nonEmptyPages =
                    enhancedMainState.SetTargetVariable.filter(
                        (page) => page.length > 0
                    );

                // Format each variable in each page while preserving 2D structure
                const formattedPages = nonEmptyPages.map((page) =>
                    page.map((variable) => {
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
                    })
                );

                // Maintain 2D array structure - do not flatten
                enhancedMainState.SetTargetVariable = formattedPages as any;
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
                                className="min-h-[465px] rounded-slg border md:min-w-[200px]"
                            >
                                {/* Variable List */}
                                <ResizablePanel defaultSize={25}>
                                    <ScrollArea>
                                        <div className="flex flex-col gap-1 justify-start items-start h-[425px] w-full p-2">
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
                                <ResizablePanel defaultSize={75}>
                                    <ResizablePanelGroup direction="vertical">
                                        <ResizablePanel defaultSize={10}>
                                            <div className="flex items-start justify-start p-2">
                                                <Pagination>
                                                    <PaginationContent>
                                                        <PaginationItem>
                                                            <PaginationPrevious
                                                                onClick={() => {
                                                                    if (
                                                                        activePage >
                                                                        0
                                                                    ) {
                                                                        handlePageChange(
                                                                            activePage -
                                                                                1
                                                                        );
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    activePage ===
                                                                        0
                                                                        ? "pointer-events-none opacity-50"
                                                                        : "cursor-pointer"
                                                                )}
                                                            />
                                                        </PaginationItem>
                                                        {/* Fixed pagination rendering */}
                                                        {renderPagination()}
                                                        <PaginationItem>
                                                            <PaginationNext
                                                                onClick={() =>
                                                                    handlePageChange(
                                                                        activePage +
                                                                            1
                                                                    )
                                                                }
                                                                className="cursor-pointer"
                                                            />
                                                        </PaginationItem>
                                                    </PaginationContent>
                                                </Pagination>
                                            </div>
                                        </ResizablePanel>
                                        <ResizablePanel defaultSize={90}>
                                            <ResizablePanelGroup direction="horizontal">
                                                <ResizablePanel
                                                    defaultSize={80}
                                                >
                                                    <div className="flex flex-col gap-4 p-2">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="w-full">
                                                                <div
                                                                    onDragOver={(
                                                                        e
                                                                    ) =>
                                                                        e.preventDefault()
                                                                    }
                                                                    onDrop={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation(); // Prevent event bubbling
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
                                                                        Variables:{" "}
                                                                    </Label>
                                                                    <div className="w-full h-[100px] p-2 border rounded overflow-hidden">
                                                                        <ScrollArea>
                                                                            <div className="w-full h-[80px]">
                                                                                {mainState.SetTargetVariable &&
                                                                                mainState
                                                                                    .SetTargetVariable[
                                                                                    activePage
                                                                                ] &&
                                                                                mainState
                                                                                    .SetTargetVariable[
                                                                                    activePage
                                                                                ]
                                                                                    .length >
                                                                                    0 ? (
                                                                                    <div className="flex flex-col gap-1">
                                                                                        {mainState.SetTargetVariable[
                                                                                            activePage
                                                                                        ].map(
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
                                                                                        here
                                                                                        for
                                                                                        Set{" "}
                                                                                        {activePage +
                                                                                            1}

                                                                                        .
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </ScrollArea>
                                                                    </div>
                                                                    <input
                                                                        type="hidden"
                                                                        value={
                                                                            mainState.SetTargetVariable
                                                                                ? JSON.stringify(
                                                                                      mainState.SetTargetVariable
                                                                                  )
                                                                                : ""
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
                                                                    Define Range
                                                                    and Scale...
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <div className="w-full">
                                                                <div
                                                                    onDragOver={(
                                                                        e
                                                                    ) =>
                                                                        e.preventDefault()
                                                                    }
                                                                    onDrop={(
                                                                        e
                                                                    ) => {
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
                                                                        Label
                                                                        Object
                                                                        Score
                                                                        Plot(s)
                                                                        by:{" "}
                                                                    </Label>
                                                                    <div className="w-full h-[100px] p-2 border rounded overflow-hidden">
                                                                        <ScrollArea>
                                                                            <div className="w-full h-[80px]">
                                                                                {mainState.PlotsTargetVariable &&
                                                                                mainState
                                                                                    .PlotsTargetVariable
                                                                                    .length >
                                                                                    0 ? (
                                                                                    <div className="flex flex-col gap-1">
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
                                                                    Define
                                                                    Range...
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Label className="w-[150px]">
                                                                Dimension in
                                                                Solution:
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
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleChange(
                                                                            "Dimensions",
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
                                                </ResizablePanel>

                                                {/* Tools Area */}
                                                <ResizablePanel
                                                    defaultSize={20}
                                                >
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
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
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
