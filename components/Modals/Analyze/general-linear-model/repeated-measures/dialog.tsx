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
    RepeatedMeasuresDialogProps,
    RepeatedMeasuresMainType
} from "@/models/general-linear-model/repeated-measures/repeated-measures";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

export const RepeatedMeasuresDialog = ({
                                       isMainOpen,
                                       setIsMainOpen,
                                       setIsModelOpen,
                                       setIsContrastOpen,
                                       setIsPlotsOpen,
                                       setIsPostHocOpen,
                                       setIsEMMeansOpen,
                                       setIsSaveOpen,
                                       setIsOptionsOpen,
                                       updateFormData,
                                       data
                                   }: RepeatedMeasuresDialogProps) => {
    const [mainState, setMainState] = useState<RepeatedMeasuresMainType>({...data});

    useEffect(() => {
        if (isMainOpen) {
            setMainState({...data});
        }
    }, [isMainOpen, data]);

    const handleChange = (field: keyof RepeatedMeasuresMainType, value: number | string | null) => {
        setMainState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof RepeatedMeasuresMainType, value);
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
                    <Button variant="outline">Repeated Measures</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Repeated Measures</DialogTitle>
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
                                <div className="flex flex-col gap-2 p-2">
                                    <div className="w-full">
                                        <Label className="font-bold">Within-Subjects Variables: </Label>
                                        <Input
                                            id="SubVar"
                                            type="text"
                                            className="w-full min-h-[165px]"
                                            placeholder=""
                                            value={mainState.SubVar ?? ""}
                                            onChange={(e) => handleChange("SubVar", e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">Between-Subjects Factor(s): </Label>
                                        <Input
                                            id="FactorsVar"
                                            type="text"
                                            className="w-full min-h-[65px]"
                                            placeholder=""
                                            value={mainState.FactorsVar ?? ""}
                                            onChange={(e) => handleChange("FactorsVar", e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">Covariates: </Label>
                                        <Input
                                            id="Covariates"
                                            type="text"
                                            className="w-full min-h-[65px]"
                                            placeholder=""
                                            value={mainState.Covariates ?? ""}
                                            onChange={(e) => handleChange("Covariates", e.target.value)}
                                        />
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
                                        onClick={openDialog(setIsContrastOpen)}
                                    >
                                        Contrast...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsPlotsOpen)}
                                    >
                                        Plots...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsPostHocOpen)}
                                    >
                                        Post Hoc...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsEMMeansOpen)}
                                    >
                                        EM Means...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsSaveOpen)}
                                    >
                                        Save...
                                    </Button>
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
