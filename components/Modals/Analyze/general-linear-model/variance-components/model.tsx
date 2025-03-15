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
    VarianceCompsModelProps,
    VarianceCompsModelType,
} from "@/models/general-linear-model/variance-components/variance-components";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BUILDTERMMETHOD } from "@/constants/general-linear-model/multivariate/multivariate-method";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";

export const VarianceCompsModel = ({
    isModelOpen,
    setIsModelOpen,
    updateFormData,
    data,
}: VarianceCompsModelProps) => {
    const [modelState, setModelState] = useState<VarianceCompsModelType>({
        ...data,
    });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    useEffect(() => {
        if (isModelOpen) {
            setModelState({ ...data });
        }
    }, [isModelOpen, data]);

    const handleChange = (
        field: keyof VarianceCompsModelType,
        value: CheckedState | number | string | null
    ) => {
        setModelState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleSpecifyGrp = (value: string) => {
        setModelState((prevState) => ({
            ...prevState,
            NonCust: value === "NonCust",
            Custom: value === "Custom",
        }));
    };

    const handleContinue = () => {
        Object.entries(modelState).forEach(([key, value]) => {
            updateFormData(key as keyof VarianceCompsModelType, value);
        });
        setIsModelOpen(false);
    };

    return (
        <>
            {/* Model Dialog */}
            <Dialog open={isModelOpen} onOpenChange={setIsModelOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Variance Components: Model</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="h-[350px] flex flex-col gap-2">
                        <ScrollArea>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[300px] max-w-2xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={20}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Specify Model
                                        </Label>
                                        <RadioGroup
                                            value={
                                                modelState.NonCust
                                                    ? "NonCust"
                                                    : modelState.Custom
                                                    ? "Custom"
                                                    : ""
                                            }
                                            onValueChange={handleSpecifyGrp}
                                        >
                                            <div className="grid grid-cols-3">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="NonCust"
                                                        id="NonCust"
                                                    />
                                                    <Label htmlFor="NonCust">
                                                        Full Factorial
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Custom"
                                                        id="Custom"
                                                    />
                                                    <Label htmlFor="Custom">
                                                        Build Terms
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={80}>
                                    <ResizablePanelGroup direction="horizontal">
                                        <ResizablePanel defaultSize={30}>
                                            <div className="w-full p-2">
                                                <Label>
                                                    Factor & Covariates:{" "}
                                                </Label>
                                                <Input
                                                    id="FactorsVar"
                                                    type="text"
                                                    className="w-full"
                                                    placeholder=""
                                                    value={
                                                        modelState.FactorsVar ??
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "FactorsVar",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        </ResizablePanel>
                                        <ResizableHandle />
                                        <ResizablePanel defaultSize={30}>
                                            <div className="flex flex-col gap-2 p-2">
                                                <Label className="font-bold">
                                                    Build Term(s):
                                                </Label>
                                                <div className="flex items-center space-x-2">
                                                    <Label className="w-[75px]">
                                                        Type:
                                                    </Label>
                                                    <Select
                                                        value={
                                                            modelState.BuildTermMethod ??
                                                            ""
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            handleChange(
                                                                "BuildTermMethod",
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
                                                                    (
                                                                        method,
                                                                        index
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                index
                                                                            }
                                                                            value={
                                                                                method
                                                                            }
                                                                        >
                                                                            {capitalize(
                                                                                method
                                                                            ) +
                                                                                "'s Method"}
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </ResizablePanel>
                                        <ResizableHandle />
                                        <ResizablePanel defaultSize={40}>
                                            <div className="w-full p-2">
                                                <Label>Model: </Label>
                                                <Input
                                                    id="FactorsModel"
                                                    type="text"
                                                    className="w-full"
                                                    placeholder=""
                                                    value={
                                                        modelState.FactorsModel ??
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "FactorsModel",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ScrollArea>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="Intercept"
                                checked={modelState.Intercept}
                                onCheckedChange={(checked) =>
                                    handleChange("Intercept", checked)
                                }
                            />
                            <label
                                htmlFor="Intercept"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Include Intercept in Model
                            </label>
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
                            onClick={() => setIsModelOpen(false)}
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
