// hooks/fileActions.ts
import { useModal } from "@/hooks/useModal";
import { useDataStore } from "@/stores/useDataStore";
import { useVariableStore } from "@/stores/useVariableStore";

export type FileActionType =
    | "Save";

interface FileActionPayload {
    actionType: FileActionType;
}

export const useFileActions = () => {
    const { openModal } = useModal();

    const handleAction = async ({ actionType }: FileActionPayload) => {
        switch (actionType) {
            case "Save":
                const dataMatrix = useDataStore.getState().data;
                const variablesStore = useVariableStore.getState().variables;

                const actualRowCount = dataMatrix.reduce((max, row, index) => {
                    return row.some(cell => String(cell).trim() !== "") ? index + 1 : max;
                }, 0);

                const actualColCount = dataMatrix.reduce((max, row) => {
                    const lastFilledIndex = row.reduce((last: number, cell, index) => {
                        return String(cell).trim() !== "" ? index : last;
                    }, -1);
                    return Math.max(max, lastFilledIndex + 1);
                }, 0);

                const trimmedDataMatrix = dataMatrix
                    .slice(0, actualRowCount)
                    .map(row => row.slice(0, actualColCount));

                const filteredVariables = variablesStore.filter(
                    variable =>
                        String(variable.name).trim() !== "" ||
                        (variable.label && String(variable.label).trim() !== "")
                );

                const sanitizeVariableName = (name: string) => {
                    let sanitized = name.trim();

                    if (!/^[a-zA-Z]/.test(sanitized)) {
                        sanitized = "V" + sanitized;
                    }

                    sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, "_");

                    if (sanitized.length > 64) {
                        sanitized = sanitized.substring(0, 64);
                    }

                    return sanitized;
                };

                const transformedVariables = filteredVariables.map(variable => {
                    const name = sanitizeVariableName(variable.name || `VAR${variable.columnIndex}`);

                    const valueLabels = Array.isArray(variable.values) ?
                        variable.values.map(vl => ({
                            value: vl.value,
                            label: vl.label || ""
                        })) : [];

                    return {
                        name,
                        label: variable.label || "",
                        type: variable.type,
                        width: variable.width,
                        decimal: variable.decimals,
                        alignment: variable.align.toLowerCase(),
                        measure: variable.measure.toLowerCase(),
                        columns: variable.columns,
                        valueLabels
                    };
                });

                const transformedData = trimmedDataMatrix.map(row => {
                    const record: Record<string, any> = {};
                    filteredVariables.forEach(variable => {
                        if (variable.columnIndex !== undefined && variable.columnIndex < actualColCount) {
                            const name = sanitizeVariableName(variable.name || `VAR${variable.columnIndex}`);
                            record[name] = row[variable.columnIndex];
                        }
                    });
                    return record;
                });

                console.log(transformedVariables);
                try {
                    const response = await fetch("http://localhost:5000/api/sav/create", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            data: transformedData,
                            variables: transformedVariables,
                        }),
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error("Server error response:", errorText);
                        throw new Error(errorText || "Gagal membuat file .sav");
                    }

                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "data.sav";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                } catch (error) {
                    console.error("Error during save action:", error);
                    openModal("Terjadi kesalahan saat menyimpan file .sav.");
                }
                break;
            default:
                console.warn("Unknown file action:", actionType);
        }
    };

    return { handleAction };
};