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
    CorrespondenceDialogProps,
    CorrespondenceMainType
} from "@/models/dimension-reduction/correspondence-analysis/correspondence-analysis";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

export const CorrespondenceDialog = ({
                                         isMainOpen,
                                         setIsMainOpen,
                                         setIsDefineRangeRowOpen,
                                         setIsDefineRangeColumnOpen,
                                         setIsModelOpen,
                                         setIsStatisticsOpen,
                                         setIsPlotsOpen,
                                         updateFormData,
                                         data
                                     }: CorrespondenceDialogProps) => {
    const [mainState, setMainState] = useState<CorrespondenceMainType>({...data});

    useEffect(() => {
        if (isMainOpen) {
            setMainState({...data});
        }
    }, [isMainOpen, data]);

    const handleChange = (field: keyof CorrespondenceMainType, value: number | string | null) => {
        setMainState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof CorrespondenceMainType, value);
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
                    <Button variant="outline">Coresspondence</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Coresspondence Analysis</DialogTitle>
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
                                <div className="flex flex-col gap-4 p-2">
                                    <div className="flex flex-col gap-1">
                                        <div className="w-full">
                                            <Label className="font-bold">Row: </Label>
                                            <Input
                                                id="RowTargetVar"
                                                type="text"
                                                className="w-full"
                                                placeholder=""
                                                value={mainState.RowTargetVar ?? ""}
                                                onChange={(e) => handleChange("RowTargetVar", e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={openDialog(setIsDefineRangeRowOpen)}
                                            >
                                                Define Range...
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="w-full">
                                            <Label className="font-bold">Column: </Label>
                                            <Input
                                                id="ColTargetVar"
                                                type="text"
                                                className="w-full"
                                                placeholder=""
                                                value={mainState.ColTargetVar ?? ""}
                                                onChange={(e) => handleChange("ColTargetVar", e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={openDialog(setIsDefineRangeColumnOpen)}
                                            >
                                                Define Range...
                                            </Button>
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
                                        onClick={openDialog(setIsModelOpen)}
                                    >
                                        Model...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsStatisticsOpen)}
                                    >
                                        Statistics...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsPlotsOpen)}
                                    >
                                        Plots...
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
