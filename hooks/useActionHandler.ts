// hooks/useActionHandler.ts
import { useModal } from "@/hooks/useModal";
import { useDataStore } from "@/stores/useDataStore";
import { useVariableStore } from "@/stores/useVariableStore";

export type ActionType =
    | "Undo"
    | "Redo"
    | "Cut"
    | "Copy"
    | "CopyWithVariableNames"
    | "CopyWithVariableLabels"
    | "Paste"
    | "PasteVariables"
    | "PasteWithVariableNames"
    | "Clear"
    | "InsertVariable"
    | "InsertCases"
    | "Save"
    | "New";

interface ActionPayload {
    actionType: ActionType;
}

function sanitizeVariableName(name: string): string {
    // Hapus spasi di awal dan akhir
    let sanitized = name.trim();
    // Hanya izinkan karakter yang valid: huruf, angka, dan underscore
    sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, "");
    // Pastikan nama diawali huruf
    if (!sanitized[0]?.match(/[a-zA-Z]/)) {
        sanitized = "V" + sanitized;
    }
    // Jika modul membatasi panjang (misalnya maksimal 8 karakter), terapkan slicing
    return sanitized.slice(0, 8);
}


export const useActionHandler = () => {
    const { openModal } = useModal();

    const handleAction = async ({ actionType }: ActionPayload) => {
        switch (actionType) {
            // ... kasus lain jika diperlukan
            case "Save":
                console.log("Executing Save action");

                // Ambil data dan variabel dari store
                const dataMatrix = useDataStore.getState().data;
                const variablesStore = useVariableStore.getState().variables;

                // --- Memangkas Data Matrix ---
                // Tentukan baris terakhir yang memiliki setidaknya satu cell tidak kosong
                const actualRowCount = dataMatrix.reduce((max, row, index) => {
                    return row.some(cell => String(cell).trim() !== "") ? index + 1 : max;
                }, 0);

                // Tentukan kolom terakhir yang memiliki setidaknya satu cell tidak kosong
                const actualColCount = dataMatrix.reduce((max, row) => {
                    const lastFilledIndex = row.reduce((last, cell, index) => {
                        return String(cell).trim() !== "" ? index : last;
                    }, -1);
                    return Math.max(max, lastFilledIndex + 1);
                }, 0);

                // Potong (trim) data matrix
                const trimmedDataMatrix = dataMatrix
                    .slice(0, actualRowCount)
                    .map(row => row.slice(0, actualColCount));


                // --- Filter Variabel yang Terisi ---
                // Hanya ambil variabel yang telah diisi (misal: name atau label tidak kosong)
                const filteredVariables = variablesStore.filter(
                    variable =>
                        String(variable.name).trim() !== "" ||
                        (variable.label && String(variable.label).trim() !== "")
                );

                // Transformasi variabel ke format yang akan dikirim ke backend
                const transformedVariables = filteredVariables.map(variable => ({
                    name: sanitizeVariableName(variable.name),
                    label: variable.label || "",
                    type: variable.type, // dikirim sebagai string, backend akan mengkonversi ke enum
                    width: variable.width,
                    decimal: variable.decimals,
                    alignment: variable.align, // backend akan menangani mapping ke enum yang sesuai
                    measure: variable.measure, // backend akan menangani mapping ke enum yang sesuai
                    columns: variable.columns,
                    columnIndex: variable.columnIndex,
                }));

                // Transformasi data matrix menjadi array objek dengan key sesuai nama variabel
                const transformedData = trimmedDataMatrix.map(row => {
                    const record: Record<string, string> = {};
                    filteredVariables.forEach(variable => {
                        if (variable.columnIndex < actualColCount) {
                            const key = variable.name || `VAR${variable.columnIndex}`;
                            record[key] = String(row[variable.columnIndex] || "");
                        }
                    });
                    return record;
                });

                try {
                    console.log("Sending data to backend for .sav file creation");
                    console.log("Variables:", transformedVariables);
                    console.log("Data:", transformedData);
                    const response = await fetch("http://localhost:5000/create-sav", {
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
                        throw new Error("Gagal membuat file .sav");
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
                console.warn("Unknown action:", actionType);
        }
    };

    return { handleAction };
};
