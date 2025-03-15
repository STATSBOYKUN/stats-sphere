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
import { TreeSaveProps, TreeSaveType } from "@/models/classify/tree/tree";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Input } from "@/components/ui/input";

export const TreeSave = ({
    isSaveOpen,
    setIsSaveOpen,
    updateFormData,
    data,
}: TreeSaveProps) => {
    const [saveState, setSaveState] = useState<TreeSaveType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    useEffect(() => {
        if (isSaveOpen) {
            setSaveState({ ...data });
        }
    }, [isSaveOpen, data]);

    const handleChange = (
        field: keyof TreeSaveType,
        value: CheckedState | string | number | string | null
    ) => {
        setSaveState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(saveState).forEach(([key, value]) => {
            updateFormData(key as keyof TreeSaveType, value);
        });
        setIsSaveOpen(false);
    };

    return (
        <>
            {/* Save Dialog */}
            <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Decision Tree: Save</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[300px] max-w-md rounded-lg border md:min-w-[250px]"
                    >
                        <ResizablePanel defaultSize={45}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-semibold">
                                    Saved Variables
                                </Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="TerminalNode"
                                        checked={saveState.TerminalNode}
                                        onCheckedChange={(checked) =>
                                            handleChange(
                                                "TerminalNode",
                                                checked
                                            )
                                        }
                                    />
                                    <label
                                        htmlFor="TerminalNode"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Terminal Node Number
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="PredictedValue"
                                        checked={saveState.PredictedValue}
                                        onCheckedChange={(checked) =>
                                            handleChange(
                                                "PredictedValue",
                                                checked
                                            )
                                        }
                                    />
                                    <label
                                        htmlFor="PredictedValue"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Predicted Value
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="PredictedProbabilities"
                                        checked={
                                            saveState.PredictedProbabilities
                                        }
                                        onCheckedChange={(checked) =>
                                            handleChange(
                                                "PredictedProbabilities",
                                                checked
                                            )
                                        }
                                    />
                                    <label
                                        htmlFor="PredictedProbabilities"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Predicted Probabilities
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="SampleAssign"
                                        checked={saveState.SampleAssign}
                                        onCheckedChange={(checked) =>
                                            handleChange(
                                                "SampleAssign",
                                                checked
                                            )
                                        }
                                    />
                                    <label
                                        htmlFor="SampleAssign"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Sample Assignment (Training/Testing)
                                    </label>
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={55}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-semibold">
                                    Export Tree Model as XML
                                </Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="TrainingSample"
                                        checked={saveState.TrainingSample}
                                        onCheckedChange={(checked) =>
                                            handleChange(
                                                "TrainingSample",
                                                checked
                                            )
                                        }
                                    />
                                    <label
                                        htmlFor="TrainingSample"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Training Sample
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2 pl-6">
                                    <Label className="w-[150px]">File:</Label>
                                    <Input
                                        id="TrainingFile"
                                        type="file"
                                        placeholder=""
                                        onChange={(e) =>
                                            handleChange(
                                                "TrainingFile",
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="TestSample"
                                        checked={saveState.TestSample}
                                        onCheckedChange={(checked) =>
                                            handleChange("TestSample", checked)
                                        }
                                    />
                                    <label
                                        htmlFor="TestSample"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Test Sample
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2 pl-6">
                                    <Label className="w-[150px]">File:</Label>
                                    <Input
                                        id="TestSampleFile"
                                        type="file"
                                        placeholder=""
                                        onChange={(e) =>
                                            handleChange(
                                                "TestSampleFile",
                                                Number(e.target.value)
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
                            onClick={() => setIsSaveOpen(false)}
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
