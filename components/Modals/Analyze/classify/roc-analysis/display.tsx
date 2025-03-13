import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {RocAnalysisDisplayProps, RocAnalysisDisplayType} from "@/models/classify/roc-analysis/roc-analysis";
import {CheckedState} from "@radix-ui/react-checkbox";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

export const RocAnalysisDisplay = ({
                                       isDisplayOpen,
                                       setIsDisplayOpen,
                                       updateFormData,
                                       data
                                   }: RocAnalysisDisplayProps) => {
    const [displayState, setDisplayState] = useState<RocAnalysisDisplayType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isDisplayOpen) {
            setDisplayState({...data});
        }
    }, [isDisplayOpen, data]);

    const handleChange = (field: keyof RocAnalysisDisplayType, value: CheckedState | number | boolean | string | null) => {
        setDisplayState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handlePRCGrp = (value: string) => {
        setDisplayState((prevState) => ({
            ...prevState,
            IntepolateTrue: value === "IntepolateTrue",
            IntepolateFalse: value === "IntepolateFalse",
        }));
    };

    const handleContinue = () => {
        Object.entries(displayState).forEach(([key, value]) => {
            updateFormData(key as keyof RocAnalysisDisplayType, value);
        });
        setIsDisplayOpen(false);
    };

    return (
        <>
            {/* Display Dialog */}
            <Dialog open={isDisplayOpen} onOpenChange={setIsDisplayOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>ROC Analysis: Display</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[300px] max-w-md rounded-lg border md:min-w-[150px]"
                    >
                        <ResizablePanel defaultSize={55}>
                            <div className="flex flex-col gap-1 p-2">
                                <Label className="font-bold">Plot</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="RocCurve"
                                        checked={displayState.RocCurve}
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
                                        id="Refline"
                                        checked={displayState.Refline}
                                        onCheckedChange={(checked) => handleChange("Refline", checked)}
                                    />
                                    <label
                                        htmlFor="Refline"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        With Diagonal Reference Line
                                    </label>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="PRC"
                                            checked={displayState.PRC}
                                            onCheckedChange={(checked) => handleChange("PRC", checked)}
                                        />
                                        <label
                                            htmlFor="PRC"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Precision-Recall Curve
                                        </label>
                                    </div>
                                    <RadioGroup
                                        value={displayState.IntepolateTrue ? "IntepolateTrue" : "IntepolateFalse"}
                                        onValueChange={handlePRCGrp}
                                    >
                                        <div className="flex flex-col gap-2 pl-6">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="IntepolateTrue" id="IntepolateTrue"/>
                                                <Label htmlFor="IntepolateTrue">
                                                    Interpolate along The True Positive
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="IntepolateFalse" id="IntepolateFalse"/>
                                                <Label htmlFor="IntepolateFalse">
                                                    Interpolate along The False Positive
                                                </Label>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="Overall"
                                        checked={displayState.Overall}
                                        onCheckedChange={(checked) => handleChange("Overall", checked)}
                                    />
                                    <label
                                        htmlFor="Overall"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Overall Model Quality
                                    </label>
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle/>
                        <ResizablePanel defaultSize={45}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">Files</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="SECI"
                                        checked={displayState.SECI}
                                        onCheckedChange={(checked) => handleChange("SECI", checked)}
                                    />
                                    <label
                                        htmlFor="SECI"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Standard Error and Confidence Interval
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="ROCPoint"
                                        checked={displayState.ROCPoint}
                                        onCheckedChange={(checked) => handleChange("ROCPoint", checked)}
                                    />
                                    <label
                                        htmlFor="ROCPoint"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Coordinates points of ROC Curve
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="PRCPoint"
                                        checked={displayState.PRCPoint}
                                        onCheckedChange={(checked) => handleChange("PRCPoint", checked)}
                                    />
                                    <label
                                        htmlFor="PRCPoint"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Coordinates points of Precision-Recall Curve
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="EvalMetrics"
                                        checked={displayState.EvalMetrics}
                                        onCheckedChange={(checked) => handleChange("EvalMetrics", checked)}
                                    />
                                    <label
                                        htmlFor="EvalMetrics"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Classifier Evaluation Metrics
                                    </label>
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsDisplayOpen(false)}>
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
