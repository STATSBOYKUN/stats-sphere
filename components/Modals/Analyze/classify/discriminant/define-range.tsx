import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {DiscriminantDefineRangeProps, DiscriminantDefineRangeType} from "@/models/classify/discriminant/discriminant";

export const DiscriminantDefineRange = ({ isDefineRangeOpen, setIsDefineRangeOpen, updateFormData, data }: DiscriminantDefineRangeProps) => {
    const [defineRangeState, setDefineRangeState] = useState<DiscriminantDefineRangeType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isDefineRangeOpen) {
            setDefineRangeState({ ...data });
        }
    }, [isDefineRangeOpen, data]);

    const handleChange = (field: keyof DiscriminantDefineRangeType, value: number) => {
        setDefineRangeState((prev) => ({ ...prev, [field]: value }));
    };

    const handleContinue = () => {
        Object.entries(defineRangeState).forEach(([key, value]) => {
            updateFormData(key as keyof DiscriminantDefineRangeType, value);
        });
        setIsDefineRangeOpen(false);
    };

    return (
        <>
            {/* Define Range Dialog */}
            <Dialog open={isDefineRangeOpen} onOpenChange={setIsDefineRangeOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Define Range</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col items-start gap-2">
                        <div className="flex flex-col gap-2">
                            <Label className="font-bold">Minimum</Label>
                            <Input
                                id="Minimum"
                                type="number"
                                value={defineRangeState.minRange ?? ""}
                                onChange={(e) => handleChange("minRange", Number(e.target.value))}
                                placeholder=""
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="font-bold">Maximum</Label>
                            <Input
                                id="Maximum"
                                type="number"
                                value={defineRangeState.maxRange ?? ""}
                                onChange={(e) => handleChange("maxRange", Number(e.target.value))}
                                placeholder=""
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsDefineRangeOpen(false)}>
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
