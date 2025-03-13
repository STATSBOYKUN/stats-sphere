import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    CorrespondenceModelProps,
    CorrespondenceModelType
} from "@/models/dimension-reduction/correspondence-analysis/correspondence-analysis";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

export const CorrespondenceModel = ({isModelOpen, setIsModelOpen, updateFormData, data}: CorrespondenceModelProps) => {
    const [modelState, setModelState] = useState<CorrespondenceModelType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isModelOpen) {
            setModelState({...data});
        }
    }, [isModelOpen, data]);

    const handleChange = (field: keyof CorrespondenceModelType, value: number | string | null) => {
        setModelState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDistanceGrp = (value: string) => {
        setModelState((prevState) => ({
            ...prevState,
            ChiSquare: value === "ChiSquare",
            Euclidean: value === "Euclidean"
        }));
    };

    const handleStandadizationGrp = (value: string) => {
        setModelState((prevState) => ({
            ...prevState,
            RNCRemoved: value === "RNCRemoved",
            RowRemoved: value === "RowRemoved",
            ColRemoved: value === "ColRemoved",
            RowTotals: value === "RowTotals",
            ColTotals: value === "ColTotals"
        }));
    };

    const handleNormalizationGrp = (value: string) => {
        setModelState((prevState) => ({
            ...prevState,
            Symmetrical: value === "Symmetrical",
            Principal: value === "Principal",
            RowPrincipal: value === "RowPrincipal",
            ColPrincipal: value === "ColPrincipal",
            Custom: value === "Custom"
        }));
    };

    const handleContinue = () => {
        Object.entries(modelState).forEach(([key, value]) => {
            updateFormData(key as keyof CorrespondenceModelType, value);
        });
        setIsModelOpen(false);
    };

    return (
        <>
            {/* Model Dialog */}
            <Dialog open={isModelOpen} onOpenChange={setIsModelOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Correspondence Analysis: Model</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="flex flex-col gap-2">
                        <div
                            className="flex items-center space-x-2">
                            <Label className="w-[200px]">Dimension in Solution:</Label>
                            <div className="w-[75px]">
                                <Input
                                    id="Dimensions"
                                    type="number"
                                    placeholder=""
                                    value={modelState.Dimensions ?? 0}
                                    onChange={(e) => handleChange("Dimensions", Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <ResizablePanelGroup
                            direction="vertical"
                            className="min-h-[340px] max-w-xl rounded-lg border md:min-w-[200px]"
                        >
                            <ResizablePanel defaultSize={25}>
                                <RadioGroup
                                    value={modelState.ChiSquare ? "ChiSquare" : "Euclidean"}
                                    onValueChange={handleDistanceGrp}
                                >
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Distance Measure</Label>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="ChiSquare" id="ChiSquare"/>
                                            <Label htmlFor="ChiSquare">
                                                Chi-Square
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Euclidean" id="Euclidean"/>
                                            <Label htmlFor="Euclidean">
                                                Euclidean
                                            </Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </ResizablePanel>
                            <ResizableHandle/>
                            <ResizablePanel defaultSize={45}>
                                <RadioGroup
                                    value={
                                        modelState.RNCRemoved ? "RNCRemoved" :
                                            modelState.RowRemoved ? "RowRemoved" :
                                                modelState.ColRemoved ? "ColRemoved" :
                                                    modelState.RowTotals ? "RowTotals" :
                                                        modelState.ColTotals ? "ColTotals" : ""
                                    }
                                    onValueChange={handleStandadizationGrp}
                                >
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Standadization Method</Label>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="RNCRemoved" id="RNCRemoved"/>
                                            <Label htmlFor="RNCRemoved">
                                                Row and Column Means are Removed
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="RowRemoved" id="RowRemoved"/>
                                            <Label htmlFor="RowRemoved">
                                                Row Means are Removed
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="ColRemoved" id="ColRemoved"/>
                                            <Label htmlFor="ColRemoved">
                                                Column Means are Removed
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="RowTotals" id="RowTotals"/>
                                            <Label htmlFor="RowTotals">
                                                Row Totals are Equalized and Means are Removed
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="ColTotals" id="ColTotals"/>
                                            <Label htmlFor="ColTotals">
                                                Column Totals are Equalized and Means are Removed
                                            </Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </ResizablePanel>
                            <ResizableHandle />
                            <ResizablePanel defaultSize={30}>
                                <RadioGroup
                                    value={
                                        modelState.Symmetrical ? "Symmetrical" :
                                            modelState.Principal ? "Principal" :
                                                modelState.RowPrincipal ? "RowPrincipal" :
                                                    modelState.ColPrincipal ? "ColPrincipal" :
                                                        modelState.Custom ? "Custom" : ""
                                    }
                                    onValueChange={handleNormalizationGrp}
                                >
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Normalization Method</Label>
                                        <div className="grid grid-cols-3 gap-1">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Symmetrical" id="Symmetrical"/>
                                                    <Label htmlFor="Symmetrical">
                                                        Symmetrical
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Principal" id="Principal"/>
                                                    <Label htmlFor="Principal">
                                                        Principal
                                                    </Label>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="RowPrincipal" id="RowPrincipal"/>
                                                    <Label htmlFor="RowPrincipal">
                                                        Row Principal
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="ColPrincipal" id="ColPrincipal"/>
                                                    <Label htmlFor="ColPrincipal">
                                                        Column Principal
                                                    </Label>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Custom" id="Custom"/>
                                                    <Label htmlFor="Custom">
                                                        Custom
                                                    </Label>
                                                </div>
                                                <div
                                                    className="flex items-center space-x-2">
                                                    <Label className="w-[75px]">Custom:</Label>
                                                    <div className="w-[150px]">
                                                        <Input
                                                            id="CustomDimensions"
                                                            type="number"
                                                            placeholder=""
                                                            value={modelState.CustomDimensions ?? 0}
                                                            onChange={(e) => handleChange("CustomDimensions", Number(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsModelOpen(false)}>
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
