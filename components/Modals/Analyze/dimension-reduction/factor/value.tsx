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
    FactorValueProps,
    FactorValueType,
} from "@/models/dimension-reduction/factor/factor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const FactorValue = ({
    isValueOpen,
    setIsValueOpen,
    updateFormData,
    data,
}: FactorValueProps) => {
    const [valueState, setValueState] = useState<FactorValueType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    useEffect(() => {
        if (isValueOpen) {
            setValueState({ ...data });
        }
    }, [isValueOpen, data]);

    const handleChange = (
        field: keyof FactorValueType,
        value: string | null
    ) => {
        setValueState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(valueState).forEach(([key, value]) => {
            updateFormData(key as keyof FactorValueType, value);
        });
        setIsValueOpen(false);
    };

    return (
        <>
            {/* Value Dialog */}
            <Dialog open={isValueOpen} onOpenChange={setIsValueOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Factor Analysis: Value</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col items-start gap-2">
                        <Label className="w-[75px]">Value:</Label>
                        <Input
                            id="Selection"
                            className="w-full"
                            type="text"
                            placeholder=""
                            value={valueState.Selection ?? ""}
                            onChange={(e) =>
                                handleChange("Selection", e.target.value)
                            }
                        />
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
                            onClick={() => setIsValueOpen(false)}
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
