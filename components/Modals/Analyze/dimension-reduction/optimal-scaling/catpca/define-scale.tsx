import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    OptScaCatpcaDefineScaleProps,
    OptScaCatpcaDefineScaleType,
} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

// Extend the props type with an optional onContinue callback
interface ExtendedProps extends OptScaCatpcaDefineScaleProps {
    onContinue?: (data: OptScaCatpcaDefineScaleType) => void;
}

export const OptScaCatpcaDefineScale = ({
    isDefineScaleOpen,
    setIsDefineScaleOpen,
    updateFormData,
    data,
    onContinue, // Optional callback
}: ExtendedProps) => {
    const [defineScaleState, setDefineScaleState] =
        useState<OptScaCatpcaDefineScaleType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    useEffect(() => {
        if (isDefineScaleOpen) {
            setDefineScaleState({ ...data });
        }
    }, [isDefineScaleOpen, data]);

    const handleChange = (
        field: keyof OptScaCatpcaDefineScaleType,
        value: number | string | null
    ) => {
        setDefineScaleState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleOptGrp = (value: string) => {
        setDefineScaleState((prevState) => ({
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
        Object.entries(defineScaleState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaCatpcaDefineScaleType, value);
        });

        // Call the onContinue callback if provided
        if (onContinue) {
            onContinue(defineScaleState);
        }

        setIsDefineScaleOpen(false);
    };

    return (
        <>
            {/* Define Scale Dialog */}
            <Dialog
                open={isDefineScaleOpen}
                onOpenChange={setIsDefineScaleOpen}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            Categorical Principal Components: Define Scale
                        </DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[185px] max-w-lg rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={60}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">
                                    Optimal Scaling Level
                                </Label>
                                <RadioGroup
                                    value={
                                        defineScaleState.SplineOrdinal
                                            ? "SplineOrdinal"
                                            : defineScaleState.SplineNominal
                                            ? "SplineNominal"
                                            : defineScaleState.MultipleNominal
                                            ? "MultipleNominal"
                                            : defineScaleState.Ordinal
                                            ? "Ordinal"
                                            : defineScaleState.Nominal
                                            ? "Nominal"
                                            : defineScaleState.Numeric
                                            ? "Numeric"
                                            : ""
                                    }
                                    onValueChange={handleOptGrp}
                                >
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="SplineOrdinal"
                                                    id="SplineOrdinal"
                                                />
                                                <Label htmlFor="SplineOrdinal">
                                                    Spline Ordinal
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="SplineNominal"
                                                    id="SplineNominal"
                                                />
                                                <Label htmlFor="SplineNominal">
                                                    Spline Nominal
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="MultipleNominal"
                                                    id="MultipleNominal"
                                                />
                                                <Label htmlFor="MultipleNominal">
                                                    Multiple Nominal
                                                </Label>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="Ordinal"
                                                    id="Ordinal"
                                                />
                                                <Label htmlFor="Ordinal">
                                                    Ordinal
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="Nominal"
                                                    id="Nominal"
                                                />
                                                <Label htmlFor="Nominal">
                                                    Nominal
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="Numeric"
                                                    id="Numeric"
                                                />
                                                <Label htmlFor="Numeric">
                                                    Numeric
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={40}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">Spline</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center space-x-2">
                                        <Label className="w-[75px]">
                                            Degree:
                                        </Label>
                                        <div className="w-[75px]">
                                            <Input
                                                id="Degree"
                                                type="number"
                                                placeholder=""
                                                value={
                                                    defineScaleState.Degree ??
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        "Degree",
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Label className="w-[100px]">
                                            Interior Knots:
                                        </Label>
                                        <div className="w-[75px]">
                                            <Input
                                                id="InteriorKnots"
                                                type="number"
                                                placeholder=""
                                                value={
                                                    defineScaleState.InteriorKnots ??
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        "InteriorKnots",
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            disabled={isContinueDisabled}
                            type="button"
                            onClick={handleContinue}
                        >
                            Continue
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsDefineScaleOpen(false)}
                        >
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
