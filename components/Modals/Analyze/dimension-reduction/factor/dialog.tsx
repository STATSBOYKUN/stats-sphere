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
import {FactorDialogProps, FactorMainType} from "@/models/dimension-reduction/factor/factor";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

export const FactorDialog = ({
                                 isMainOpen,
                                 setIsMainOpen,
                                 setIsValueOpen,
                                 setIsDescriptivesOpen,
                                 setIsExtractionOpen,
                                 setIsRotationOpen,
                                 setIsScoresOpen,
                                 setIsOptionsOpen,
                                 updateFormData,
                                 data
                             }: FactorDialogProps) => {
    const [mainState, setMainState] = useState<FactorMainType>({...data});

    useEffect(() => {
        if (isMainOpen) {
            setMainState({...data});
        }
    }, [isMainOpen, data]);

    const handleChange = (field: keyof FactorMainType, value: number | string | null) => {
        setMainState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof FactorMainType, value);
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
                    <Button variant="outline">Factor</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Factor Analysis</DialogTitle>
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
                                    <div className="w-full">
                                        <Label className="font-bold">Variables: </Label>
                                        <Input
                                            id="TargetVar"
                                            type="text"
                                            className="w-full min-h-[65px]"
                                            placeholder=""
                                            value={mainState.TargetVar ?? ""}
                                            onChange={(e) => handleChange("TargetVar", e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="w-full">
                                            <Label className="font-bold">Selection Variable: </Label>
                                            <Input
                                                id="ValueTarget"
                                                type="text"
                                                className="w-full"
                                                placeholder=""
                                                value={mainState.ValueTarget ?? ""}
                                                onChange={(e) => handleChange("ValueTarget", e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={openDialog(setIsValueOpen)}
                                            >
                                                Value...
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
                                        onClick={openDialog(setIsDescriptivesOpen)}
                                    >
                                        Descriptives...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsExtractionOpen)}
                                    >
                                        Extraction...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsRotationOpen)}
                                    >
                                        Rotation...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsScoresOpen)}
                                    >
                                        Scores...
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
