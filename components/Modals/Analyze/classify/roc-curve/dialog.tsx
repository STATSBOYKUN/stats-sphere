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
import {RocCurveDialogProps, RocCurveMainType} from "@/models/classify/roc-curve/roc-curve";
import {CheckedState} from "@radix-ui/react-checkbox";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";

export const RocCurveDialog = ({
                                   isMainOpen,
                                   setIsMainOpen,
                                   setIsOptionsOpen,
                                   updateFormData,
                                   data
                               }: RocCurveDialogProps) => {
    const [mainState, setMainState] = useState<RocCurveMainType>({...data});

    useEffect(() => {
        if (isMainOpen) {
            setMainState({...data});
        }
    }, [isMainOpen, data]);

    const handleChange = (field: keyof RocCurveMainType, value: CheckedState | number | boolean | string | null) => {
        setMainState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof RocCurveMainType, value);
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
                    <Button variant="outline">ROC Curve</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>ROC Curve Analysis</DialogTitle>
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
                                        <ResizablePanelGroup
                                            direction="vertical"
                                            className="min-h-[110px] rounded-lg border md:min-w-[150px]"
                                        >
                                            <ResizablePanel defaultSize={100}>
                                                <div className="flex flex-col gap-1 p-2">
                                                    <Label className="font-bold">Display</Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="RocCurve"
                                                            checked={mainState.RocCurve}
                                                            onCheckedChange={(checked) => handleChange("RocCurve", checked)}
                                                        />
                                                        <label
                                                            htmlFor="RocCurve"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            ROC Curve
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center pl-6 space-x-2">
                                                        <Checkbox
                                                            id="DiagRef"
                                                            checked={mainState.DiagRef}
                                                            onCheckedChange={(checked) => handleChange("DiagRef", checked)}
                                                        />
                                                        <label
                                                            htmlFor="DiagRef"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Diagnostic Reference
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="ErrInterval"
                                                            checked={mainState.ErrInterval}
                                                            onCheckedChange={(checked) => handleChange("ErrInterval", checked)}
                                                        />
                                                        <label
                                                            htmlFor="ErrInterval"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Error Interval
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="CoordPt"
                                                            checked={mainState.CoordPt}
                                                            onCheckedChange={(checked) => handleChange("CoordPt", checked)}
                                                        />
                                                        <label
                                                            htmlFor="CoordPt"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Coordinate Points
                                                        </label>
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
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
