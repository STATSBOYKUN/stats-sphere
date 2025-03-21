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
    OptScaCatpcaOutputProps,
    OptScaCatpcaOutputType,
} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const OptScaCatpcaOutput = ({
    isOutputOpen,
    setIsOutputOpen,
    updateFormData,
    data,
}: OptScaCatpcaOutputProps) => {
    const [outputState, setOutputState] = useState<OptScaCatpcaOutputType>({
        ...data,
    });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);
    const [availableQuantifiedVariables, setAvailableQuantifiedVariables] =
        useState<string[]>([]);
    const [availableLabelingVariables, setAvailableLabelingVariables] =
        useState<string[]>([]);

    useEffect(() => {
        if (isOutputOpen) {
            setOutputState({ ...data });
            setAvailableQuantifiedVariables(data.QuantifiedVars ?? []);
            setAvailableLabelingVariables(data.LabelingVars ?? []);
        }
    }, [isOutputOpen, data]);

    const handleChange = (
        field: keyof OptScaCatpcaOutputType,
        value: CheckedState | number | string | null
    ) => {
        setOutputState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDrop = (target, variable) => {
        setOutputState((prev) => {
            const updatedState = { ...prev };

            // Add to target array if it doesn't already exist in that array
            if (target === "CatQuantifications") {
                const currentArray = updatedState.CatQuantifications || [];
                if (!currentArray.includes(variable)) {
                    updatedState.CatQuantifications = [
                        ...currentArray,
                        variable,
                    ];
                }
            } else if (target === "DescStats") {
                const currentArray = updatedState.DescStats || [];
                if (!currentArray.includes(variable)) {
                    updatedState.DescStats = [...currentArray, variable];
                }
            } else if (target === "ObjScoresIncludeCat") {
                const currentArray = updatedState.ObjScoresIncludeCat || [];
                if (!currentArray.includes(variable)) {
                    updatedState.ObjScoresIncludeCat = [
                        ...currentArray,
                        variable,
                    ];
                }
            } else if (target === "ObjScoresLabelBy") {
                const currentArray = updatedState.ObjScoresLabelBy || [];
                if (!currentArray.includes(variable)) {
                    updatedState.ObjScoresLabelBy = [...currentArray, variable];
                }
            }

            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setOutputState((prev) => {
            const updatedState = { ...prev };
            if (target === "CatQuantifications") {
                updatedState.CatQuantifications = (
                    updatedState.CatQuantifications || []
                ).filter((item) => item !== variable);
            } else if (target === "DescStats") {
                updatedState.DescStats = (updatedState.DescStats || []).filter(
                    (item) => item !== variable
                );
            } else if (target === "ObjScoresIncludeCat") {
                updatedState.ObjScoresIncludeCat = (
                    updatedState.ObjScoresIncludeCat || []
                ).filter((item) => item !== variable);
            } else if (target === "ObjScoresLabelBy") {
                updatedState.ObjScoresLabelBy = (
                    updatedState.ObjScoresLabelBy || []
                ).filter((item) => item !== variable);
            }
            return updatedState;
        });
    };

    const handleContinue = () => {
        Object.entries(outputState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaCatpcaOutputType, value);
        });
        setIsOutputOpen(false);
    };

    return (
        <>
            {/* Output Dialog */}
            <Dialog open={isOutputOpen} onOpenChange={setIsOutputOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Categorical Principal Components: Output
                        </DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[450px] max-w-md rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={30}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">Tables</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="ObjectScores"
                                                checked={
                                                    outputState.ObjectScores
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "ObjectScores",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="ObjectScores"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Object Scores
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="ComponentLoadings"
                                                checked={
                                                    outputState.ComponentLoadings
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "ComponentLoadings",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="ComponentLoadings"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Component Loadings
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2 pl-6">
                                            <Checkbox
                                                id="SortBySize"
                                                checked={outputState.SortBySize}
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "SortBySize",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="SortBySize"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Sort by Size
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="IterationHistory"
                                                checked={
                                                    outputState.IterationHistory
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "IterationHistory",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="IterationHistory"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Iteration History
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="CorreOriginalVars"
                                                checked={
                                                    outputState.CorreOriginalVars
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "CorreOriginalVars",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="CorreOriginalVars"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Correlation of Original
                                                Variables
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="CorreTransVars"
                                                checked={
                                                    outputState.CorreTransVars
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "CorreTransVars",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="CorreTransVars"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Correlation of Transformed
                                                Variables
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="Variance"
                                                checked={outputState.Variance}
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "Variance",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="Variance"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Variance Accounted For
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={70}>
                            <ResizablePanelGroup direction="horizontal">
                                <ResizablePanel defaultSize={50}>
                                    <div className="flex flex-col gap-8 p-2">
                                        <div className="w-full">
                                            <Label>
                                                Quantified Variables:{" "}
                                            </Label>
                                            <ScrollArea>
                                                <div className="flex flex-col gap-1 justify-start items-start h-[100px] w-full p-2">
                                                    {availableQuantifiedVariables.map(
                                                        (
                                                            variable: string,
                                                            index: number
                                                        ) => (
                                                            <Badge
                                                                key={index}
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
                                                                {variable}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                        <div className="w-full">
                                            <Label>Labeling Variables: </Label>
                                            <ScrollArea>
                                                <div className="flex flex-col gap-1 justify-start items-start h-[100px] w-full p-2">
                                                    {availableLabelingVariables.map(
                                                        (
                                                            variable: string,
                                                            index: number
                                                        ) => (
                                                            <Badge
                                                                key={index}
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
                                                                {variable}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={50}>
                                    <div className="flex flex-col gap-2 p-2">
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
                                                        "CatQuantifications",
                                                        variable
                                                    );
                                                }}
                                            >
                                                <Label>
                                                    Category Quantifications:{" "}
                                                </Label>
                                                <div className="w-full h-[35px] p-2 border rounded overflow-hidden">
                                                    <ScrollArea>
                                                        <div className="w-full h-[35px]">
                                                            {outputState.CatQuantifications &&
                                                            outputState
                                                                .CatQuantifications
                                                                .length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {outputState.CatQuantifications.map(
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
                                                                                        "CatQuantifications",
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
                                                        outputState.CatQuantifications ??
                                                        ""
                                                    }
                                                    name="Independents"
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
                                                        "DescStats",
                                                        variable
                                                    );
                                                }}
                                            >
                                                <Label>
                                                    Descriptive Statistics:{" "}
                                                </Label>
                                                <div className="w-full h-[35px] p-2 border rounded overflow-hidden">
                                                    <ScrollArea>
                                                        <div className="w-full h-[35px]">
                                                            {outputState.DescStats &&
                                                            outputState
                                                                .DescStats
                                                                .length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {outputState.DescStats.map(
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
                                                                                        "DescStats",
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
                                                        outputState.DescStats ??
                                                        ""
                                                    }
                                                    name="Independents"
                                                />
                                            </div>
                                        </div>
                                        <Label className="font-bold">
                                            Object Scores Options
                                        </Label>
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
                                                        "ObjScoresIncludeCat",
                                                        variable
                                                    );
                                                }}
                                            >
                                                <Label>
                                                    Include Categories of:{" "}
                                                </Label>
                                                <div className="w-full h-[35px] p-2 border rounded overflow-hidden">
                                                    <ScrollArea>
                                                        <div className="w-full h-[35px]">
                                                            {outputState.ObjScoresIncludeCat &&
                                                            outputState
                                                                .ObjScoresIncludeCat
                                                                .length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {outputState.ObjScoresIncludeCat.map(
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
                                                                                        "ObjScoresIncludeCat",
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
                                                        outputState.ObjScoresIncludeCat ??
                                                        ""
                                                    }
                                                    name="Independents"
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
                                                        "ObjScoresLabelBy",
                                                        variable
                                                    );
                                                }}
                                            >
                                                <Label>
                                                    Label Object Scores By:{" "}
                                                </Label>
                                                <div className="w-full h-[35px] p-2 border rounded overflow-hidden">
                                                    <ScrollArea>
                                                        <div className="w-full h-[35px]">
                                                            {outputState.ObjScoresLabelBy &&
                                                            outputState
                                                                .ObjScoresLabelBy
                                                                .length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {outputState.ObjScoresLabelBy.map(
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
                                                                                        "ObjScoresLabelBy",
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
                                                        outputState.ObjScoresLabelBy ??
                                                        ""
                                                    }
                                                    name="Independents"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
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
                            onClick={() => setIsOutputOpen(false)}
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
