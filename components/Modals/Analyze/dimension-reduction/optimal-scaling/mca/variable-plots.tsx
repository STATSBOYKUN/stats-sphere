import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    OptScaMCAVariablePlotsProps,
    OptScaMCAVariablePlotsType,
} from "@/models/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

export const OptScaMCAVariablePlots = ({
    isVariablePlotsOpen,
    setIsVariablePlotsOpen,
    updateFormData,
    data,
}: OptScaMCAVariablePlotsProps) => {
    const [variablePlotsState, setVariablePlotsState] =
        useState<OptScaMCAVariablePlotsType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);

    useEffect(() => {
        if (isVariablePlotsOpen) {
            setVariablePlotsState({ ...data });
            setAvailableVariables(data.SourceVar ?? []);
        }
    }, [isVariablePlotsOpen, data]);

    const handleChange = (
        field: keyof OptScaMCAVariablePlotsType,
        value: CheckedState | number | string | null
    ) => {
        setVariablePlotsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDiscGrp = (value: string) => {
        setVariablePlotsState((prevState) => ({
            ...prevState,
            UseAllVars: value === "UseAllVars",
            UseSelectedVars: value === "UseSelectedVars",
        }));
    };

    const handleDrop = (target: string, variable: string) => {
        setVariablePlotsState((prev) => {
            const updatedState = { ...prev };

            // Add to target array if it doesn't already exist in that array
            if (target === "CatPlotsVar") {
                const currentArray = Array.isArray(updatedState.CatPlotsVar)
                    ? updatedState.CatPlotsVar
                    : updatedState.CatPlotsVar
                    ? [updatedState.CatPlotsVar]
                    : [];

                if (!currentArray.includes(variable)) {
                    updatedState.CatPlotsVar = [...currentArray, variable];
                }
            } else if (target === "JointCatPlotsVar") {
                const currentArray = Array.isArray(
                    updatedState.JointCatPlotsVar
                )
                    ? updatedState.JointCatPlotsVar
                    : updatedState.JointCatPlotsVar
                    ? [updatedState.JointCatPlotsVar]
                    : [];

                if (!currentArray.includes(variable)) {
                    updatedState.JointCatPlotsVar = [...currentArray, variable];
                }
            } else if (target === "TransPlotsVar") {
                const currentArray = Array.isArray(updatedState.TransPlotsVar)
                    ? updatedState.TransPlotsVar
                    : updatedState.TransPlotsVar
                    ? [updatedState.TransPlotsVar]
                    : [];

                if (!currentArray.includes(variable)) {
                    updatedState.TransPlotsVar = [...currentArray, variable];
                }
            } else if (target === "DiscMeasuresVar") {
                const currentArray = Array.isArray(updatedState.DiscMeasuresVar)
                    ? updatedState.DiscMeasuresVar
                    : updatedState.DiscMeasuresVar
                    ? [updatedState.DiscMeasuresVar]
                    : [];

                if (!currentArray.includes(variable)) {
                    updatedState.DiscMeasuresVar = [...currentArray, variable];
                }
            }

            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setVariablePlotsState((prev) => {
            const updatedState = { ...prev };

            if (
                target === "CatPlotsVar" &&
                Array.isArray(updatedState.CatPlotsVar)
            ) {
                updatedState.CatPlotsVar = updatedState.CatPlotsVar.filter(
                    (item) => item !== variable
                );
            } else if (
                target === "JointCatPlotsVar" &&
                Array.isArray(updatedState.JointCatPlotsVar)
            ) {
                updatedState.JointCatPlotsVar =
                    updatedState.JointCatPlotsVar.filter(
                        (item) => item !== variable
                    );
            } else if (
                target === "TransPlotsVar" &&
                Array.isArray(updatedState.TransPlotsVar)
            ) {
                updatedState.TransPlotsVar = updatedState.TransPlotsVar.filter(
                    (item) => item !== variable
                );
            } else if (
                target === "DiscMeasuresVar" &&
                Array.isArray(updatedState.DiscMeasuresVar)
            ) {
                updatedState.DiscMeasuresVar =
                    updatedState.DiscMeasuresVar.filter(
                        (item) => item !== variable
                    );
            }

            return updatedState;
        });
    };

    const handleContinue = () => {
        Object.entries(variablePlotsState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaMCAVariablePlotsType, value);
        });
        setIsVariablePlotsOpen(false);
    };

    return (
        <>
            {/* Variable Plots Dialog */}
            <Dialog
                open={isVariablePlotsOpen}
                onOpenChange={setIsVariablePlotsOpen}
            >
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            Multiple Correspondence Analysis: Variable Plots
                        </DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="h-[450px] flex flex-col gap-2">
                        <ScrollArea>
                            <ResizablePanelGroup
                                direction="horizontal"
                                className="min-h-[450px] max-w-xl rounded-lg border md:min-w-[200px]"
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
                                <ResizablePanel defaultSize={75}>
                                    <div className="flex flex-col p-2">
                                        <div className="w-full">
                                            <div
                                                className="flex flex-col w-full gap-2"
                                                onDragOver={(e) =>
                                                    e.preventDefault()
                                                }
                                                onDrop={(e) => {
                                                    const variable =
                                                        e.dataTransfer.getData(
                                                            "text"
                                                        );
                                                    handleDrop(
                                                        "CatPlotsVar",
                                                        variable
                                                    );
                                                }}
                                            >
                                                <Label>Category Plots: </Label>
                                                <div className="w-full h-[65px] p-2 border rounded overflow-hidden">
                                                    <ScrollArea>
                                                        <div className="w-full h-[65px]">
                                                            {Array.isArray(
                                                                variablePlotsState.CatPlotsVar
                                                            ) &&
                                                            variablePlotsState
                                                                .CatPlotsVar
                                                                .length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {variablePlotsState.CatPlotsVar.map(
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
                                                                                        "CatPlotsVar",
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
                                                        variablePlotsState.CatPlotsVar ??
                                                        ""
                                                    }
                                                    name="CatPlotsVar"
                                                />
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <div
                                                className="flex flex-col w-full gap-2"
                                                onDragOver={(e) =>
                                                    e.preventDefault()
                                                }
                                                onDrop={(e) => {
                                                    const variable =
                                                        e.dataTransfer.getData(
                                                            "text"
                                                        );
                                                    handleDrop(
                                                        "JointCatPlotsVar",
                                                        variable
                                                    );
                                                }}
                                            >
                                                <Label>
                                                    Joint Category Plots:{" "}
                                                </Label>
                                                <div className="w-full h-[65px] p-2 border rounded overflow-hidden">
                                                    <ScrollArea>
                                                        <div className="w-full h-[65px]">
                                                            {Array.isArray(
                                                                variablePlotsState.JointCatPlotsVar
                                                            ) &&
                                                            variablePlotsState
                                                                .JointCatPlotsVar
                                                                .length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {variablePlotsState.JointCatPlotsVar.map(
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
                                                                                        "JointCatPlotsVar",
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
                                                        variablePlotsState.JointCatPlotsVar ??
                                                        ""
                                                    }
                                                    name="JointCatPlotsVar"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="w-full">
                                                <div
                                                    className="flex flex-col w-full gap-2"
                                                    onDragOver={(e) =>
                                                        e.preventDefault()
                                                    }
                                                    onDrop={(e) => {
                                                        const variable =
                                                            e.dataTransfer.getData(
                                                                "text"
                                                            );
                                                        handleDrop(
                                                            "TransPlotsVar",
                                                            variable
                                                        );
                                                    }}
                                                >
                                                    <Label>
                                                        Transformation Plots:{" "}
                                                    </Label>
                                                    <div className="w-full h-[65px] p-2 border rounded overflow-hidden">
                                                        <ScrollArea>
                                                            <div className="w-full h-[65px]">
                                                                {Array.isArray(
                                                                    variablePlotsState.TransPlotsVar
                                                                ) &&
                                                                variablePlotsState
                                                                    .TransPlotsVar
                                                                    .length >
                                                                    0 ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {variablePlotsState.TransPlotsVar.map(
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
                                                                                            "TransPlotsVar",
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
                                                            variablePlotsState.TransPlotsVar ??
                                                            ""
                                                        }
                                                        name="TransPlotsVar"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Label className="w-[225px]">
                                                    Dimensions for Multiple
                                                    Nominal:
                                                </Label>
                                                <div className="w-[75px]">
                                                    <Input
                                                        id="DimensionsForMultiNom"
                                                        type="number"
                                                        placeholder=""
                                                        value={
                                                            variablePlotsState.DimensionsForMultiNom ??
                                                            ""
                                                        }
                                                        disabled={
                                                            !Array.isArray(
                                                                variablePlotsState.TransPlotsVar
                                                            ) ||
                                                            variablePlotsState
                                                                .TransPlotsVar
                                                                .length === 0
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "DimensionsForMultiNom",
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
                                                <Checkbox
                                                    id="InclResidPlots"
                                                    checked={
                                                        variablePlotsState.InclResidPlots
                                                    }
                                                    disabled={
                                                        !Array.isArray(
                                                            variablePlotsState.TransPlotsVar
                                                        ) ||
                                                        variablePlotsState
                                                            .TransPlotsVar
                                                            .length === 0
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "InclResidPlots",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="InclResidPlots"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Include Residual Plots
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 pt-2 w-full">
                                            <Label className="font-bold">
                                                Discriminant Measures
                                            </Label>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="DisplayPlot"
                                                    checked={
                                                        variablePlotsState.DisplayPlot
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "DisplayPlot",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="DisplayPlot"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Display Plot
                                                </label>
                                            </div>
                                            <RadioGroup
                                                value={
                                                    variablePlotsState.UseAllVars
                                                        ? "UseAllVars"
                                                        : "UseSelectedVars"
                                                }
                                                onValueChange={handleDiscGrp}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="UseAllVars"
                                                        id="UseAllVars"
                                                    />
                                                    <Label htmlFor="UseAllVars">
                                                        Use All Variables
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="UseSelectedVars"
                                                        id="UseSelectedVars"
                                                    />
                                                    <Label htmlFor="UseSelectedVars">
                                                        Use Selected Variables
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                            <div
                                                className="flex flex-col w-full gap-2"
                                                onDragOver={(e) =>
                                                    e.preventDefault()
                                                }
                                                onDrop={(e) => {
                                                    const variable =
                                                        e.dataTransfer.getData(
                                                            "text"
                                                        );
                                                    handleDrop(
                                                        "DiscMeasuresVar",
                                                        variable
                                                    );
                                                }}
                                            >
                                                <div className="w-full h-[65px] p-2 border rounded overflow-hidden">
                                                    <ScrollArea>
                                                        <div className="w-full h-[65px]">
                                                            {Array.isArray(
                                                                variablePlotsState.DiscMeasuresVar
                                                            ) &&
                                                            variablePlotsState
                                                                .DiscMeasuresVar
                                                                .length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {variablePlotsState.DiscMeasuresVar.map(
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
                                                                                        "DiscMeasuresVar",
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
                                                        variablePlotsState.DiscMeasuresVar ??
                                                        ""
                                                    }
                                                    name="DiscMeasuresVar"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ScrollArea>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            disabled={isContinueDisabled}
                            type="button"
                            onClick={handleContinue}
                        >
                            Continue
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsVariablePlotsOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="button" variant="secondary">
                            Help
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
