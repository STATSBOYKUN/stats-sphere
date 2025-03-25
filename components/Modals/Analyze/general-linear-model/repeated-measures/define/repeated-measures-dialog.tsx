import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    RepeatedMeasureDefineDialogProps,
    RepeatedMeasureDefineData,
    RepeatedMeasureDefineFactor,
    FactorLevelCombination,
    RepeatedMeasure,
} from "@/models/general-linear-model/repeated-measures/repeated-measure-define";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ModalType, useModal } from "@/hooks/useModal";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export const RepeatedMeasureDefineDialog = ({
    isDefineOpen,
    setIsDefineOpen,
    data,
    updateFormData,
    onReset,
}: RepeatedMeasureDefineDialogProps) => {
    // State for the form
    const [dialogState, setDialogState] = useState<RepeatedMeasureDefineData>({
        ...data,
    });
    const { closeModal, openModal } = useModal();

    useEffect(() => {
        if (isDefineOpen) {
            setDialogState({ ...data });
        }
    }, [isDefineOpen, data]);

    const handleChange = (
        field: keyof RepeatedMeasureDefineData,
        value: any
    ) => {
        setDialogState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    // Validation for factor name
    const isFactorNameValid = (name: string): boolean => {
        // Check if name is empty
        if (!name.trim()) {
            toast({
                title: "Validation Error",
                description: "Factor name cannot be empty.",
                variant: "destructive",
            });
            return false;
        }

        // Check for illegal characters
        const illegalCharsRegex = /[^a-zA-Z0-9_]/;
        if (illegalCharsRegex.test(name)) {
            toast({
                title: "Validation Error",
                description:
                    "Factor name cannot contain spaces or special characters. Use only letters, numbers, and underscores.",
                variant: "destructive",
            });
            return false;
        }

        // Extract name from selectedFactor for proper comparison
        let selectedFactorName = "";
        if (dialogState.selectedFactor) {
            const match = dialogState.selectedFactor.match(/^(.+?)\([0-9]+\)$/);
            if (match) {
                selectedFactorName = match[1];
            }
        }

        // Check for duplicate factor names
        const isDuplicate = dialogState.factors.some(
            (factor) =>
                factor.name?.toLowerCase() === name.toLowerCase() &&
                factor.name?.toLowerCase() !== selectedFactorName.toLowerCase()
        );

        if (isDuplicate) {
            toast({
                title: "Validation Error",
                description: "A factor with this name already exists.",
                variant: "destructive",
            });
            return false;
        }

        return true;
    };

    // Validation for factor levels
    const isFactorLevelsValid = (levels: number | null): boolean => {
        if (levels === null) {
            toast({
                title: "Validation Error",
                description: "Number of levels must be a valid number.",
                variant: "destructive",
            });
            return false;
        }
        if (levels < 2 || levels > 99) {
            toast({
                title: "Validation Error",
                description: "Number of levels must be between 2 and 99.",
                variant: "destructive",
            });
            return false;
        }
        return true;
    };

    // Validation for measure name
    const isMeasureNameValid = (name: string): boolean => {
        // Check if name is empty
        if (!name.trim()) {
            toast({
                title: "Validation Error",
                description: "Measure name cannot be empty.",
                variant: "destructive",
            });
            return false;
        }

        // Check for illegal characters
        const illegalCharsRegex = /[^a-zA-Z0-9_]/;
        if (illegalCharsRegex.test(name)) {
            toast({
                title: "Validation Error",
                description:
                    "Measure name cannot contain spaces or special characters. Use only letters, numbers, and underscores.",
                variant: "destructive",
            });
            return false;
        }

        // Extract name from selectedMeasure for proper comparison
        let selectedMeasureName = "";
        if (dialogState.selectedMeasure) {
            const match =
                dialogState.selectedMeasure.match(/^(.+?)\([0-9]+\)$/);
            if (match) {
                selectedMeasureName = match[1];
            }
        }

        // Check for duplicate factor names
        const isDuplicate = dialogState.measures.some(
            (measure) =>
                measure.name?.toLowerCase() === name.toLowerCase() &&
                measure.name?.toLowerCase() !==
                    selectedMeasureName.toLowerCase()
        );

        if (isDuplicate) {
            toast({
                title: "Validation Error",
                description: "A measure with this name already exists.",
                variant: "destructive",
            });
            return false;
        }
        return true;
    };

    // Handler for adding a factor
    const handleAddFactor = () => {
        const factorName = dialogState.factorName?.trim() || "";
        const factorLevels = dialogState.factorLevels;

        // Validate factor name and levels
        if (!isFactorNameValid(factorName)) return;
        if (!isFactorLevelsValid(factorLevels)) return;

        const newFactor = {
            name: factorName,
            levels: factorLevels,
        };
        const updatedFactors = [...dialogState.factors, newFactor];

        handleChange("factors", updatedFactors);
        handleChange("factorName", "");
        handleChange("factorLevels", "");
    };

    // Handler for changing a factor
    const handleChangeFactor = () => {
        if (
            !dialogState.selectedFactor ||
            !dialogState.factorName ||
            !dialogState.factorLevels
        )
            return;

        const factorName = dialogState.factorName.trim();
        const factorLevels = dialogState.factorLevels;

        // Validate factor name and levels
        if (!isFactorNameValid(factorName)) return;
        if (!isFactorLevelsValid(factorLevels)) return;

        const updatedFactors = dialogState.factors.map((factor) => {
            if (
                `${factor.name}(${factor.levels})` ===
                dialogState.selectedFactor
            ) {
                return {
                    name: factorName,
                    levels: factorLevels,
                };
            }
            return factor;
        });

        handleChange("factors", updatedFactors);
        handleChange("factorName", "");
        handleChange("factorLevels", "");
    };

    // Handler for removing a factor
    const handleRemoveFactor = () => {
        if (dialogState.selectedFactor) {
            const updatedFactors = dialogState.factors.filter(
                (factor) =>
                    `${factor.name}(${factor.levels})` !==
                    dialogState.selectedFactor
            );

            handleChange("factors", updatedFactors);
            handleChange("selectedFactor", null);
        }
    };

    // Handler for selecting a factor
    const handleFactorSelect = (factorString: string) => {
        handleChange("selectedFactor", factorString);
        const [name, levelsStr] = factorString.split("(");
        const levels = parseInt(levelsStr.replace(")", ""), 10);
        handleChange("factorName", name);
        handleChange("factorLevels", levels);
    };

    // Handler for adding a measure
    const handleAddMeasure = () => {
        const measureName = dialogState.measureName?.trim() || "";

        // Validate measure name
        if (!isMeasureNameValid(measureName)) return;

        const newMeasure = {
            name: measureName,
        };
        const updatedMeasures = [...dialogState.measures, newMeasure];

        handleChange("measures", updatedMeasures);
        handleChange("measureName", "");
    };

    // Handler for changing a measure
    const handleChangeMeasure = () => {
        if (!dialogState.selectedMeasure || !dialogState.measureName) return;

        const measureName = dialogState.measureName.trim();

        // Validate measure name
        if (!isMeasureNameValid(measureName)) return;

        const updatedMeasures = dialogState.measures.map((measure) => {
            if (measure.name === dialogState.selectedMeasure) {
                return {
                    name: measureName,
                };
            }
            return measure;
        });

        handleChange("measures", updatedMeasures);
        handleChange("measureName", "");
        handleChange("selectedMeasure", null);
    };

    // Handler for removing a measure
    const handleRemoveMeasure = () => {
        if (dialogState.selectedMeasure) {
            const updatedMeasures = dialogState.measures.filter(
                (measure) => measure.name !== dialogState.selectedMeasure
            );

            handleChange("measures", updatedMeasures);
            handleChange("selectedMeasure", null);
        }
    };

    // Handler for selecting a measure
    const handleMeasureSelect = (measureName: string) => {
        handleChange("selectedMeasure", measureName);
        handleChange("measureName", measureName);
    };

    /**
     * Generates all possible combinations of factor levels and measures
     * @param factors Array of factor definitions
     * @param measures Array of measure definitions
     * @returns Array of all possible combinations sorted by measure.name
     */
    const generateCombinations = (
        factors: RepeatedMeasureDefineFactor[],
        measures: RepeatedMeasure[]
    ): FactorLevelCombination[] => {
        // No factors or measures, return empty array
        if (!factors.length || !measures.length) return [];

        const combinations: FactorLevelCombination[] = [];

        // First iterate through measures to ensure combinations are grouped by measure.name
        measures.forEach((measure) => {
            // Helper function to generate factor level combinations recursively
            const generateLevelCombinations = (
                currentFactorIndex: number,
                currentCombination: number[]
            ): void => {
                // If we've processed all factors, add the combination with current measure
                if (currentFactorIndex === factors.length) {
                    combinations.push({
                        factorLevels: [...currentCombination],
                        measure: measure.name,
                    });
                    return;
                }

                // Get current factor
                const currentFactor = factors[currentFactorIndex];
                const levels = currentFactor.levels || 0;

                // Loop through each level of the current factor
                for (let level = 1; level <= levels; level++) {
                    // Add this level to the current combination
                    generateLevelCombinations(currentFactorIndex + 1, [
                        ...currentCombination,
                        level,
                    ]);
                }
            };

            // Start the recursive generation with empty combination for this measure
            generateLevelCombinations(0, []);
        });

        return combinations;
    };

    // Handler for continuing with the defined data
    const handleContinue = () => {
        Object.entries(dialogState).forEach(([key, value]) => {
            updateFormData(key as keyof RepeatedMeasureDefineData, value);
        });

        // Generate all combinations of factor levels and measures
        const combinations = generateCombinations(
            dialogState.factors,
            dialogState.measures
        );

        // Format the combinations as per the example
        const formattedCombinations: string[] = combinations.map((combo) => {
            const levelPart = combo.factorLevels.join(",");
            return `?_(${levelPart},${combo.measure})`;
        });

        setIsDefineOpen(false);
        closeModal();
        openModal(ModalType.RepeatedMeasuresDialog, {
            combinationVars: formattedCombinations,
            factorVars: dialogState.factors.map((factor) => factor.name || ""),
        });
    };

    const handleReset = () => {
        onReset();
        setDialogState({ ...data });
    };

    const handleDialog = () => {
        setIsDefineOpen(false);
        closeModal();
    };

    return (
        <Dialog open={isDefineOpen} onOpenChange={handleDialog}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Repeated Measures: Define Factor(s)
                    </DialogTitle>
                </DialogHeader>
                <Separator />
                <ResizablePanelGroup
                    direction="vertical"
                    className="min-h-[450px] max-w-md rounded-lg border md:min-w-[200px]"
                >
                    <ResizablePanel defaultSize={55}>
                        <div className="flex flex-col gap-2 p-2">
                            <div className="flex items-center">
                                <Label
                                    htmlFor="factorName"
                                    className="w-[200px]"
                                >
                                    Within-Subject Factor Name:
                                </Label>
                                <Input
                                    id="factorName"
                                    value={dialogState.factorName || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "factorName",
                                            e.target.value
                                        )
                                    }
                                    className="w-full border"
                                />
                            </div>
                            <div className="flex items-center">
                                <Label
                                    htmlFor="factorLevels"
                                    className="w-[200px]"
                                >
                                    Number of Levels:
                                </Label>
                                <Input
                                    id="factorLevels"
                                    className="w-full"
                                    value={dialogState.factorLevels || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "factorLevels",
                                            parseInt(e.target.value, 10) || ""
                                        )
                                    }
                                    type="number"
                                    min={2}
                                    max={99}
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleAddFactor}
                                    >
                                        Add
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleChangeFactor}
                                        disabled={!dialogState.selectedFactor}
                                    >
                                        Change
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleRemoveFactor}
                                        disabled={!dialogState.selectedFactor}
                                    >
                                        Remove
                                    </Button>
                                </div>
                                <div className="h-[125px] border w-full">
                                    <ScrollArea className="h-full w-full">
                                        <div className="flex flex-col gap-1 p-2">
                                            {dialogState.factors &&
                                                dialogState.factors.map(
                                                    (factor, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant={`${
                                                                dialogState.selectedFactor ===
                                                                `${factor.name}(${factor.levels})`
                                                                    ? "default"
                                                                    : "outline"
                                                            }`}
                                                            className="text-start text-sm font-light p-2 cursor-pointer"
                                                            onClick={() =>
                                                                handleFactorSelect(
                                                                    `${factor.name}(${factor.levels})`
                                                                )
                                                            }
                                                        >
                                                            {`${factor.name}(${factor.levels})`}
                                                        </Badge>
                                                    )
                                                )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={45}>
                        <div className="flex flex-col gap-2 p-2">
                            <div className="flex items-center">
                                <Label
                                    htmlFor="measureName"
                                    className="w-[200px]"
                                >
                                    Measure Name:
                                </Label>
                                <Input
                                    id="measureName"
                                    value={dialogState.measureName || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "measureName",
                                            e.target.value
                                        )
                                    }
                                    className="w-full"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleAddMeasure}
                                    >
                                        Add
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleChangeMeasure}
                                        disabled={!dialogState.selectedMeasure}
                                    >
                                        Change
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleRemoveMeasure}
                                        disabled={!dialogState.selectedMeasure}
                                    >
                                        Remove
                                    </Button>
                                </div>
                                <div className="border h-[125px] w-full">
                                    <ScrollArea className="h-full w-full">
                                        <div className="flex flex-col gap-1 p-2">
                                            {dialogState.measures &&
                                                dialogState.measures.map(
                                                    (measure, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant={`${
                                                                dialogState.selectedMeasure ===
                                                                measure.name
                                                                    ? "default"
                                                                    : "outline"
                                                            }`}
                                                            className="text-start text-sm font-light p-2 cursor-pointer"
                                                            onClick={() =>
                                                                handleMeasureSelect(
                                                                    measure.name ||
                                                                        ""
                                                                )
                                                            }
                                                        >
                                                            {measure.name}
                                                        </Badge>
                                                    )
                                                )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
                <DialogFooter className="sm:justify-start">
                    <Button type="button" onClick={handleContinue}>
                        OK
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleReset}
                    >
                        Reset
                    </Button>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="button" variant="secondary">
                        Help
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
