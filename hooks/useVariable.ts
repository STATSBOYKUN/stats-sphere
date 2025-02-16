export function getMaxIndex(dataVariables: any[], variables: any[], selectedVariables: string[]) {
    let maxIndex = -1;

    dataVariables.forEach((row, rowIndex) => {
        let hasData = false;
        for (const varName of selectedVariables) {
            const varDef = variables.find((v) => v.name === varName);
            if (!varDef) continue;
            const rawValue = row[varDef.columnIndex];
            if (rawValue !== null && rawValue !== "") {
                hasData = true;
                break;
            }
        }
        if (hasData) maxIndex = rowIndex;
    });

    if (maxIndex < 0) maxIndex = 0;
    return maxIndex;
}

export function getSlicedData(
    dataVariables: any[],
    variables: any[],
    selectedVariables: string[] | string | null
) {
    if (!selectedVariables) return [];

    const names = Array.isArray(selectedVariables) ? selectedVariables : [selectedVariables];
    const maxIndex = getMaxIndex(dataVariables, variables, names);

    const newSlicedData: Record<string, string | number | null>[] = [];

    for (let i = 0; i <= maxIndex; i++) {
        const row = dataVariables[i];
        const rowObj: Record<string, string | number | null> = {};

        names.forEach((varName) => {
            const varDef = variables.find((v) => v.name === varName);
            if (!varDef) return;
            const rawValue = row[varDef.columnIndex];
            const num = parseFloat(rawValue);
            rowObj[varName] = isNaN(num) ? (rawValue === "" ? null : rawValue) : num;
        });

        newSlicedData.push(rowObj);
    }

    return newSlicedData;
}

export function getVarDefs(variables: any[], selectedVariables: string[] | string | null) {
    if (!selectedVariables) return [];

    const names = Array.isArray(selectedVariables) ? selectedVariables : [selectedVariables];

    const newVarDefs = names.map((varName) => {
        const varDef = variables.find((v) => v.name === varName);
        return {
            name: varDef?.name ?? "",
            type: varDef?.type ?? "",
            label: varDef?.label ?? "",
            values: varDef?.values ?? "",
            missing: varDef?.missing ?? "",
            measure: varDef?.measure ?? "",
        };
    });

    return newVarDefs;
}
