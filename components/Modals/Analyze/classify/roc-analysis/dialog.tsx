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
    RocAnalysisDialogProps,
    RocAnalysisMainType,
} from "@/models/classify/roc-analysis/roc-analysis";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModal } from "@/hooks/useModal";

export const RocAnalysisDialog = ({
    isMainOpen,
    setIsMainOpen,
    setIsOptionsOpen,
    setIsDefineGroupsOpen,
    setIsDisplayOpen,
    updateFormData,
    data,
    globalVariables,
    onContinue,
    onReset,
}: RocAnalysisDialogProps) => {
    const [mainState, setMainState] = useState<RocAnalysisMainType>({
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
            ...(mainState.TestTargetVariable || []),
            mainState.StateTargetVariable,
            mainState.StateVarVal,
            mainState.TargetGroupVar,
        ].filter(Boolean);

        const updatedVariables = globalVariables.filter(
            (variable) => !usedVariables.includes(variable)
        );
        setAvailableVariables(updatedVariables);
    }, [mainState]);

    const handleChange = (
        field: keyof RocAnalysisMainType,
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
            if (target === "TestTargetVariable") {
                updatedState.TestTargetVariable = [
                    ...(updatedState.TestTargetVariable || []),
                    variable,
                ];
            } else if (target === "StateTargetVariable") {
                updatedState.StateTargetVariable = variable;
            } else if (target === "StateVarVal") {
                updatedState.StateVarVal = variable;
            } else if (target === "TargetGroupVar") {
                updatedState.TargetGroupVar = variable;
            }
            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setMainState((prev) => {
            const updatedState = { ...prev };
            if (target === "TestTargetVariable") {
                updatedState.TestTargetVariable = (
                    updatedState.TestTargetVariable || []
                ).filter((item) => item !== variable);
            } else if (target === "StateTargetVariable") {
                updatedState.StateTargetVariable = "";
            } else if (target === "StateVarVal") {
                updatedState.StateVarVal = "";
            } else if (target === "TargetGroupVar") {
                updatedState.TargetGroupVar = "";
            }
            return updatedState;
        });
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof RocAnalysisMainType, value);
        });

        setIsMainOpen(false);

        onContinue(mainState);
    };

    const openDialog =
        (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
            Object.entries(mainState).forEach(([key, value]) => {
                updateFormData(key as keyof RocAnalysisMainType, value);
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
                    <Button variant="outline">ROC Analysis</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>ROC Analysis</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex items-center space-x-2">
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
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            Test Variable:{" "}
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
                                                    "TestTargetVariable",
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
                                                        {mainState.TestTargetVariable &&
                                                        mainState
                                                            .TestTargetVariable
                                                            .length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {mainState.TestTargetVariable.map(
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
                                                                                    "TestTargetVariable",
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
                                                    mainState.TestTargetVariable ??
                                                    ""
                                                }
                                                name="Independents"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            State Variable:{" "}
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-full min-h-[40px] p-2 border rounded"
                                                onDrop={(e) => {
                                                    handleDrop(
                                                        "StateTargetVariable",
                                                        e.dataTransfer.getData(
                                                            "text"
                                                        )
                                                    );
                                                }}
                                                onDragOver={(e) =>
                                                    e.preventDefault()
                                                }
                                            >
                                                {mainState.StateTargetVariable ? (
                                                    <Badge
                                                        className="text-start text-sm font-light p-2 cursor-pointer"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleRemoveVariable(
                                                                "StateTargetVariable"
                                                            )
                                                        }
                                                    >
                                                        {
                                                            mainState.StateTargetVariable
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
                                                    mainState.StateTargetVariable ??
                                                    ""
                                                }
                                                name="StateTargetVariable"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-full gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Label className="w-[300px]">
                                                Value of State Variable:
                                            </Label>
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-full min-h-[40px] p-2 border rounded"
                                                    onDrop={(e) => {
                                                        handleDrop(
                                                            "StateVarVal",
                                                            e.dataTransfer.getData(
                                                                "text"
                                                            )
                                                        );
                                                    }}
                                                    onDragOver={(e) =>
                                                        e.preventDefault()
                                                    }
                                                >
                                                    {mainState.StateVarVal ? (
                                                        <Badge
                                                            className="text-start text-sm font-light p-2 cursor-pointer"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleRemoveVariable(
                                                                    "StateVarVal"
                                                                )
                                                            }
                                                        >
                                                            {
                                                                mainState.StateVarVal
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
                                                        mainState.StateVarVal ??
                                                        ""
                                                    }
                                                    name="StateVarVal"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="PairedSample"
                                                checked={mainState.PairedSample}
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "PairedSample",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="PairedSample"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Paired-Sampled Design
                                            </label>
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            Grouping Variable:{" "}
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-full min-h-[40px] p-2 border rounded"
                                                onDrop={(e) => {
                                                    handleDrop(
                                                        "TargetGroupVar",
                                                        e.dataTransfer.getData(
                                                            "text"
                                                        )
                                                    );
                                                }}
                                                onDragOver={(e) =>
                                                    e.preventDefault()
                                                }
                                            >
                                                {mainState.TargetGroupVar ? (
                                                    <Badge
                                                        className="text-start text-sm font-light p-2 cursor-pointer"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleRemoveVariable(
                                                                "TargetGroupVar"
                                                            )
                                                        }
                                                    >
                                                        {
                                                            mainState.TargetGroupVar
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
                                                    mainState.TargetGroupVar ??
                                                    ""
                                                }
                                                name="TargetGroupVar"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={openDialog(
                                                setIsDefineGroupsOpen
                                            )}
                                        >
                                            Define Groups...
                                        </Button>
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
                                        onClick={openDialog(setIsOptionsOpen)}
                                    >
                                        Options...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsDisplayOpen)}
                                    >
                                        Display...
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
