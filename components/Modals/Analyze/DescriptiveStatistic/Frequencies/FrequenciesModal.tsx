"use client";
import React, { useState, useEffect, FC } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CornerDownLeft, CornerDownRight } from "lucide-react";
import { useVariableStore } from "@/stores/useVariableStore";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";

interface VariableDef {
    name: string;
    columnIndex: number;
    type: string;
    label: string;
    values: string;
    missing: string;
    measure: string;
}

interface FrequenciesModalProps {
    onClose: () => void;
}

type RawData = string[][];

const FrequenciesModal: FC<FrequenciesModalProps> = ({ onClose }) => {
    const [availableVariables, setLeftVariables] = useState<string[]>([]);
    const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
    const [highlightedVariable, setHighlightedVariable] = useState<string | null>(
        null
    );
    const [isCalculating, setIsCalculating] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const variables = useVariableStore((state) => state.variables) as VariableDef[];
    const data = useDataStore((state) => state.data) as RawData;
    const { addLog, addAnalytic, addStatistic } = useResultStore();

    useEffect(() => {
        setLeftVariables(variables.map((v) => v.name));
    }, [variables]);

    const handleSelectLeft = (variable: string) => {
        if (highlightedVariable === variable) {
            setSelectedVariables((prev) => [...prev, variable]);
            setLeftVariables((prev) => prev.filter((item) => item !== variable));
            setHighlightedVariable(null);
        } else {
            setHighlightedVariable(variable);
        }
    };

    const handleDeselectRight = (variable: string) => {
        if (highlightedVariable === variable) {
            setLeftVariables((prev) => [...prev, variable]);
            setSelectedVariables((prev) => prev.filter((item) => item !== variable));
            setHighlightedVariable(null);
        } else {
            setHighlightedVariable(variable);
        }
    };

    const handleMoveVariable = () => {
        if (highlightedVariable) {
            if (availableVariables.includes(highlightedVariable)) {
                setSelectedVariables((prev) => [...prev, highlightedVariable]);
                setLeftVariables((prev) =>
                    prev.filter((item) => item !== highlightedVariable)
                );
            } else if (selectedVariables.includes(highlightedVariable)) {
                setLeftVariables((prev) => [...prev, highlightedVariable]);
                setSelectedVariables((prev) =>
                    prev.filter((item) => item !== highlightedVariable)
                );
            }
            setHighlightedVariable(null);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedVariables.length) {
            setErrorMsg("Please select at least one variable.");
            return;
        }
        setErrorMsg(null);
        setIsCalculating(true);

        try {
            // Cari baris data terakhir yang masih berisi
            let maxIndex = -1;
            data.forEach((row, rowIndex) => {
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

            // Potong data sampai maxIndex
            const slicedData: Record<string, string | number | null>[] = [];
            for (let i = 0; i <= maxIndex; i++) {
                const row = data[i];
                const rowObj: Record<string, string | number | null> = {};
                selectedVariables.forEach((varName) => {
                    const varDef = variables.find((v) => v.name === varName);
                    if (!varDef) return;
                    const rawValue = row[varDef.columnIndex];
                    const num = parseFloat(rawValue);
                    rowObj[varName] = isNaN(num) ? (rawValue === "" ? null : rawValue) : num;
                });
                slicedData.push(rowObj);
            }

            // Definisi variabel terpilih
            const varDefs = selectedVariables.map((varName) => {
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

            // Panggil worker universal
            const worker = new Worker("/workers/Frequencies/index.js");
            worker.onmessage = async (e: MessageEvent) => {
                const wData = e.data;
                if (wData.success) {
                    try {
                        // Simpan log & hasil
                        const logMsg = `FREQUENCIES VARIABLES=${selectedVariables.join(", ")}`;
                        const logId = await addLog({ log: logMsg });
                        const analyticId = await addAnalytic({
                            log_id: logId,
                            title: "Frequencies",
                            note: "",
                        });
                        if (wData.descriptive) {
                            await addStatistic({
                                analytic_id: analyticId,
                                title: "Statistics",
                                output_data: wData.descriptive,
                                components: "Descriptive Statistics",
                            });
                        }
                        if (wData.frequencies) {
                            wData.frequencies.forEach(
                                async (freqData: string, i: number) => {
                                    await addStatistic({
                                        analytic_id: analyticId,
                                        title: `${selectedVariables[i]}`,
                                        output_data: freqData,
                                        components: "Frequency Table",
                                    });
                                }
                            );
                        }
                        setIsCalculating(false);
                        onClose();
                    } catch (err) {
                        console.error(err);
                        setErrorMsg("Error saving results.");
                        setIsCalculating(false);
                    }
                } else {
                    setErrorMsg(wData.error || "Worker returned an error.");
                    setIsCalculating(false);
                }
            };

            worker.onerror = (event) => {
                console.error("Worker error:", event);
                setIsCalculating(false);
                setErrorMsg("Worker error occurred. Check console for details.");
            };

            // Kirim data + action
            worker.postMessage({
                action: "FREQUENCIES",
                data: slicedData,
                variables: varDefs,
            });
        } catch (ex) {
            console.error(ex);
            setErrorMsg("Something went wrong.");
            setIsCalculating(false);
        }
    };

    return (
        <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
                <DialogTitle>Frequencies</DialogTitle>
            </DialogHeader>
            <Separator className="my-0" />
            <div className="grid grid-cols-9 gap-2 py-2">
                <div className="col-span-3 flex flex-col border p-4 rounded-md max-h-[300px] overflow-y-auto">
                    <label className="font-semibold">Available Variables</label>
                    <div className="space-y-2">
                        {availableVariables.map((variable) => (
                            <div
                                key={variable}
                                className={`p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${
                                    highlightedVariable === variable
                                        ? "bg-blue-100 border-blue-500"
                                        : "border-gray-300"
                                }`}
                                onClick={() => handleSelectLeft(variable)}
                            >
                                {variable}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-span-1 flex flex-col items-center justify-center space-y-10">
                    <Button
                        variant="link"
                        onClick={handleMoveVariable}
                        disabled={!highlightedVariable}
                    >
                        {highlightedVariable && availableVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} />
                        ) : highlightedVariable &&
                        selectedVariables.includes(highlightedVariable) ? (
                            <CornerDownLeft size={24} />
                        ) : (
                            <CornerDownLeft size={24} />
                        )}
                    </Button>
                </div>
                <div className="col-span-3 flex flex-col border p-4 rounded-md max-h-[300px] overflow-y-auto">
                    <label className="font-semibold">Selected Variables</label>
                    <div className="space-y-2">
                        {selectedVariables.map((variable) => (
                            <div
                                key={variable}
                                className={`p-2 border cursor-pointer rounded-md hover:bg-blue-100 ${
                                    highlightedVariable === variable
                                        ? "bg-blue-100 border-blue-500"
                                        : "border-gray-300"
                                }`}
                                onClick={() => handleDeselectRight(variable)}
                            >
                                {variable}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-span-2 flex flex-col justify-start space-y-4 p-4">
                    <Button variant="outline" disabled>
                        Statistics
                    </Button>
                    <Button variant="outline" disabled>
                        Charts
                    </Button>
                </div>
            </div>
            {errorMsg && <div className="text-red-600 mb-2">{errorMsg}</div>}
            <DialogFooter className="flex justify-center space-x-4">
                <Button onClick={handleAnalyze} disabled={isCalculating}>
                    {isCalculating ? "Calculating..." : "OK"}
                </Button>
                <Button variant="outline" disabled={isCalculating}>
                    Paste
                </Button>
                <Button variant="outline" disabled={isCalculating}>
                    Reset
                </Button>
                <Button variant="outline" onClick={onClose} disabled={isCalculating}>
                    Cancel
                </Button>
                <Button variant="outline" disabled={isCalculating}>
                    Help
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default FrequenciesModal;
