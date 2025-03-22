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
    OptScaCatpcaObjectPlotsProps,
    OptScaCatpcaObjectPlotsType,
} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckedState } from "@radix-ui/react-checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const OptScaCatpcaObjectPlots = ({
    isObjectPlotsOpen,
    setIsObjectPlotsOpen,
    updateFormData,
    data,
}: OptScaCatpcaObjectPlotsProps) => {
    const [objectPlotsState, setObjectPlotsState] =
        useState<OptScaCatpcaObjectPlotsType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);
    const [availableBTVariables, setAvailableBTVariables] = useState<string[]>(
        []
    );
    const [availableLabelVariables, setAvailableLabelVariables] = useState<
        string[]
    >([]);

    useEffect(() => {
        if (isObjectPlotsOpen) {
            setObjectPlotsState({ ...data });
            setAvailableBTVariables(data.BTAvailableVars ?? []);
            setAvailableLabelVariables(data.LabelObjAvailableVars ?? []);
        }
    }, [isObjectPlotsOpen, data]);

    useEffect(() => {
        const usedBTVariables = [
            ...(objectPlotsState.BTSelectedVars || []),
        ].filter(Boolean);

        if (!(objectPlotsState.BTAvailableVars === null)) {
            const updatedVariables = objectPlotsState.BTAvailableVars.filter(
                (variable) => !usedBTVariables.includes(variable)
            );
            setAvailableBTVariables(updatedVariables);
        }

        const usedLabelVariables = [
            ...(objectPlotsState.LabelObjSelectedVars || []),
        ].filter(Boolean);

        if (!(objectPlotsState.LabelObjAvailableVars === null)) {
            const updatedVariables =
                objectPlotsState.LabelObjAvailableVars.filter(
                    (variable) => !usedLabelVariables.includes(variable)
                );
            setAvailableLabelVariables(updatedVariables);
        }
    }, [objectPlotsState]);

    const handleChange = (
        field: keyof OptScaCatpcaObjectPlotsType,
        value: CheckedState | number | string | null
    ) => {
        setObjectPlotsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleBiGrp = (value: string) => {
        setObjectPlotsState((prevState) => ({
            ...prevState,
            BiLoadings: value === "BiLoadings",
            BiCentroids: value === "BiCentroids",
        }));
    };

    const handleBTInclude = (value: string) => {
        setObjectPlotsState((prevState) => ({
            ...prevState,
            BTIncludeAllVars: value === "BTIncludeAllVars",
            BTIncludeSelectedVars: value === "BTIncludeSelectedVars",
        }));
    };

    const handleLabelObj = (value: string) => {
        setObjectPlotsState((prevState) => ({
            ...prevState,
            LabelObjLabelByCaseNumber: value === "LabelObjLabelByCaseNumber",
            LabelObjLabelByVar: value === "LabelObjLabelByVar",
        }));
    };

    const handleDrop = (target: string, variable: string) => {
        setObjectPlotsState((prev) => {
            const updatedState = { ...prev };
            if (target === "BTSelectedVars") {
                updatedState.BTSelectedVars = [
                    ...(updatedState.BTSelectedVars || []),
                    variable,
                ];
            } else if (target === "LabelObjSelectedVars") {
                updatedState.LabelObjSelectedVars = [
                    ...(updatedState.LabelObjSelectedVars || []),
                    variable,
                ];
            }
            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setObjectPlotsState((prev) => {
            const updatedState = { ...prev };
            if (target === "BTSelectedVars") {
                updatedState.BTSelectedVars = (
                    updatedState.BTSelectedVars || []
                ).filter((item) => item !== variable);
            } else if (target === "LabelObjSelectedVars") {
                updatedState.LabelObjSelectedVars = (
                    updatedState.LabelObjSelectedVars || []
                ).filter((item) => item !== variable);
            }
            return updatedState;
        });
    };

    const handleContinue = () => {
        Object.entries(objectPlotsState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaCatpcaObjectPlotsType, value);
        });
        setIsObjectPlotsOpen(false);
    };

    return (
        <>
            {/* Object Plots Dialog */}
            <Dialog
                open={isObjectPlotsOpen}
                onOpenChange={setIsObjectPlotsOpen}
            >
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            Categorical Principal Components: Object Plots
                        </DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="h-[450px] flex flex-col gap-2">
                        <ScrollArea>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[625px] max-w-xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={20}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Plots
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="ObjectPoints"
                                                checked={
                                                    objectPlotsState.ObjectPoints
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "ObjectPoints",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="ObjectPoints"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Object Points
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="Biplot"
                                                checked={
                                                    objectPlotsState.Biplot
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "Biplot",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="Biplot"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Object and Variable (Biplot)
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2 pl-6">
                                            <Label>
                                                Variable Coordinates:{" "}
                                            </Label>
                                            <RadioGroup
                                                value={
                                                    objectPlotsState.BiLoadings
                                                        ? "BiLoadings"
                                                        : "BiCentroids"
                                                }
                                                disabled={
                                                    !objectPlotsState.Biplot
                                                }
                                                onValueChange={handleBiGrp}
                                            >
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem
                                                            value="BiLoadings"
                                                            id="BiLoadings"
                                                        />
                                                        <Label htmlFor="BiLoadings">
                                                            Loadings
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem
                                                            value="BiCentroids"
                                                            id="BiCentroids"
                                                        />
                                                        <Label htmlFor="BiCentroids">
                                                            Centroids
                                                        </Label>
                                                    </div>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="Triplot"
                                                checked={
                                                    objectPlotsState.Triplot
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "Triplot",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="Triplot"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Objects, Loadings, and Centroids
                                                (Triplot)
                                            </label>
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={40}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Biplot and Triplot Variables
                                        </Label>
                                        <ResizablePanelGroup direction="horizontal">
                                            <ResizablePanel defaultSize={65}>
                                                <div className="grid grid-cols-2 gap-2 p-2">
                                                    <div className="flex flex-col gap-2">
                                                        <Label>Include: </Label>
                                                        <RadioGroup
                                                            value={
                                                                objectPlotsState.BTIncludeAllVars
                                                                    ? "BTIncludeAllVars"
                                                                    : "BTIncludeSelectedVars"
                                                            }
                                                            disabled={
                                                                !objectPlotsState.Biplot
                                                            }
                                                            onValueChange={
                                                                handleBTInclude
                                                            }
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="BTIncludeAllVars"
                                                                    id="BTIncludeAllVars"
                                                                />
                                                                <Label htmlFor="BTIncludeAllVars">
                                                                    All
                                                                    Variables
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="BTIncludeSelectedVars"
                                                                    id="BTIncludeSelectedVars"
                                                                />
                                                                <Label htmlFor="BTIncludeSelectedVars">
                                                                    Selected
                                                                    Variables
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label>
                                                            Available:{" "}
                                                        </Label>
                                                        <ScrollArea>
                                                            <div className="flex flex-col justify-start items-start h-[175px] p-2 border rounded overflow-hidden">
                                                                {availableBTVariables.map(
                                                                    (
                                                                        variable: string,
                                                                        index: number
                                                                    ) => (
                                                                        <Badge
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="w-full text-start text-sm font-light p-2 cursor-pointer"
                                                                            variant="outline"
                                                                            draggable
                                                                            onDragStart={(
                                                                                e
                                                                            ) =>
                                                                                e.dataTransfer.setData(
                                                                                    "text",
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
                                                        </ScrollArea>
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle withHandle />
                                            <ResizablePanel defaultSize={35}>
                                                <div
                                                    className="flex flex-col w-full gap-2 p-2"
                                                    onDragOver={(e) =>
                                                        e.preventDefault()
                                                    }
                                                    onDrop={(e) => {
                                                        const variable =
                                                            e.dataTransfer.getData(
                                                                "text"
                                                            );
                                                        handleDrop(
                                                            "BTSelectedVars",
                                                            variable
                                                        );
                                                    }}
                                                >
                                                    <Label className="font-bold">
                                                        <Label>
                                                            Selected:{" "}
                                                        </Label>
                                                    </Label>
                                                    <div className="w-full h-[175px] p-2 border rounded overflow-hidden">
                                                        <ScrollArea>
                                                            <div className="w-full h-[175px]">
                                                                {objectPlotsState.BTSelectedVars &&
                                                                objectPlotsState
                                                                    .BTSelectedVars
                                                                    .length >
                                                                    0 ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {objectPlotsState.BTSelectedVars.map(
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
                                                                                            "BTSelectedVars",
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
                                                            objectPlotsState.BTSelectedVars ??
                                                            ""
                                                        }
                                                        name="Independents"
                                                    />
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={35}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Label Objects
                                        </Label>
                                        <ResizablePanelGroup direction="horizontal">
                                            <ResizablePanel defaultSize={65}>
                                                <div className="grid grid-cols-2 gap-2 p-2">
                                                    <div className="flex flex-col gap-2">
                                                        <Label>
                                                            Label By:{" "}
                                                        </Label>
                                                        <RadioGroup
                                                            value={
                                                                objectPlotsState.LabelObjLabelByCaseNumber
                                                                    ? "LabelObjLabelByCaseNumber"
                                                                    : "LabelObjLabelByVar"
                                                            }
                                                            onValueChange={
                                                                handleLabelObj
                                                            }
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="LabelObjLabelByCaseNumber"
                                                                    id="LabelObjLabelByCaseNumber"
                                                                />
                                                                <Label htmlFor="LabelObjLabelByCaseNumber">
                                                                    Case Number
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="LabelObjLabelByVar"
                                                                    id="LabelObjLabelByVar"
                                                                />
                                                                <Label htmlFor="LabelObjLabelByVar">
                                                                    Variable
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label>
                                                            Available:{" "}
                                                        </Label>
                                                        <ScrollArea>
                                                            <div className="flex flex-col justify-start items-start h-[150px] p-2 border rounded overflow-hidden">
                                                                {availableLabelVariables.map(
                                                                    (
                                                                        variable: string,
                                                                        index: number
                                                                    ) => (
                                                                        <Badge
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="w-full text-start text-sm font-light p-2 cursor-pointer"
                                                                            variant="outline"
                                                                            draggable
                                                                            onDragStart={(
                                                                                e
                                                                            ) =>
                                                                                e.dataTransfer.setData(
                                                                                    "text",
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
                                                        </ScrollArea>
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle withHandle />
                                            <ResizablePanel defaultSize={35}>
                                                <div
                                                    className="flex flex-col w-full gap-2 p-2"
                                                    onDragOver={(e) =>
                                                        e.preventDefault()
                                                    }
                                                    onDrop={(e) => {
                                                        const variable =
                                                            e.dataTransfer.getData(
                                                                "text"
                                                            );
                                                        handleDrop(
                                                            "LabelObjSelectedVars",
                                                            variable
                                                        );
                                                    }}
                                                >
                                                    <Label>Selected:</Label>
                                                    <div className="w-full h-[150px] p-2 border rounded overflow-hidden">
                                                        <ScrollArea>
                                                            <div className="w-full h-[150px]">
                                                                {objectPlotsState.LabelObjSelectedVars &&
                                                                objectPlotsState
                                                                    .LabelObjSelectedVars
                                                                    .length >
                                                                    0 ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {objectPlotsState.LabelObjSelectedVars.map(
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
                                                                                            "LabelObjSelectedVars",
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
                                                            objectPlotsState.LabelObjSelectedVars ??
                                                            ""
                                                        }
                                                        name="Independents"
                                                    />
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
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
                            onClick={() => setIsObjectPlotsOpen(false)}
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
