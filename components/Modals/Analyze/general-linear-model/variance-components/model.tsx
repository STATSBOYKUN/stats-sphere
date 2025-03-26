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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);

    useEffect(() => {
        if (isModelOpen) {
            setModelState({ ...data });
            setAvailableVariables(data.FactorsVar ?? []);
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

    const handleDrop = (target: string, variable: string) => {
        setModelState((prev) => {
            const updatedState = { ...prev };
            if (target === "FactorsModel") {
                // Prevent duplicates by checking if the variable already exists
                if (!(updatedState.FactorsModel || []).includes(variable)) {
                    updatedState.FactorsModel = [
                        ...(updatedState.FactorsModel || []),
                        variable,
                    ];
                }
            }
            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setModelState((prev) => {
            const updatedState = { ...prev };
            if (target === "FactorsModel") {
                updatedState.FactorsModel = (
                    updatedState.FactorsModel || []
                ).filter((item) => item !== variable);
            }
            return updatedState;
        });
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
                                                <ScrollArea className="h-[200px] p-2 border rounded overflow-hidden">
                                                    <div className="flex flex-col gap-1 justify-start items-start">
                                                        {availableVariables.map(
                                                            (
                                                                variable: string,
                                                                index: number
                                                            ) => (
                                                                <Badge
                                                                    key={index}
                                                                    className="w-full text-start text-sm font-light p-2 cursor-pointer"
                                                                    draggable={
                                                                        !modelState.NonCust
                                                                    }
                                                                    variant="outline"
                                                                    onDragStart={(
                                                                        e
                                                                    ) =>
                                                                        e.dataTransfer.setData(
                                                                            "text",
                                                                            variable
                                                                        )
                                                                    }
                                                                >
                                                                    {variable}
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                </ScrollArea>
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
                                                        disabled={
                                                            modelState.NonCust
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
                                                                                method.value
                                                                            }
                                                                        >
                                                                            {
                                                                                method.name
                                                                            }
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
                                                <div
                                                    className="flex flex-col w-full gap-2"
                                                    onDragOver={(e) =>
                                                        modelState.Custom
                                                            ? e.preventDefault()
                                                            : null
                                                    }
                                                    onDrop={(e) => {
                                                        if (modelState.Custom) {
                                                            const variable =
                                                                e.dataTransfer.getData(
                                                                    "text"
                                                                );
                                                            handleDrop(
                                                                "FactorsModel",
                                                                variable
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Label>Model: </Label>
                                                    <div className="w-full h-[200px] p-2 border rounded overflow-hidden">
                                                        <ScrollArea>
                                                            <div className="w-full h-[180px]">
                                                                {modelState.FactorsModel &&
                                                                modelState
                                                                    .FactorsModel
                                                                    .length >
                                                                    0 ? (
                                                                    <div className="flex flex-col gap-1">
                                                                        {modelState.FactorsModel.map(
                                                                            (
                                                                                variable,
                                                                                index
                                                                            ) => (
                                                                                <Badge
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    className="text-start text-sm font-light p-2 cursor-pointer"
                                                                                    variant={
                                                                                        "outline"
                                                                                    }
                                                                                    onClick={() =>
                                                                                        handleRemoveVariable(
                                                                                            "FactorsModel",
                                                                                            variable
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        variable
                                                                                    }
                                                                                </Badge>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm font-light text-gray-500">
                                                                        {modelState.Custom
                                                                            ? "Drop variables here."
                                                                            : "Select a model specification method."}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </ScrollArea>
                                                    </div>
                                                    <input
                                                        type="hidden"
                                                        value={
                                                            modelState.FactorsModel ??
                                                            ""
                                                        }
                                                        name="Independents"
                                                    />
                                                </div>
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
