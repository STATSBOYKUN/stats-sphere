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
    OptScaCatpcaCategoryPlotsProps,
    OptScaCatpcaCategoryPlotsType,
} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const OptScaCatpcaCategoryPlots = ({
    isCategoryPlotsOpen,
    setIsCategoryPlotsOpen,
    updateFormData,
    data,
}: OptScaCatpcaCategoryPlotsProps) => {
    const [categoryPlotsState, setCategoryPlotsState] =
        useState<OptScaCatpcaCategoryPlotsType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);

    useEffect(() => {
        if (isCategoryPlotsOpen) {
            setCategoryPlotsState({ ...data });
            setAvailableVariables(data.SourceVar ?? []);
        }
    }, [isCategoryPlotsOpen, data]);

    const handleChange = (
        field: keyof OptScaCatpcaCategoryPlotsType,
        value: CheckedState | number | string | null
    ) => {
        setCategoryPlotsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDrop = (target: string, variable: string) => {
        setCategoryPlotsState((prev) => {
            const updatedState = { ...prev };

            // Add to target array if it doesn't already exist in that array
            if (target === "CatPlotsVar") {
                const currentArray = updatedState.CatPlotsVar || [];
                if (!currentArray.includes(variable)) {
                    updatedState.CatPlotsVar = [...currentArray, variable];
                }
            } else if (target === "JointCatPlotsVar") {
                const currentArray = updatedState.JointCatPlotsVar || [];
                if (!currentArray.includes(variable)) {
                    updatedState.JointCatPlotsVar = [...currentArray, variable];
                }
            } else if (target === "TransPlotsVar") {
                const currentArray = updatedState.TransPlotsVar || [];
                if (!currentArray.includes(variable)) {
                    updatedState.TransPlotsVar = [...currentArray, variable];
                }
            } else if (target === "PrjCentroidsOfVar") {
                const currentArray = updatedState.PrjCentroidsOfVar || "";
                if (!currentArray.includes(variable)) {
                    updatedState.PrjCentroidsOfVar = variable;
                }
            } else if (target === "PrjCentroidsOntoVar") {
                const currentArray = updatedState.PrjCentroidsOntoVar || [];
                if (!currentArray.includes(variable)) {
                    updatedState.PrjCentroidsOntoVar = [
                        ...currentArray,
                        variable,
                    ];
                }
            }

            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setCategoryPlotsState((prev) => {
            const updatedState = { ...prev };
            if (target === "CatPlotsVar") {
                updatedState.CatPlotsVar = (
                    updatedState.CatPlotsVar || []
                ).filter((item) => item !== variable);
            } else if (target === "JointCatPlotsVar") {
                updatedState.JointCatPlotsVar = (
                    updatedState.JointCatPlotsVar || []
                ).filter((item) => item !== variable);
            } else if (target === "TransPlotsVar") {
                updatedState.TransPlotsVar = (
                    updatedState.TransPlotsVar || []
                ).filter((item) => item !== variable);
            } else if (target === "PrjCentroidsOfVar") {
                updatedState.PrjCentroidsOfVar = "";
            } else if (target === "PrjCentroidsOntoVar") {
                updatedState.PrjCentroidsOntoVar = (
                    updatedState.PrjCentroidsOntoVar || []
                ).filter((item) => item !== variable);
            }
            return updatedState;
        });
    };

    const handleContinue = () => {
        Object.entries(categoryPlotsState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaCatpcaCategoryPlotsType, value);
        });
        setIsCategoryPlotsOpen(false);
    };

    return (
        <>
            {/* Category Plots Dialog */}
            <Dialog
                open={isCategoryPlotsOpen}
                onOpenChange={setIsCategoryPlotsOpen}
            >
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            Categorical Principal Components: Category Plots
                        </DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col gap-2">
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
                                                        {categoryPlotsState.CatPlotsVar &&
                                                        categoryPlotsState
                                                            .CatPlotsVar
                                                            .length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {categoryPlotsState.CatPlotsVar.map(
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
                                                    categoryPlotsState.CatPlotsVar ??
                                                    ""
                                                }
                                                name="Independents"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <Label>Joint Category Plots: </Label>
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
                                            <Label className="font-bold">
                                                Forced Entry:
                                            </Label>
                                            <div className="w-full h-[65px] p-2 border rounded overflow-hidden">
                                                <ScrollArea>
                                                    <div className="w-full h-[65px]">
                                                        {categoryPlotsState.JointCatPlotsVar &&
                                                        categoryPlotsState
                                                            .JointCatPlotsVar
                                                            .length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {categoryPlotsState.JointCatPlotsVar.map(
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
                                                    categoryPlotsState.JointCatPlotsVar ??
                                                    ""
                                                }
                                                name="Independents"
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
                                                            {categoryPlotsState.TransPlotsVar &&
                                                            categoryPlotsState
                                                                .TransPlotsVar
                                                                .length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {categoryPlotsState.TransPlotsVar.map(
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
                                                        categoryPlotsState.TransPlotsVar ??
                                                        ""
                                                    }
                                                    name="Independents"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Label className="w-[225px]">
                                                Dimensions for Multiple Nominal:
                                            </Label>
                                            <div className="w-[75px]">
                                                <Input
                                                    id="DimensionsForMultiNom"
                                                    type="number"
                                                    placeholder=""
                                                    value={
                                                        categoryPlotsState.DimensionsForMultiNom ??
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "DimensionsForMultiNom",
                                                            Number(
                                                                e.target.value
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
                                                    categoryPlotsState.InclResidPlots
                                                }
                                                onCheckedChange={(checked) =>
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
                                    <div className="w-full">
                                        <div
                                            onDragOver={(e) =>
                                                e.preventDefault()
                                            }
                                            onDrop={(e) => {
                                                handleDrop(
                                                    "PrjCentroidsOfVar",
                                                    e.dataTransfer.getData(
                                                        "text"
                                                    )
                                                );
                                            }}
                                        >
                                            <Label>
                                                Project Centroids Of:{" "}
                                            </Label>
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-full min-h-[40px] p-2 border rounded"
                                                    onDrop={(e) => {
                                                        handleDrop(
                                                            "PrjCentroidsOfVar",
                                                            e.dataTransfer.getData(
                                                                "text"
                                                            )
                                                        );
                                                    }}
                                                    onDragOver={(e) =>
                                                        e.preventDefault()
                                                    }
                                                >
                                                    {categoryPlotsState.PrjCentroidsOfVar ? (
                                                        <Badge
                                                            className="text-start text-sm font-light p-2 cursor-pointer"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleRemoveVariable(
                                                                    "PrjCentroidsOfVar"
                                                                )
                                                            }
                                                        >
                                                            {
                                                                categoryPlotsState.PrjCentroidsOfVar
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
                                                        categoryPlotsState.PrjCentroidsOfVar ??
                                                        ""
                                                    }
                                                    name="PrjCentroidsOfVar"
                                                />
                                            </div>
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
                                                    "PrjCentroidsOntoVar",
                                                    variable
                                                );
                                            }}
                                        >
                                            <Label>Onto: </Label>
                                            <div className="w-full h-[65px] p-2 border rounded overflow-hidden">
                                                <ScrollArea>
                                                    <div className="w-full h-[65px]">
                                                        {categoryPlotsState.PrjCentroidsOntoVar &&
                                                        categoryPlotsState
                                                            .PrjCentroidsOntoVar
                                                            .length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {categoryPlotsState.PrjCentroidsOntoVar.map(
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
                                                                                    "PrjCentroidsOntoVar",
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
                                                    categoryPlotsState.PrjCentroidsOntoVar ??
                                                    ""
                                                }
                                                name="Independents"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
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
                            onClick={() => setIsCategoryPlotsOpen(false)}
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
