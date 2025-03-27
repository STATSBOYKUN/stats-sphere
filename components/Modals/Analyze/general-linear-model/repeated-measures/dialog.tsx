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
    RepeatedMeasuresDialogProps,
    RepeatedMeasuresMainType,
} from "@/models/general-linear-model/repeated-measures/repeated-measures";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModal } from "@/hooks/useModal";

export const RepeatedMeasuresDialog = ({
    isMainOpen,
    setIsMainOpen,
    setIsModelOpen,
    setIsContrastOpen,
    setIsPlotsOpen,
    setIsPostHocOpen,
    setIsEMMeansOpen,
    setIsSaveOpen,
    setIsOptionsOpen,
    updateFormData,
    data,
    globalVariables,
    combinationVars,
    onContinue,
    onReset,
}: RepeatedMeasuresDialogProps) => {
    const [mainState, setMainState] = useState<RepeatedMeasuresMainType>({
        ...data,
    });
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);

    const { closeModal } = useModal();

    useEffect(() => {
        setMainState((prevState) => ({
            ...data,
            SubVar: combinationVars || prevState.SubVar || [],
        }));
        setAvailableVariables(globalVariables);
    }, [data, globalVariables, combinationVars]);

    // Replace the second useEffect with this:
    useEffect(() => {
        // Extract actual variable names from SubVar array
        const extractedSubVars = (mainState.SubVar || [])
            .map((item) => {
                // Skip items that still have placeholders
                if (item.includes("?_")) return null;

                // Extract the variable name (everything before the first parenthesis)
                const match = item.match(/^([^(]+)/);
                return match ? match[1] : null;
            })
            .filter(Boolean); // Remove null entries

        // Combine all used variables
        const usedVariables = [
            ...extractedSubVars,
            ...(mainState.FactorsVar || []),
            ...(mainState.Covariates || []),
        ].filter(Boolean);

        // Filter out used variables from the available list
        const updatedVariables = globalVariables.filter(
            (variable) => !usedVariables.includes(variable)
        );

        setAvailableVariables(updatedVariables);
    }, [mainState, globalVariables]);

    const handleChange = (
        field: keyof RepeatedMeasuresMainType,
        value: number | string | null
    ) => {
        setMainState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    // Modified handleDrop function
    const handleDrop = (target: string, variable: string) => {
        setMainState((prev) => {
            const updatedState = { ...prev };

            if (target === "SubVar") {
                const updatedSubVar = [...(updatedState.SubVar || [])];

                // Find the first placeholder that contains "?_"
                const placeholderIndex = updatedSubVar.findIndex((item) =>
                    item.includes("?_")
                );

                if (placeholderIndex >= 0) {
                    // Replace "?_" with the variable name while preserving the format
                    updatedSubVar[placeholderIndex] = updatedSubVar[
                        placeholderIndex
                    ].replace("?_", variable);
                    updatedState.SubVar = updatedSubVar;
                } else {
                    // If no placeholder with "?_" is found, append as before
                    updatedState.SubVar = [...updatedSubVar, variable];
                }
            } else if (target === "FactorsVar") {
                updatedState.FactorsVar = [
                    ...(updatedState.FactorsVar || []),
                    variable,
                ];
            } else if (target === "Covariates") {
                updatedState.Covariates = [
                    ...(updatedState.Covariates || []),
                    variable,
                ];
            }

            return updatedState;
        });
    };

    // Modified handleRemoveVariable function
    const handleRemoveVariable = (target: string, variable?: string) => {
        setMainState((prev) => {
            const updatedState = { ...prev };

            if (target === "SubVar" && variable) {
                const updatedSubVar = [...(updatedState.SubVar || [])];

                // Find the index of the variable to revert
                const varIndex = updatedSubVar.findIndex(
                    (item) => item === variable
                );

                if (varIndex >= 0) {
                    // Extract the format part (everything inside parentheses)
                    const formatRegex = /(\(.*\))/; // Match anything inside parentheses
                    const formatMatch = variable.match(formatRegex);

                    if (formatMatch) {
                        const format = formatMatch[0];

                        // Replace with ?_ + format
                        updatedSubVar[varIndex] = "?_" + format;
                        updatedState.SubVar = updatedSubVar;
                    } else {
                        // If no format is found, just remove the item (fallback)
                        updatedSubVar.splice(varIndex, 1);
                        updatedState.SubVar = updatedSubVar;
                    }
                }
            } else if (target === "FactorsVar") {
                updatedState.FactorsVar = (
                    updatedState.FactorsVar || []
                ).filter((item) => item !== variable);
            } else if (target === "Covariates") {
                updatedState.Covariates = (
                    updatedState.Covariates || []
                ).filter((item) => item !== variable);
            }

            return updatedState;
        });
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof RepeatedMeasuresMainType, value);
        });

        setIsMainOpen(false);
        onContinue(mainState);
    };

    const openDialog =
        (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
            Object.entries(mainState).forEach(([key, value]) => {
                updateFormData(key as keyof RepeatedMeasuresMainType, value);
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
                {/* <DialogTrigger asChild>
                    <Button variant="outline">Repeated Measures</Button>
                </DialogTrigger> */}
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Repeated Measures</DialogTitle>
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
                                <div className="flex flex-col gap-2 p-2">
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
                                                handleDrop("SubVar", variable);
                                            }}
                                        >
                                            <Label className="font-bold">
                                                Within-Subjects Variables:{" "}
                                            </Label>
                                            <div className="w-full h-[100px] p-2 border rounded overflow-hidden">
                                                <ScrollArea>
                                                    <div className="w-full h-[80px]">
                                                        {mainState.SubVar &&
                                                        mainState.SubVar
                                                            .length > 0 ? (
                                                            <div className="flex flex-col gap-1">
                                                                {mainState.SubVar.map(
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
                                                                                    "SubVar",
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
                                                                Drop variables
                                                                here.
                                                            </span>
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                            <input
                                                type="hidden"
                                                value={mainState.SubVar ?? ""}
                                                name="Independents"
                                            />
                                        </div>
                                    </div>
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
                                                    "FactorsVar",
                                                    variable
                                                );
                                            }}
                                        >
                                            <Label className="font-bold">
                                                Between-Subjects Factor(s):{" "}
                                            </Label>
                                            <div className="w-full h-[100px] p-2 border rounded overflow-hidden">
                                                <ScrollArea>
                                                    <div className="w-full h-[80px]">
                                                        {mainState.FactorsVar &&
                                                        mainState.FactorsVar
                                                            .length > 0 ? (
                                                            <div className="flex flex-col gap-1">
                                                                {mainState.FactorsVar.map(
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
                                                                                    "FactorsVar",
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
                                                                Drop variables
                                                                here.
                                                            </span>
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                            <input
                                                type="hidden"
                                                value={
                                                    mainState.FactorsVar ?? ""
                                                }
                                                name="Independents"
                                            />
                                        </div>
                                    </div>
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
                                                    "Covariates",
                                                    variable
                                                );
                                            }}
                                        >
                                            <Label className="font-bold">
                                                Covariates:{" "}
                                            </Label>
                                            <div className="w-full h-[100px] p-2 border rounded overflow-hidden">
                                                <ScrollArea>
                                                    <div className="w-full h-[80px]">
                                                        {mainState.Covariates &&
                                                        mainState.Covariates
                                                            .length > 0 ? (
                                                            <div className="flex flex-col gap-1">
                                                                {mainState.Covariates.map(
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
                                                                                    "Covariates",
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
                                                                Drop variables
                                                                here.
                                                            </span>
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                            <input
                                                type="hidden"
                                                value={
                                                    mainState.Covariates ?? ""
                                                }
                                                name="Independents"
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
                                        onClick={openDialog(setIsModelOpen)}
                                    >
                                        Model...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsContrastOpen)}
                                    >
                                        Contrast...
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
                                        onClick={openDialog(setIsPostHocOpen)}
                                    >
                                        Post Hoc...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsEMMeansOpen)}
                                    >
                                        EM Means...
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
