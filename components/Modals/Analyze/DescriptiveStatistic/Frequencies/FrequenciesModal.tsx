// components/Modals/FrequenciesModal.tsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CornerDownLeft, CornerDownRight } from "lucide-react";
import { useDescriptiveStatistics } from "@/hooks/useDescriptiveStatistics"; // Import hook statistik
import { useVariableStore } from "@/stores/useVariableStore"; // Import store variabel
import useResultStore from "@/stores/useResultStore"; // Import store statistik
import { Statistic } from "@/lib/db";

interface FrequenciesModalProps {
    onClose: () => void;
}

const FrequenciesModal: React.FC<FrequenciesModalProps> = ({ onClose }) => {
    const [leftVariables, setLeftVariables] = useState<string[]>([]);
    const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
    const [highlightedVariable, setHighlightedVariable] = useState<string | null>(null);

    const { calculateFrequencies, calculateCompleteStatisticsForAll, getVariableByColumnIndex } = useDescriptiveStatistics();
    const variables = useVariableStore((state) => state.variables);
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
            if (leftVariables.includes(highlightedVariable)) {
                setSelectedVariables((prev) => [...prev, highlightedVariable]);
                setLeftVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            } else if (selectedVariables.includes(highlightedVariable)) {
                setLeftVariables((prev) => [...prev, highlightedVariable]);
                setSelectedVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            }
            setHighlightedVariable(null);
        }
    };

    const handleAnalyze = async () => {
        try {
            // 1. Menambahkan log frekuensi
            const logMessage = `FREQUENCIES VARIABLES=${selectedVariables.join(", ")} /ORDER=ANALYSIS.`;
            const log = { log: logMessage };
            const logId = await addLog(log);

            // 2. Menambahkan Analitik terkait dengan log
            const analytic = {
                title: "Frequencies",
                log_id: logId,
                note: "",
            };
            const analyticId = await addAnalytic(analytic);

            // 3. Menambahkan statistik lengkap untuk semua variabel numerik
            const columnIndices = selectedVariables.map(variableName => {
                const variable = variables.find(v => v.name === variableName);
                return variable ? variable.columnIndex : -1;
            }).filter(index => index !== -1) as number[];

            const completeStatistics = calculateCompleteStatisticsForAll(columnIndices);
            if (Object.keys(completeStatistics).length > 0) {
                const completeStatsStat: Omit<Statistic, 'id'> = {
                    analytic_id: analyticId,
                    title: "Statistics",
                    output_data: JSON.stringify(completeStatistics), // Serialize complete statistics
                    components: "Frequency",
                };
                await addStatistic(completeStatsStat);
            }

            // 4. Menambahkan statistik untuk tabel frekuensi tiap variabel
            for (const variableName of selectedVariables) {
                const variable = variables.find((v) => v.name === variableName);
                if (variable) {
                    const { frequencies, valid, missing } = calculateFrequencies(variable.columnIndex);
                    const frequencyData = Object.entries(frequencies).map(([key, value]) => ({
                        Frequency: key,
                        Percent: parseFloat(((value / valid) * 100).toFixed(1)),
                        "Valid Percent": parseFloat(((value / valid) * 100).toFixed(1)),
                        "Cumulative Percent": 0, // Akan dihitung nanti
                    }));

                    // Menghitung Cumulative Percent
                    let cumulative = 0;
                    frequencyData.forEach((item) => {
                        cumulative += item.Percent;
                        item["Cumulative Percent"] = parseFloat(cumulative.toFixed(1));
                    });

                    // Menambahkan baris Total
                    frequencyData.push({
                        Frequency: "Total",
                        Percent: 100.0,
                        "Valid Percent": 100.0,
                        "Cumulative Percent": "",
                    });

                    const stat = {
                        analytic_id: analyticId,
                        title: variableName,
                        output_data: JSON.stringify({
                            Frequency: frequencyData.map(fd => ({
                                Frequency: fd.Frequency,
                                Percent: fd.Percent,
                                "Valid Percent": fd["Valid Percent"],
                                "Cumulative Percent": fd["Cumulative Percent"],
                            })),
                            Total: {
                                Frequency: valid,
                                Percent: 100.0,
                                "Valid Percent": 100.0,
                                "Cumulative Percent": "",
                            },
                        }), // Serialize frequency table
                        output_type: "table",
                        components: "FrequencyTable",
                    };
                    await addStatistic(stat);
                }
            }

            onClose();
        } catch (error) {
            console.error('Failed to analyze frequencies:', error);
        }
    };

    const handleClose = () => {
        onClose();
    };

    const descriptionId = "frequencies-modal-description"; // ID unik untuk deskripsi

    return (
        <DialogContent className="sm:max-w-[700px]" aria-describedby={descriptionId}>
            <DialogHeader>
                <DialogTitle>Frequencies</DialogTitle>
            </DialogHeader>

            <Separator className="my-0" />

            <p id={descriptionId} className="sr-only">
                Modal ini digunakan untuk menghitung frekuensi dan statistik variabel yang dipilih.
            </p>

            <div className="grid grid-cols-9 gap-2 py-2">
                <div className="col-span-3 flex flex-col border p-4 rounded-md max-h-[300px] overflow-y-auto">
                    <label className="font-semibold">Available Variables</label>
                    <div className="space-y-2">
                        {leftVariables.map((variable) => (
                            <div
                                key={variable}
                                className={`p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${highlightedVariable === variable ? "bg-blue-100 border-blue-500" : "border-gray-300"}`}
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
                        {highlightedVariable && leftVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} />
                        ) : highlightedVariable && selectedVariables.includes(highlightedVariable) ? (
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
                                className={`p-2 border cursor-pointer rounded-md hover:bg-blue-100 ${highlightedVariable === variable ? "bg-blue-100 border-blue-500" : "border-gray-300"}`}
                                onClick={() => handleDeselectRight(variable)}
                            >
                                {variable}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-span-2 flex flex-col justify-start space-y-4 p-4">
                    <Button variant="outline">Statistics</Button>
                    <Button variant="outline">Charts</Button>
                    {/*<Button variant="outline">Format</Button>*/}
                    {/*<Button variant="outline">Style</Button>*/}
                    {/*<Button variant="outline">Bootstrap</Button>*/}
                </div>
            </div>

            <DialogFooter className="flex justify-center space-x-4">
                <Button onClick={handleAnalyze}>OK</Button>
                <Button variant="outline">Paste</Button>
                <Button variant="outline">Reset</Button>
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button variant="outline">Help</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default FrequenciesModal;
