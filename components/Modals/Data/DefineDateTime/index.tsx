"use client";

import React, { FC, useState, useEffect } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, Clock, Info } from "lucide-react";
import { useMetaStore } from "@/stores/useMetaStore"; // Import meta store
import { useVariableStore } from "@/stores/useVariableStore"; // Import variable store
import { useDataStore } from "@/stores/useDataStore"; // Import data store
import { Variable } from "@/types/Variable";
import { ValueLabel } from '@/types/ValueLabel'

interface DefineDatesProps {
    onClose: () => void;
}

interface TimeComponent {
    name: string;
    value: number;
    periodicity?: number;
}

const DefineDatesModal: FC<DefineDatesProps> = ({ onClose }) => {
    // Get store functions
    const { meta, setMeta } = useMetaStore();
    const { variables, addVariable, resetVariables } = useVariableStore();
    const { updateBulkCells, data } = useDataStore();

    const getMaxRow = () => {
        return data.length > 0 ? data.length - 1 : 0;
    };

    // State for Cases Are options
    const [casesAreOptions] = useState<string[]>([
        "Years",
        "Years, quarters",
        "Years, months",
        "Years, quarters, months",
        "Days",
        "Weeks, days",
        "Weeks, work days(5)",
        "Weeks, work days(6)",
        "Hours",
        "Days, hours",
        "Days, work hour(8)",
        "Weeks, days, hours",
        "Weeks, work days, hours",
        "Minutes",
        "Hours, minutes",
        "Days, hours, minutes",
        "Seconds",
        "Minutes, seconds",
        "Hours, minutes, seconds",
        "Not dated"
    ]);
    const [selectedCase, setSelectedCase] = useState<string>("Years, quarters");

    // Time components state
    const [timeComponents, setTimeComponents] = useState<TimeComponent[]>([
        { name: "Year", value: 1900 },
        { name: "Quarter", value: 1, periodicity: 4 }
    ]);

    // Update time components when a different case option is selected
    useEffect(() => {
        const components: TimeComponent[] = [];

        // Parse the selected case to determine time components
        if (selectedCase.includes("Years")) {
            components.push({ name: "Year", value: 1900 });
        }

        if (selectedCase.includes("quarters")) {
            components.push({ name: "Quarter", value: 1, periodicity: 4 });
        }

        if (selectedCase.includes("months")) {
            components.push({ name: "Month", value: 1, periodicity: 12 });
        }

        // Handle Weeks
        if (selectedCase.includes("Weeks")) {
            components.push({ name: "Week", value: 1 });
        }

        // Handle Days - fix the case sensitivity issue and standalone Days
        if (selectedCase === "Days") {
            components.push({ name: "Day", value: 1 });
        } else if (selectedCase.startsWith("Days,")) {
            components.push({ name: "Day", value: 1 });
        } else if (selectedCase.includes("work days")) {
            // Work days with periodicity
            if (selectedCase.includes("work days(6)")) {
                components.push({ name: "Work day", value: 1, periodicity: 6 });
            } else {
                components.push({ name: "Work day", value: 1, periodicity: 5 });
            }
        } else if (selectedCase.includes("days") && !selectedCase.includes("work hour")) {
            // Regular days as part of combination (e.g., "Weeks, days")
            if (selectedCase.includes("Weeks")) {
                components.push({ name: "Day", value: 1, periodicity: 7 });
            } else {
                components.push({ name: "Day", value: 1 });
            }
        }

        // Handle work hours
        if (selectedCase.includes("work hour(8)")) {
            components.push({ name: "Work hour", value: 1, periodicity: 8 });
        } else if (selectedCase.includes("work hour")) {
            components.push({ name: "Work hour", value: 1, periodicity: 8 });
        } else if (selectedCase.includes("Hours") || selectedCase.includes("hours")) {
            // Regular hours
            if (selectedCase.includes("Days") || selectedCase.includes("days")) {
                components.push({ name: "Hour", value: 0, periodicity: 24 });
            } else {
                components.push({ name: "Hour", value: 0 });
            }
        }

        if (selectedCase.includes("Minutes") || selectedCase.includes("minutes")) {
            if (selectedCase.includes("Hours") || selectedCase.includes("hours")) {
                components.push({ name: "Minute", value: 0, periodicity: 60 });
            } else {
                components.push({ name: "Minute", value: 0 });
            }
        }

        if (selectedCase.includes("Seconds") || selectedCase.includes("seconds")) {
            if (selectedCase.includes("Minutes") || selectedCase.includes("minutes")) {
                components.push({ name: "Second", value: 0, periodicity: 60 });
            } else {
                components.push({ name: "Second", value: 0 });
            }
        }

        console.log("Selected case:", selectedCase);
        console.log("Generated components:", components);

        setTimeComponents(components);
    }, [selectedCase]);

    // Handle input changes
    const handleInputChange = (index: number, value: number) => {
        const updatedComponents = [...timeComponents];
        updatedComponents[index].value = value;
        setTimeComponents(updatedComponents);
    };

    // Format date string for meta store
    const formatDateForMetaStore = (): string => {
        if (selectedCase === "Not dated") return "";

        return timeComponents.map(component => {
            const periodicityStr = component.periodicity ? `;${component.periodicity}` : "";
            return `${component.name}(${component.value}${periodicityStr})`;
        }).join("");
    };

    // Create date variables
    const createDateVariables = async () => {
        if (selectedCase === "Not dated") {
            // Simply remove any date variables
            await resetVariables();
            return;
        }

        let startColumnIndex = variables.length;

        // Create variables for each component
        const variablesToCreate: Variable[] = [];

        // Create individual component variables (all NUMERIC)
        for (const component of timeComponents) {
            const variableName = `${component.name.toUpperCase()}_`;

            // Create label with periodicity information
            let variableLabel = component.name.toUpperCase();
            if (component.periodicity) {
                variableLabel += `, period ${component.periodicity}`;
            } else {
                variableLabel += ", not periodic";
            }

            const newVariable: Variable = {
                columnIndex: startColumnIndex++,
                name: variableName,
                type: "NUMERIC",
                width: 8,
                decimals: 0,
                label: variableLabel,
                values: [],
                missing: [],
                columns: 64,
                align: "right",
                measure: "scale",
                role: "input",
            };

            variablesToCreate.push(newVariable);
        }

        // Create DATE_ string variable
        const dateFormatString = getDateFormatString();

        const dateVariable: Variable = {
            columnIndex: startColumnIndex,
            name: "DATE_",
            type: "STRING",
            width: 20,
            decimals: 0,
            label: `Date. Format: ${dateFormatString}`,
            values: [],
            missing: [],
            columns: 64,
            align: "left",
            measure: "nominal",
            role: "input",
        };

        variablesToCreate.push(dateVariable);

        // Add all variables to the store
        for (const variable of variablesToCreate) {
            await addVariable(variable);
        }

        // Generate sample data in the data store
        await generateSampleData(variablesToCreate);
    };

    // Generate a human-readable date format string
    const getDateFormatString = (): string => {
        if (timeComponents.length === 0) return "";

        const formatParts: string[] = [];

        // Check for each possible component and add its format
        const hasYear = timeComponents.some(c => c.name === "Year");
        const hasQuarter = timeComponents.some(c => c.name === "Quarter");
        const hasMonth = timeComponents.some(c => c.name === "Month");
        const hasWeek = timeComponents.some(c => c.name === "Week");
        const hasDay = timeComponents.some(c => c.name === "Day") || timeComponents.some(c => c.name === "Work day");
        const hasHour = timeComponents.some(c => c.name === "Hour") || timeComponents.some(c => c.name === "Work hour");
        const hasMinute = timeComponents.some(c => c.name === "Minute");
        const hasSecond = timeComponents.some(c => c.name === "Second");

        // Build format string based on components
        if (hasYear) {
            if (hasQuarter && hasMonth) {
                formatParts.push("YYYY-QQ-MM");
            } else if (hasQuarter) {
                formatParts.push("YYYY-QQ");
            } else if (hasMonth) {
                formatParts.push("YYYY-MM");
            } else {
                formatParts.push("YYYY");
            }
        } else if (hasWeek) {
            if (hasDay) {
                formatParts.push("WW-D");
            } else {
                formatParts.push("WW");
            }
        } else if (hasDay) {
            formatParts.push("DD");
        }

        // Time components
        if (hasHour) {
            if (hasMinute) {
                if (hasSecond) {
                    formatParts.push("HH:MM:SS");
                } else {
                    formatParts.push("HH:MM");
                }
            } else {
                formatParts.push("HH");
            }
        } else if (hasMinute) {
            if (hasSecond) {
                formatParts.push("MM:SS");
            } else {
                formatParts.push("MM");
            }
        } else if (hasSecond) {
            formatParts.push("SS");
        }

        return formatParts.join(" ");
    };

    // Generate sample data for the DataStore
    const generateSampleData = async (createdVariables: Variable[]) => {
        // Get existing row count to limit generation
        const existingRowCount = await getMaxRow();

        // Default to generating 20 records, but limit to existing row count if available
        const rowCount = existingRowCount > 0 ? existingRowCount : 20;
        const updates = [];

        // Create a map of variables by name for easy lookup
        const variableMap = createdVariables.reduce((map, variable) => {
            map[variable.name] = variable;
            return map;
        }, {} as Record<string, Variable>);

        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            // Clone initial values
            const currentValues: Record<string, number> = {};

            // First, set all components to their initial values
            timeComponents.forEach(component => {
                currentValues[component.name.toLowerCase()] = component.value;
            });

            // Then, perform increments with proper periodicity handling
            if (rowIndex > 0) {
                // Start with the smallest unit (last component) and work upward
                let carry = rowIndex;

                // Process from smallest to largest (reversed to handle carry properly)
                for (let i = timeComponents.length - 1; i >= 0; i--) {
                    const component = timeComponents[i];
                    const name = component.name.toLowerCase();

                    if (component.periodicity) {
                        // Use modular arithmetic to cycle values within the periodicity
                        const baseValue = component.value; // The starting value (first case value)
                        const addedValue = carry % component.periodicity;
                        const periodicValue = ((baseValue - 1 + addedValue) % component.periodicity) + 1;

                        currentValues[name] = periodicValue;

                        // Calculate carry to next component
                        carry = Math.floor((baseValue - 1 + carry) / component.periodicity);

                        // If there's no more carry, we're done
                        if (carry === 0) break;
                    } else {
                        // For non-periodic components, just add the carry
                        currentValues[name] = component.value + carry;
                        carry = 0;
                        break;
                    }
                }
            }

            // Add each component value to the updates
            timeComponents.forEach(component => {
                const variableName = `${component.name.toUpperCase()}_`;
                const variableColIndex = variableMap[variableName]?.columnIndex;

                if (variableColIndex !== undefined) {
                    updates.push({
                        row: rowIndex,
                        col: variableColIndex,
                        value: currentValues[component.name.toLowerCase()]
                    });
                }
            });

            // Add the formatted date string
            const dateColIndex = variableMap["DATE_"]?.columnIndex;
            if (dateColIndex !== undefined) {
                const dateString = formatDateString(currentValues);
                updates.push({
                    row: rowIndex,
                    col: dateColIndex,
                    value: dateString
                });
            }
        }

        // Use bulk update to efficiently add all data
        if (updates.length > 0) {
            await updateBulkCells(updates);
        }
    };

    // Format date string for display based on components
    const formatDateString = (values: Record<string, number>): string => {
        // Create basic component names for reference
        const componentNames = timeComponents.map(c => c.name.toLowerCase());

        // Format parts based on which components exist
        const parts: string[] = [];

        // Handle day part
        if (componentNames.includes('day') || componentNames.includes('work day')) {
            const dayValue = values['day'] || values['work day'];
            parts.push(dayValue.toString());
        } else if (componentNames.includes('week')) {
            parts.push(values['week'].toString());
        } else if (componentNames.includes('year')) {
            parts.push(values['year'].toString());

            if (componentNames.includes('quarter')) {
                parts[parts.length - 1] += `-Q${values['quarter']}`;
            }

            if (componentNames.includes('month')) {
                parts[parts.length - 1] += `-${values['month'].toString().padStart(2, '0')}`;
            }
        }

        // Handle time part
        const timeParts: string[] = [];

        if (componentNames.includes('hour') || componentNames.includes('work hour')) {
            timeParts.push((values['hour'] || values['work hour']).toString());
        }

        if (componentNames.includes('minute')) {
            timeParts.push(values['minute'].toString().padStart(2, '0'));
        }

        if (componentNames.includes('second')) {
            timeParts.push(values['second'].toString().padStart(2, '0'));
        }

        // Format time parts with colons
        if (timeParts.length > 0) {
            // If it's hours and minutes, use HH:MM format
            if (timeParts.length === 2) {
                parts.push(`${timeParts[0]}:${timeParts[1]}`);
            }
            // If it's hours, minutes, and seconds, use HH:MM:SS format
            else if (timeParts.length === 3) {
                parts.push(`${timeParts[0]}:${timeParts[1]}:${timeParts[2]}`);
            }
            // Just hours or other single component
            else {
                parts.push(timeParts[0]);
            }
        }

        // Join all parts with spaces
        return parts.join("  ");
    };

    // Event handlers
    const handleOk = async () => {
        // Format date string for meta store
        const dateString = formatDateForMetaStore();

        // Update meta store with the new date format
        setMeta({ dates: dateString });

        // Create date variables and sample data
        await createDateVariables();

        // Close the modal
        onClose();
    };

    const handleReset = () => {
        setSelectedCase("Years, quarters");
        // Reset will be handled by the useEffect
    };

    // Format the current dates display - FIXED to include values
    const formatCurrentDates = () => {
        if (selectedCase === "Not dated") return "Not dated";

        return timeComponents.map(component => {
            const periodicityStr = component.periodicity ? `(${component.periodicity})` : "";
            return `${component.name}(${component.value})${periodicityStr}`;
        }).join("");
    };

    return (
        <DialogContent className="max-w-[650px] p-3">
            <DialogHeader className="p-0 mb-2">
                <DialogTitle>Define Dates</DialogTitle>
            </DialogHeader>
            <Separator className="my-0" />

            <div className="grid grid-cols-2 gap-4 py-2">
                {/* Left Column - Cases Are */}
                <div className="space-y-2">
                    <Label className="text-xs font-semibold">Cases Are:</Label>
                    <div className="border p-2 rounded-md h-48 overflow-y-auto overflow-x-hidden">
                        <div className="space-y-1">
                            {casesAreOptions.map((option) => (
                                <TooltipProvider key={option}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={`flex items-center p-1 cursor-pointer border rounded-md hover:bg-gray-100 ${
                                                    selectedCase === option
                                                        ? "bg-gray-200 border-gray-500"
                                                        : "border-gray-300"
                                                }`}
                                                onClick={() => setSelectedCase(option)}
                                            >
                                                <div className="flex items-center w-full">
                                                    <Calendar size={14} className="text-gray-600 mr-1 flex-shrink-0" />
                                                    <span className="text-xs truncate">{option}</span>
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p className="text-xs">{option}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    </div>

                    {/* Current Dates */}
                    <div className="border p-2 rounded-md">
                        <Label className="text-xs font-semibold mb-1 block">Current Dates:</Label>
                        <div className="flex items-center">
                            <Clock size={14} className="text-gray-600 mr-1 flex-shrink-0" />
                            <span className="text-xs">{formatCurrentDates()}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column - First Case Is */}
                <div className="space-y-2">
                    <Label className="text-xs font-semibold">First Case Is:</Label>
                    <div className="border p-2 rounded-md space-y-3">
                        {timeComponents.map((component, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor={`component-${index}`} className="text-xs block">
                                        {component.name}:
                                    </Label>

                                    {component.periodicity && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Info size={12} />
                                            <span>Periodicity: {component.periodicity}</span>
                                        </div>
                                    )}
                                </div>

                                <Input
                                    id={`component-${index}`}
                                    type="number"
                                    value={component.value}
                                    onChange={(e) => handleInputChange(index, Number(e.target.value))}
                                    className="h-7 text-xs"
                                />
                            </div>
                        ))}

                        {timeComponents.length === 0 && (
                            <div className="text-xs text-gray-500 text-center py-2">
                                No date components to configure
                            </div>
                        )}
                    </div>

                    {/* Hint for periodicity */}
                    <div className="border p-2 rounded-md bg-gray-50">
                        <div className="flex items-start gap-2">
                            <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-gray-700">
                                Periodicity values show how many units exist in the next higher level.
                                For example, there are 4 quarters in a year, 12 months in a year,
                                7 days in a week, etc.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter className="flex justify-center space-x-2 mt-2 p-0">
                <Button size="sm" className="text-xs h-7" onClick={handleOk}>
                    OK
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={handleReset}>
                    Reset
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => alert("Help dialog here")}>
                    Help
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default DefineDatesModal;