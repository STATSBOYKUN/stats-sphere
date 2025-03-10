import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    OptScaCatpcaDefineRangeScaleProps,
    OptScaCatpcaDefineRangeScaleType
} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

export const OptScaCatpcaDefineRangeScale = ({
                                                 isDefineRangeScaleOpen,
                                                 setIsDefineRangeScaleOpen,
                                                 updateFormData,
                                                 data
                                             }: OptScaCatpcaDefineRangeScaleProps) => {
    const [defineRangeScaleState, setDefineRangeScaleState] = useState<OptScaCatpcaDefineRangeScaleType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isDefineRangeScaleOpen) {
            setDefineRangeScaleState({...data});
        }
    }, [isDefineRangeScaleOpen, data]);

    const handleChange = (field: keyof OptScaCatpcaDefineRangeScaleType, value: number | string | null) => {
        setDefineRangeScaleState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleOptGrp = (value: string) => {
        setDefineRangeScaleState((prevState) => ({
            ...prevState,
            SplineOrdinal: value === "SplineOrdinal",
            SplineNominal: value === "SplineNominal",
            MultipleNominal: value === "MultipleNominal",
            Ordinal: value === "Ordinal",
            Nominal: value === "Nominal",
            Numeric: value === "Numeric",
        }));
    };

    const handleContinue = () => {
        Object.entries(defineRangeScaleState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaCatpcaDefineRangeScaleType, value);
        });
        setIsDefineRangeScaleOpen(false);
    };

    return (
        <>
            {/* Define Range Scale Dialog */}
            <Dialog open={isDefineRangeScaleOpen} onOpenChange={setIsDefineRangeScaleOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>CATPCA: Define Range Scale</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                            <Label className="w-[150px]">Variable Weight:</Label>
                            <div className="w-[75px]">
                                <Input
                                    id="Weight"
                                    type="number"
                                    placeholder=""
                                    value={defineRangeScaleState.Weight || ""}
                                    onChange={(e) => handleChange("Weight", Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <ResizablePanelGroup
                            direction="vertical"
                            className="min-h-[185px] max-w-lg rounded-lg border md:min-w-[200px]"
                        >
                            <ResizablePanel defaultSize={60}>
                                <div className="flex flex-col gap-2 p-2">
                                    <Label className="font-bold">Optimal Scaling Level</Label>
                                    <RadioGroup
                                        value={
                                            defineRangeScaleState.SplineOrdinal ? "SplineOrdinal" :
                                                defineRangeScaleState.SplineNominal ? "SplineNominal" :
                                                    defineRangeScaleState.MultipleNominal ? "MultipleNominal" :
                                                        defineRangeScaleState.Ordinal ? "Ordinal" :
                                                            defineRangeScaleState.Nominal ? "Nominal" :
                                                                defineRangeScaleState.Numeric ? "Numeric" : ""
                                        }
                                        onValueChange={handleOptGrp}
                                    >
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="SplineOrdinal" id="SplineOrdinal"/>
                                                    <Label htmlFor="SplineOrdinal">
                                                        Spline Ordinal
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="SplineNominal" id="SplineNominal"/>
                                                    <Label htmlFor="SplineNominal">
                                                        Spline Nominal
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="MultipleNominal" id="MultipleNominal"/>
                                                    <Label htmlFor="MultipleNominal">
                                                        Multiple Nominal
                                                    </Label>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Ordinal" id="Ordinal"/>
                                                    <Label htmlFor="Ordinal">
                                                        Ordinal
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Nominal" id="Nominal"/>
                                                    <Label htmlFor="Nominal">
                                                        Nominal
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Numeric" id="Numeric"/>
                                                    <Label htmlFor="Numeric">
                                                        Numeric
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle/>
                            <ResizablePanel defaultSize={40}>
                                <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">Spline</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Label className="w-[75px]">Degree:</Label>
                                            <div className="w-[75px]">
                                                <Input
                                                    id="Degree"
                                                    type="number"
                                                    placeholder=""
                                                    value={defineRangeScaleState.Degree || ""}
                                                    onChange={(e) => handleChange("Degree", Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Label className="w-[100px]">Interior Knots:</Label>
                                            <div className="w-[75px]">
                                                <Input
                                                    id="InteriorKnots"
                                                    type="number"
                                                    placeholder=""
                                                    value={defineRangeScaleState.InteriorKnots || ""}
                                                    onChange={(e) => handleChange("InteriorKnots", Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsDefineRangeScaleOpen(false)}>
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
