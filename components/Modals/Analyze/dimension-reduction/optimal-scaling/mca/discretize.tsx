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
    OptScaMCADiscretizeProps,
    OptScaMCADiscretizeType,
} from "@/models/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DISCRETIZEMETHOD } from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-sca-method";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const OptScaMCADiscretize = ({
    isDiscretizeOpen,
    setIsDiscretizeOpen,
    updateFormData,
    data,
}: OptScaMCADiscretizeProps) => {
    const [discretizeState, setDiscretizeState] =
        useState<OptScaMCADiscretizeType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);

    // Add state for selected variable and formatted variables
    const [selectedVariable, setSelectedVariable] = useState<string | null>(
        null
    );
    const [formattedVariables, setFormattedVariables] = useState<{
        [key: string]: string;
    }>({});

    // Store original variable names to prevent double formatting
    const [originalVariables, setOriginalVariables] = useState<string[]>([]);

    useEffect(() => {
        if (isDiscretizeOpen) {
            setDiscretizeState({ ...data });

            // Extract original variable names and create mapping of current formatting
            const originals: string[] = [];
            const currentFormatting: { [key: string]: string } = {};

            data.VariablesList?.forEach((variable) => {
                // Extract original name from possibly formatted variable
                const originalName = variable.split(" (")[0];
                originals.push(originalName);

                // If the variable is formatted, store the formatting
                if (variable !== originalName) {
                    currentFormatting[originalName] = variable;
                }
            });

            setAvailableVariables(originals);
            setOriginalVariables(originals);

            // Initialize with current formatting instead of resetting
            setFormattedVariables(currentFormatting);
        }
    }, [isDiscretizeOpen, data]);

    const handleChange = (
        field: keyof OptScaMCADiscretizeType,
        value: number | string | null
    ) => {
        setDiscretizeState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleGroupingGrp = (value: string) => {
        setDiscretizeState((prevState) => ({
            ...prevState,
            NumberOfCategories: value === "NumberOfCategories",
            EqualIntervals: value === "EqualIntervals",
        }));
    };

    const handleDistributionGrp = (value: string) => {
        setDiscretizeState((prevState) => ({
            ...prevState,
            DistributionNormal: value === "DistributionNormal",
            DistributionUniform: value === "DistributionUniform",
        }));
    };

    // Handle variable selection
    const handleVariableClick = (variable: string) => {
        setSelectedVariable(variable);
    };

    // Format variable based on current discretization settings
    const formatVariable = (variable: string) => {
        const method = discretizeState.Method || "Grouping";

        let groupingInfo = "";
        if (method === "Grouping") {
            if (discretizeState.NumberOfCategories) {
                // Add distribution info
                if (discretizeState.DistributionNormal) {
                    groupingInfo += " Normal ";
                } else if (discretizeState.DistributionUniform) {
                    groupingInfo += " Uniform ";
                }

                groupingInfo += `${
                    discretizeState.NumberOfCategoriesValue || 7
                }`;
            } else if (discretizeState.EqualIntervals) {
                groupingInfo = `${discretizeState.EqualIntervalsValue || 7}`;
            }
        }

        // Get the original variable name to prevent double formatting
        const originalName = variable.split(" (")[0];
        return `${originalName} (${method} ${groupingInfo})`;
    };

    // Handle the Change button click
    const handleChangeClick = () => {
        if (selectedVariable) {
            const formatted = formatVariable(selectedVariable);

            // Update formatted variables
            setFormattedVariables((prev) => ({
                ...prev,
                [selectedVariable]: formatted,
            }));
        }
    };

    const handleContinue = () => {
        // Create the updated variable list by applying formatting
        const updatedVariablesList = availableVariables.map((variable) => {
            return formattedVariables[variable] || variable;
        });

        // Update the discretize state with formatted variables
        const updatedState = {
            ...discretizeState,
            // Set the updated variable list
            VariablesList: updatedVariablesList,
        };

        // Update parent component's form data
        Object.entries(updatedState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaMCADiscretizeType, value);
        });

        // Close the dialog
        setIsDiscretizeOpen(false);
    };

    return (
        <>
            {/* Discretize Dialog */}
            <Dialog open={isDiscretizeOpen} onOpenChange={setIsDiscretizeOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Multiple Correspondence Analysis: Discretize
                        </DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <div className="w-full">
                            <Label className="font-bold">
                                Categorical Variables:{" "}
                            </Label>
                            <ScrollArea>
                                <div className="flex flex-col gap-1 justify-start items-start h-[150px] w-full p-2 border rounded">
                                    {availableVariables.map(
                                        (variable: string, index: number) => (
                                            <Badge
                                                key={index}
                                                className="w-full text-start text-sm font-light p-2 cursor-pointer"
                                                variant={
                                                    selectedVariable ===
                                                    variable
                                                        ? "default"
                                                        : "outline"
                                                }
                                                onClick={() =>
                                                    handleVariableClick(
                                                        variable
                                                    )
                                                }
                                            >
                                                {formattedVariables[variable] ||
                                                    variable}
                                            </Badge>
                                        )
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                        <div className="flex justify-between items-center space-x-2">
                            <Label className="w-[150px] font-bold">
                                Growing Method:{" "}
                            </Label>
                            <div className="flex items-center space-x-2">
                                <Select
                                    value={discretizeState.Method ?? "Grouping"}
                                    onValueChange={(value) =>
                                        handleChange("Method", value)
                                    }
                                >
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="w-[150px]">
                                        <SelectGroup>
                                            {DISCRETIZEMETHOD.map(
                                                (method, index) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={method.value}
                                                    >
                                                        {method.name}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleChangeClick}
                                    disabled={!selectedVariable}
                                >
                                    Change
                                </Button>
                            </div>
                        </div>
                        <ResizablePanelGroup
                            direction="vertical"
                            className="min-h-[150px] max-w-md rounded-lg border md:min-w-[200px]"
                        >
                            <ResizablePanel defaultSize={100}>
                                <RadioGroup
                                    value={
                                        discretizeState.NumberOfCategories
                                            ? "NumberOfCategories"
                                            : "EqualIntervals"
                                    }
                                    disabled={
                                        !(discretizeState.Method === "Grouping")
                                    }
                                    onValueChange={handleGroupingGrp}
                                >
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Grouping
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="NumberOfCategories"
                                                id="NumberOfCategories"
                                            />
                                            <Label
                                                className="w-[250px]"
                                                htmlFor="NumberOfCategories"
                                            >
                                                Number of Categories
                                            </Label>
                                            <Input
                                                id="NumberOfCategoriesValue"
                                                type="number"
                                                className="ml-12 w-[75px]"
                                                value={
                                                    discretizeState.NumberOfCategoriesValue ??
                                                    ""
                                                }
                                                disabled={
                                                    !discretizeState.NumberOfCategories
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        "NumberOfCategoriesValue",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <RadioGroup
                                            value={
                                                discretizeState.DistributionNormal
                                                    ? "DistributionNormal"
                                                    : "DistributionUniform"
                                            }
                                            disabled={
                                                !discretizeState.NumberOfCategories ||
                                                !(
                                                    discretizeState.Method ===
                                                    "Grouping"
                                                )
                                            }
                                            onValueChange={
                                                handleDistributionGrp
                                            }
                                        >
                                            <div className="flex items-center justify between space-x-2 pl-6">
                                                <Label>Distribution: </Label>
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem
                                                            value="DistributionNormal"
                                                            id="DistributionNormal"
                                                        />
                                                        <Label htmlFor="DistributionNormal">
                                                            Normal
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem
                                                            value="DistributionUniform"
                                                            id="DistributionUniform"
                                                        />
                                                        <Label htmlFor="DistributionUniform">
                                                            Uniform
                                                        </Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="EqualIntervals"
                                                id="EqualIntervals"
                                            />
                                            <Label
                                                className="w-[250px]"
                                                htmlFor="EqualIntervals"
                                            >
                                                Equal Intervals
                                            </Label>
                                            <Input
                                                id="EqualIntervalsValue"
                                                type="number"
                                                className="ml-12 w-[75px]"
                                                value={
                                                    discretizeState.EqualIntervalsValue ??
                                                    ""
                                                }
                                                disabled={
                                                    !discretizeState.EqualIntervals
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        "EqualIntervalsValue",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </RadioGroup>
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
                            onClick={() => setIsDiscretizeOpen(false)}
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
