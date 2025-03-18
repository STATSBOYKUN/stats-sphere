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
    TwoStepClusterOutputProps,
    TwoStepClusterOutputType,
} from "@/models/classify/two-step-cluster/two-step-cluster";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const TwoStepClusterOutput = ({
    isOutputOpen,
    setIsOutputOpen,
    updateFormData,
    data,
}: TwoStepClusterOutputProps) => {
    const [outputState, setOutputState] = useState<TwoStepClusterOutputType>({
        ...data,
    });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);

    useEffect(() => {
        if (isOutputOpen) {
            setOutputState({ ...data });
            setAvailableVariables(data.SrcVar ?? []);
        }
    }, [isOutputOpen, data]);

    useEffect(() => {
        const usedVariables = [...(outputState.TargetVar || [])].filter(
            Boolean
        );

        if (!(outputState.SrcVar === null)) {
            const updatedVariables = outputState.SrcVar.filter(
                (variable) => !usedVariables.includes(variable)
            );
            setAvailableVariables(updatedVariables);
        }
    }, [outputState]);

    const handleChange = (
        field: keyof TwoStepClusterOutputType,
        value: CheckedState | number | string | null
    ) => {
        setOutputState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDrop = (target: string, variable: string) => {
        setOutputState((prev) => {
            const updatedState = { ...prev };
            if (target === "TargetVar") {
                updatedState.TargetVar = [
                    ...(updatedState.TargetVar || []),
                    variable,
                ];
            }
            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setOutputState((prev) => {
            const updatedState = { ...prev };
            if (target === "TargetVar") {
                updatedState.TargetVar = (updatedState.TargetVar || []).filter(
                    (item) => item !== variable
                );
            }
            return updatedState;
        });
    };

    const handleContinue = () => {
        Object.entries(outputState).forEach(([key, value]) => {
            updateFormData(key as keyof TwoStepClusterOutputType, value);
        });
        setIsOutputOpen(false);
    };

    return (
        <>
            {/* Output Dialog */}
            <Dialog open={isOutputOpen} onOpenChange={setIsOutputOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            TwoStep Cluster Analysis: Output
                        </DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[465px] max-w-2xl rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={50}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">Output</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="PivotTable"
                                        checked={outputState.PivotTable}
                                        onCheckedChange={(checked) =>
                                            handleChange("PivotTable", checked)
                                        }
                                    />
                                    <label
                                        htmlFor="PivotTable"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Pivot Tables
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="ChartTable"
                                        checked={outputState.ChartTable}
                                        onCheckedChange={(checked) =>
                                            handleChange("ChartTable", checked)
                                        }
                                    />
                                    <label
                                        htmlFor="ChartTable"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Chart and Tables
                                    </label>
                                </div>
                                <div className="text-sm text-justify">
                                    Variables specified as evaluation fields can
                                    be optionally displayed in the Model Viewer
                                    as Cluster Descriptors.
                                </div>
                                <ResizablePanelGroup direction="horizontal">
                                    <ResizablePanel defaultSize={50}>
                                        <div className="flex flex-col gap-2">
                                            <Label>Variables:</Label>
                                            <ScrollArea>
                                                <div className="flex flex-col justify-start items-start h-[150px] gap-1 p-2 border rounded overflow-hidden">
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
                                    </ResizablePanel>
                                    <ResizableHandle />
                                    <ResizablePanel defaultSize={50}>
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
                                                    "TargetVar",
                                                    variable
                                                );
                                            }}
                                        >
                                            <Label>Evaluation Fields: </Label>
                                            <div className="w-full h-[150px] p-2 border rounded overflow-hidden">
                                                <ScrollArea>
                                                    <div className="w-full h-[150px]">
                                                        {outputState.TargetVar &&
                                                        outputState.TargetVar
                                                            .length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {outputState.TargetVar.map(
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
                                                                                    "TargetVar",
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
                                                    outputState.TargetVar ?? ""
                                                }
                                                name="TargetVar"
                                            />
                                        </div>
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={13}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">Export</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="ClustVar"
                                        checked={outputState.ClustVar}
                                        onCheckedChange={(checked) =>
                                            handleChange("ClustVar", checked)
                                        }
                                    />
                                    <label
                                        htmlFor="ClustVar"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Create Cluster Membership Variable
                                    </label>
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={37}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">XML Files</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="ExportModel"
                                        checked={outputState.ExportModel}
                                        onCheckedChange={(checked) =>
                                            handleChange("ExportModel", checked)
                                        }
                                    />
                                    <label
                                        htmlFor="ExportModel"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Export Final Model
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2 pl-6">
                                    <Label>Name: </Label>
                                    <Input
                                        id="ModelName"
                                        type="file"
                                        className="w-full"
                                        placeholder=""
                                        disabled={!outputState.ExportModel}
                                        onChange={(e) =>
                                            handleChange(
                                                "ModelName",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="ExportCFTree"
                                        checked={outputState.ExportCFTree}
                                        onCheckedChange={(checked) =>
                                            handleChange(
                                                "ExportCFTree",
                                                checked
                                            )
                                        }
                                    />
                                    <label
                                        htmlFor="ExportCFTree"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Export CF Tree
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2 pl-6">
                                    <Label>Name: </Label>
                                    <Input
                                        id="CFTreeName"
                                        type="file"
                                        className="w-full"
                                        placeholder=""
                                        disabled={!outputState.ExportCFTree}
                                        onChange={(e) =>
                                            handleChange(
                                                "CFTreeName",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
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
