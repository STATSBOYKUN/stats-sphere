// Function-related utility functions for AggregateData component

// Get function name suffix to be used in variable naming
export const getFunctionSuffix = (functionName: string): string => {
    // Map SPSS function names to their corresponding suffixes for variable naming
    const functionMap: {[key: string]: string} = {
        // Summary Statistics
        "MEAN": "mean",
        "MEDIAN": "median",
        "SUM": "sum",
        "STDDEV": "sd",

        // Specific Values
        "MIN": "min",
        "MAX": "max",
        "FIRST": "first",
        "LAST": "last",

        // Number of cases
        "WEIGHTED": "n",         // Maps to N in SPSS
        "WEIGHTED_MISSING": "nmiss",
        "UNWEIGHTED": "nu",
        "UNWEIGHTED_MISSING": "numiss",

        // Percentages
        "PERCENTAGE": "pct",
        "PGT": "pgt",
        "PLT": "plt",
        "PIN": "pin",
        "POUT": "pout",

        // Fractions
        "FRACTION": "frac",
        "FGT": "fgt",
        "FLT": "flt",
        "FIN": "fin",
        "FOUT": "fout",

        // Counts
        "COUNT": "count"
    };

    return functionMap[functionName] || functionName.toLowerCase();
};

// Generates a variable name based on the base variable name and function
export const createVariableName = (baseName: string, functionName: string, existingNames: string[]): string => {
    const functionSuffix = getFunctionSuffix(functionName);
    const baseName_functionSuffix = `${baseName}_${functionSuffix}`;

    // If the name doesn't exist yet, use it as is
    if (!existingNames.includes(baseName_functionSuffix)) {
        return baseName_functionSuffix;
    }

    // If the name exists, find the next available numbered suffix
    let counter = 1;
    let newName = `${baseName_functionSuffix}_${counter}`;

    while (existingNames.includes(newName)) {
        counter++;
        newName = `${baseName_functionSuffix}_${counter}`;
    }

    return newName;
};

// Converts UI function to actual SPSS function for calculation
export const mapUIFunctionToCalculationFunction = (uiFunction: string, percentageType?: string): string => {
    // Map UI function selections to actual calculation functions
    if (uiFunction === "WEIGHTED") return "N";
    if (uiFunction === "WEIGHTED_MISSING") return "NMISS";
    if (uiFunction === "UNWEIGHTED") return "NU";
    if (uiFunction === "UNWEIGHTED_MISSING") return "NUMISS";

    if (uiFunction === "PERCENTAGE") {
        // Map percentage types to specific functions
        if (percentageType === "above") return "PGT";
        if (percentageType === "below") return "PLT";
        if (percentageType === "inside") return "PIN";
        if (percentageType === "outside") return "POUT";
    }

    if (uiFunction === "FRACTION") {
        // Map fraction types to specific functions
        if (percentageType === "above") return "FGT";
        if (percentageType === "below") return "FLT";
        if (percentageType === "inside") return "FIN";
        if (percentageType === "outside") return "FOUT";
    }

    // Default: return the original function name
    return uiFunction;
};

// Get function display string with appropriate parameters
export const getFunctionDisplay = (functionName: string, varName: string,
                                   percentageValue?: string, percentageLow?: string, percentageHigh?: string): string => {

    // Special case functions that need parameter values
    switch(functionName) {
        case "PGT":
        case "FGT":
            return `${functionName}(${varName}, ${percentageValue || "value"})`;
        case "PLT":
        case "FLT":
            return `${functionName}(${varName}, ${percentageValue || "value"})`;
        case "PIN":
        case "FIN":
            return `${functionName}(${varName}, ${percentageLow || "low"}, ${percentageHigh || "high"})`;
        case "POUT":
        case "FOUT":
            return `${functionName}(${varName}, ${percentageLow || "low"}, ${percentageHigh || "high"})`;
        default:
            return `${functionName}(${varName})`;
    }
};

