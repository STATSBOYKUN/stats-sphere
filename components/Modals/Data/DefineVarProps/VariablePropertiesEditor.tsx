import React, { FC, useState, useEffect, useRef, useCallback } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Dialog,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    Shapes,
    Ruler,
    BarChartHorizontal,
    ChevronDown,
    AlertCircle,
    Info
} from "lucide-react";
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.css';
import { useDataStore } from "@/stores/useDataStore";
import { useVariableStore } from "@/stores/useVariableStore";

// Register all Handsontable modules
registerAllModules();

// Interfaces matching db.ts structure
interface ValueLabel {
    id?: number;
    variableName: string;
    value: number | string;
    label: string;
}

interface Variable {
    id?: number;
    columnIndex: number;
    name: string;
    type:
        | "NUMERIC"
        | "COMMA"
        | "SCIENTIFIC"
        | "DATE"
        | "ADATE"
        | "EDATE"
        | "SDATE"
        | "JDATE"
        | "QYR"
        | "MOYR"
        | "WKYR"
        | "DATETIME"
        | "TIME"
        | "DTIME"
        | "WKDAY"
        | "MONTH"
        | "DOLLAR"
        | "CCA"
        | "CCB"
        | "CCC"
        | "CCD"
        | "CCE"
        | "STRING"
        | "RESTRICTED_NUMERIC";
    width: number;
    decimals: number;
    label?: string;
    values: ValueLabel[];
    missing: (number | string)[];
    columns: number;
    align: "right" | "left" | "center";
    measure: "scale" | "ordinal" | "nominal";
    role: "input" | "target" | "both" | "none" | "partition" | "split";
}

// Dropdown options
const ROLE_OPTIONS = ["input", "target", "both", "none", "partition", "split"];
const MEASURE_OPTIONS = ["scale", "ordinal", "nominal"];
const TYPE_OPTIONS = [
    "NUMERIC", "COMMA", "DOT", "SCIENTIFIC", "DATE", "DOLLAR",
    "CCA", "CCB", "CCC", "CCD", "CCE", "PERCENT", "STRING", "RESTRICTED_NUMERIC"
];

// Date format specifications
const DATE_FORMAT_SPECS = [
    { format: "dd-mmm-yyyy", type: "DATE", width: 11 },
    { format: "dd-mmm-yy", type: "DATE", width: 9 },
    { format: "mm/dd/yyyy", type: "ADATE", width: 10 },
    { format: "mm/dd/yy", type: "ADATE", width: 8 },
    { format: "dd.mm.yyyy", type: "EDATE", width: 10 },
    { format: "dd.mm.yy", type: "EDATE", width: 8 },
    { format: "yyyy/mm/dd", type: "SDATE", width: 10 },
    { format: "yy/mm/dd", type: "SDATE", width: 8 },
    { format: "yydddd", type: "JDATE", width: 5 },
    { format: "yyyyddd", type: "JDATE", width: 7 },
    { format: "q Q yyyy", type: "QYR", width: 8 },
    { format: "q Q yy", type: "QYR", width: 6 },
    { format: "mmm yyyy", type: "MOYR", width: 8 },
    { format: "mmm yy", type: "MOYR", width: 6 },
    { format: "ww WK yyyy", type: "WKYR", width: 10 },
    { format: "ww WK yy", type: "WKYR", width: 8 },
    { format: "dd-mmm-yyyy hh:mm", type: "DATETIME", width: 17 },
    { format: "dd-mmm-yyyy hh:mm:ss", type: "DATETIME", width: 20 },
    { format: "dd-mmm-yyyy hh:mm:ss.ss", type: "DATETIME", width: 23 },
    { format: "mm/dd/yyyy hh:mm", type: "DATETIME", width: 16 },
    { format: "mm/dd/yyyy hh:mm:ss", type: "DATETIME", width: 19 },
    { format: "yyyy-mm-dd hh:mm:ss.ss", type: "DATETIME", width: 22 },
    { format: "mm:ss", type: "TIME", width: 5 },
    { format: "mm:ss.ss", type: "TIME", width: 8 },
    { format: "hh:mm", type: "TIME", width: 5 },
    { format: "hh:mm:ss", type: "TIME", width: 8 },
    { format: "hh:mm:ss.ss", type: "TIME", width: 11 },
    { format: "ddd hh:mm", type: "DTIME", width: 9 },
    { format: "ddd hh:mm:ss", type: "DTIME", width: 12 },
    { format: "ddd hh:mm:ss.ss", type: "DTIME", width: 15 },
    { format: "Monday, Tuesday, ...", type: "WKDAY", width: 9 },
    { format: "Mon, Tue, Wed, ...", type: "WKDAY", width: 3 },
    { format: "January, February, ...", type: "MONTH", width: 9 },
    { format: "Jan, Feb, Mar, ...", type: "MONTH", width: 3 }
];

interface VariablePropertiesEditorProps {
    onClose: () => void;
    variables: Variable[];
    caseLimit: string;
    valueLimit: string;
    onSave?: (variables: Variable[]) => void;
}

