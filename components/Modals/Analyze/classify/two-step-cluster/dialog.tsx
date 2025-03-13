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
    TwoStepClusterDialogProps,
    TwoStepClusterMainType,
} from "@/models/classify/two-step-cluster/two-step-cluster";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModal } from "@/hooks/useModal";

export const TwoStepClusterDialog = ({
    isMainOpen,
    setIsMainOpen,
    setIsOptionsOpen,
    setIsOutputOpen,
    updateFormData,
    data,
    globalVariables,
    onContinue,
    onReset,
}: TwoStepClusterDialogProps) => {
    const [mainState, setMainState] = useState<TwoStepClusterMainType>({
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
            ...(mainState.CategoricalVar || []),
            ...(mainState.ContinousVar || []),
        ].filter(Boolean);

        const updatedVariables = globalVariables.filter(
            (variable) => !usedVariables.includes(variable)
        );
        setAvailableVariables(updatedVariables);
    }, [mainState]);

    const handleChange = (
        field: keyof TwoStepClusterMainType,
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
            if (target === "CategoricalVar") {
                updatedState.CategoricalVar = [
                    ...(updatedState.CategoricalVar || []),
                    variable,
                ];
            } else if (target === "ContinousVar") {
                updatedState.ContinousVar = [
                    ...(updatedState.ContinousVar || []),
                    variable,
                ];
            }
            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setMainState((prev) => {
            const updatedState = { ...prev };
            if (target === "CategoricalVar") {
                updatedState.CategoricalVar = (
                    updatedState.CategoricalVar || []
                ).filter((item) => item !== variable);
            } else if (target === "ContinousVar") {
                updatedState.ContinousVar = (
                    updatedState.ContinousVar || []
                ).filter((item) => item !== variable);
            }
            return updatedState;
        });
    };

    const handleDistanceGrp = (value: string) => {
        setMainState((prevState) => ({
            ...prevState,
            Log: value === "Log",
            Euclidean: value === "Euclidean",
        }));
    };

    const handleClusterGrp = (value: string) => {
        setMainState((prevState) => ({
            ...prevState,
            Auto: value === "Auto",
            Fixed: value === "Fixed",
        }));
    };

    const handleCriterionGrp = (value: string) => {
        setMainState((prevState) => ({
            ...prevState,
            Aic: value === "Aic",
            Bic: value === "Bic",
        }));
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof TwoStepClusterMainType, value);
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
                <DialogTrigger asChild>
                    <Button variant="outline">TwoStep Cluster</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>TwoStep Cluster Analysis</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col gap-2">
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
                                <div className="flex flex-col p-2">
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            Categorical Variables:{" "}
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
                                                    "CategoricalVar",
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
                                                        {mainState.CategoricalVar &&
                                                        mainState.CategoricalVar
                                                            .length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {mainState.CategoricalVar.map(
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
                                                                                    "CategoricalVar",
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
                                                    mainState.CategoricalVar ??
                                                    ""
                                                }
                                                name="Independents"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            Continous Variables:{" "}
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
                                                    "ContinousVar",
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
                                                        {mainState.ContinousVar &&
                                                        mainState.ContinousVar
                                                            .length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {mainState.ContinousVar.map(
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
                                                                                    "ContinousVar",
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
                                                    mainState.ContinousVar ?? ""
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
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                        <ResizablePanelGroup
                            direction="vertical"
                            className="min-h-[235px] rounded-lg border md:min-w-[200px]"
                        >
                            <ResizablePanel defaultSize={35}>
                                <ResizablePanelGroup direction="horizontal">
                                    <ResizablePanel defaultSize={50}>
                                        <RadioGroup
                                            value={
                                                mainState.Log
                                                    ? "Log"
                                                    : "Euclidean"
                                            }
                                            onValueChange={handleDistanceGrp}
                                        >
                                            <div className="flex flex-col gap-2 p-2">
                                                <Label className="font-bold">
                                                    Distance Measure:{" "}
                                                </Label>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Log"
                                                        id="Log"
                                                    />
                                                    <Label htmlFor="Log">
                                                        Log-likehood
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Euclidean"
                                                        id="Euclidean"
                                                    />
                                                    <Label htmlFor="Euclidean">
                                                        Euclidean
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                    </ResizablePanel>
                                    <ResizableHandle />
                                    <ResizablePanel defaultSize={50}>
                                        <RadioGroup
                                            value={
                                                mainState.Bic ? "Bic" : "Aic"
                                            }
                                            onValueChange={handleCriterionGrp}
                                        >
                                            <div className="flex flex-col gap-2 p-2">
                                                <Label className="font-bold">
                                                    Clustering Criterion:{" "}
                                                </Label>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Bic"
                                                        id="Bic"
                                                    />
                                                    <Label htmlFor="Bic">
                                                        Schwarz&apos;s Bayesian
                                                        Criterion (BIC)
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Aic"
                                                        id="Aic"
                                                    />
                                                    <Label htmlFor="Aic">
                                                        Akaike&apos;s
                                                        Information Criterion
                                                        (AIC)
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            </ResizablePanel>
                            <ResizableHandle />
                            <ResizablePanel defaultSize={65}>
                                <ResizablePanelGroup direction="horizontal">
                                    <ResizablePanel defaultSize={50}>
                                        <RadioGroup
                                            value={
                                                mainState.Auto
                                                    ? "Auto"
                                                    : "Fixed"
                                            }
                                            onValueChange={handleClusterGrp}
                                        >
                                            <div className="flex flex-col gap-1 p-2">
                                                <Label className="font-bold">
                                                    Number of Clusters:{" "}
                                                </Label>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Auto"
                                                        id="Auto"
                                                    />
                                                    <Label htmlFor="Auto">
                                                        Auto
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 pl-6">
                                                    <Label className="w-[75px]">
                                                        Maximum:
                                                    </Label>
                                                    <div className="w-[75px]">
                                                        <Input
                                                            id="MaxCluster"
                                                            type="number"
                                                            placeholder=""
                                                            value={
                                                                mainState.MaxCluster ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "MaxCluster",
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Fixed"
                                                        id="Fixed"
                                                    />
                                                    <Label htmlFor="Fixed">
                                                        Fixed
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 pl-6">
                                                    <Label className="w-[75px]">
                                                        Number:
                                                    </Label>
                                                    <div className="w-[75px]">
                                                        <Input
                                                            id="NumCluster"
                                                            type="number"
                                                            placeholder=""
                                                            value={
                                                                mainState.NumCluster ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "NumCluster",
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
                                        </RadioGroup>
                                    </ResizablePanel>
                                    <ResizableHandle />
                                    <ResizablePanel defaultSize={50}>
                                        <div className="flex flex-col gap-2 p-2">
                                            <Label className="font-bold">
                                                Count of Continuous Variables:{" "}
                                            </Label>
                                            <div className="flex items-center space-x-2">
                                                <Label className="w-[150px]">
                                                    To Be Standardized:
                                                </Label>
                                                <div className="w-[75px]">
                                                    <Input
                                                        disabled={true}
                                                        id="ToStandardized"
                                                        type="number"
                                                        placeholder=""
                                                        value={
                                                            mainState.ToStandardized ??
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "ToStandardized",
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Label className="w-[150px]">
                                                    Assumed Standardized:
                                                </Label>
                                                <div className="w-[75px]">
                                                    <Input
                                                        disabled={true}
                                                        id="AssumedStandardized"
                                                        type="number"
                                                        placeholder=""
                                                        value={
                                                            mainState.AssumedStandardized ??
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "AssumedStandardized",
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
};
