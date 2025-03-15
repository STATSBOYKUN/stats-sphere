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
    MultivariateModelProps,
    MultivariateModelType,
} from "@/models/general-linear-model/multivariate/multivariate";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";

export const MultivariateModel = ({
    isModelOpen,
    setIsModelOpen,
    updateFormData,
    data,
}: MultivariateModelProps) => {
    const [modelState, setModelState] = useState<MultivariateModelType>({
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
        field: keyof MultivariateModelType,
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
            BuildCustomTerm: value === "BuildCustomTerm",
        }));
    };

    const handleContinue = () => {
        Object.entries(modelState).forEach(([key, value]) => {
            updateFormData(key as keyof MultivariateModelType, value);
        });
        setIsModelOpen(false);
    };

    return (
        <>
            {/* Model Dialog */}
            <Dialog open={isModelOpen} onOpenChange={setIsModelOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Multivariate: Model</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="h-[450px] flex flex-col gap-2">
                        <ScrollArea>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[400px] max-w-2xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={15}>
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
                                                    : "BuildCustomTerm"
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
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="BuildCustomTerm"
                                                        id="BuildCustomTerm"
                                                    />
                                                    <Label htmlFor="BuildCustomTerm">
                                                        Build Custom Terms
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={60}>
                                    <ResizablePanelGroup direction="horizontal">
                                        <ResizablePanel defaultSize={50}>
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
                                        <ResizablePanel defaultSize={20}>
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
                                        <ResizablePanel defaultSize={30}>
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
                                <ResizableHandle />
                                <ResizablePanel defaultSize={25}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label>Build Term:</Label>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[150px]">
                                                        Variable
                                                    </TableHead>
                                                    <TableHead>By</TableHead>
                                                    <TableHead>
                                                        Within
                                                    </TableHead>
                                                    <TableHead>
                                                        Clear Term
                                                    </TableHead>
                                                    <TableHead>Add</TableHead>
                                                    <TableHead>
                                                        Remove
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>1</TableCell>
                                                    <TableCell>2</TableCell>
                                                    <TableCell>3</TableCell>
                                                    <TableCell>4</TableCell>
                                                    <TableCell>5</TableCell>
                                                    <TableCell>6</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ScrollArea>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                                <Label className="w-[200px]">
                                    Sum of Squares:
                                </Label>
                                <Select
                                    value={modelState.SumOfSquareMethod ?? ""}
                                    onValueChange={(value) =>
                                        handleChange("SumOfSquareMethod", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="w-full">
                                        <SelectGroup>
                                            {BUILDTERMMETHOD.map(
                                                (method, index) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={method}
                                                    >
                                                        {capitalize(method) +
                                                            "'s Method"}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
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
