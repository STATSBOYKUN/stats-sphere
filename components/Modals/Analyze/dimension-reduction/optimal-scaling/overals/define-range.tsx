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
    OptScaOveralsDefineRangeProps,
    OptScaOveralsDefineRangeType,
} from "@/models/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const OptScaOveralsDefineRange = ({
    isDefineRangeOpen,
    setIsDefineRangeOpen,
    updateFormData,
    data,
}: OptScaOveralsDefineRangeProps) => {
    const [defineRangeState, setDefineRangeState] =
        useState<OptScaOveralsDefineRangeType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    useEffect(() => {
        if (isDefineRangeOpen) {
            setDefineRangeState({ ...data });
        }
    }, [isDefineRangeOpen, data]);

    const handleChange = (
        field: keyof OptScaOveralsDefineRangeType,
        value: number | null
    ) => {
        setDefineRangeState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(defineRangeState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaOveralsDefineRangeType, value);
        });
        setIsDefineRangeOpen(false);
    };

    return (
        <>
            {/* Define Range Dialog */}
            <Dialog
                open={isDefineRangeOpen}
                onOpenChange={setIsDefineRangeOpen}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>OVERALS: Define Range</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                            <Label className="w-[100px]">Minimum:</Label>
                            <div className="w-[75px]">
                                <Input
                                    id="Minimum"
                                    type="number"
                                    placeholder=""
                                    value={defineRangeState.Minimum || 1}
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
                            <Label className="w-[100px]">Maximum:</Label>
                            <div className="w-[75px]">
                                <Input
                                    id="Maximum"
                                    type="number"
                                    placeholder=""
                                    value={defineRangeState.Maximum ?? ""}
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
                            onClick={() => setIsDefineRangeOpen(false)}
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
