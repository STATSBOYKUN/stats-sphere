"use client";

import React, { FC, useState, useEffect } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Dialog,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/useModal";
import { Separator } from "@/components/ui/separator";
import {
    Shapes,
    Ruler,
    BarChartHorizontal,
    CornerDownLeft,
    CornerDownRight,
    AlertCircle
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useVariableStore } from "@/stores/useVariableStore";
import { useDataStore } from "@/stores/useDataStore";
import { useModalStore } from "@/stores/useModalStore";

// Import utility functions for function naming and calculations
import {
    getFunctionSuffix,
    createVariableName,
    mapUIFunctionToCalculationFunction,
    getFunctionDisplay,
    calculateAggregateValue
} from "./aggregateFunctionUtils";
import {Variable} from "@/types/Variable";

interface AggregatedVariable {
    id: string;
    baseVarColumnIndex: number;
    baseVarName: string;
    name: string;
    displayName: string;
    type: string;
    measure?: "scale" | "ordinal" | "nominal" | "unknown";
    label?: string;
    function: string;
    functionCategory: "summary" | "specific" | "cases" | "percentages";
    calculationFunction?: string; // The actual function used for calculation
    percentageType?: "above" | "below" | "inside" | "outside";
    percentageValue?: string;
    percentageLow?: string;
    percentageHigh?: string;
}

interface AggregateDataProps {
    onClose: () => void;
}

