import React, {useEffect, useState} from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Separator} from "@/components/ui/separator";
import {RocAnalysisDialogProps, RocAnalysisMainType} from "@/models/classify/roc-analysis/roc-analysis";
import {CheckedState} from "@radix-ui/react-checkbox";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";

export const RocAnalysisDialog = ({
                                      isMainOpen,
                                      setIsMainOpen,
                                      setIsOptionsOpen,
                                      setIsDefineGroupsOpen,
                                      setIsDisplayOpen,
                                      updateFormData,
                                      data
                                  }: RocAnalysisDialogProps) => {
    const [mainState, setMainState] = useState<RocAnalysisMainType>({...data});

    useEffect(() => {
        if (isMainOpen) {
            setMainState({...data});
        }
    }, [isMainOpen, data]);

    const handleChange = (field: keyof RocAnalysisMainType, value: CheckedState | number | boolean | string | null) => {
        setMainState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof RocAnalysisMainType, value);
        });
        setIsMainOpen(false);
    };

    const openDialog = (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
        setter(true);
    };

    return (
        <>
            {/* Main Dialog */}
            <Dialog open={isMainOpen} onOpenChange={setIsMainOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">ROC Analysis</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>ROC Analysis</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="flex items-center space-x-2">
                        <ResizablePanelGroup
                            direction="horizontal"
                            className="min-h-[200px] rounded-lg border md:min-w-[200px]"
                        >
                            {/* Variable List */}
                            <ResizablePanel defaultSize={25}>
                                <div className="flex h-full items-center justify-center p-2">
                                    <span className="font-semibold">List Variabel</span>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle/>

                            {/* Defining Variable */}
                            <ResizablePanel defaultSize={55}>
                                <div className="flex flex-col h-full w-full items-start justify-start gap-2 p-2">
                                    <div className="w-full">
                                        <Label className="font-bold">Test Variable: </Label>
                                        <Input
                                            id="TestTargetVariable"
                                            type="text"
                                            className="min-w-2xl w-full min-h-[150px]"
                                            placeholder=""
                                            value={mainState.TestTargetVariable ?? ""}
                                            onChange={(e) => handleChange("TestTargetVariable", e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">State Variable: </Label>
                                        <Input
                                            id="StateTargetVariable"
                                            type="text"
                                            className="min-w-2xl w-full"
                                            placeholder=""
                                            value={mainState.StateTargetVariable ?? ""}
                                            onChange={(e) => handleChange("StateTargetVariable", e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col w-full gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Label className="w-[300px]">Value of State Variable:</Label>
                                            <Input
                                                id="StateVarVal"
                                                type="text"
                                                value={mainState.StateVarVal ?? ""}
                                                onChange={(e) => handleChange("StateVarVal", e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="PairedSample"
                                                checked={mainState.PairedSample}
                                                onCheckedChange={(checked) => handleChange("PairedSample", checked)}
                                            />
                                            <label
                                                htmlFor="PairedSample"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Paired-Sampled Design
                                            </label>
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">Grouping Variable: </Label>
                                        <Input
                                            id="TargetGroupVar"
                                            type="text"
                                            className="min-w-2xl w-full"
                                            placeholder=""
                                            value={mainState.TargetGroupVar ?? ""}
                                            onChange={(e) => handleChange("TargetGroupVar", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={openDialog(setIsDefineGroupsOpen)}
                                        >
                                            Define Groups...
                                        </Button>
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
                                        onClick={openDialog(setIsDisplayOpen)}
                                    >
                                        Display...
                                    </Button>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            onClick={handleContinue}
                        >
                            OK
                        </Button>
                        <Button type="button" variant="secondary">
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
