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
import { TreeDialogProps, TreeMainType } from "@/models/classify/tree/tree";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GROWINGMETHOD } from "@/constants/classify/tree/tree-method";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModal } from "@/hooks/useModal";

export const TreeDialog = ({
    isMainOpen,
    setIsMainOpen,
    setIsCategoriesOpen,
    setIsOutputOpen,
    setIsValidationOpen,
    setIsCriteriaOpen,
    setIsSaveOpen,
    setIsOptionsOpen,
    updateFormData,
    data,
    globalVariables,
    onContinue,
    onReset,
}: TreeDialogProps) => {
    const [mainState, setMainState] = useState<TreeMainType>({ ...data });
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);

    const { closeModal } = useModal();

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    useEffect(() => {
        setMainState({ ...data });
        setAvailableVariables(globalVariables);
    }, [data, globalVariables]);

    useEffect(() => {
        const usedVariables = [
            mainState.DependentTargetVar,
            ...(mainState.IndependentTargetVar || []),
            mainState.InfluenceTargetVar,
        ].filter(Boolean);

        const updatedVariables = globalVariables.filter(
            (variable) => !usedVariables.includes(variable)
        );
        setAvailableVariables(updatedVariables);
    }, [mainState]);

    const handleChange = (
        field: keyof TreeMainType,
        value: CheckedState | number | string | null
    ) => {
        setMainState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDrop = (target: string, variable: string) => {
        setMainState((prev) => {
            const updatedState = { ...prev };
            if (target === "DependentTargetVar") {
                updatedState.DependentTargetVar = variable;
            } else if (target === "IndependentTargetVar") {
                updatedState.IndependentTargetVar = [
                    ...(updatedState.IndependentTargetVar || []),
                    variable,
                ];
            } else if (target === "InfluenceTargetVar") {
                updatedState.InfluenceTargetVar = variable;
            }
            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setMainState((prev) => {
            const updatedState = { ...prev };
            if (target === "DependentTargetVar") {
                updatedState.DependentTargetVar = "";
            } else if (target === "IndependentTargetVar") {
                updatedState.IndependentTargetVar = (
                    updatedState.IndependentTargetVar || []
                ).filter((item) => item !== variable);
            } else if (target === "InfluenceTargetVar") {
                updatedState.InfluenceTargetVar = "";
            }
            return updatedState;
        });
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof TreeMainType, value);
        });

        setIsMainOpen(false);

        onContinue(mainState);
    };

    const openDialog =
        (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
            Object.entries(mainState).forEach(([key, value]) => {
                updateFormData(key as keyof TreeMainType, value);
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
                    <Button variant="outline">Decision Tree</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Decision Tree</DialogTitle>
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
                                <div className="flex flex-col h-full w-full items-start justify-start gap-2 p-2">
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            Dependent Variable:{" "}
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-full min-h-[40px] p-2 border rounded"
                                                onDrop={(e) => {
                                                    handleDrop(
                                                        "DependentTargetVar",
                                                        e.dataTransfer.getData(
                                                            "text"
                                                        )
                                                    );
                                                }}
                                                onDragOver={(e) =>
                                                    e.preventDefault()
                                                }
                                            >
                                                {mainState.DependentTargetVar ? (
                                                    <Badge
                                                        className="text-start text-sm font-light p-2 cursor-pointer"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleRemoveVariable(
                                                                "DependentTargetVar"
                                                            )
                                                        }
                                                    >
                                                        {
                                                            mainState.DependentTargetVar
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
                                                    mainState.DependentTargetVar ??
                                                    ""
                                                }
                                                name="DependentTargetVar"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={openDialog(
                                                setIsCategoriesOpen
                                            )}
                                        >
                                            Categories...
                                        </Button>
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            Independent Variables:{" "}
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
                                                    "IndependentTargetVar",
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
                                                        {mainState.IndependentTargetVar &&
                                                        mainState
                                                            .IndependentTargetVar
                                                            .length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {mainState.IndependentTargetVar.map(
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
                                                                                    "IndependentTargetVar",
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
                                                    mainState.IndependentTargetVar ??
                                                    ""
                                                }
                                                name="Independents"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="Force"
                                            checked={mainState.Force}
                                            onCheckedChange={(checked) =>
                                                handleChange("Force", checked)
                                            }
                                        />
                                        <label
                                            htmlFor="Force"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Force first variable
                                        </label>
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            Influence Variable:{" "}
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-full min-h-[40px] p-2 border rounded"
                                                onDrop={(e) => {
                                                    handleDrop(
                                                        "InfluenceTargetVar",
                                                        e.dataTransfer.getData(
                                                            "text"
                                                        )
                                                    );
                                                }}
                                                onDragOver={(e) =>
                                                    e.preventDefault()
                                                }
                                            >
                                                {mainState.InfluenceTargetVar ? (
                                                    <Badge
                                                        className="text-start text-sm font-light p-2 cursor-pointer"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleRemoveVariable(
                                                                "InfluenceTargetVar"
                                                            )
                                                        }
                                                    >
                                                        {
                                                            mainState.InfluenceTargetVar
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
                                                    mainState.InfluenceTargetVar ??
                                                    ""
                                                }
                                                name="InfluenceTargetVar"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            Growing Method:{" "}
                                        </Label>
                                        <Select
                                            value={
                                                mainState.GrowingMethod ?? ""
                                            }
                                            onValueChange={(value) =>
                                                handleChange(
                                                    "GrowingMethod",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {GROWINGMETHOD.map(
                                                        (method, index) => (
                                                            <SelectItem
                                                                key={index}
                                                                value={method}
                                                            >
                                                                {capitalize(
                                                                    method
                                                                ) + "'s Method"}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
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
                                        onClick={openDialog(setIsOutputOpen)}
                                    >
                                        Output...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(
                                            setIsValidationOpen
                                        )}
                                    >
                                        Validation...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsCriteriaOpen)}
                                    >
                                        Criteria...
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
