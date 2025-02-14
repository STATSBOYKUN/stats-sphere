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
import {
    OptScaMCADialogProps,
    OptScaMCAMainType
} from "@/models/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

export const OptScaMCADialog = ({
                                    isMainOpen,
                                    setIsMainOpen,
                                    setIsDefineVariableOpen,
                                    setIsDiscretizeOpen,
                                    setIsMissingOpen,
                                    setIsOptionsOpen,
                                    setIsOutputOpen,
                                    setIsSaveOpen,
                                    setIsObjectPlotsOpen,
                                    setIsVariablePlotsOpen,
                                    updateFormData,
                                    data
                                }: OptScaMCADialogProps) => {
    const [mainState, setMainState] = useState<OptScaMCAMainType>({...data});

    useEffect(() => {
        if (isMainOpen) {
            setMainState({...data});
        }
    }, [isMainOpen, data]);

    const handleChange = (field: keyof OptScaMCAMainType, value: number | string | null) => {
        setMainState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaMCAMainType, value);
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
                {/*<DialogTrigger asChild>*/}
                {/*    <Button variant="outline">Multiple Correspondence Analysis</Button>*/}
                {/*</DialogTrigger>*/}
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Multiple Correspondence Analysis</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="flex items-center space-x-2">
                        <ResizablePanelGroup
                            direction="horizontal"
                            className="min-h-[400px] rounded-lg border md:min-w-[200px]"
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
                                <div className="flex flex-col gap-4 p-2">
                                    <div className="flex flex-col gap-1">
                                        <div className="w-full">
                                            <Label className="font-bold">Analysis Variables: </Label>
                                            <Input
                                                id="AnalysisVars"
                                                type="text"
                                                className="w-full min-h-[65px]"
                                                placeholder=""
                                                value={mainState.AnalysisVars ?? ""}
                                                onChange={(e) => handleChange("AnalysisVars", e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={openDialog(setIsDefineVariableOpen)}
                                            >
                                                Define Variable Weight...
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="w-full">
                                            <Label className="font-bold">Supplementary Variables: </Label>
                                            <Input
                                                id="SuppleVars"
                                                type="text"
                                                className="w-full min-h-[65px]"
                                                placeholder=""
                                                value={mainState.SuppleVars ?? ""}
                                                onChange={(e) => handleChange("SuppleVars", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="w-full">
                                            <Label className="font-bold">Labeling Variables: </Label>
                                            <Input
                                                id="LabelingVars"
                                                type="text"
                                                className="w-full min-h-[65px]"
                                                placeholder=""
                                                value={mainState.LabelingVars ?? ""}
                                                onChange={(e) => handleChange("LabelingVars", e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Label className="w-[150px]">Dimension in Solution:</Label>
                                            <div className="w-[75px]">
                                                <Input
                                                    id="Dimensions"
                                                    type="number"
                                                    placeholder=""
                                                    value={mainState.Dimensions || ""}
                                                    onChange={(e) => handleChange("Dimensions", Number(e.target.value))}
                                                />
                                            </div>
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
                                        onClick={openDialog(setIsDiscretizeOpen)}
                                    >
                                        Discretize...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsMissingOpen)}
                                    >
                                        Missing...
                                    </Button>
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
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsSaveOpen)}
                                    >
                                        Save...
                                    </Button>
                                    <Separator className="my-2"/>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsObjectPlotsOpen)}
                                    >
                                        Object...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsVariablePlotsOpen)}
                                    >
                                        Variable...
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