// Calculation implementations for aggregate functions
export const calculateAggregateValue = (
    aggFunction: string,
    values: (string | number | null)[],
    options?: {
        percentageValue?: string,
        percentageLow?: string,
        percentageHigh?: string
    }
): number | string | null => {
    // Filter out null values and convert to numeric if needed
    const numericValues = values
        .filter(v => v !== null && v !== "")
        .map(v => typeof v === 'number' ? v : Number(v))
        .filter(v => !isNaN(v));

    try {
        switch (aggFunction) {
            case "MEAN":
                // Mean across cases
                return numericValues.length > 0
                    ? numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length
                    : null;

            case "SUM":
                // Sum across cases
                return numericValues.length > 0
                    ? numericValues.reduce((sum, val) => sum + val, 0)
                    : null;

            case "MEDIAN":
                // Median across cases
                if (numericValues.length > 0) {
                    const sortedValues = [...numericValues].sort((a, b) => a - b);
                    const mid = Math.floor(sortedValues.length / 2);
                    return sortedValues.length % 2 === 0
                        ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
                        : sortedValues[mid];
                }
                return null;

            case "STDDEV":
                // Standard deviation across cases
                if (numericValues.length > 1) {
                    const mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
                    const variance = numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (numericValues.length - 1); // Using n-1 for sample standard deviation
                    return Math.sqrt(variance);
                }
                return null;

            case "MIN":
                // Minimum value across cases
                return numericValues.length > 0 ? Math.min(...numericValues) : null;

            case "MAX":
                // Maximum value across cases
                return numericValues.length > 0 ? Math.max(...numericValues) : null;

            case "FIRST":
                // First nonmissing observed value in break group
                return values.find(v => v !== null && v !== "") ?? null;

            case "LAST":
                // Last nonmissing observed value in break group
                return [...values].reverse().find(v => v !== null && v !== "") ?? null;

            case "N":
                // Weighted number of cases in break group
                return values.filter(v => v !== null && v !== "").length;

            case "NU":
                // Unweighted number of cases in break group
                return values.length;

            case "NMISS":
                // Weighted number of missing cases
                return values.filter(v => v === null || v === "").length;

            case "NUMISS":
                // Unweighted number of missing cases (this is actually equal to NU - N)
                return values.filter(v => v === null || v === "").length;

            case "PGT":
                // Percentage of cases greater than the specified value
                if (numericValues.length > 0 && options?.percentageValue) {
                    const threshold = parseFloat(options.percentageValue);
                    const count = numericValues.filter(val => val > threshold).length;
                    return (count / numericValues.length) * 100;
                }
                return null;

            case "PLT":
                // Percentage of cases less than the specified value
                if (numericValues.length > 0 && options?.percentageValue) {
                    const threshold = parseFloat(options.percentageValue);
                    const count = numericValues.filter(val => val < threshold).length;
                    return (count / numericValues.length) * 100;
                }
                return null;

            case "PIN":
                // Percentage of cases between value1 and value2, inclusive
                if (numericValues.length > 0 && options?.percentageLow && options?.percentageHigh) {
                    const low = parseFloat(options.percentageLow);
                    const high = parseFloat(options.percentageHigh);
                    const count = numericValues.filter(val => val >= low && val <= high).length;
                    return (count / numericValues.length) * 100;
                }
                return null;

            case "POUT":
                // Percentage of cases not between value1 and value2
                if (numericValues.length > 0 && options?.percentageLow && options?.percentageHigh) {
                    const low = parseFloat(options.percentageLow);
                    const high = parseFloat(options.percentageHigh);
                    const count = numericValues.filter(val => val < low || val > high).length;
                    return (count / numericValues.length) * 100;
                }
                return null;

            case "FGT":
                // Fraction of cases greater than the specified value
                if (numericValues.length > 0 && options?.percentageValue) {
                    const threshold = parseFloat(options.percentageValue);
                    const count = numericValues.filter(val => val > threshold).length;
                    return count / numericValues.length;
                }
                return null;

            case "FLT":
                // Fraction of cases less than the specified value
                if (numericValues.length > 0 && options?.percentageValue) {
                    const threshold = parseFloat(options.percentageValue);
                    const count = numericValues.filter(val => val < threshold).length;
                    return count / numericValues.length;
                }
                return null;

            case "FIN":
                // Fraction of cases between value1 and value2, inclusive
                if (numericValues.length > 0 && options?.percentageLow && options?.percentageHigh) {
                    const low = parseFloat(options.percentageLow);
                    const high = parseFloat(options.percentageHigh);
                    const count = numericValues.filter(val => val >= low && val <= high).length;
                    return count / numericValues.length;
                }
                return null;

            case "FOUT":
                // Fraction of cases not between value1 and value2
                if (numericValues.length > 0 && options?.percentageLow && options?.percentageHigh) {
                    const low = parseFloat(options.percentageLow);
                    const high = parseFloat(options.percentageHigh);
                    const count = numericValues.filter(val => val < low || val > high).length;
                    return count / numericValues.length;
                }
                return null;

            case "COUNT":
                // Count of cases (similar to N but could be used differently)
                return values.filter(v => v !== null && v !== "").length;

            default:
                console.log(`Unrecognized function: ${aggFunction}`);
                return null;
        }
    } catch (error) {
        console.error(`Error calculating ${aggFunction}:`, error);
        return null;
    }
};