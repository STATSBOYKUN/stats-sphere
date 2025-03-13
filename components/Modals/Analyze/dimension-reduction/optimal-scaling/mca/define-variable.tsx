import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    OptScaMCADefineVariableProps,
    OptScaMCADefineVariableType
} from "@/models/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

export const OptScaMCADefineVariable = ({ isDefineVariableOpen, setIsDefineVariableOpen, updateFormData, data }: OptScaMCADefineVariableProps) => {
    const [defineVariableState, setDefineVariableState] = useState<OptScaMCADefineVariableType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isDefineVariableOpen) {
            setDefineVariableState({ ...data });
        }
    }, [isDefineVariableOpen, data]);

    const handleChange = (field: keyof OptScaMCADefineVariableType, value: number | null) => {
        setDefineVariableState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(defineVariableState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaMCADefineVariableType, value);
        });
        setIsDefineVariableOpen(false);
    };

    return (
        <>
            {/* Define Variable Dialog */}
            <Dialog open={isDefineVariableOpen} onOpenChange={setIsDefineVariableOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Multiple Correspondence Analysis: Define Variable</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col items-start gap-2">
                        <div className="flex items-center space-x-2">
                            <Label className="w-[150px]">Variable Weight:</Label>
                            <div className="w-[75px]">
                                <Input
                                    id="VariableWeight"
                                    type="number"
                                    placeholder=""
                                    value={defineVariableState.VariableWeight || ""}
                                    onChange={(e) => handleChange("VariableWeight", Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsDefineVariableOpen(false)}>
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
