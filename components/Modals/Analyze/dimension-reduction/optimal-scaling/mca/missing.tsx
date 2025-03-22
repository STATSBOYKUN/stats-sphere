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
    OptScaMCAMissingProps,
    OptScaMCAMissingType,
} from "@/models/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const OptScaMCAMissing = ({
    isMissingOpen,
    setIsMissingOpen,
    updateFormData,
    data,
}: OptScaMCAMissingProps) => {
    const [missingState, setMissingState] = useState<OptScaMCAMissingType>({
        ...data,
    });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);
    const [availableAnalysisVariables, setAvailableAnalysisVariables] =
        useState<string[]>([]);
    const [
        availableSupplementaryVariables,
        setAvailableSupplementaryVariables,
    ] = useState<string[]>([]);

    // Add state for selected variable and formatted variables
    const [selectedAnalysisVariable, setSelectedAnalysisVariable] = useState<
        string | null
    >(null);
    const [selectedSupplementaryVariable, setSelectedSupplementaryVariable] =
        useState<string | null>(null);
    const [formattedAnalysisVariables, setFormattedAnalysisVariables] =
        useState<{
            [key: string]: string;
        }>({});
    const [
        formattedSupplementaryVariables,
        setFormattedSupplementaryVariables,
    ] = useState<{
        [key: string]: string;
    }>({});

    // Store original variable names to prevent double formatting
    const [originalAnalysisVariables, setOriginalAnalysisVariables] = useState<
        string[]
    >([]);
    const [originalSupplementaryVariables, setOriginalSupplementaryVariables] =
        useState<string[]>([]);

    useEffect(() => {
        if (isMissingOpen) {
            setMissingState({ ...data });

            // Extract original variable names and create mapping of current formatting for analysis variables
            const origAnalysis: string[] = [];
            const currentAnalysisFormatting: { [key: string]: string } = {};

            if (Array.isArray(data.AnalysisVariables)) {
                data.AnalysisVariables.forEach((variable) => {
                    // Extract original name from possibly formatted variable
                    const originalName = variable.split(" (")[0];
                    origAnalysis.push(originalName);

                    // If the variable is formatted, store the formatting
                    if (variable !== originalName) {
                        currentAnalysisFormatting[originalName] = variable;
                    }
                });
            }

            // Extract original variable names and create mapping of current formatting for supplementary variables
            const origSupplementary: string[] = [];
            const currentSupplementaryFormatting: { [key: string]: string } =
                {};

            if (Array.isArray(data.SupplementaryVariables)) {
                data.SupplementaryVariables.forEach((variable) => {
                    // Extract original name from possibly formatted variable
                    const originalName = variable.split(" (")[0];
                    origSupplementary.push(originalName);

                    // If the variable is formatted, store the formatting
                    if (variable !== originalName) {
                        currentSupplementaryFormatting[originalName] = variable;
                    }
                });
            }

            // Update state with original variable names and their current formatting
            setAvailableAnalysisVariables(origAnalysis);
            setOriginalAnalysisVariables(origAnalysis);
            setFormattedAnalysisVariables(currentAnalysisFormatting);

            setAvailableSupplementaryVariables(origSupplementary);
            setOriginalSupplementaryVariables(origSupplementary);
            setFormattedSupplementaryVariables(currentSupplementaryFormatting);
        }
    }, [isMissingOpen, data]);

    const handleChange = (
        field: keyof OptScaMCAMissingType,
        value: number | string | null
    ) => {
        setMissingState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleExcludeGrp = (value: string) => {
        setMissingState((prevState) => ({
            ...prevState,
            MissingValuesExclude: value === "MissingValuesExclude",
            MissingValuesImpute: value === "MissingValuesImpute",
            ExcludeObjects: value === "ExcludeObjects",
        }));
    };

    const handleExcludeMethodGrp = (value: string) => {
        setMissingState((prevState) => ({
            ...prevState,
            ExcludeMode: value === "ExcludeMode",
            ExcludeExtraCat: value === "ExcludeExtraCat",
            ExcludeRandomCat: value === "ExcludeRandomCat",
        }));
    };

    const handleImputeMethodGrp = (value: string) => {
        setMissingState((prevState) => ({
            ...prevState,
            ImputeMode: value === "ImputeMode",
            ImputeExtraCat: value === "ImputeExtraCat",
            ImputeRandomCat: value === "ImputeRandomCat",
        }));
    };

    // Handle analysis variable selection
    const handleAnalysisVariableClick = (variable: string) => {
        setSelectedAnalysisVariable(variable);
        setSelectedSupplementaryVariable(null);
    };

    // Handle supplementary variable selection
    const handleSupplementaryVariableClick = (variable: string) => {
        setSelectedSupplementaryVariable(variable);
        setSelectedAnalysisVariable(null);
    };

    // Format variable based on current missing value strategy
    const formatVariable = (variable: string) => {
        // Get the original variable name to prevent double formatting
        const originalName = variable.split(" (")[0];

        // Determine strategy text based on currently selected options
        let strategyText = "";

        if (missingState.MissingValuesExclude) {
            strategyText = "Exclude-";
            if (missingState.ExcludeMode) {
                strategyText += "Mode";
            } else if (missingState.ExcludeExtraCat) {
                strategyText += "Extra";
            } else if (missingState.ExcludeRandomCat) {
                strategyText += "Random";
            }
        } else if (missingState.MissingValuesImpute) {
            strategyText = "Impute-";
            if (missingState.ImputeMode) {
                strategyText += "Mode";
            } else if (missingState.ImputeExtraCat) {
                strategyText += "Extra";
            } else if (missingState.ImputeRandomCat) {
                strategyText += "Random";
            }
        } else if (missingState.ExcludeObjects) {
            strategyText = "ExcludeObjects";
        }

        return `${originalName} (${strategyText})`;
    };

    // Handle the Change button click
    const handleChangeClick = () => {
        // Apply changes to analysis variable if one is selected
        if (selectedAnalysisVariable) {
            const formatted = formatVariable(selectedAnalysisVariable);

            // Update formatted analysis variables
            setFormattedAnalysisVariables((prev) => ({
                ...prev,
                [selectedAnalysisVariable]: formatted,
            }));
        }

        // Apply changes to supplementary variable if one is selected
        if (selectedSupplementaryVariable) {
            const formatted = formatVariable(selectedSupplementaryVariable);

            // Update formatted supplementary variables
            setFormattedSupplementaryVariables((prev) => ({
                ...prev,
                [selectedSupplementaryVariable]: formatted,
            }));
        }
    };

    const handleContinue = () => {
        // Create updated variable lists by applying formatting
        const updatedAnalysisVariablesList = availableAnalysisVariables.map(
            (variable) => {
                return formattedAnalysisVariables[variable] || variable;
            }
        );

        const updatedSupplementaryVariablesList =
            availableSupplementaryVariables.map((variable) => {
                return formattedSupplementaryVariables[variable] || variable;
            });

        // Update the missing state with formatted variables
        const updatedState = {
            ...missingState,
            AnalysisVariables: updatedAnalysisVariablesList,
            SupplementaryVariables: updatedSupplementaryVariablesList,
        };

        // Update parent component's form data
        Object.entries(updatedState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaMCAMissingType, value);
        });

        setIsMissingOpen(false);
    };

    return (
        <>
            {/* Missing Dialog */}
            <Dialog open={isMissingOpen} onOpenChange={setIsMissingOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            Multiple Correspondence Analysis: Missing Values
                        </DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[450px] max-w-xl rounded-lg border md:min-w-[250px]"
                    >
                        <ResizablePanel defaultSize={65}>
                            <ResizablePanelGroup direction="vertical">
                                <ResizablePanel defaultSize={50}>
                                    <div className="flex flex-col p-2">
                                        <Label className="font-bold">
                                            Missing Value Strategy{" "}
                                        </Label>
                                        <div className="w-full">
                                            <Label>Analysis Variables: </Label>
                                            <ScrollArea>
                                                <div className="flex flex-col gap-1 justify-start items-start h-[100px] w-full p-2 border rounded">
                                                    {availableAnalysisVariables.map(
                                                        (
                                                            variable: string,
                                                            index: number
                                                        ) => (
                                                            <Badge
                                                                key={index}
                                                                className="w-full text-start text-sm font-light p-2 cursor-pointer"
                                                                variant={
                                                                    selectedAnalysisVariable ===
                                                                    variable
                                                                        ? "default"
                                                                        : "outline"
                                                                }
                                                                onClick={() =>
                                                                    handleAnalysisVariableClick(
                                                                        variable
                                                                    )
                                                                }
                                                            >
                                                                {formattedAnalysisVariables[
                                                                    variable
                                                                ] || variable}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={50}>
                                    <div className="flex flex-col p-2">
                                        <div className="w-full">
                                            <Label>
                                                Supplementary Variables:{" "}
                                            </Label>
                                            <ScrollArea>
                                                <div className="flex flex-col gap-1 justify-start items-start h-[100px] w-full p-2 border rounded">
                                                    {availableSupplementaryVariables.map(
                                                        (
                                                            variable: string,
                                                            index: number
                                                        ) => (
                                                            <Badge
                                                                key={index}
                                                                className="w-full text-start text-sm font-light p-2 cursor-pointer"
                                                                variant={
                                                                    selectedSupplementaryVariable ===
                                                                    variable
                                                                        ? "default"
                                                                        : "outline"
                                                                }
                                                                onClick={() =>
                                                                    handleSupplementaryVariableClick(
                                                                        variable
                                                                    )
                                                                }
                                                            >
                                                                {formattedSupplementaryVariables[
                                                                    variable
                                                                ] || variable}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={35}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">Strategy</Label>
                                <RadioGroup
                                    value={
                                        missingState.MissingValuesExclude
                                            ? "MissingValuesExclude"
                                            : missingState.MissingValuesImpute
                                            ? "MissingValuesImpute"
                                            : "ExcludeObjects"
                                    }
                                    onValueChange={handleExcludeGrp}
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="MissingValuesExclude"
                                                id="MissingValuesExclude"
                                            />
                                            <Label htmlFor="MissingValuesExclude">
                                                Exclude Missing Values
                                            </Label>
                                        </div>
                                        <RadioGroup
                                            value={
                                                missingState.ExcludeMode
                                                    ? "ExcludeMode"
                                                    : missingState.ExcludeExtraCat
                                                    ? "ExcludeExtraCat"
                                                    : "ExcludeRandomCat"
                                            }
                                            disabled={
                                                !missingState.MissingValuesExclude
                                            }
                                            onValueChange={
                                                handleExcludeMethodGrp
                                            }
                                        >
                                            <div className="grid grid-cols-3 gap-1 pl-6">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="ExcludeMode"
                                                        id="ExcludeMode"
                                                    />
                                                    <Label htmlFor="ExcludeMode">
                                                        Mode
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="ExcludeExtraCat"
                                                        id="ExcludeExtraCat"
                                                    />
                                                    <Label htmlFor="ExcludeExtraCat">
                                                        Extra
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="ExcludeRandomCat"
                                                        id="ExcludeRandomCat"
                                                    />
                                                    <Label htmlFor="ExcludeRandomCat">
                                                        Random
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="MissingValuesImpute"
                                                id="MissingValuesImpute"
                                            />
                                            <Label htmlFor="MissingValuesImpute">
                                                Impute Missing Values
                                            </Label>
                                        </div>
                                        <RadioGroup
                                            value={
                                                missingState.ImputeMode
                                                    ? "ImputeMode"
                                                    : missingState.ImputeExtraCat
                                                    ? "ImputeExtraCat"
                                                    : "ImputeRandomCat"
                                            }
                                            disabled={
                                                !missingState.MissingValuesImpute
                                            }
                                            onValueChange={
                                                handleImputeMethodGrp
                                            }
                                        >
                                            <div className="grid grid-cols-3 gap-1 pl-6">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="ImputeMode"
                                                        id="ImputeMode"
                                                    />
                                                    <Label htmlFor="ImputeMode">
                                                        Mode
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="ImputeExtraCat"
                                                        id="ImputeExtraCat"
                                                    />
                                                    <Label htmlFor="ImputeExtraCat">
                                                        Extra
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="ImputeRandomCat"
                                                        id="ImputeRandomCat"
                                                    />
                                                    <Label htmlFor="ImputeRandomCat">
                                                        Random
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="ExcludeObjects"
                                                id="ExcludeObjects"
                                            />
                                            <Label htmlFor="ExcludeObjects">
                                                Exclude Objects with Missing
                                                Values
                                            </Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleChangeClick}
                                    disabled={
                                        !selectedAnalysisVariable &&
                                        !selectedSupplementaryVariable
                                    }
                                >
                                    Change
                                </Button>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
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
                            onClick={() => setIsMissingOpen(false)}
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
