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
import { useModalStore, ModalType } from "@/stores/useModalStore";
import { Variable } from "@/types/Variable";

interface DefineVariablePropertiesProps {
    onClose: () => void;
}

const DefineVariableProperties: FC<DefineVariablePropertiesProps> = ({ onClose }) => {
    const { closeModal, openModal } = useModalStore();

    // Get variables from store
    const { variables, loadVariables } = useVariableStore();
    const [storeVariables, setStoreVariables] = useState<Variable[]>([]);

    useEffect(() => {
        const loadVariablesData = async () => {
            await loadVariables();
            setStoreVariables(variables.filter(v => v.name !== ""));
        };
        loadVariablesData();
    }, [loadVariables, variables]);

    // Variables in the left list (available)
    const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);

    // Variables in the right list (to scan)
    const [variablesToScan, setVariablesToScan] = useState<Variable[]>([]);

    // Update available variables when store variables are loaded
    useEffect(() => {
        setAvailableVariables(storeVariables);
    }, [storeVariables]);

    // Currently selected variable for highlighting
    const [highlightedVariable, setHighlightedVariable] = useState<{id: string, source: 'available' | 'toScan'} | null>(null);

    // Error dialog state
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);

    // Settings for the limits
    const [limitCases, setLimitCases] = useState<boolean>(true);
    const [limitValues, setLimitValues] = useState<boolean>(true);
    const [caseLimit, setCaseLimit] = useState<string>("50");
    const [valueLimit, setValueLimit] = useState<string>("200");

    // Handle variable selection
    const handleVariableSelect = (columnIndex: number, source: 'available' | 'toScan') => {
        if (highlightedVariable?.id === columnIndex.toString() && highlightedVariable.source === source) {
            setHighlightedVariable(null);
        } else {
            setHighlightedVariable({ id: columnIndex.toString(), source });
        }
    };

    // Handle variable double-click
    const handleVariableDoubleClick = (columnIndex: number, source: 'available' | 'toScan') => {
        if (source === 'available') {
            moveToScan(columnIndex);
        } else {
            moveToAvailable(columnIndex);
        }
    };

    // Move a variable from available to scan
    const moveToScan = (columnIndex: number) => {
        const variable = availableVariables.find(v => v.columnIndex === columnIndex);
        if (variable) {
            setVariablesToScan(prev => [...prev, variable]);
            setAvailableVariables(prev => prev.filter(v => v.columnIndex !== columnIndex));
            setHighlightedVariable(null);
        }
    };

    // Move a variable from scan to available
    const moveToAvailable = (columnIndex: number) => {
        const variable = variablesToScan.find(v => v.columnIndex === columnIndex);
        if (variable) {
            setAvailableVariables(prev => [...prev, variable]);
            setVariablesToScan(prev => prev.filter(v => v.columnIndex !== columnIndex));
            setHighlightedVariable(null);
        }
    };

    // Handle arrow click (right)
    const handleMoveToScan = () => {
        if (highlightedVariable && highlightedVariable.source === 'available') {
            const columnIndex = parseInt(highlightedVariable.id);
            moveToScan(columnIndex);
        }
    };

    // Handle arrow click (left)
    const handleMoveFromScan = () => {
        if (highlightedVariable && highlightedVariable.source === 'toScan') {
            const columnIndex = parseInt(highlightedVariable.id);
            moveToAvailable(columnIndex);
        }
    };

    // Get variable icon based on measure
    const getVariableIcon = (variable: Variable) => {
        switch (variable.measure) {
            case "scale":
                return <Ruler size={14} className="text-gray-600 mr-1 flex-shrink-0" />;
            case "nominal":
                return <Shapes size={14} className="text-gray-600 mr-1 flex-shrink-0" />;
            case "ordinal":
                return <BarChartHorizontal size={14} className="text-gray-600 mr-1 flex-shrink-0" />;
            default:
                return variable.type === "STRING"
                    ? <Shapes size={14} className="text-gray-600 mr-1 flex-shrink-0" />
                    : <Ruler size={14} className="text-gray-600 mr-1 flex-shrink-0" />;
        }
    };

    // Get display name for variable
    const getDisplayName = (variable: Variable): string => {
        if (variable.label) {
            return `${variable.label} [${variable.name}]`;
        }
        return variable.name;
    };

    // Button handlers
    const handleContinue = () => {
        if (variablesToScan.length === 0) {
            setErrorMessage("No variables have been selected for scanning.");
            setErrorDialogOpen(true);
            return;
        }

        // Close current modal
        closeModal();

        // Open the Variable Properties Editor with selected variables and limits
        openModal(ModalType.VarPropsEditor, {
            variables: variablesToScan,
            caseLimit: caseLimit,
            valueLimit: valueLimit
        });
    };

    const handleCancel = () => {
        onClose();
    };

    const handleHelp = () => {
        console.log("Help requested");
    };

    return (
        <>
            <DialogContent className="max-w-[650px] p-3">
                <DialogHeader className="p-0 mb-2">
                    <DialogTitle>Define Variable Properties</DialogTitle>
                </DialogHeader>
                <Separator className="my-0" />

                {/* Information text */}
                <div className="flex items-start space-x-3 mb-3">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs">
                            Use this facility to label variable values and set other properties
                            after scanning the data.
                        </p>
                        <p className="text-xs">
                            Select the variables to scan. They should be categorical
                            (nominal or ordinal) for best results. You can change the
                            measurement level setting in the next panel.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-9 gap-2 py-1">
                    {/* Left Column - Available Variables */}
                    <div className="col-span-4 flex flex-col">
                        <Label className="text-xs font-semibold mb-1">Variables:</Label>
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
                    <div className="col-span-1 flex flex-col items-center justify-center space-y-5">
                        <Button
                            variant="link"
                            onClick={handleMoveToScan}
                            disabled={!highlightedVariable || highlightedVariable.source !== 'available'}
                        >
                            <CornerDownRight size={20} />
                        </Button>

                        <Button
                            variant="link"
                            onClick={handleMoveFromScan}
                            disabled={!highlightedVariable || highlightedVariable.source !== 'toScan'}
                        >
                            <CornerDownLeft size={20} />
                        </Button>
                    </div>

                    {/* Right Column - Variables to Scan */}
                    <div className="col-span-4 flex flex-col">
                        <Label className="text-xs font-semibold mb-1">Variables to Scan:</Label>
                        <div className="border p-2 rounded-md h-[250px] overflow-y-auto overflow-x-hidden">
                            <div className="space-y-1">
                                {variablesToScan.map((variable) => (
                                    <TooltipProvider key={variable.columnIndex}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={`flex items-center p-1 cursor-pointer border rounded-md hover:bg-gray-100 ${
                                                        highlightedVariable?.id === variable.columnIndex.toString() && highlightedVariable.source === 'toScan'
                                                            ? "bg-gray-200 border-gray-500"
                                                            : "border-gray-300"
                                                    }`}
                                                    onClick={() => handleVariableSelect(variable.columnIndex, 'toScan')}
                                                    onDoubleClick={() => handleVariableDoubleClick(variable.columnIndex, 'toScan')}
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
                </div>

                {/* Limit options */}
                <div className="border p-2 rounded-md mt-2">
                    <div className="text-xs font-semibold mb-1">Limits</div>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="limit-cases"
                                className="w-3 h-3"
                                checked={limitCases}
                                onCheckedChange={(checked) => setLimitCases(!!checked)}
                            />
                            <Label htmlFor="limit-cases" className="text-xs">Limit number of cases scanned to:</Label>
                            <Input
                                value={caseLimit}
                                onChange={(e) => setCaseLimit(e.target.value)}
                                className="w-20 h-6 text-xs"
                                disabled={!limitCases}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="limit-values"
                                className="w-3 h-3"
                                checked={limitValues}
                                onCheckedChange={(checked) => setLimitValues(!!checked)}
                            />
                            <Label htmlFor="limit-values" className="text-xs">Limit number of values displayed to:</Label>
                            <Input
                                value={valueLimit}
                                onChange={(e) => setValueLimit(e.target.value)}
                                className="w-20 h-6 text-xs"
                                disabled={!limitValues}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-center space-x-2 mt-2 p-0">
                    <Button
                        size="sm"
                        className="text-xs h-7"
                        onClick={handleContinue}
                    >
                        Continue
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={handleHelp}
                    >
                        Help
                    </Button>
                </DialogFooter>
            </DialogContent>

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

export default DefineVariableProperties;