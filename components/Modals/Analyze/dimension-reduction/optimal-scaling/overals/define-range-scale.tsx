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
    OptScaOveralsDefineRangeScaleProps,
    OptScaOveralsDefineRangeScaleType,
} from "@/models/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

export const OptScaOveralsDefineRangeScale = ({
    isDefineRangeScaleOpen,
    setIsDefineRangeScaleOpen,
    updateFormData,
    data,
}: OptScaOveralsDefineRangeScaleProps) => {
    const [defineRangeScaleState, setDefineRangeScaleState] =
        useState<OptScaOveralsDefineRangeScaleType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    useEffect(() => {
        if (isDefineRangeScaleOpen) {
            setDefineRangeScaleState({ ...data });
        }
    }, [isDefineRangeScaleOpen, data]);

    const handleChange = (
        field: keyof OptScaOveralsDefineRangeScaleType,
        value: number | string | null
    ) => {
        setDefineRangeScaleState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleMeasureGrp = (value: string) => {
        setDefineRangeScaleState((prevState) => ({
            ...prevState,
            Ordinal: value === "Ordinal",
            SingleNominal: value === "SingleNominal",
            MultipleNominal: value === "MultipleNominal",
            DiscreteNumeric: value === "DiscreteNumeric",
        }));
    };

    const handleContinue = () => {
        Object.entries(defineRangeScaleState).forEach(([key, value]) => {
            updateFormData(
                key as keyof OptScaOveralsDefineRangeScaleType,
                value
            );
        });
        setIsDefineRangeScaleOpen(false);
    };

    return (
        <>
            {/* Define Range Scale Dialog */}
            <Dialog
                open={isDefineRangeScaleOpen}
                onOpenChange={setIsDefineRangeScaleOpen}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>OVERALS: Define Range Scale</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[150px] max-w-lg rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={40}>
                            <div className="grid grid-cols-2 gap-2 p-2">
                                <div className="flex items-center space-x-2">
                                    <Label className="w-[75px]">Minimum:</Label>
                                    <div className="w-[75px]">
                                        <Input
                                            disabled={true}
                                            id="Minimum"
                                            type="number"
                                            placeholder=""
                                            value={
                                                defineRangeScaleState.Minimum ||
                                                1
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "Minimum",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Label className="w-[75px]">Maximum:</Label>
                                    <div className="w-[75px]">
                                        <Input
                                            id="Maximum"
                                            type="number"
                                            placeholder=""
                                            value={
                                                defineRangeScaleState.Maximum ??
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "Maximum",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={60}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">
                                    Measurement Scale
                                </Label>
                                <RadioGroup
                                    value={
                                        defineRangeScaleState.Ordinal
                                            ? "Ordinal"
                                            : defineRangeScaleState.SingleNominal
                                            ? "SingleNominal"
                                            : defineRangeScaleState.MultipleNominal
                                            ? "MultipleNominal"
                                            : defineRangeScaleState.DiscreteNumeric
                                            ? "DiscreteNumeric"
                                            : ""
                                    }
                                    onValueChange={handleMeasureGrp}
                                >
                                    <div className="grid grid-cols-2 gap-2">
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
                                                    value="SingleNominal"
                                                    id="SingleNominal"
                                                />
                                                <Label htmlFor="SingleNominal">
                                                    Single Nominal
                                                </Label>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="MultipleNominal"
                                                    id="MultipleNominal"
                                                />
                                                <Label htmlFor="MultipleNominal">
                                                    Multiple Nominal
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="DiscreteNumeric"
                                                    id="DiscreteNumeric"
                                                />
                                                <Label htmlFor="DiscreteNumeric">
                                                    Discrete Numeric
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
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
                            onClick={() => setIsDefineRangeScaleOpen(false)}
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
