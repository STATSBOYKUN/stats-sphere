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
    UnivariateContrastProps,
    UnivariateContrastType,
} from "@/models/general-linear-model/univariate/univariate";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BUILDTERMMETHOD } from "@/constants/general-linear-model/multivariate/multivariate-method";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const UnivariateContrast = ({
    isContrastOpen,
    setIsContrastOpen,
    updateFormData,
    data,
}: UnivariateContrastProps) => {
    const [contrastState, setContrastState] = useState<UnivariateContrastType>({
        ...data,
    });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    useEffect(() => {
        if (isContrastOpen) {
            setContrastState({ ...data });
        }
    }, [isContrastOpen, data]);

    const handleChange = (
        field: keyof UnivariateContrastType,
        value: number | string | null
    ) => {
        setContrastState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleRefGrp = (value: string) => {
        setContrastState((prevState) => ({
            ...prevState,
            Last: value === "Last",
            First: value === "First",
        }));
    };

    const handleContinue = () => {
        Object.entries(contrastState).forEach(([key, value]) => {
            updateFormData(key as keyof UnivariateContrastType, value);
        });
        setIsContrastOpen(false);
    };

    return (
        <>
            {/* Contrast Dialog */}
            <Dialog open={isContrastOpen} onOpenChange={setIsContrastOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Univariate: Contrast</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <div className="w-full">
                            <Label className="font-bold">Factors: </Label>
                            <Input
                                id="FactorList"
                                type="text"
                                className="w-full min-h-[100px]"
                                placeholder=""
                                value={contrastState.FactorList ?? ""}
                                onChange={(e) =>
                                    handleChange("FactorList", e.target.value)
                                }
                            />
                        </div>
                        <ResizablePanelGroup
                            direction="vertical"
                            className="min-h-[115px] max-w-md rounded-lg border md:min-w-[200px]"
                        >
                            <ResizablePanel defaultSize={100}>
                                <div className="flex flex-col gap-2 p-2">
                                    <Label className="font-bold">
                                        Change Contrast
                                    </Label>
                                    <div className="flex items-center space-x-2">
                                        <Label className="w-[250px]">
                                            Contrast:{" "}
                                        </Label>
                                        <Select
                                            value={
                                                contrastState.ContrastMethod ??
                                                ""
                                            }
                                            onValueChange={(value) =>
                                                handleChange(
                                                    "ContrastMethod",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="w-[150px]">
                                                <SelectGroup>
                                                    {BUILDTERMMETHOD.map(
                                                        (method, index) => (
                                                            <SelectItem
                                                                key={index}
                                                                value={method}
                                                            >
                                                                {capitalize(
                                                                    method
                                                                ) + "'s Method"}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <RadioGroup
                                        value={
                                            contrastState.Last
                                                ? "Last"
                                                : "First"
                                        }
                                        onValueChange={handleRefGrp}
                                    >
                                        <div className="flex items-center justify between space-x-2">
                                            <Label>References: </Label>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Last"
                                                        id="Last"
                                                    />
                                                    <Label htmlFor="Last">
                                                        Last
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="First"
                                                        id="First"
                                                    />
                                                    <Label htmlFor="First">
                                                        First
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
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
                            onClick={() => setIsContrastOpen(false)}
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