const AggregateData: FC<AggregateDataProps> = ({ onClose }) => {
    const { closeModal } = useModal();

    // Get variables from store
    const { variables, loadVariables } = useVariableStore();
    const [storeVariables, setStoreVariables] = useState<Variable[]>([]);

    useEffect(() => {
        const loadVars = async () => {
            await loadVariables();
            setStoreVariables(variables.filter(v => v.name !== ""));
        };
        loadVars();
    }, [loadVariables, variables]);

    // Available, break, and aggregated variables
    const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);
    const [breakVariables, setBreakVariables] = useState<Variable[]>([]);
    const [aggregatedVariables, setAggregatedVariables] = useState<AggregatedVariable[]>([]);

    // Update available variables when store variables are loaded
    useEffect(() => {
        setAvailableVariables(storeVariables);
    }, [storeVariables]);

    // Selected variable for highlighting
    const [highlightedVariable, setHighlightedVariable] = useState<{id: string, source: 'available' | 'break' | 'aggregated'} | null>(null);

    // Error message for duplicate variables
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);

    // Function dialog states
    const [functionDialogOpen, setFunctionDialogOpen] = useState<boolean>(false);
    const [functionCategory, setFunctionCategory] = useState<"summary" | "specific" | "cases" | "percentages">("summary");
    const [selectedFunction, setSelectedFunction] = useState<string>("MEAN");
    const [percentageType, setPercentageType] = useState<"above" | "below" | "inside" | "outside">("above");
    const [percentageValue, setPercentageValue] = useState<string>("");
    const [percentageLow, setPercentageLow] = useState<string>("");
    const [percentageHigh, setPercentageHigh] = useState<string>("");

    // Name & Label dialog states
    const [nameDialogOpen, setNameDialogOpen] = useState<boolean>(false);
    const [newVariableName, setNewVariableName] = useState<string>("");
    const [newVariableLabel, setNewVariableLabel] = useState<string>("");
    const [currentEditingVariable, setCurrentEditingVariable] = useState<AggregatedVariable | null>(null);

    // State for dataset name and file path
    const [datasetName, setDatasetName] = useState<string>("");
    const [filePath, setFilePath] = useState<string>("C:\\Users\\hp\\Downloads\\aggr.sav");

    // Save options
    const [saveOption, setSaveOption] = useState<"ADD" | "CREATE" | "WRITE">("ADD");

    // Options for very large datasets
    const [isAlreadySorted, setIsAlreadySorted] = useState<boolean>(false);
    const [sortBeforeAggregating, setSortBeforeAggregating] = useState<boolean>(false);

    // State for name field
    const [breakName, setBreakName] = useState<string>("N_BREAK");

    const getDisplayName = (variable: Variable): string => {
        if (variable.label) {
            return `${variable.label} [${variable.name}]`;
        }
        return variable.name;
    };

    const handleVariableSelect = (columnIndex: number, source: 'available' | 'break' | 'aggregated') => {
        if (highlightedVariable?.id === columnIndex.toString() && highlightedVariable.source === source) {
            setHighlightedVariable(null);
        } else {
            setHighlightedVariable({ id: columnIndex.toString(), source });
        }
    };

    const handleAggregatedVariableSelect = (id: string) => {
        if (highlightedVariable?.id === id && highlightedVariable.source === 'aggregated') {
            setHighlightedVariable(null);
        } else {
            setHighlightedVariable({ id, source: 'aggregated' });
        }
    };

    const handleVariableDoubleClick = (columnIndex: number, source: 'available' | 'break') => {
        if (source === 'break') {
            const variable = breakVariables.find(v => v.columnIndex === columnIndex);
            if (variable) {
                setAvailableVariables(prev => [...prev, variable]);
                setBreakVariables(prev => prev.filter(v => v.columnIndex !== columnIndex));
            }
        } else if (source === 'available') {
            // Handle double-click on available variable - move to break by default
            handleMoveToBreak();
        }
    };

    // Handle double-click on aggregated variable (just remove it)
    const handleAggregatedDoubleClick = (id: string) => {
        setAggregatedVariables(prev => prev.filter(v => v.id !== id));
    };

    const getDefaultFunction = (variable: Variable): { functionCategory: "summary" | "specific" | "cases" | "percentages", function: string } => {
        if (variable.type === "STRING") {
            return { functionCategory: "specific", function: "FIRST" };
        } else {
            return { functionCategory: "summary", function: "MEAN" };
        }
    };

    const getAggregatedVariableDisplayText = (
        aggVar: AggregatedVariable,
        includeFormula: boolean = true
    ): string => {
        let displayText = aggVar.name;

        if (aggVar.label) {
            displayText += ` '${aggVar.label}'`;
        }

        if (includeFormula) {
            let formula;

            // Use calculationFunction if available, otherwise use the UI function
            const func = aggVar.calculationFunction || aggVar.function;

            if (["PGT", "PLT", "FGT", "FLT"].includes(func) && aggVar.percentageValue) {
                formula = `${func}(${aggVar.baseVarName}, ${aggVar.percentageValue})`;
            } else if (["PIN", "POUT", "FIN", "FOUT"].includes(func) && aggVar.percentageLow && aggVar.percentageHigh) {
                formula = `${func}(${aggVar.baseVarName}, ${aggVar.percentageLow}, ${aggVar.percentageHigh})`;
            } else {
                formula = `${func}(${aggVar.baseVarName})`;
            }

            displayText += ` = ${formula}`;
        }

        return displayText;
    };

    const isNumericType = (type: string): boolean => {
        return type !== "STRING";
    };

    const isVariableInAggregated = (columnIndex: number) => {
        return aggregatedVariables.some(v => v.baseVarColumnIndex === columnIndex);
    };

    const handleMoveToBreak = () => {
        if (!highlightedVariable) return;

        if (highlightedVariable.source === 'available') {
            const columnIndex = parseInt(highlightedVariable.id);

            // Check if the variable is already used in aggregated
            if (isVariableInAggregated(columnIndex)) {
                setErrorMessage("The target list accepts only variables that do not appear in another target list.");
                setErrorDialogOpen(true);
                return;
            }

            const variable = availableVariables.find(v => v.columnIndex === columnIndex);
            if (variable) {
                setBreakVariables(prev => [...prev, variable]);
                setAvailableVariables(prev => prev.filter(v => v.columnIndex !== columnIndex));
                setHighlightedVariable(null);
            }
        } else if (highlightedVariable.source === 'aggregated') {
            // Cannot move from aggregated to break
            setErrorMessage("The target list accepts only variables that do not appear in another target list.");
            setErrorDialogOpen(true);
        }
    };

    const handleMoveFromBreak = () => {
        if (highlightedVariable && highlightedVariable.source === 'break') {
            const columnIndex = parseInt(highlightedVariable.id);
            const variable = breakVariables.find(v => v.columnIndex === columnIndex);
            if (variable) {
                setAvailableVariables(prev => [...prev, variable]);
                setBreakVariables(prev => prev.filter(v => v.columnIndex !== columnIndex));
                setHighlightedVariable(null);
            }
        }
    };

    const handleMoveToAggregated = () => {
        if (!highlightedVariable) return;

        if (highlightedVariable.source === 'available') {
            const columnIndex = parseInt(highlightedVariable.id);
            const variable = availableVariables.find(v => v.columnIndex === columnIndex);
            if (variable) {
                const { functionCategory, function: uiFunc } = getDefaultFunction(variable);

                // Get actual calculation function name if different from UI function
                const calculationFunction = mapUIFunctionToCalculationFunction(uiFunc, "above");

                // Get existing variable names for generating unique name
                const existingNames = aggregatedVariables.map(v => v.name);

                // Create new variable name (with the right suffix based on function)
                const newName = createVariableName(variable.name, calculationFunction, existingNames);

                // Generate display text with formula
                const displayFormula = getFunctionDisplay(calculationFunction, variable.name);

                const newAggregatedVar: AggregatedVariable = {
                    id: `agg_${columnIndex}_${Date.now()}`, // Use timestamp for uniqueness
                    baseVarColumnIndex: columnIndex,
                    baseVarName: variable.name,
                    name: newName,
                    displayName: `${newName} = ${displayFormula}`,
                    type: variable.type,
                    measure: variable.measure,
                    function: uiFunc,         // Keep the UI function name for the interface
                    calculationFunction,      // Store the actual calculation function
                    functionCategory
                };

                setAggregatedVariables(prev => [...prev, newAggregatedVar]);
                setHighlightedVariable(null);
            }
        } else if (highlightedVariable.source === 'break') {
            // Cannot move from break to aggregated if the variable is already in use
            setErrorMessage("The target list accepts only variables that do not appear in another target list.");
            setErrorDialogOpen(true);
        }
    };

    const handleMoveFromAggregated = () => {
        if (highlightedVariable && highlightedVariable.source === 'aggregated') {
            setAggregatedVariables(prev =>
                prev.filter(v => v.id !== highlightedVariable.id)
            );
            setHighlightedVariable(null);
        }
    };

    const handleTopArrowClick = () => {
        if (!highlightedVariable) return;

        if (highlightedVariable.source === 'available') {
            handleMoveToBreak();
        } else if (highlightedVariable.source === 'break') {
            handleMoveFromBreak();
        } else if (highlightedVariable.source === 'aggregated') {
            handleMoveToBreak();
        }
    };

    const handleBottomArrowClick = () => {
        if (!highlightedVariable) return;

        if (highlightedVariable.source === 'available') {
            handleMoveToAggregated();
        } else if (highlightedVariable.source === 'break') {
            handleMoveToAggregated();
        } else if (highlightedVariable.source === 'aggregated') {
            handleMoveFromAggregated();
        }
    };

    const getVariableIcon = (variable: Variable) => {
        // Use measure to determine icon
        switch (variable.measure) {
            case "scale":
                return <Ruler size={14} className="text-gray-600 mr-1 flex-shrink-0" />;
            case "nominal":
                return <Shapes size={14} className="text-gray-600 mr-1 flex-shrink-0" />;
            case "ordinal":
                return <BarChartHorizontal size={14} className="text-gray-600 mr-1 flex-shrink-0" />;
            default:
                // Fallback to type-based icons
                return variable.type === "STRING"
                    ? <BarChartHorizontal size={14} className="text-gray-600 mr-1 flex-shrink-0" />
                    : <Ruler size={14} className="text-gray-600 mr-1 flex-shrink-0" />;
        }
    };

    const getTopArrowDirection = () => {
        if (!highlightedVariable) return <CornerDownRight size={20} />;

        if (highlightedVariable.source === 'break') {
            return <CornerDownLeft size={20} />;
        } else {
            return <CornerDownRight size={20} />;
        }
    };

    const getBottomArrowDirection = () => {
        if (!highlightedVariable) return <CornerDownRight size={20} />;

        if (highlightedVariable.source === 'aggregated') {
            return <CornerDownLeft size={20} />;
        } else {
            return <CornerDownRight size={20} />;
        }
    };

    const handleFunctionClick = () => {
        if (highlightedVariable && highlightedVariable.source === 'aggregated') {
            const variable = aggregatedVariables.find(v => v.id === highlightedVariable.id);
            if (variable) {
                setFunctionCategory(variable.functionCategory);
                setSelectedFunction(variable.function);
                setPercentageType(variable.percentageType || "above");
                setPercentageValue(variable.percentageValue || "");
                setPercentageLow(variable.percentageLow || "");
                setPercentageHigh(variable.percentageHigh || "");
                setCurrentEditingVariable(variable);
                setFunctionDialogOpen(true);
            }
        }
    };

    const handleNameLabelClick = () => {
        if (highlightedVariable && highlightedVariable.source === 'aggregated') {
            const variable = aggregatedVariables.find(v => v.id === highlightedVariable.id);
            if (variable) {
                setNewVariableName(variable.name);
                setNewVariableLabel(variable.label || "");
                setCurrentEditingVariable(variable);
                setNameDialogOpen(true);
            }
        }
    };

    const isStringType = (currentEditingVariable: AggregatedVariable | null) => {
        if (!currentEditingVariable) return false;
        return currentEditingVariable.type === "STRING";
    };

    const applyFunction = () => {
        if (currentEditingVariable) {
            // Check if function is changing
            const oldFunction = currentEditingVariable.function;
            const functionChanged = oldFunction !== selectedFunction;

            // Get base name
            const baseName = currentEditingVariable.baseVarName;

            // Get the actual calculation function name based on the UI selection
            const calculationFunction = mapUIFunctionToCalculationFunction(
                selectedFunction,
                functionCategory === "percentages" ? percentageType : undefined
            );

            // Generate new name if function changed
            let newName = currentEditingVariable.name;
            if (functionChanged) {
                // Get existing names excluding the current variable
                const existingNames = aggregatedVariables
                    .filter(v => v.id !== currentEditingVariable.id)
                    .map(v => v.name);

                // Create new name based on the calculation function
                newName = createVariableName(baseName, calculationFunction, existingNames);
            }

            // Prepare function display with appropriate parameters
            let displayFormula;
            if (functionCategory === "percentages") {
                if (["PGT", "PLT"].includes(calculationFunction)) {
                    displayFormula = getFunctionDisplay(calculationFunction, baseName, percentageValue);
                } else if (["PIN", "POUT"].includes(calculationFunction)) {
                    displayFormula = getFunctionDisplay(calculationFunction, baseName, undefined, percentageLow, percentageHigh);
                } else {
                    displayFormula = getFunctionDisplay(calculationFunction, baseName);
                }
            } else {
                displayFormula = getFunctionDisplay(calculationFunction, baseName);
            }

            // Create updated variable
            const updatedVar: AggregatedVariable = {
                ...currentEditingVariable,
                function: selectedFunction,  // Keep the UI function name
                calculationFunction,         // Store the actual calculation function
                functionCategory,
                name: newName,
                displayName: `${newName}${currentEditingVariable.label ? ` '${currentEditingVariable.label}'` : ''} = ${displayFormula}`
            };

            // Add percentage-specific properties if applicable
            if (functionCategory === "percentages") {
                updatedVar.percentageType = percentageType;

                if (percentageType === "above" || percentageType === "below") {
                    updatedVar.percentageValue = percentageValue;
                    delete updatedVar.percentageLow;
                    delete updatedVar.percentageHigh;
                } else if (percentageType === "inside" || percentageType === "outside") {
                    delete updatedVar.percentageValue;
                    updatedVar.percentageLow = percentageLow;
                    updatedVar.percentageHigh = percentageHigh;
                }
            } else {
                delete updatedVar.percentageType;
                delete updatedVar.percentageValue;
                delete updatedVar.percentageLow;
                delete updatedVar.percentageHigh;
            }

            // Update the aggregated variables list
            setAggregatedVariables(prev =>
                prev.map(v => v.id === currentEditingVariable.id ? updatedVar : v)
            );

            setFunctionDialogOpen(false);
            setCurrentEditingVariable(null);
        }
    };

    const applyNameLabel = () => {
        if (currentEditingVariable) {
            // Create updated variable with new name and label
            // Get the appropriate function display text based on the function type
            let displayFormula;
            const func = currentEditingVariable.calculationFunction || currentEditingVariable.function;

            if (["PGT", "PLT", "FGT", "FLT"].includes(func) && currentEditingVariable.percentageValue) {
                displayFormula = getFunctionDisplay(
                    func,
                    currentEditingVariable.baseVarName,
                    currentEditingVariable.percentageValue
                );
            } else if (["PIN", "POUT", "FIN", "FOUT"].includes(func) &&
                currentEditingVariable.percentageLow &&
                currentEditingVariable.percentageHigh) {
                displayFormula = getFunctionDisplay(
                    func,
                    currentEditingVariable.baseVarName,
                    undefined,
                    currentEditingVariable.percentageLow,
                    currentEditingVariable.percentageHigh
                );
            } else {
                displayFormula = getFunctionDisplay(func, currentEditingVariable.baseVarName);
            }

            const updatedVar: AggregatedVariable = {
                ...currentEditingVariable,
                name: newVariableName,
                label: newVariableLabel !== "" ? newVariableLabel : undefined,
                displayName: `${newVariableName}${newVariableLabel ? ` '${newVariableLabel}'` : ''} = ${displayFormula}`
            };

            // Update the aggregated variables list
            setAggregatedVariables(prev =>
                prev.map(v => v.id === currentEditingVariable.id ? updatedVar : v)
            );

            setNameDialogOpen(false);
            setCurrentEditingVariable(null);
        }
    };

    const handleConfirm = async () => {
        // Ambil snapshot state dari dataStore, variableStore, dan modalStore
        const dataStoreState = useDataStore.getState();
        const variableStoreState = useVariableStore.getState();
        const modalStoreState = useModalStore.getState();

        modalStoreState.setStatisticProgress(true);
        const data: (string | number)[][] = dataStoreState.data; // misalnya: Array<(string | number)[]>

        // 1. Kelompokkan data berdasarkan nilai pada break variables
        const groups: Record<string, { rowIndex: number; row: (string | number)[] }[]> = {};
        data.forEach((row, rowIndex) => {
            const key = breakVariables
                .map((bv: { columnIndex: number }) => row[bv.columnIndex])
                .join("|");
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push({ rowIndex, row });
        });

        // 2. Dapatkan jumlah variabel yang sudah ada agar aggregated variable baru ditempatkan pada kolom selanjutnya
        let totalVarCount = variableStoreState.variables.length;

        // 3. Siapkan kumpulan update untuk updateBulkCells
        const bulkUpdates: { row: number; col: number; value: string | number }[] = [];

        // 4. Proses setiap aggregated variable yang telah didefinisikan
        for (const aggVar of aggregatedVariables) {
            // Buat array aggregatedData dengan panjang sama dengan jumlah baris data
            const aggregatedData: (string | number | null)[] = new Array(data.length).fill(null);

            // Get the calculation function to use
            const calcFunction = aggVar.calculationFunction || aggVar.function;

            for (const groupKey in groups) {
                const groupRows = groups[groupKey];
                // Ambil nilai-nilai dari kolom sumber yang ditentukan oleh properti baseVarColumnIndex
                const values = groupRows.map(
                    (item: { rowIndex: number; row: (string | number)[] }) =>
                        item.row[aggVar.baseVarColumnIndex]
                );

                // Calculate the aggregated value using our utility function
                const aggregatedValue = calculateAggregateValue(
                    calcFunction,
                    values,
                    {
                        percentageValue: aggVar.percentageValue,
                        percentageLow: aggVar.percentageLow,
                        percentageHigh: aggVar.percentageHigh
                    }
                );

                // Assign aggregatedValue ke tiap baris dalam kelompok tersebut
                groupRows.forEach((item: { rowIndex: number; row: (string | number)[] }) => {
                    aggregatedData[item.rowIndex] = aggregatedValue;
                    // Karena updateBulkCells tidak menerima null, gunakan operator nullish coalescing untuk menggantinya dengan string kosong
                    bulkUpdates.push({
                        row: item.rowIndex,
                        col: totalVarCount,
                        value: aggregatedValue ?? ""
                    });
                });
            }

            // 5. Tentukan properti variabel berdasarkan aggregatedData
            const nonEmptyData = aggregatedData.filter((d) => d !== "");
            const allNumeric = nonEmptyData.every(
                (d) => typeof d === "number" || (!isNaN(Number(d)) && d !== "")
            );
            let computedType = allNumeric ? "NUMERIC" : "STRING";
            // Casting supaya sesuai dengan union type yang diharapkan
            const type = computedType as "NUMERIC" | "STRING";
            let width = 8;
            let decimals = 2;
            if (!allNumeric) {
                const maxWidth = nonEmptyData.reduce((max: number, d: string | number | null): number => {
                    const str = String(d);
                    return Math.max(max, str.length);
                }, 0);
                width = maxWidth || width;
            }

            const newVariable = {
                columnIndex: totalVarCount,
                name: aggVar.name,
                type,
                width,
                decimals,
                label: aggVar.label || "",
            };
            await variableStoreState.addVariable(newVariable);

            // 7. Pindah ke variabel berikutnya
            totalVarCount++;
        }

        // 8. Lakukan update bulk pada data store dengan kumpulan update yang telah disusun
        await dataStoreState.updateBulkCells(bulkUpdates);
        modalStoreState.setStatisticProgress(false);
        console.log("Aggregation complete. Bulk updates applied:", bulkUpdates);
        closeModal();
    };

    return (
        <>
            <DialogContent className="max-w-[650px] p-3">
                <DialogHeader className="p-0 mb-2">
                    <DialogTitle>Aggregate Data</DialogTitle>
                </DialogHeader>
                <Separator className="my-0" />

                <div className="grid grid-cols-9 gap-2 py-2">
                    {/* Left Column - Available Variables */}
                    <div className="col-span-3 flex flex-col">
                        <Label className="text-xs font-semibold mb-1">Available Variables</Label>
                        <div className="border p-2 rounded-md h-[250px] overflow-y-auto overflow-x-hidden">
                            <div className="space-y-1">
                                {availableVariables.map((variable) => (
                                    <TooltipProvider key={variable.columnIndex}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={`flex items-center p-1 cursor-pointer border rounded-md hover:bg-gray-100 ${
                                                        highlightedVariable?.id === variable.columnIndex.toString() && highlightedVariable.source === 'available'
                                                            ? "bg-gray-200 border-gray-500"
                                                            : "border-gray-300"
                                                    }`}
                                                    onClick={() => handleVariableSelect(variable.columnIndex, 'available')}
                                                    onDoubleClick={() => handleVariableDoubleClick(variable.columnIndex, 'available')}
                                                >
                                                    <div className="flex items-center w-full">
                                                        {getVariableIcon(variable)}
                                                        <span className="text-xs truncate">{getDisplayName(variable)}</span>
                                                    </div>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <p className="text-xs">{getDisplayName(variable)}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Middle Column - Arrow Controls */}
                    <div className="col-span-1 flex flex-col items-center justify-center space-y-16">
                        <Button
                            variant="link"
                            onClick={handleTopArrowClick}
                            disabled={!highlightedVariable}
                        >
                            {getTopArrowDirection()}
                        </Button>

                        <Button
                            variant="link"
                            onClick={handleBottomArrowClick}
                            disabled={!highlightedVariable}
                        >
                            {getBottomArrowDirection()}
                        </Button>
                    </div>

                    {/* Right Column - Break Variables and Aggregated Variables */}
                    <div className="col-span-5 space-y-2">
                        {/* Break Variables */}
                        <div>
                            <Label className="text-xs font-semibold mb-1">Break Variable(s):</Label>
                            <div className="border p-2 rounded-md h-20 overflow-y-auto overflow-x-hidden">
                                <div className="space-y-1">
                                    {breakVariables.map((variable) => (
                                        <TooltipProvider key={variable.columnIndex}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={`flex items-center p-1 cursor-pointer border rounded-md hover:bg-gray-100 ${
                                                            highlightedVariable?.id === variable.columnIndex.toString() && highlightedVariable.source === 'break'
                                                                ? "bg-gray-200 border-gray-500"
                                                                : "border-gray-300"
                                                        }`}
                                                        onClick={() => handleVariableSelect(variable.columnIndex, 'break')}
                                                        onDoubleClick={() => handleVariableDoubleClick(variable.columnIndex, 'break')}
                                                    >
                                                        <div className="flex items-center w-full">
                                                            {getVariableIcon(variable)}
                                                            <span className="text-xs truncate">{getDisplayName(variable)}</span>
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="right">
                                                    <p className="text-xs">{getDisplayName(variable)}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Aggregated Variables */}
                        <div>
                            <Label className="text-xs font-semibold mb-1">Aggregated Variables</Label>
                            <div className="text-xs mb-1">Summaries of Variable(s):</div>
                            <div className="border p-2 rounded-md h-[110px] overflow-y-auto overflow-x-hidden">
                                <div className="space-y-1">
                                    {aggregatedVariables.map((variable, index) => (
                                        <TooltipProvider key={variable.id}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={`flex items-center p-1 cursor-pointer border rounded-md hover:bg-gray-100 ${
                                                            highlightedVariable?.id === variable.id && highlightedVariable.source === 'aggregated'
                                                                ? "bg-gray-200 border-gray-500"
                                                                : index === 1 ? "bg-gray-100 border-gray-300" : "border-gray-300"
                                                        }`}
                                                        onClick={() => handleAggregatedVariableSelect(variable.id)}
                                                        onDoubleClick={() => handleAggregatedDoubleClick(variable.id)}
                                                    >
                                                        <span className="text-xs truncate">{variable.displayName}</span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="right">
                                                    <p className="text-xs">{variable.displayName}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-1 mt-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7"
                                    onClick={handleFunctionClick}
                                    disabled={!(highlightedVariable?.source === 'aggregated')}
                                >
                                    Function...
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7"
                                    onClick={handleNameLabelClick}
                                    disabled={!(highlightedVariable?.source === 'aggregated')}
                                >
                                    Name & Label...
                                </Button>
                            </div>

                            <div className="flex items-center mt-1 gap-2">
                                <div className="flex items-center gap-1">
                                    <Checkbox id="number-cases" className="w-3 h-3" />
                                    <Label htmlFor="number-cases" className="text-xs">Number of cases</Label>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Label className="text-xs">Name:</Label>
                                    <Input value={breakName} onChange={(e) => setBreakName(e.target.value)} className="h-6 text-xs w-24" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Options */}
                <div className="border p-2 rounded-md mt-2">
                    <div className="text-xs font-semibold mb-1">Save</div>
                    <div className="space-y-1">
                        <label className="flex items-center space-x-1">
                            <input
                                type="radio"
                                className="w-3 h-3"
                                value="ADD"
                                checked={saveOption === "ADD"}
                                onChange={() => setSaveOption("ADD")}
                            />
                            <span className="text-xs">Add aggregated variables to active dataset</span>
                        </label>

                        <label className="flex items-center space-x-1">
                            <input
                                type="radio"
                                className="w-3 h-3"
                                value="CREATE"
                                checked={saveOption === "CREATE"}
                                onChange={() => setSaveOption("CREATE")}
                            />
                            <span className="text-xs">Create a new dataset containing only the aggregated variables</span>
                        </label>

                        {saveOption === "CREATE" && (
                            <div className="ml-4 flex items-center gap-1">
                                <Label className="text-xs">Dataset name:</Label>
                                <Input
                                    value={datasetName}
                                    onChange={(e) => setDatasetName(e.target.value)}
                                    className="h-6 text-xs w-36"
                                />
                            </div>
                        )}

                        <label className="flex items-center space-x-1">
                            <input
                                type="radio"
                                className="w-3 h-3"
                                value="WRITE"
                                checked={saveOption === "WRITE"}
                                onChange={() => setSaveOption("WRITE")}
                            />
                            <span className="text-xs">Write a new data file containing only the aggregated variables</span>
                        </label>

                        {saveOption === "WRITE" && (
                            <div className="ml-4 flex items-center gap-1">
                                <Button variant="outline" size="sm" className="h-6 text-xs">
                                    File...
                                </Button>
                                <span className="text-xs truncate">{filePath}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Options for Very Large Datasets */}
                <div className="border p-2 rounded-md mt-2">
                    <div className="text-xs font-semibold mb-1">Options for Very Large Datasets</div>
                    <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                            <Checkbox
                                id="already-sorted"
                                className="w-3 h-3"
                                checked={isAlreadySorted}
                                onCheckedChange={(checked) => setIsAlreadySorted(Boolean(checked))}
                            />
                            <Label htmlFor="already-sorted" className="text-xs">File is already sorted on break variable(s)</Label>
                        </div>

                        <div className="flex items-center space-x-1">
                            <Checkbox
                                id="sort-before"
                                className="w-3 h-3"
                                checked={sortBeforeAggregating}
                                onCheckedChange={(checked) => setSortBeforeAggregating(Boolean(checked))}
                            />
                            <Label htmlFor="sort-before" className="text-xs">Sort file before aggregating</Label>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-center space-x-2 mt-2 p-0">
                    <Button size="sm" className="text-xs h-7" onClick={handleConfirm}>
                        OK
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7">
                        Paste
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7">
                        Reset
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-7">
                        Help
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Function Dialog */}
            <Dialog open={functionDialogOpen} onOpenChange={setFunctionDialogOpen}>
                <DialogContent className="max-w-[450px] p-3">
                    <DialogHeader className="p-0 mb-1">
                        <DialogTitle>Aggregate Data: Aggregate Function</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Summary Statistics */}
                        <fieldset className="border rounded-md p-2">
                            <legend className="text-xs font-semibold px-1">Summary Statistics</legend>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center space-x-1">
                                    <input
                                        type="radio"
                                        id="mean"
                                        name="functionType"
                                        value="MEAN"
                                        className="w-3 h-3"
                                        checked={functionCategory === "summary" && selectedFunction === "MEAN"}
                                        onChange={() => {
                                            setFunctionCategory("summary");
                                            setSelectedFunction("MEAN");
                                        }}
                                        disabled={isStringType(currentEditingVariable)}
                                    />
                                    <Label
                                        htmlFor="mean"
                                        className={`text-xs ${isStringType(currentEditingVariable) ? 'text-gray-400' : ''}`}
                                    >
                                        Mean
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <input
                                        type="radio"
                                        id="median"
                                        name="functionType"
                                        value="MEDIAN"
                                        className="w-3 h-3"
                                        checked={functionCategory === "summary" && selectedFunction === "MEDIAN"}
                                        onChange={() => {
                                            setFunctionCategory("summary");
                                            setSelectedFunction("MEDIAN");
                                        }}
                                        disabled={isStringType(currentEditingVariable)}
                                    />
                                    <Label
                                        htmlFor="median"
                                        className={`text-xs ${isStringType(currentEditingVariable) ? 'text-gray-400' : ''}`}
                                    >
                                        Median
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <input
                                        type="radio"
                                        id="sum"
                                        name="functionType"
                                        value="SUM"
                                        className="w-3 h-3"
                                        checked={functionCategory === "summary" && selectedFunction === "SUM"}
                                        onChange={() => {
                                            setFunctionCategory("summary");
                                            setSelectedFunction("SUM");
                                        }}
                                        disabled={isStringType(currentEditingVariable)}
                                    />
                                    <Label
                                        htmlFor="sum"
                                        className={`text-xs ${isStringType(currentEditingVariable) ? 'text-gray-400' : ''}`}
                                    >
                                        Sum
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <input
                                        type="radio"
                                        id="stddev"
                                        name="functionType"
                                        value="STDDEV"
                                        className="w-3 h-3"
                                        checked={functionCategory === "summary" && selectedFunction === "STDDEV"}
                                        onChange={() => {
                                            setFunctionCategory("summary");
                                            setSelectedFunction("STDDEV");
                                        }}
                                        disabled={isStringType(currentEditingVariable)}
                                    />
                                    <Label
                                        htmlFor="stddev"
                                        className={`text-xs ${isStringType(currentEditingVariable) ? 'text-gray-400' : ''}`}
                                    >
                                        Standard Deviation
                                    </Label>
                                </div>
                            </div>
                        </fieldset>

                        {/* Specific Values */}
                        <fieldset className="border rounded-md p-2">
                            <legend className="text-xs font-semibold px-1">Specific Values</legend>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center space-x-1">
                                    <input
                                        type="radio"
                                        id="first"
                                        name="functionType"
                                        value="FIRST"
                                        className="w-3 h-3"
                                        checked={functionCategory === "specific" && selectedFunction === "FIRST"}
                                        onChange={() => {
                                            setFunctionCategory("specific");
                                            setSelectedFunction("FIRST");
                                        }}
                                    />
                                    <Label htmlFor="first" className="text-xs">First</Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <input
                                        type="radio"
                                        id="last"
                                        name="functionType"
                                        value="LAST"
                                        className="w-3 h-3"
                                        checked={functionCategory === "specific" && selectedFunction === "LAST"}
                                        onChange={() => {
                                            setFunctionCategory("specific");
                                            setSelectedFunction("LAST");
                                        }}
                                    />
                                    <Label htmlFor="last" className="text-xs">Last</Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <input
                                        type="radio"
                                        id="min"
                                        name="functionType"
                                        value="MIN"
                                        className="w-3 h-3"
                                        checked={functionCategory === "specific" && selectedFunction === "MIN"}
                                        onChange={() => {
                                            setFunctionCategory("specific");
                                            setSelectedFunction("MIN");
                                        }}
                                        disabled={isStringType(currentEditingVariable)}
                                    />
                                    <Label
                                        htmlFor="min"
                                        className={`text-xs ${isStringType(currentEditingVariable) ? 'text-gray-400' : ''}`}
                                    >
                                        Minimum
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <input
                                        type="radio"
                                        id="max"
                                        name="functionType"
                                        value="MAX"
                                        className="w-3 h-3"
                                        checked={functionCategory === "specific" && selectedFunction === "MAX"}
                                        onChange={() => {
                                            setFunctionCategory("specific");
                                            setSelectedFunction("MAX");
                                        }}
                                        disabled={isStringType(currentEditingVariable)}
                                    />
                                    <Label
                                        htmlFor="max"
                                        className={`text-xs ${isStringType(currentEditingVariable) ? 'text-gray-400' : ''}`}
                                    >
                                        Maximum
                                    </Label>
                                </div>
                            </div>
                        </fieldset>

                        {/* Number of cases */}
                        <fieldset className="border rounded-md p-2">
                            <legend className="text-xs font-semibold px-1">Number of cases</legend>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center space-x-1">
                                    <input
                                        type="radio"
                                        id="weighted"
                                        name="functionType"
                                        value="WEIGHTED"
                                        className="w-3 h-3"
                                        checked={functionCategory === "cases" && selectedFunction === "WEIGHTED"}
                                        onChange={() => {
                                            setFunctionCategory("cases");
                                            setSelectedFunction("WEIGHTED");
                                        }}
                                    />
                                    <Label htmlFor="weighted" className="text-xs">Weighted</Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <input
                                        type="radio"
                                        id="weighted-missing"
                                        name="functionType"
                                        value="WEIGHTED_MISSING"
                                        className="w-3 h-3"
                                        checked={functionCategory === "cases" && selectedFunction === "WEIGHTED_MISSING"}
                                        onChange={() => {
                                            setFunctionCategory("cases");
                                            setSelectedFunction("WEIGHTED_MISSING");
                                        }}
                                    />
                                    <Label htmlFor="weighted-missing" className="text-xs">Weighted missing</Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <input
                                        type="radio"
                                        id="unweighted"
                                        name="functionType"
                                        value="UNWEIGHTED"
                                        className="w-3 h-3"
                                        checked={functionCategory === "cases" && selectedFunction === "UNWEIGHTED"}
                                        onChange={() => {
                                            setFunctionCategory("cases");
                                            setSelectedFunction("UNWEIGHTED");
                                        }}
                                    />
                                    <Label htmlFor="unweighted" className="text-xs">Unweighted</Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <input
                                        type="radio"
                                        id="unweighted-missing"
                                        name="functionType"
                                        value="UNWEIGHTED_MISSING"
                                        className="w-3 h-3"
                                        checked={functionCategory === "cases" && selectedFunction === "UNWEIGHTED_MISSING"}
                                        onChange={() => {
                                            setFunctionCategory("cases");
                                            setSelectedFunction("UNWEIGHTED_MISSING");
                                        }}
                                    />
                                    <Label htmlFor="unweighted-missing" className="text-xs">Unweighted missing</Label>
                                </div>
                            </div>
                        </fieldset>

                        {/* Percentages, Fractions, Counts */}
                        <fieldset className="border rounded-md p-2">
                            <legend className="text-xs font-semibold px-1">Percentages, Fractions, Counts</legend>
                            <div className="flex gap-4 mb-2">
                                <div className="flex items-center space-x-1">
                                    <input
                                        type="radio"
                                        id="percentages"
                                        name="functionType"
                                        value="PERCENTAGE"
                                        className="w-3 h-3"
                                        checked={functionCategory === "percentages" && selectedFunction === "PERCENTAGE"}
                                        onChange={() => {
                                            setFunctionCategory("percentages");
                                            setSelectedFunction("PERCENTAGE");
                                        }}
                                        disabled={isStringType(currentEditingVariable)}
                                    />
                                    <Label
                                        htmlFor="percentages"
                                        className={`text-xs ${isStringType(currentEditingVariable) ? 'text-gray-400' : ''}`}
                                    >
                                        Percentages
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <input
                                        type="radio"
                                        id="fractions"
                                        name="functionType"
                                        value="FRACTION"
                                        className="w-3 h-3"
                                        checked={functionCategory === "percentages" && selectedFunction === "FRACTION"}
                                        onChange={() => {
                                            setFunctionCategory("percentages");
                                            setSelectedFunction("FRACTION");
                                        }}
                                        disabled={isStringType(currentEditingVariable)}
                                    />
                                    <Label
                                        htmlFor="fractions"
                                        className={`text-xs ${isStringType(currentEditingVariable) ? 'text-gray-400' : ''}`}
                                    >
                                        Fractions
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <input
                                        type="radio"
                                        id="counts"
                                        name="functionType"
                                        value="COUNT"
                                        className="w-3 h-3"
                                        checked={functionCategory === "percentages" && selectedFunction === "COUNT"}
                                        onChange={() => {
                                            setFunctionCategory("percentages");
                                            setSelectedFunction("COUNT");
                                        }}
                                    />
                                    <Label htmlFor="counts" className="text-xs">Counts</Label>
                                </div>
                            </div>

                            {functionCategory === "percentages" && (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center space-x-1">
                                            <input
                                                type="radio"
                                                id="above"
                                                name="percentageType"
                                                value="above"
                                                className="w-3 h-3"
                                                checked={percentageType === "above"}
                                                onChange={() => setPercentageType("above")}
                                                disabled={functionCategory !== "percentages"}
                                            />
                                            <Label htmlFor="above" className="text-xs">Above</Label>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <input
                                                type="radio"
                                                id="below"
                                                name="percentageType"
                                                value="below"
                                                className="w-3 h-3"
                                                checked={percentageType === "below"}
                                                onChange={() => setPercentageType("below")}
                                                disabled={functionCategory !== "percentages"}
                                            />
                                            <Label htmlFor="below" className="text-xs">Below</Label>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <input
                                                type="radio"
                                                id="inside"
                                                name="percentageType"
                                                value="inside"
                                                className="w-3 h-3"
                                                checked={percentageType === "inside"}
                                                onChange={() => setPercentageType("inside")}
                                                disabled={functionCategory !== "percentages"}
                                            />
                                            <Label htmlFor="inside" className="text-xs">Inside</Label>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <input
                                                type="radio"
                                                id="outside"
                                                name="percentageType"
                                                value="outside"
                                                className="w-3 h-3"
                                                checked={percentageType === "outside"}
                                                onChange={() => setPercentageType("outside")}
                                                disabled={functionCategory !== "percentages"}
                                            />
                                            <Label htmlFor="outside" className="text-xs">Outside</Label>
                                        </div>
                                    </div>

                                    {(percentageType === "above" || percentageType === "below") && (
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="value" className="text-xs whitespace-nowrap">Value:</Label>
                                            <Input
                                                id="value"
                                                value={percentageValue}
                                                onChange={(e) => setPercentageValue(e.target.value)}
                                                className="h-6 text-xs"
                                                disabled={functionCategory !== "percentages"}
                                            />
                                        </div>
                                    )}

                                    {(percentageType === "inside" || percentageType === "outside") && (
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="low" className="text-xs whitespace-nowrap">Low:</Label>
                                            <Input
                                                id="low"
                                                value={percentageLow}
                                                onChange={(e) => setPercentageLow(e.target.value)}
                                                className="h-6 text-xs"
                                                disabled={functionCategory !== "percentages"}
                                            />

                                            <Label htmlFor="high" className="text-xs whitespace-nowrap ml-2">High:</Label>
                                            <Input
                                                id="high"
                                                value={percentageHigh}
                                                onChange={(e) => setPercentageHigh(e.target.value)}
                                                className="h-6 text-xs"
                                                disabled={functionCategory !== "percentages"}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </fieldset>
                    </div>

                    <DialogFooter className="flex justify-center space-x-2 mt-2 p-0">
                        <Button
                            size="sm"
                            className="text-xs h-7"
                            onClick={applyFunction}
                        >
                            Continue
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => setFunctionDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                        >
                            Help
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Name & Label Dialog */}
            <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
                <DialogContent className="max-w-[400px] p-3">
                    <DialogHeader className="p-0 mb-2">
                        <DialogTitle>Aggregate Data: Variable Name</DialogTitle>
                    </DialogHeader>

                    <div className="text-center mb-4">
                        {currentEditingVariable && (() => {
                            const func = currentEditingVariable.calculationFunction || currentEditingVariable.function;
                            let displayFormula;

                            if (["PGT", "PLT", "FGT", "FLT"].includes(func) && currentEditingVariable.percentageValue) {
                                displayFormula = `${func}(${currentEditingVariable.baseVarName}, ${currentEditingVariable.percentageValue})`;
                            } else if (["PIN", "POUT", "FIN", "FOUT"].includes(func) &&
                                currentEditingVariable.percentageLow &&
                                currentEditingVariable.percentageHigh) {
                                displayFormula = `${func}(${currentEditingVariable.baseVarName}, ${currentEditingVariable.percentageLow}, ${currentEditingVariable.percentageHigh})`;
                            } else {
                                displayFormula = `${func}(${currentEditingVariable.baseVarName})`;
                            }

                            return displayFormula;
                        })()}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="name" className="text-xs whitespace-nowrap">Name:</Label>
                            <Input
                                id="name"
                                value={newVariableName}
                                onChange={(e) => setNewVariableName(e.target.value)}
                                className="h-7 text-xs"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Label htmlFor="label" className="text-xs whitespace-nowrap">Label:</Label>
                            <Input
                                id="label"
                                value={newVariableLabel}
                                onChange={(e) => setNewVariableLabel(e.target.value)}
                                className="h-7 text-xs"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex justify-center space-x-2 mt-4 p-0">
                        <Button
                            size="sm"
                            className="text-xs h-7"
                            onClick={applyNameLabel}
                        >
                            Continue
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => setNameDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                        >
                            Help
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Error Dialog */}
            <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
                <DialogContent className="max-w-[450px] p-3">
                    <DialogHeader className="p-0 mb-2">
                        <DialogTitle>IBM SPSS Statistics 25</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-4">
                        <AlertCircle className="h-10 w-10 text-blue-500" />
                        <div>
                            <p className="text-sm mt-2">{errorMessage}</p>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-center mt-4">
                        <Button
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => setErrorDialogOpen(false)}
                        >
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AggregateData;