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
    FactorRotationProps,
    FactorRotationType,
} from "@/models/dimension-reduction/factor/factor";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";

export const FactorRotation = ({
    isRotationOpen,
    setIsRotationOpen,
    updateFormData,
    data,
}: FactorRotationProps) => {
    const [rotationState, setRotationState] = useState<FactorRotationType>({
        ...data,
    });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    useEffect(() => {
        if (isRotationOpen) {
            setRotationState({ ...data });
        }
    }, [isRotationOpen, data]);

    const handleChange = (
        field: keyof FactorRotationType,
        value: CheckedState | number | string | null
    ) => {
        setRotationState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleMethodGrp = (value: string) => {
        setRotationState((prevState) => ({
            ...prevState,
            None: value === "None",
            Quartimax: value === "Quartimax",
            Varimax: value === "Varimax",
            Equimax: value === "Equimax",
            Oblimin: value === "Oblimin",
            Promax: value === "Promax",
        }));
    };

    const handleContinue = () => {
        Object.entries(rotationState).forEach(([key, value]) => {
            updateFormData(key as keyof FactorRotationType, value);
        });
        setIsRotationOpen(false);
    };

    return (
        <>
            {/* Rotation Dialog */}
            <Dialog open={isRotationOpen} onOpenChange={setIsRotationOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Factor Analysis: Rotation</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <ResizablePanelGroup
                            direction="vertical"
                            className="min-h-[215px] max-w-xl rounded-lg border md:min-w-[200px]"
                        >
                            <ResizablePanel defaultSize={75}>
                                <div className="flex flex-col gap-2 p-2">
                                    <Label className="font-bold">Method</Label>
                                    <RadioGroup
                                        value={
                                            rotationState.None
                                                ? "None"
                                                : rotationState.Quartimax
                                                ? "Quartimax"
                                                : rotationState.Varimax
                                                ? "Varimax"
                                                : rotationState.Equimax
                                                ? "Equimax"
                                                : rotationState.Oblimin
                                                ? "Oblimin"
                                                : rotationState.Promax
                                                ? "Promax"
                                                : ""
                                        }
                                        onValueChange={handleMethodGrp}
                                    >
                                        <div className="grid grid-cols-2 gap-1">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="None"
                                                        id="None"
                                                    />
                                                    <Label htmlFor="None">
                                                        None
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Varimax"
                                                        id="Varimax"
                                                    />
                                                    <Label htmlFor="Varimax">
                                                        Varimax
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Oblimin"
                                                        id="Oblimin"
                                                    />
                                                    <Label htmlFor="Oblimin">
                                                        Direct Oblimin
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 pl-6">
                                                    <Label className="w-[75px]">
                                                        Delta:
                                                    </Label>
                                                    <div className="w-[75px]">
                                                        <Input
                                                            id="Delta"
                                                            type="number"
                                                            placeholder=""
                                                            value={
                                                                rotationState.Delta ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "Delta",
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Quartimax"
                                                        id="Quartimax"
                                                    />
                                                    <Label htmlFor="Quartimax">
                                                        Quartimax
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Equimax"
                                                        id="Equimax"
                                                    />
                                                    <Label htmlFor="Equimax">
                                                        Equimax
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Promax"
                                                        id="Promax"
                                                    />
                                                    <Label htmlFor="Promax">
                                                        Promax
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 pl-6">
                                                    <Label className="w-[75px]">
                                                        Kappa:
                                                    </Label>
                                                    <div className="w-[75px]">
                                                        <Input
                                                            id="Kappa"
                                                            type="number"
                                                            placeholder=""
                                                            value={
                                                                rotationState.Kappa ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "Kappa",
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle />
                            <ResizablePanel defaultSize={25}>
                                <div className="flex flex-col gap-2 p-2">
                                    <Label className="font-bold">Display</Label>
                                    <div className="grid grid-cols-2 gap-1">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="RotatedSol"
                                                checked={
                                                    rotationState.RotatedSol
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "RotatedSol",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="RotatedSol"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Rotated Solution
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="LoadingPlot"
                                                checked={
                                                    rotationState.LoadingPlot
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "LoadingPlot",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="LoadingPlot"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Loading Plot(s)
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                        <div className="flex items-center space-x-2">
                            <Label className="w-[250px]">
                                Maximum Iterations for Convergence:
                            </Label>
                            <div className="w-[75px]">
                                <Input
                                    id="MaxIter"
                                    type="number"
                                    placeholder=""
                                    value={rotationState.MaxIter ?? ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "MaxIter",
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
                            onClick={() => setIsRotationOpen(false)}
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
