import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {FactorDescriptivesProps, FactorDescriptivesType} from "@/models/dimension-reduction/factor/factor";
import {CheckedState} from "@radix-ui/react-checkbox";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";

export const FactorDescriptives = ({ isDescriptivesOpen, setIsDescriptivesOpen, updateFormData, data }: FactorDescriptivesProps) => {
    const [descriptivesState, setDescriptivesState] = useState<FactorDescriptivesType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isDescriptivesOpen) {
            setDescriptivesState({ ...data });
        }
    }, [isDescriptivesOpen, data]);

    const handleChange = (field: keyof FactorDescriptivesType, value: CheckedState | number | string | null) => {
        setDescriptivesState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(descriptivesState).forEach(([key, value]) => {
            updateFormData(key as keyof FactorDescriptivesType, value);
        });
        setIsDescriptivesOpen(false);
    };

    return (
        <>
            {/* Descriptives Dialog */}
            <Dialog open={isDescriptivesOpen} onOpenChange={setIsDescriptivesOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Factor Analysis: Descriptives</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[250px] max-w-md rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={35}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">Statistics</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="UnivarDesc"
                                        checked={descriptivesState.UnivarDesc}
                                        onCheckedChange={(checked) => handleChange("UnivarDesc", checked)}
                                    />
                                    <label
                                        htmlFor="UnivarDesc"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Univariate Descriptives
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="InitialSol"
                                        checked={descriptivesState.InitialSol}
                                        onCheckedChange={(checked) => handleChange("InitialSol", checked)}
                                    />
                                    <label
                                        htmlFor="InitialSol"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Initial Solution
                                    </label>
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle/>
                        <ResizablePanel defaultSize={65}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">Correlation Matrix</Label>
                                <div className="grid grid-cols-2 gap-1">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="Coefficient"
                                                checked={descriptivesState.Coefficient}
                                                onCheckedChange={(checked) => handleChange("Coefficient", checked)}
                                            />
                                            <label
                                                htmlFor="Coefficient"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Coefficients
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="SignificanceLvl"
                                                checked={descriptivesState.SignificanceLvl}
                                                onCheckedChange={(checked) => handleChange("SignificanceLvl", checked)}
                                            />
                                            <label
                                                htmlFor="SignificanceLvl"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Significance Levels
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="Determinant"
                                                checked={descriptivesState.Determinant}
                                                onCheckedChange={(checked) => handleChange("Determinant", checked)}
                                            />
                                            <label
                                                htmlFor="Determinant"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Determinant
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="KMO"
                                                checked={descriptivesState.KMO}
                                                onCheckedChange={(checked) => handleChange("KMO", checked)}
                                            />
                                            <label
                                                htmlFor="KMO"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                KMO and Bartlett&apos;s Test of Sphericity
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="Inverse"
                                                checked={descriptivesState.Inverse}
                                                onCheckedChange={(checked) => handleChange("Inverse", checked)}
                                            />
                                            <label
                                                htmlFor="Inverse"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                            Inverse
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="Reproduced"
                                                checked={descriptivesState.Reproduced}
                                                onCheckedChange={(checked) => handleChange("Reproduced", checked)}
                                            />
                                            <label
                                                htmlFor="Reproduced"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Reproduced
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="AntiImage"
                                                checked={descriptivesState.AntiImage}
                                                onCheckedChange={(checked) => handleChange("AntiImage", checked)}
                                            />
                                            <label
                                                htmlFor="AntiImage"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Anti-Image
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsDescriptivesOpen(false)}>
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
