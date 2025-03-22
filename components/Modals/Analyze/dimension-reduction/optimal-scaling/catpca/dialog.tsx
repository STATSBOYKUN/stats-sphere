import React, {
    useEffect,
    useState,
    useRef,
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
    OptScaCatpcaDefineRangeScaleType,
    OptScaCatpcaDefineScaleType,
    DialogHandlers,
    VariableInfoType,
} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModal } from "@/hooks/useModal";

export const OptScaCatpcaDialog = forwardRef<
    DialogHandlers,
    OptScaCatpcaDialogProps
>(
    (
        {
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
        },
        ref
    ) => {
        const [mainState, setMainState] = useState<OptScaCatpcaMainType>({
            ...data,
        });
        const [availableVariables, setAvailableVariables] = useState<string[]>(
            []
        );

        // State untuk menyimpan variabel yang sedang terseleksi
        const [selectedVariable, setSelectedVariable] = useState<string | null>(
            null
        );
        const [selectedTarget, setSelectedTarget] = useState<string | null>(
            null
        );
        const [formattedVariables, setFormattedVariables] = useState<{
            [key: string]: string;
        }>({});

        // State untuk menyimpan informasi variable
        const [variableInfo, setVariableInfo] = useState<VariableInfoType>({});

        const { closeModal } = useModal();

        useEffect(() => {
            setMainState({ ...data });
            setAvailableVariables(globalVariables);
        }, [data, globalVariables]);

        useEffect(() => {
            const newFormattedVariables: { [key: string]: string } = {};

            // Format all variables that exist in variableInfo
            Object.keys(variableInfo).forEach((variable) => {
                const info = variableInfo[variable];

                // Check if the variable is in SuppleVars
                if (
                    mainState.SuppleVars &&
                    mainState.SuppleVars.includes(variable)
                ) {
                    // Format without weight for supplementary variables
                    newFormattedVariables[
                        variable
                    ] = `${variable} (${info.scaling} ${info.degree} ${info.interiorKnots})`;
                } else {
                    // Format with weight for analysis variables and others
                    newFormattedVariables[variable] = `${variable} (${
                        info.weight || 1
                    } ${info.scaling} ${info.degree} ${info.interiorKnots})`;
                }
            });

            setFormattedVariables(newFormattedVariables);
        }, [variableInfo, mainState.SuppleVars]);

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
            // Create a deep copy of mainState
            const enhancedMainState = { ...mainState };

            // Format Analysis Variables
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
                                scaling: "Spline Ordinal",
                                degree: 2,
                                interiorKnots: 2,
                            };
                            return `${variable} (${info.weight || 1} ${
                                info.scaling
                            } ${info.degree} ${info.interiorKnots})`;
                        }
                    });
            }

            // Format Supplementary Variables
            if (
                enhancedMainState.SuppleVars &&
                enhancedMainState.SuppleVars.length > 0
            ) {
                enhancedMainState.SuppleVars = enhancedMainState.SuppleVars.map(
                    (variable) => {
                        // Use the formatted variable if available, otherwise format it
                        if (formattedVariables[variable]) {
                            return formattedVariables[variable];
                        } else {
                            // Use default formatting if no specific info exists
                            const info = variableInfo[variable] || {
                                scaling: "Spline Ordinal",
                                degree: 2,
                                interiorKnots: 2,
                            };
                            return `${variable} (${info.scaling} ${info.degree} ${info.interiorKnots})`;
                        }
                    }
                );
            }

            // Update form data
            Object.entries(enhancedMainState).forEach(([key, value]) => {
                updateFormData(key as keyof OptScaCatpcaMainType, value);
            });

            // Close the dialog
            setIsMainOpen(false);

            // Pass the enhanced state to the parent component
            onContinue(enhancedMainState);
        };

        const openDialog =
            (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
                Object.entries(mainState).forEach(([key, value]) => {
                    updateFormData(key as keyof OptScaCatpcaMainType, value);
                });
                setter(true);
            };

        // Format variabel untuk tampilan
        const formatVariable = (variable: string) => {
            if (formattedVariables[variable]) {
                return formattedVariables[variable];
            }

            // Fallback to original formatting if not found in cached values
            const info = variableInfo[variable] || {
                weight: 1,
                scaling: "Spline Ordinal",
                degree: 2,
                interiorKnots: 2,
            };

            // Format differently based on whether it's a suppleVar or not
            if (
                mainState.SuppleVars &&
                mainState.SuppleVars.includes(variable)
            ) {
                return `${variable} (${info.scaling} ${info.degree} ${info.interiorKnots})`;
            } else {
                return `${variable} (${info.weight || 1} ${info.scaling} ${
                    info.degree
                } ${info.interiorKnots})`;
            }
        };

        // Handle ketika variabel diklik
        const handleVariableClick = (target: string, variable: string) => {
            setSelectedVariable(variable);
            setSelectedTarget(target);
        };

        // Update variabel ketika define range scale dialog ditutup
        const handleDefineRangeScaleContinue = (
            defineRangeScaleData: OptScaCatpcaDefineRangeScaleType
        ) => {
            if (selectedVariable && selectedTarget === "AnalysisVars") {
                // Temukan optimal scaling yang dipilih
                let optimalScaling = "Spline Ordinal";
                if (defineRangeScaleData.SplineOrdinal)
                    optimalScaling = "Spline Ordinal";
                else if (defineRangeScaleData.SplineNominal)
                    optimalScaling = "Spline Nominal";
                else if (defineRangeScaleData.MultipleNominal)
                    optimalScaling = "Multiple Nominal";
                else if (defineRangeScaleData.Ordinal)
                    optimalScaling = "Ordinal";
                else if (defineRangeScaleData.Nominal)
                    optimalScaling = "Nominal";
                else if (defineRangeScaleData.Numeric)
                    optimalScaling = "Numeric";

                const newVariableInfo = {
                    ...variableInfo,
                    [selectedVariable]: {
                        weight: defineRangeScaleData.Weight || 1,
                        scaling: optimalScaling,
                        degree: defineRangeScaleData.Degree || 2,
                        interiorKnots: defineRangeScaleData.InteriorKnots || 2,
                    },
                };

                setVariableInfo(newVariableInfo);

                // Keep the variable selected after updating (re-select it)
                setSelectedVariable(selectedVariable);
                setSelectedTarget("AnalysisVars");
            }
        };

        // Update variabel ketika define scale dialog ditutup
        const handleDefineScaleContinue = (
            defineScaleData: OptScaCatpcaDefineScaleType
        ) => {
            if (selectedVariable && selectedTarget === "SuppleVars") {
                // Temukan optimal scaling yang dipilih
                let optimalScaling = "Spline Ordinal";
                if (defineScaleData.SplineOrdinal)
                    optimalScaling = "Spline Ordinal";
                else if (defineScaleData.SplineNominal)
                    optimalScaling = "Spline Nominal";
                else if (defineScaleData.MultipleNominal)
                    optimalScaling = "Multiple Nominal";
                else if (defineScaleData.Ordinal) optimalScaling = "Ordinal";
                else if (defineScaleData.Nominal) optimalScaling = "Nominal";
                else if (defineScaleData.Numeric) optimalScaling = "Numeric";

                // Update variable info WITHOUT weight for supplementary variables
                const newVariableInfo = {
                    ...variableInfo,
                    [selectedVariable]: {
                        scaling: optimalScaling,
                        degree: defineScaleData.Degree || 2,
                        interiorKnots: defineScaleData.InteriorKnots || 2,
                    },
                };

                setVariableInfo(newVariableInfo);
                // Keep the variable selected after updating (re-select it)
                setSelectedVariable(selectedVariable);
                setSelectedTarget("SuppleVars");
            }
        };

        const handleDialog = () => {
            setIsMainOpen(false);
            closeModal();
        };

        // Ekspos fungsi handler untuk container
        useImperativeHandle(ref, () => ({
            handleDefineRangeScaleContinue,
            handleDefineScaleContinue,
        }));

        return (
            <>
                {/* Main Dialog */}
                <Dialog open={isMainOpen} onOpenChange={handleDialog}>
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
                                                        setIsDefineRangeScaleOpen
                                                    )}
                                                    disabled={
                                                        !selectedVariable ||
                                                        selectedTarget !==
                                                            "AnalysisVars"
                                                    }
                                                >
                                                    Define Range and Scale...
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
                                                    disabled={
                                                        !selectedVariable ||
                                                        selectedTarget !==
                                                            "SuppleVars"
                                                    }
                                                >
                                                    Define Scale...
                                                </Button>
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
                                        <Button
                                            className="w-full"
                                            type="button"
                                            variant="secondary"
                                            onClick={openDialog(
                                                setIsBootstrapOpen
                                            )}
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
    }
);
