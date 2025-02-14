import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {DiscriminantSetValueProps, DiscriminantSetValueType} from "@/models/classify/discriminant/discriminant";

export const DiscriminantSetValue = ({ isSetValueOpen, setIsSetValueOpen, updateFormData, data }: DiscriminantSetValueProps) => {
    const [setValueState, setSetValueState] = useState<DiscriminantSetValueType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isSetValueOpen) {
            setSetValueState({ ...data });
        }
    }, [isSetValueOpen, data]);

    useEffect(() => {
        const { Value } = setValueState;

        setIsContinueDisabled(!Value);
    }, [setValueState]);

    const handleChange = (field: keyof DiscriminantSetValueType, value: number) => {
        setSetValueState((prev) => ({ ...prev, [field]: value }));
    };

    const handleContinue = () => {
        Object.entries(setValueState).forEach(([key, value]) => {
            updateFormData(key as keyof DiscriminantSetValueType, value);
        });
        setIsSetValueOpen(false);
    };

    return (
        <>
            {/* Define Range Dialog */}
            <Dialog open={isSetValueOpen} onOpenChange={setIsSetValueOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Define Range</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <Label className="font-bold">Set Value:</Label>
                        <Input
                            id="Value"
                            type="number"
                            value={setValueState.Value || ""}
                            onChange={(e) => handleChange("Value", Number(e.target.value))}
                            placeholder=""
                        />
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsSetValueOpen(false)}>
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
