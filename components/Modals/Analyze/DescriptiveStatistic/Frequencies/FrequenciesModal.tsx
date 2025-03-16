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
import { useResultStore } from "@/stores/useResultStore";
import type { Variable } from "@/types/Variable";

interface FrequenciesModalProps {
    onClose: () => void;
}

type RawData = string[][];

const FrequenciesModal: FC<FrequenciesModalProps> = ({ onClose }) => {
    const [availableVariables, setLeftVariables] = useState<string[]>([]);
    const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
    const [highlightedVariable, setHighlightedVariable] = useState<string | null>(null);
    const [isCalculating, setIsCalculating] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const variables = useVariableStore.getState().variables as Variable[];
    const { addLog, addAnalytic, addStatistic } = useResultStore();

    // Initialize available variables on component mount
    useEffect(() => {
        const varNames = variables.map(v => v.name);
        setLeftVariables(varNames);
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
            // 1. Prepare variable data using useDataStore's getVariableData
            const variableDataPromises = [];
            for (const varName of selectedVariables) {
                const varDef = variables.find((v) => v.name === varName);
                if (!varDef) continue;
                variableDataPromises.push(useDataStore.getState().getVariableData(varDef));
            }
            const variableData = await Promise.all(variableDataPromises);

            // 2. Create worker and set up handlers
            const worker = new Worker("/workers/Frequencies/index.js");

            // Set a timeout to prevent worker hanging
            const timeoutId = setTimeout(() => {
                worker.terminate();
                setErrorMsg("Analysis timed out. Please try again with fewer variables.");
                setIsCalculating(false);
            }, 60000); // 60 second timeout

            worker.onmessage = async (e) => {
                clearTimeout(timeoutId);
                const wData = e.data;

                if (wData.success) {
                    try {
                        // Save results to database
                        const logMsg = `FREQUENCIES VARIABLES=${selectedVariables.join(", ")}`;
                        const logId = await addLog({ log: logMsg });

                        const analyticId = await addAnalytic(logId, {
                            title: "Frequencies",
                            note: ""
                        });

                        if (wData.descriptive) {
                            await addStatistic(analyticId, {
                                title: "Statistics",
                                output_data: wData.descriptive,
                                components: "Descriptive Statistics",
                                description: ""
                            });
                        }

                        if (wData.frequencies) {
                            for (let i = 0; i < wData.frequencies.length; i++) {
                                await addStatistic(analyticId, {
                                    title: `${selectedVariables[i]}`,
                                    output_data: wData.frequencies[i],
                                    components: "Frequency Table",
                                    description: ""
                                });
                            }
                        }

                        setIsCalculating(false);
                        worker.terminate();
                        onClose();
                    } catch (err) {
                        console.error(err);
                        setErrorMsg("Error saving results.");
                        setIsCalculating(false);
                        worker.terminate();
                    }
                } else {
                    setErrorMsg(wData.error || "Worker returned an error.");
                    setIsCalculating(false);
                    worker.terminate();
                }
            };

            worker.onerror = (event) => {
                clearTimeout(timeoutId);
                console.error("Worker error:", event);
                setIsCalculating(false);
                setErrorMsg("Worker error occurred. Check console for details.");
                worker.terminate();
            };

            // 3. Send data to worker - using the new format with variableData
            worker.postMessage({
                action: "FULL_ANALYSIS",  // Get both descriptive and frequency results
                variableData: variableData
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