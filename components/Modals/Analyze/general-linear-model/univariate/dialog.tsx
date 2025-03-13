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
    UnivariateDialogProps,
    UnivariateMainType,
} from "@/models/general-linear-model/univariate/univariate";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModal } from "@/hooks/useModal";

export const UnivariateDialog = ({
    isMainOpen,
    setIsMainOpen,
    setIsModelOpen,
    setIsContrastOpen,
    setIsPlotsOpen,
    setIsPostHocOpen,
    setIsEMMeansOpen,
    setIsSaveOpen,
    setIsOptionsOpen,
    setIsBootstrapOpen,
    updateFormData,
    data,
    globalVariables,
    onContinue,
    onReset,
}: UnivariateDialogProps) => {
    const [mainState, setMainState] = useState<UnivariateMainType>({ ...data });
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);

    const { closeModal } = useModal();

    useEffect(() => {
        setMainState({ ...data });
        setAvailableVariables(globalVariables);
    }, [data, globalVariables]);

    useEffect(() => {
        const usedVariables = [
            ...(mainState.DepVar || []),
            ...(mainState.FixFactor || []),
            ...(mainState.RandFactor || []),
            ...(mainState.Covar || []),
            mainState.WlsWeight,
        ].filter(Boolean);

        const updatedVariables = globalVariables.filter(
            (variable) => !usedVariables.includes(variable)
        );
        setAvailableVariables(updatedVariables);
    }, [mainState]);

    const handleChange = (
        field: keyof UnivariateMainType,
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
            if (target === "DepVar") {
                updatedState.DepVar = [
                    ...(updatedState.DepVar || []),
                    variable,
                ];
            } else if (target === "FixFactor") {
                updatedState.FixFactor = [
                    ...(updatedState.FixFactor || []),
                    variable,
                ];
            } else if (target === "Covar") {
                updatedState.Covar = [...(updatedState.Covar || []), variable];
            } else if (target === "RandFactor") {
                updatedState.RandFactor = [
                    ...(updatedState.RandFactor || []),
                    variable,
                ];
            } else if (target === "WlsWeight") {
                updatedState.WlsWeight = variable;
            }
            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setMainState((prev) => {
            const updatedState = { ...prev };
            if (target === "DepVar") {
                updatedState.DepVar = (updatedState.DepVar || []).filter(
                    (item) => item !== variable
                );
            } else if (target === "FixFactor") {
                updatedState.FixFactor = (updatedState.FixFactor || []).filter(
                    (item) => item !== variable
                );
            } else if (target === "Covar") {
                updatedState.Covar = (updatedState.Covar || []).filter(
                    (item) => item !== variable
                );
            } else if (target === "RandFactor") {
                updatedState.RandFactor = (
                    updatedState.RandFactor || []
                ).filter((item) => item !== variable);
            } else if (target === "WlsWeight") {
                updatedState.WlsWeight = "";
            }
            return updatedState;
        });
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof UnivariateMainType, value);
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
                    <Button variant="outline">Univariate</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Univariate</DialogTitle>
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
                                        <Label className="font-bold">
                                            Dependent Variables:{" "}
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
                                                handleDrop("DepVar", variable);
                                            }}
                                        >
                                            <Label className="font-bold">
                                                Independents:
                                            </Label>
                                            <div className="w-full h-[100px] p-2 border rounded overflow-hidden">
                                                <ScrollArea>
                                                    <div className="w-full h-[100px]">
                                                        {mainState.DepVar &&
                                                        mainState.DepVar
                                                            .length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {mainState.DepVar.map(
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
                                                                                    "DepVar",
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
                                                value={mainState.DepVar ?? ""}
                                                name="Independents"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            Fixed Factor(s):{" "}
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
                                                    "FixFactor",
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
                                                        {mainState.FixFactor &&
                                                        mainState.FixFactor
                                                            .length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {mainState.FixFactor.map(
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
                                                                                    "FixFactor",
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
                                                    mainState.FixFactor ?? ""
                                                }
                                                name="Independents"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            Random Factor(s):{" "}
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
                                                    "RandFactor",
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
                                                        {mainState.RandFactor &&
                                                        mainState.RandFactor
                                                            .length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {mainState.RandFactor.map(
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
                                                                                    "RandFactor",
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
                                                    mainState.RandFactor ?? ""
                                                }
                                                name="Independents"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            Covariate(s):{" "}
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
                                                handleDrop("Covar", variable);
                                            }}
                                        >
                                            <Label className="font-bold">
                                                Independents:
                                            </Label>
                                            <div className="w-full h-[100px] p-2 border rounded overflow-hidden">
                                                <ScrollArea>
                                                    <div className="w-full h-[100px]">
                                                        {mainState.Covar &&
                                                        mainState.Covar.length >
                                                            0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {mainState.Covar.map(
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
                                                                                    "Covar",
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
                                                value={mainState.Covar ?? ""}
                                                name="Independents"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            WLS Weight:{" "}
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-full min-h-[40px] p-2 border rounded"
                                                onDrop={(e) => {
                                                    handleDrop(
                                                        "WlsWeight",
                                                        e.dataTransfer.getData(
                                                            "text"
                                                        )
                                                    );
                                                }}
                                                onDragOver={(e) =>
                                                    e.preventDefault()
                                                }
                                            >
                                                {mainState.WlsWeight ? (
                                                    <Badge
                                                        className="text-start text-sm font-light p-2 cursor-pointer"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleRemoveVariable(
                                                                "WlsWeight"
                                                            )
                                                        }
                                                    >
                                                        {mainState.WlsWeight}
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
                                                    mainState.WlsWeight ?? ""
                                                }
                                                name="WlsWeight"
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
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsBootstrapOpen)}
                                    >
                                        Bootstrap...
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