const VariablePropertiesEditor: FC<VariablePropertiesEditorProps> = ({
                                                                         onClose,
                                                                         variables,
                                                                         caseLimit,
                                                                         valueLimit,
                                                                         onSave
                                                                     }) => {
    // Get data from data store
    const { data, isLoading: dataIsLoading } = useDataStore();

    // Get variable store functions
    const { addVariable } = useVariableStore();

    // Track the original variables for reference during save
    const [originalVariables] = useState<Variable[]>(variables);

    // Selected variable in left pane
    const [selectedVariableIndex, setSelectedVariableIndex] = useState<number | null>(
        variables.length > 0 ? 0 : null
    );

    // Current variable being edited
    const [currentVariable, setCurrentVariable] = useState<Variable | null>(
        variables.length > 0 ? {
            ...variables[0],
            values: Array.isArray(variables[0].values) ? variables[0].values : [],
            missing: Array.isArray(variables[0].missing) ? variables[0].missing : []
        } : null
    );

    // Modified variables to keep track of changes
    const [modifiedVariables, setModifiedVariables] = useState<Variable[]>(
        variables.map(variable => ({
            ...variable,
            values: Array.isArray(variable.values) ? variable.values : [],
            missing: Array.isArray(variable.missing) ? variable.missing : []
        }))
    );

    // Track grid data per variable to persist changes when switching
    const [variableGridData, setVariableGridData] = useState<Record<number, any[]>>({});

    // Selected type dropdown state
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [showMeasureDropdown, setShowMeasureDropdown] = useState(false);
    const [showDateFormatDropdown, setShowDateFormatDropdown] = useState(false);

    // Track which variables have been labeled
    const [labeledVariables, setLabeledVariables] = useState<Record<number, boolean>>({});

    // Handsontable data
    const [gridData, setGridData] = useState<any[]>([]);
    const hotTableRef = useRef(null);

    // Error dialog state
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);

    // Measurement level suggestion dialog state
    const [suggestDialogOpen, setSuggestDialogOpen] = useState<boolean>(false);
    const [suggestedMeasure, setSuggestedMeasure] = useState<string>("");
    const [measurementExplanation, setMeasurementExplanation] = useState<string>("");

    // State for dynamically calculated unlabeled values count
    const [unlabeledValuesCount, setUnlabeledValuesCount] = useState<number>(0);

    // Get unique values and their counts from data for a column
    const getUniqueValuesWithCounts = useCallback((columnIndex: number, variableType: string) => {
        if (!data || data.length === 0) return [];

        // Calculate how many cases to scan
        const casesToScan = parseInt(caseLimit, 10) || data.length;
        const dataToScan = data.slice(0, casesToScan);

        // Get column data and filter based on variable type
        // For STRING type, include empty values; for NUMERIC type, exclude them
        const columnValues = dataToScan
            .map(row => row[columnIndex])
            .filter(value => {
                if (variableType === "STRING") {
                    // Include empty values for string type
                    return value !== undefined;
                } else {
                    // Exclude empty values for numeric types
                    return value !== "" && value !== undefined;
                }
            });

        // Count occurrences of each value
        const valueCounts: Record<string, number> = {};
        columnValues.forEach(value => {
            const strValue = String(value);
            valueCounts[strValue] = (valueCounts[strValue] || 0) + 1;
        });

        // Convert to array of [value, count] pairs
        const uniqueValues = Object.entries(valueCounts).map(([value, count]) => ({
            value,
            count
        }));

        // Limit by valueLimit
        const limit = parseInt(valueLimit, 10) || uniqueValues.length;
        return uniqueValues.slice(0, limit);
    }, [data, caseLimit, valueLimit]);

    // Calculate unlabeled values count
    const calculateUnlabeledValues = useCallback((uniqueValuesData: any[], valueLabels: ValueLabel[]) => {
        const valueLabelsMap = new Map(
            valueLabels.map(vl => [String(vl.value), vl.label])
        );

        return uniqueValuesData.filter(
            item => !valueLabelsMap.has(String(item.value))
        ).length;
    }, []);

    // Update grid data when the current variable changes
    useEffect(() => {
        if (!currentVariable) return;

        // Check if we have saved grid data for this variable
        if (variableGridData[currentVariable.columnIndex]) {
            // Use the saved grid data
            setGridData(variableGridData[currentVariable.columnIndex]);

            // Calculate unlabeled values based on saved grid data
            const savedGridData = variableGridData[currentVariable.columnIndex];
            const valueLabels = savedGridData
                .filter(row => row[4] !== '' && row[5] !== '')
                .map(row => ({
                    variableName: currentVariable.name,
                    value: isNaN(Number(row[4])) ? row[4] : Number(row[4]),
                    label: row[5]
                }));

            const uniqueValues = getUniqueValuesWithCounts(
                currentVariable.columnIndex,
                currentVariable.type
            );

            setUnlabeledValuesCount(calculateUnlabeledValues(uniqueValues, valueLabels));
        } else if (data && data.length > 0) {
            // Get unique values for the current variable's column
            const uniqueValuesData = getUniqueValuesWithCounts(
                currentVariable.columnIndex,
                currentVariable.type
            );

            // Create a map of existing value labels
            const valueLabelsMap = new Map(
                Array.isArray(currentVariable.values)
                    ? currentVariable.values.map(vl => [String(vl.value), vl.label])
                    : []
            );

            // Check which values are marked as missing
            const missingValuesSet = new Set(
                Array.isArray(currentVariable.missing)
                    ? currentVariable.missing.map(mv => String(mv))
                    : []
            );

            // Convert to grid data format
            const newGridData = uniqueValuesData.map((item, index) => {
                const strValue = String(item.value);
                const hasLabel = valueLabelsMap.has(strValue);
                const label = valueLabelsMap.get(strValue) || '';
                const isMissing = missingValuesSet.has(strValue);

                return [
                    String(index + 1), // Row number
                    false,             // Changed (initially false)
                    isMissing,         // Missing
                    item.count,        // Count
                    strValue,          // Value
                    label,             // Label
                ];
            });

            // Add an empty row for new values
            newGridData.push([
                String(uniqueValuesData.length + 1),
                false,
                false,
                0,
                '',
                ''
            ]);

            setGridData(newGridData);

            // Save this grid data for future reference
            setVariableGridData(prev => ({
                ...prev,
                [currentVariable.columnIndex]: newGridData
            }));

            // Calculate unlabeled values count
            const unlabeledCount = calculateUnlabeledValues(
                uniqueValuesData,
                Array.isArray(currentVariable.values) ? currentVariable.values : []
            );

            setUnlabeledValuesCount(unlabeledCount);
        } else {
            // If no data, show empty grid
            const emptyGrid = [['1', false, false, 0, '', '']];
            setGridData(emptyGrid);

            // Save empty grid for this variable
            setVariableGridData(prev => ({
                ...prev,
                [currentVariable.columnIndex]: emptyGrid
            }));

            setUnlabeledValuesCount(0);
        }
    }, [currentVariable, data, getUniqueValuesWithCounts, calculateUnlabeledValues, variableGridData]);

    // Save current variable state before switching
    const saveCurrentVariableState = () => {
        if (!currentVariable || selectedVariableIndex === null) return;

        // Extract values and labels from grid data, excluding the empty row at the end
        const valueLabels: ValueLabel[] = gridData
            .filter(row => row[4] !== '' && row[5] !== '')
            .map(row => ({
                variableName: currentVariable.name,
                value: isNaN(Number(row[4])) ? row[4] : Number(row[4]),
                label: row[5]
            }));

        // Extract missing values
        const missingValues = gridData
            .filter(row => row[2] && row[4] !== '')
            .map(row => isNaN(Number(row[4])) ? row[4] : Number(row[4]));

        // Update the current variable with latest grid data
        const updatedVariable = {
            ...currentVariable,
            values: valueLabels,
            missing: missingValues,
        };

        // Update in modified variables array
        const updatedVariables = [...modifiedVariables];
        updatedVariables[selectedVariableIndex] = updatedVariable;
        setModifiedVariables(updatedVariables);

        // Save current grid data for this variable
        setVariableGridData(prev => ({
            ...prev,
            [currentVariable.columnIndex]: [...gridData]
        }));
    };

    // Update current variable
    const handleVariableChange = (index: number) => {
        // Save state of current variable before switching
        saveCurrentVariableState();

        // Switch to the new variable
        setSelectedVariableIndex(index);
        const variable = modifiedVariables[index];
        setCurrentVariable({
            ...variable,
            values: Array.isArray(variable.values) ? variable.values : [],
            missing: Array.isArray(variable.missing) ? variable.missing : []
        });
    };

    // Update variable field
    const handleVariableFieldChange = (field: keyof Variable, value: any) => {
        if (!currentVariable) return;

        const updatedVariable = { ...currentVariable, [field]: value };

        // Handle special case for date types
        if (field === 'type' && isDateType(value)) {
            const defaultFormat = DATE_FORMAT_SPECS.find(spec => spec.type === value);
            if (defaultFormat) {
                updatedVariable.width = defaultFormat.width;
            }
        }

        // If type is changing, we need to refresh the grid data with the new type's filtering
        if (field === 'type' && value !== currentVariable.type) {
            // Remove saved grid data for this variable to force refresh
            setVariableGridData(prev => {
                const newData = { ...prev };
                delete newData[currentVariable.columnIndex];
                return newData;
            });
        }

        setCurrentVariable(updatedVariable);

        // Update the modified variables array
        const updatedVariables = [...modifiedVariables];
        if (selectedVariableIndex !== null) {
            updatedVariables[selectedVariableIndex] = updatedVariable;
            setModifiedVariables(updatedVariables);
        }
    };

    // Get icon for variable type
    const getVariableIcon = (variable: Variable) => {
        switch (variable.measure) {
            case "scale":
                return <Ruler size={12} className="text-gray-700 mr-1 flex-shrink-0" />;
            case "nominal":
                return <Shapes size={12} className="text-gray-700 mr-1 flex-shrink-0" />;
            case "ordinal":
                return <BarChartHorizontal size={12} className="text-gray-700 mr-1 flex-shrink-0" />;
            default:
                return variable.type === "STRING"
                    ? <Shapes size={12} className="text-gray-700 mr-1 flex-shrink-0" />
                    : <Ruler size={12} className="text-gray-700 mr-1 flex-shrink-0" />;
        }
    };

    // Check if type is a date type
    const isDateType = (type: string): boolean => {
        const dateTypes = ["DATE", "ADATE", "EDATE", "SDATE", "JDATE", "QYR", "MOYR",
            "WKYR", "DATETIME", "TIME", "DTIME", "WKDAY", "MONTH"];
        return dateTypes.includes(type);
    };

    // Check if type is a currency type
    const isCurrencyType = (type: string): boolean => {
        const currencyTypes = ["CCA", "CCB", "CCC", "CCD", "CCE", "DOLLAR"];
        return currencyTypes.includes(type);
    };

    // Get formatted type display name
    const getFormattedTypeName = (type: string): string => {
        switch (type) {
            case "NUMERIC": return "Numeric";
            case "COMMA": return "Comma";
            case "DOT": return "Dot";
            case "SCIENTIFIC": return "Scientific";
            case "DATE": return "Date";
            case "DOLLAR": return "Dollar";
            case "CCA": return "Currency A";
            case "CCB": return "Currency B";
            case "CCC": return "Currency C";
            case "CCD": return "Currency D";
            case "CCE": return "Currency E";
            case "PERCENT": return "Percent";
            case "STRING": return "String";
            case "RESTRICTED_NUMERIC": return "Restricted Numeric";
            default: return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
        }
    };

    // Format display text for dropdown items
    const formatDropdownText = (text: string): string => {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    // Handle data changes from HandsonTable
    const handleDataChange = (changes: any[] | null, source: string) => {
        if (source === 'edit' && changes) {
            // Create a new data array with the changes
            const newData = [...gridData];
            changes.forEach(([row, col, oldValue, newValue]) => {
                newData[row][col] = newValue;
                // Mark as changed if it's not the first row (which is already marked)
                if ((col === 4 || col === 5) && newValue !== oldValue) {
                    newData[row][1] = true; // Set the "Changed" column to true
                }
            });

            // Check if we need to add a new empty row at the end
            const lastRow = newData[newData.length - 1];
            if (lastRow[4] !== '' || lastRow[5] !== '') {
                newData.push([
                    String(newData.length + 1), // New row number
                    false, // Changed
                    false, // Missing
                    0,     // Count
                    '',    // Value
                    ''     // Label
                ]);
            }

            setGridData(newData);

            // Save updated grid data for current variable
            if (currentVariable) {
                setVariableGridData(prev => ({
                    ...prev,
                    [currentVariable.columnIndex]: newData
                }));
            }

            // Recalculate unlabeled values count when data changes
            if (currentVariable) {
                // Extract values with labels from the grid data
                const currentLabels = newData
                    .filter(row => row[4] !== '' && row[5] !== '')
                    .map(row => ({
                        variableName: currentVariable.name,
                        value: isNaN(Number(row[4])) ? row[4] : Number(row[4]),
                        label: row[5]
                    }));

                // Get unique values for the current column
                const uniqueValues = getUniqueValuesWithCounts(
                    currentVariable.columnIndex,
                    currentVariable.type
                );

                // Calculate unlabeled count
                const newUnlabeledCount = calculateUnlabeledValues(uniqueValues, currentLabels);
                setUnlabeledValuesCount(newUnlabeledCount);
            }
        }
    };

    // Auto-label values
    const handleAutoLabel = () => {
        if (!currentVariable) return;

        const newGridData = gridData.map(row => {
            // If there's a value but no label, use the value as the label
            if (row[4] && !row[5]) {
                return [
                    row[0],     // Row number
                    true,       // Mark as changed
                    row[2],     // Missing
                    row[3],     // Count
                    row[4],     // Value
                    row[4],     // Use value as label
                ];
            }
            return [...row];
        });

        setGridData(newGridData);

        // Save updated grid data for current variable
        setVariableGridData(prev => ({
            ...prev,
            [currentVariable.columnIndex]: newGridData
        }));

        // Recalculate unlabeled values after auto-labeling
        if (currentVariable) {
            // Extract values with labels from the grid data
            const currentLabels = newGridData
                .filter(row => row[4] !== '' && row[5] !== '')
                .map(row => ({
                    variableName: currentVariable.name,
                    value: isNaN(Number(row[4])) ? row[4] : Number(row[4]),
                    label: row[5]
                }));

            // Get unique values for the current column
            const uniqueValues = getUniqueValuesWithCounts(
                currentVariable.columnIndex,
                currentVariable.type
            );

            // Calculate unlabeled count
            const newUnlabeledCount = calculateUnlabeledValues(uniqueValues, currentLabels);
            setUnlabeledValuesCount(newUnlabeledCount);
        }
    };

    // Handle copying properties from another variable
    const handleCopyFromVariable = () => {
        setErrorMessage("This feature would allow copying properties from another variable.");
        setErrorDialogOpen(true);
    };

    // Handle copying properties to other variables
    const handleCopyToVariables = () => {
        setErrorMessage("This feature would allow copying properties to other variables.");
        setErrorDialogOpen(true);
    };

    // Handle suggesting measurement level
    const handleSuggestMeasurement = () => {
        if (!currentVariable || !data || data.length === 0) return;

        // Analyze data to suggest measurement level
        const suggestion = suggestMeasurementLevel(currentVariable, data);
        setSuggestedMeasure(suggestion.level);
        setMeasurementExplanation(suggestion.explanation);
        setSuggestDialogOpen(true);
    };

    // Logic to determine appropriate measurement level
    const suggestMeasurementLevel = (variable: Variable, dataSet: any[]) => {
        const columnIndex = variable.columnIndex;
        const casesToScan = parseInt(caseLimit, 10) || dataSet.length;
        const dataToScan = dataSet.slice(0, casesToScan);

        // Extract column values, excluding missing values
        const columnValues = dataToScan
            .map(row => row[columnIndex])
            .filter(value => {
                // Skip empty values and values marked as missing
                if (value === "" || value === undefined) return false;
                const strValue = String(value);
                return !Array.isArray(variable.missing) ||
                    !variable.missing.some(mv => String(mv) === strValue);
            });

        if (columnValues.length === 0) {
            return {
                level: "nominal",
                explanation: "No valid values were found after excluding missing values."
            };
        }

        // Count unique values
        const uniqueValues = new Set(columnValues.map(String));
        const uniqueCount = uniqueValues.size;

        // Check if all values are numeric
        const allNumeric = columnValues.every(
            value => typeof value === "number" || (!isNaN(Number(value)) && String(value).trim() !== "")
        );

        // Check if all values are integers
        const allIntegers = allNumeric && columnValues.every(
            value => Number.isInteger(Number(value))
        );

        // Check value range
        let hasNegatives = false;
        let minValue = Infinity;
        let maxValue = -Infinity;

        if (allNumeric) {
            columnValues.forEach(value => {
                const num = Number(value);
                if (num < 0) hasNegatives = true;
                if (num < minValue) minValue = num;
                if (num > maxValue) maxValue = num;
            });
        }

        // Check if the range is small
        const smallRange = maxValue - minValue < 10;

        // Count values with labels
        const labeledValuesCount = Array.isArray(variable.values) ? variable.values.length : 0;
        const percentLabeled = uniqueCount > 0 ? (labeledValuesCount / uniqueCount) * 100 : 0;

        // Determine measurement level and explanation
        if (!allNumeric) {
            return {
                level: "nominal",
                explanation: "Contains non-numeric values, suggesting categorical data best treated as nominal."
            };
        } else if (uniqueCount <= 10 && allIntegers && minValue >= 0) {
            return {
                level: "ordinal",
                explanation: `Contains ${uniqueCount} unique integer values (ranging from ${minValue} to ${maxValue}), suggesting ordered categories.`
            };
        } else if (uniqueCount <= 20 && allIntegers) {
            return {
                level: "ordinal",
                explanation: `Contains ${uniqueCount} unique values with a limited range, suggesting ordered categories.`
            };
        } else if (labeledValuesCount > 0 && percentLabeled > 50) {
            return {
                level: "nominal",
                explanation: `${labeledValuesCount} of ${uniqueCount} values have labels (${percentLabeled.toFixed(1)}%), suggesting categorical data.`
            };
        } else if (allNumeric && uniqueCount > 20) {
            return {
                level: "scale",
                explanation: `Contains ${uniqueCount} unique numeric values with a wide range (${minValue} to ${maxValue}), suggesting continuous data.`
            };
        } else {
            return {
                level: "scale",
                explanation: "Contains numeric values with properties consistent with measurement data."
            };
        }
    };

    // Handle accepting the suggested measurement level
    const handleAcceptSuggestion = () => {
        if (currentVariable && suggestedMeasure) {
            handleVariableFieldChange('measure', suggestedMeasure as any);
            setSuggestDialogOpen(false);
        }
    };

    // Save changes
    const handleSave = async () => {
        // Make sure to save the current variable state before finalizing
        saveCurrentVariableState();

        try {
            // Only update the selected variables, not all variables
            for (const modifiedVariable of modifiedVariables) {
                // Find the matching original variable by columnIndex
                const originalVariable = originalVariables.find(
                    v => v.columnIndex === modifiedVariable.columnIndex
                );

                // If this is one of our selected variables (i.e., it was in the original set)
                if (originalVariable) {
                    // Save the updated variable to the store
                    await addVariable(modifiedVariable);
                }
            }

            // Call the onSave callback if provided, passing only the modified versions
            // of the original variables that were selected for editing
            if (onSave) {
                const updatedOriginalVariables = modifiedVariables.filter(
                    modVar => originalVariables.some(origVar => origVar.columnIndex === modVar.columnIndex)
                );
                onSave(updatedOriginalVariables);
            }

            console.log("Saving changes to selected variables");
            onClose();
        } catch (error) {
            console.error("Error saving variables:", error);
            setErrorMessage("Failed to save variable changes.");
            setErrorDialogOpen(true);
        }
    };

    // Define cell renderers for HandsonTable
    const checkboxRenderer = (instance: any, td: HTMLTableCellElement, row: number, col: number, prop: string | number, value: any) => {
        td.innerHTML = '';
        td.style.textAlign = 'center';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = Boolean(value);
        checkbox.style.width = '12px';
        checkbox.style.height = '12px';
        checkbox.style.cursor = 'pointer';
        checkbox.style.margin = '1px';

        checkbox.addEventListener('change', () => {
            const newData = [...gridData];
            newData[row][col] = checkbox.checked;
            setGridData(newData);

            // Save updated grid data for current variable
            if (currentVariable) {
                setVariableGridData(prev => ({
                    ...prev,
                    [currentVariable.columnIndex]: newData
                }));
            }
        });

        td.appendChild(checkbox);
        return td;
    };

    // Render dropdown with options
    const renderDropdown = (options: string[], currentValue: string, onChange: (value: string) => void, onClose: () => void) => {
        return (
            <div className="absolute top-full left-0 z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-y-auto">
                {options.map((option) => (
                    <div
                        key={option}
                        className="text-xs p-1 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                            onChange(option);
                            onClose();
                        }}
                        title={formatDropdownText(option)}
                    >
                        {formatDropdownText(option)}
                    </div>
                ))}
            </div>
        );
    };

    // Render date format dropdown
    const renderDateFormatDropdown = () => {
        if (!currentVariable) return null;

        return (
            <div className="absolute top-full right-0 z-10 mt-1 w-60 bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-y-auto">
                {DATE_FORMAT_SPECS.map((format, index) => (
                    <div
                        key={index}
                        className="text-xs p-1 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                            // Update both type and width when selecting a date format
                            handleVariableFieldChange('type', format.type);
                            handleVariableFieldChange('width', format.width);
                            setShowDateFormatDropdown(false);
                        }}
                        title={format.format}
                    >
                        {format.format}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <DialogContent className="max-w-[880px] max-h-[90vh] p-1 bg-gray-100">
                <DialogHeader className="p-0 mb-1">
                    <DialogTitle className="flex items-center text-sm">
                        <span className="text-gray-800">Define Variable Properties</span>
                    </DialogTitle>
                </DialogHeader>
                <Separator className="my-0" />

                <div className="grid grid-cols-12 gap-1 py-1">
                    {/* Left Column - Scanned Variable List */}
                    <div className="col-span-4 flex flex-col">
                        <div className="text-xs font-semibold mb-1 text-gray-800">Scanned Variable List</div>
                        <div className="border border-gray-300 rounded h-full overflow-y-auto bg-white">
                            <div className="bg-gray-100 border-b border-gray-300">
                                <div className="grid grid-cols-12 text-xs font-semibold">
                                    <div className="col-span-2 p-1 text-center border-r border-gray-300 overflow-hidden" title="Labeled">
                                        <span className="block truncate">Labeled</span>
                                    </div>
                                    <div className="col-span-4 p-1 text-center border-r border-gray-300 overflow-hidden" title="Measurement">
                                        <span className="block truncate">Measurement</span>
                                    </div>
                                    <div className="col-span-2 p-1 text-center border-r border-gray-300 overflow-hidden" title="Role">
                                        <span className="block truncate">Role</span>
                                    </div>
                                    <div className="col-span-4 p-1 text-center overflow-hidden" title="Variable">
                                        <span className="block truncate">Variable</span>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-y-auto" style={{ maxHeight: '160px' }}>
                                {modifiedVariables.map((variable, index) => (
                                    <div
                                        key={variable.columnIndex}
                                        className={`grid grid-cols-12 text-xs cursor-pointer border-b border-gray-200 hover:bg-gray-50 ${selectedVariableIndex === index ? 'bg-gray-200' : ''}`}
                                        onClick={() => handleVariableChange(index)}
                                    >
                                        <div className="col-span-2 p-1 text-center border-r border-gray-200">
                                            <input
                                                type="checkbox"
                                                className="w-3 h-3"
                                                checked={variable.values.length > 0}
                                                onChange={(e) => setLabeledVariables({...labeledVariables, [index]: e.target.checked})}
                                            />
                                        </div>
                                        <div className="col-span-4 p-1 text-center border-r border-gray-200 flex items-center justify-center"
                                             title={formatDropdownText(variable.measure)}>
                                            {getVariableIcon(variable)}
                                            <span className="truncate">{formatDropdownText(variable.measure)}</span>
                                        </div>
                                        <div className="col-span-2 p-1 text-center border-r border-gray-200 truncate"
                                             title={formatDropdownText(variable.role)}>
                                            {formatDropdownText(variable.role)}
                                        </div>
                                        <div className="col-span-4 p-1 text-center truncate"
                                             title={variable.name}>
                                            {variable.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs">
                            <div>Cases scanned: <input value={caseLimit} className="w-10 h-5 text-xs border border-gray-300 rounded px-1" readOnly /></div>
                            <div>Value list limit: <input value={valueLimit} className="w-10 h-5 text-xs border border-gray-300 rounded px-1" readOnly /></div>
                        </div>
                    </div>

                    {/* Right Column - Variable Properties */}
                    <div className="col-span-8 flex flex-col">
                        {currentVariable ? (
                            <>
                                <div className="grid grid-cols-12 gap-1">
                                    {/* Left Column of Form */}
                                    <div className="col-span-6 space-y-1">
                                        <div className="grid grid-cols-12 items-center">
                                            <div className="col-span-5 text-xs font-semibold text-gray-800 pr-1">Current Variable:</div>
                                            <div className="col-span-7">
                                                <input
                                                    value={currentVariable.name}
                                                    onChange={(e) => handleVariableFieldChange('name', e.target.value)}
                                                    className="h-5 w-full text-xs border border-gray-300 rounded px-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-12 items-center">
                                            <div className="col-span-5 text-xs font-semibold text-gray-800 pr-1">Label:</div>
                                            <div className="col-span-7">
                                                <input
                                                    value={currentVariable.label || ''}
                                                    onChange={(e) => handleVariableFieldChange('label', e.target.value)}
                                                    className="h-5 w-full text-xs border border-gray-300 rounded px-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-12 items-center">
                                            <div className="col-span-5 text-xs font-semibold text-gray-800 pr-1">Measurement Level:</div>
                                            <div className="col-span-7 flex">
                                                <div className="relative flex-grow">
                                                    <div
                                                        className="flex items-center h-5 text-xs border border-gray-300 rounded bg-blue-100 px-1 w-full cursor-pointer"
                                                        onClick={() => setShowMeasureDropdown(!showMeasureDropdown)}
                                                        title={formatDropdownText(currentVariable.measure)}
                                                    >
                                                        {getVariableIcon(currentVariable)}
                                                        <span className="capitalize truncate">{formatDropdownText(currentVariable.measure)}</span>
                                                        <ChevronDown size={12} className="ml-1 text-gray-700 flex-shrink-0" />
                                                    </div>
                                                    {showMeasureDropdown && renderDropdown(
                                                        MEASURE_OPTIONS,
                                                        currentVariable.measure,
                                                        (value) => handleVariableFieldChange('measure', value),
                                                        () => setShowMeasureDropdown(false)
                                                    )}
                                                </div>
                                                <button
                                                    className="text-xs h-5 px-1 ml-1 bg-blue-100 hover:bg-blue-200 border border-gray-300 rounded whitespace-nowrap"
                                                    onClick={handleSuggestMeasurement}
                                                >
                                                    Suggest
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-12 items-center">
                                            <div className="col-span-5 text-xs font-semibold text-gray-800 pr-1">Role:</div>
                                            <div className="col-span-7">
                                                <div className="relative w-full">
                                                    <div
                                                        className="flex items-center h-5 text-xs border border-gray-300 rounded bg-blue-100 px-1 w-full cursor-pointer"
                                                        onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                                        title={formatDropdownText(currentVariable.role)}
                                                    >
                                                        <span className="capitalize truncate">{formatDropdownText(currentVariable.role)}</span>
                                                        <ChevronDown size={12} className="ml-auto text-gray-700 flex-shrink-0" />
                                                    </div>
                                                    {showRoleDropdown && renderDropdown(
                                                        ROLE_OPTIONS,
                                                        currentVariable.role,
                                                        (value) => handleVariableFieldChange('role', value),
                                                        () => setShowRoleDropdown(false)
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-12 items-center">
                                            <div className="col-span-5 text-xs font-semibold text-gray-800 pr-1">Unlabeled values:</div>
                                            <div className="col-span-7">
                                                <input
                                                    value={unlabeledValuesCount}
                                                    className="w-full h-5 text-xs border border-gray-300 rounded px-1"
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column of Form */}
                                    <div className="col-span-6 space-y-1">
                                        <div className="grid grid-cols-12 items-center">
                                            <div className="col-span-3 text-xs font-semibold text-gray-800 pr-1 pl-2">Type:</div>
                                            <div className="col-span-9 flex">
                                                <div className="relative flex-1">
                                                    <div
                                                        className="flex items-center h-5 text-xs border border-gray-300 rounded bg-blue-100 px-1 w-full cursor-pointer"
                                                        onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                                                        title={getFormattedTypeName(currentVariable.type)}
                                                    >
                                                        <span className="capitalize truncate">{getFormattedTypeName(currentVariable.type)}</span>
                                                        <ChevronDown size={12} className="ml-auto text-gray-700 flex-shrink-0" />
                                                    </div>
                                                    {showTypeDropdown && renderDropdown(
                                                        TYPE_OPTIONS,
                                                        currentVariable.type,
                                                        (value) => handleVariableFieldChange('type', value),
                                                        () => setShowTypeDropdown(false)
                                                    )}
                                                </div>
                                                <div className="relative ml-1 flex-1">
                                                    <div
                                                        className={`flex items-center h-5 text-xs border border-gray-300 rounded px-1 w-full ${
                                                            isDateType(currentVariable.type)
                                                                ? 'bg-blue-100 cursor-pointer'
                                                                : 'bg-gray-100 cursor-not-allowed text-gray-500'
                                                        }`}
                                                        onClick={() => isDateType(currentVariable.type) && setShowDateFormatDropdown(!showDateFormatDropdown)}
                                                        title={isDateType(currentVariable.type) ? "Select date format" : "Format (only available for date types)"}
                                                    >
                                                        <span className="capitalize truncate">Format</span>
                                                        <ChevronDown size={12} className="ml-auto text-gray-700 flex-shrink-0" />
                                                    </div>
                                                    {showDateFormatDropdown && isDateType(currentVariable.type) && renderDateFormatDropdown()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-12 items-center">
                                            <div className="col-span-3 text-xs font-semibold text-gray-800 pr-1 pl-2">Width:</div>
                                            <div className="col-span-4">
                                                <input
                                                    value={currentVariable.width}
                                                    onChange={(e) => handleVariableFieldChange('width', parseInt(e.target.value) || 0)}
                                                    className="w-full h-5 text-xs border border-gray-300 rounded px-1"
                                                    disabled={isDateType(currentVariable.type)}
                                                />
                                            </div>
                                            <div className="col-span-3 text-xs font-semibold text-gray-800 px-1">Decimals:</div>
                                            <div className="col-span-2">
                                                <input
                                                    value={currentVariable.decimals}
                                                    onChange={(e) => handleVariableFieldChange('decimals', parseInt(e.target.value) || 0)}
                                                    className="w-full h-5 text-xs border border-gray-300 rounded px-1"
                                                    disabled={isDateType(currentVariable.type)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-12 items-center">
                                            <div className="col-span-3"></div>
                                            <div className="col-span-9">
                                                <button className="text-xs h-5 w-full px-2 bg-blue-100 hover:bg-blue-200 border border-gray-300 rounded">
                                                    Attributes...
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center mt-1 mb-1">
                                    <div className="text-xs font-semibold mr-1 text-gray-800">Value Label grid:</div>
                                    <div className="flex items-center">
                                        <Info size={12} className="text-gray-500 mr-1" />
                                        <span className="text-xs text-gray-700 truncate">Enter or edit labels in the grid. You can enter additional values at the bottom.</span>
                                    </div>
                                </div>

                                {/* Value Labels Grid using Handsontable */}
                                <div className="border border-gray-300 rounded flex-grow bg-white">
                                    {dataIsLoading ? (
                                        <div className="flex items-center justify-center h-40">
                                            <p className="text-gray-500">Loading data...</p>
                                        </div>
                                    ) : (
                                        <HotTable
                                            ref={hotTableRef}
                                            data={gridData}
                                            colHeaders={['#', 'Changed', 'Missing', 'Count', 'Value', 'Label']}
                                            columns={[
                                                { data: 0, type: 'text', readOnly: true, className: 'htCenter', width: 24 },
                                                { data: 1, type: 'checkbox', renderer: checkboxRenderer, width: 56 },
                                                { data: 2, type: 'checkbox', renderer: checkboxRenderer, width: 56 },
                                                { data: 3, type: 'numeric', readOnly: true, className: 'htCenter', width: 46 },
                                                { data: 4, type: 'text', width: 70 },
                                                { data: 5, type: 'text' }
                                            ]}
                                            width="100%"
                                            height="180"
                                            licenseKey="non-commercial-and-evaluation"
                                            afterChange={handleDataChange}
                                            stretchH="all"
                                            rowHeaders={false}
                                            className="spss-hot-table"
                                            rowHeights={18}
                                            manualColumnResize
                                            fixedColumnsLeft={0}
                                            contextMenu={false}
                                        />
                                    )}
                                </div>

                                {/* Bottom Action Buttons */}
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div className="border border-gray-300 rounded p-1 bg-blue-50">
                                        <div className="text-xs font-semibold mb-1 text-gray-800">Copy Properties</div>
                                        <div className="grid grid-cols-1 gap-1">
                                            <button
                                                className="text-xs w-full h-5 px-1 bg-blue-100 hover:bg-blue-200 border border-gray-300 rounded truncate"
                                                onClick={handleCopyFromVariable}
                                            >
                                                From Another Variable...
                                            </button>
                                            <button
                                                className="text-xs w-full h-5 px-1 bg-blue-100 hover:bg-blue-200 border border-gray-300 rounded truncate"
                                                onClick={handleCopyToVariables}
                                            >
                                                To Other Variables...
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border border-gray-300 rounded p-1 bg-blue-50">
                                        <div className="text-xs font-semibold mb-1 text-gray-800">Unlabeled Values</div>
                                        <div className="flex justify-center">
                                            <button
                                                className="text-xs w-full h-5 px-1 bg-blue-100 hover:bg-blue-200 border border-gray-300 rounded"
                                                onClick={handleAutoLabel}
                                            >
                                                Automatic Labels
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">No variable selected</p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex justify-center space-x-1 mt-1 p-0">
                    <button
                        className="text-xs h-6 px-4 bg-blue-100 hover:bg-blue-200 border border-gray-300 rounded"
                        onClick={handleSave}
                    >
                        OK
                    </button>
                    <button className="text-xs h-6 px-2 bg-blue-100 hover:bg-blue-200 border border-gray-300 rounded">
                        Paste
                    </button>
                    <button className="text-xs h-6 px-2 bg-blue-100 hover:bg-blue-200 border border-gray-300 rounded">
                        Reset
                    </button>
                    <button
                        className="text-xs h-6 px-2 bg-blue-100 hover:bg-blue-200 border border-gray-300 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button className="text-xs h-6 px-2 bg-blue-100 hover:bg-blue-200 border border-gray-300 rounded">
                        Help
                    </button>
                </DialogFooter>
            </DialogContent>

            {/* Add custom styles for HandsonTable */}
            <style jsx global>{`
                /* Add these styles to ensure proper truncation */
                .truncate {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                /* Make sure dropdown items also truncate properly */
                .absolute.z-10 div {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .spss-hot-table .handsontable {
                    font-size: 11px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    z-index: 0 !important; /* Set z-index to 0 */
                }
                .spss-hot-table .handsontable th {
                    background-color: #f3f4f6;
                    color: #333;
                    text-align: center;
                    font-weight: bold;
                    border-color: #d1d5db;
                    padding: 1px 2px;
                    height: 18px;
                }
                .spss-hot-table .handsontable td {
                    border-color: #e5e7eb;
                    padding: 1px 2px;
                    height: 18px;
                }
                .spss-hot-table .handsontable tr:nth-child(even) td {
                    background-color: #f9fafb;
                }
                .spss-hot-table .handsontable .htCenter {
                    text-align: center;
                }
                .spss-hot-table .handsontable .current {
                    background-color: #e5e7eb !important;
                }
                .spss-hot-table .handsontable .htCheckboxRendererInput {
                    margin: 1px;
                }
                .spss-hot-table .handsontable .wtBorder {
                    background-color: #6b7280 !important;
                }
                .spss-hot-table .handsontable .htDimmed {
                    color: #6b7280;
                }
            `}</style>

            {/* Error Dialog */}
            <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
                <DialogContent className="max-w-[400px] p-2 bg-blue-50">
                    <DialogHeader className="p-0 mb-1">
                        <DialogTitle className="text-sm">IBM SPSS Statistics 25</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-3">
                        <AlertCircle className="h-8 w-8 text-gray-500" />
                        <div>
                            <p className="text-sm mt-1">{errorMessage}</p>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-center mt-2">
                        <button
                            className="text-xs h-6 px-3 bg-blue-100 hover:bg-blue-200 border border-gray-300 rounded"
                            onClick={() => setErrorDialogOpen(false)}
                        >
                            OK
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Measurement Level Suggestion Dialog */}
            <Dialog open={suggestDialogOpen} onOpenChange={setSuggestDialogOpen}>
                <DialogContent className="max-w-[450px] p-2 bg-blue-50">
                    <DialogHeader className="p-0 mb-1">
                        <DialogTitle className="text-sm">Suggest Measurement Level</DialogTitle>
                    </DialogHeader>

                    <div className="mb-3">
                        <div className="flex items-center mb-2">
                            <div className="mr-2">
                                {suggestedMeasure === "scale" && <Ruler size={16} className="text-gray-700" />}
                                {suggestedMeasure === "nominal" && <Shapes size={16} className="text-gray-700" />}
                                {suggestedMeasure === "ordinal" && <BarChartHorizontal size={16} className="text-gray-700" />}
                            </div>
                            <p className="text-sm font-semibold">
                                Suggested measurement level: <span className="capitalize">{formatDropdownText(suggestedMeasure)}</span>
                            </p>
                        </div>

                        <div className="bg-white border border-gray-300 rounded p-2 mb-2">
                            <p className="text-xs mb-1 font-semibold">Explanation:</p>
                            <p className="text-xs">{measurementExplanation}</p>
                        </div>

                        <p className="text-xs text-gray-600">
                            Note: Values defined as representing missing values were not included in this evaluation.
                        </p>
                    </div>

                    <DialogFooter className="flex justify-center space-x-2">
                        <button
                            className="text-xs h-6 px-3 bg-blue-100 hover:bg-blue-200 border border-gray-300 rounded"
                            onClick={handleAcceptSuggestion}
                        >
                            Continue
                        </button>
                        <button
                            className="text-xs h-6 px-3 bg-blue-100 hover:bg-blue-200 border border-gray-300 rounded"
                            onClick={() => setSuggestDialogOpen(false)}
                        >
                            Cancel
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default VariablePropertiesEditor;