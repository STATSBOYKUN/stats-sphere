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

    useEffect(() => {
        if (isOutputOpen) {
            setOutputState({ ...data });
        }
    }, [isOutputOpen, data]);

    const handleChange = (
        field: keyof TwoStepClusterOutputType,
        value: CheckedState | number | string | null
    ) => {
        setOutputState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
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
                                        <div className="w-full p-2">
                                            <Label>Variables: </Label>
                                            <Input
                                                id="SrcVar"
                                                type="text"
                                                className="w-full min-h-[65px]"
                                                placeholder=""
                                                value={outputState.SrcVar ?? ""}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "SrcVar",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </ResizablePanel>
                                    <ResizableHandle />
                                    <ResizablePanel defaultSize={50}>
                                        <div className="w-full p-2">
                                            <Label>Evaluation Fields: </Label>
                                            <Input
                                                id="TargetVar"
                                                type="text"
                                                className="w-full min-h-[65px]"
                                                placeholder=""
                                                value={
                                                    outputState.TargetVar ?? ""
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        "TargetVar",
                                                        e.target.value
                                                    )
                                                }
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
