import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {KNNOptionsProps, KNNOptionsType} from "@/models/classify/nearest-neighbor/nearest-neighbor";
import {ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

export const KNNOptions = ({isOptionsOpen, setIsOptionsOpen, updateFormData, data}: KNNOptionsProps) => {
    const [optionsState, setOptionsState] = useState<KNNOptionsType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isOptionsOpen) {
            setOptionsState({...data});
        }
    }, [isOptionsOpen, data]);

    const handleTreatGrp = (value: string) => {
        setOptionsState((prevState) => ({
            ...prevState,
            Exclude: value === "Exclude",
            Include: value === "Include",
        }));
    };

    const handleContinue = () => {
        Object.entries(optionsState).forEach(([key, value]) => {
            updateFormData(key as keyof KNNOptionsType, value);
        });
        setIsOptionsOpen(false);
    };

    return (
        <>
            {/* Options Dialog */}
            <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Nearest Neighbor Analysis: Options</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[150px] max-w-sm rounded-lg border md:min-w-[150px]"
                    >
                        <ResizablePanel defaultSize={100}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">User-Missing Values</Label>
                                <div className="flex flex-col gap-2">
                                    <RadioGroup
                                        value={optionsState.Exclude ? "Exclude" : "Include"}
                                        onValueChange={handleTreatGrp}
                                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Exclude"
                                                                id="Exclude"/>
                                                <Label className="w-[175px]"
                                                       htmlFor="Exclude">
                                                    Exclude
                                                </Label>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Include"
                                                                id="Include"/>
                                                <Label className="w-[175px]"
                                                       htmlFor="Include">
                                                    Include
                                                </Label>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className="text-sm text-justify">
                                    User-missing values for scale variables are always excluded.
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsOptionsOpen(false)}>
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
