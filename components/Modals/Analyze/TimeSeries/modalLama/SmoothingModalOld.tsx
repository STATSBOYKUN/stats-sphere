import React, { useState, useEffect, FC} from "react";
import { CornerDownLeft, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";  
import { Label } from "@/components/ui/label";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
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
interface SmoothingModalProps {
    onClose: () => void;
}

type RawData = string[][];

const SmoothingModal: React.FC<SmoothingModalProps> = ({ onClose }) => {
    const methodQuestions: Record<string, string[]> = {
        "Single Moving Average": ["Number of Periods"],
        "Double Moving Average": ["Number of Periods"],
        "Single Exponential Smoothing": ["Exponentially Smoothed"],
        "Brown's Method Exponential Smoothing": ["Exponentially Smoothed", "Trend"],
        "Holt's Method Exponential Smoothing": ["Exponentially Smoothed", "Trend"],
        "Winter's Method Exponential Smoothing": ["Exponentially Smoothed", "Trend", "Seasonality"],
    };
    const defaultLimits: Record<string, string> = {
        "Exponentially Smoothed": "0 < Alpha < 1",
        "Trend": "0 < Beta < 1",
        "Seasonality": "0 < Gamma < 1",
        "Number of Periods": "3 < Move < 9",
    };
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [selectedSave, setSelectedSave] = useState<string | null>(null);
    const questions = selectedMethod ? methodQuestions[selectedMethod] || [] : [];

    const handleSelectedMethod = (value: string) => {
        setSelectedMethod(value);
        setSelectedSave('selected');
    };

    const handleReset = () => {
        setSelectedMethod(null);
        setSelectedSave(null);
    };

    const [availableVariables, setAvailableVariables] = useState<string[]>([]);
    const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
    const [highlightedVariable, setHighlightedVariable] = useState<string | null>(null);
    const [isCalculating, setIsCalculating] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const variables = useVariableStore((state) => state.variables) as VariableDef[];
    const data = useDataStore((state) => state.data) as RawData;
    const { addLog, addAnalytic, addStatistic } = useResultStore();

    useEffect(() => {
        setAvailableVariables(variables.map((v) => v.name));
    }, [variables]);

    const handleSelectLeft = (variable: string) => {
        if (highlightedVariable === variable) {
            setSelectedVariables((prev) => [...prev, variable]);
            setAvailableVariables((prev) => prev.filter((item) => item !== variable));
            setHighlightedVariable(null);
        } else {
            setHighlightedVariable(variable);
        }
    };

    const handleDeselectRight = (variable: string) => {
        if (highlightedVariable === variable) {
            setAvailableVariables((prev) => [...prev, variable]);
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
                setAvailableVariables((prev) =>
                    prev.filter((item) => item !== highlightedVariable)
                );
            } else if (selectedVariables.includes(highlightedVariable)) {
                setAvailableVariables((prev) => [...prev, highlightedVariable]);
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

            // 
            const worker = new Worker("/workers/Frequencies/index.js");
            worker.onmessage = async (e: MessageEvent) => {
                const wData = e.data;
                if (wData.success) {
                    try {
                        // Digunakan untuk menyimpan log dan hasil
                        // Simpan log & hasil
                        const logMsg = `FREQUENCIES VARIABLES=${selectedVariables.join(", ")}`;
                        const logId = await addLog({ log: logMsg }); //String
                        const analyticId = await addAnalytic({
                            log_id: logId,
                            title: "Frequencies",
                            note: "",
                        });

                        // Menyimpan Statistik
                        if (wData.descriptive) {
                            await addStatistic({
                                analytic_id: analyticId,
                                title: "Statistics",
                                output_data: wData.descriptive,
                                components: "Descriptive Statistics",
                            });
                        }

                        // Menyimpan Statistik
                        if (wData.frequencies) {
                            wData.frequencies.forEach(
                                async (freqData: string, i: number) => {
                                    await addStatistic({
                                        analytic_id: analyticId, //number
                                        title: `${selectedVariables[i]}`, //String
                                        output_data: freqData, //String
                                        components: "Frequency Table", //String
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
    <DialogContent className="max-w-[75vw] max-h-[90vh] flex flex-col space-y-0 overflow-y-auto">
        <div className="pb-4 ml-4">
            <DialogHeader>
                <DialogTitle className="font-bold text-2xl">Smoothing</DialogTitle>
                <DialogDescription></DialogDescription>
            </DialogHeader>
        </div>

        {/* Awal Fitur Content */}
        <div className="flex items-center justify-center">
            <div className="flex md:flex-row flex-col gap-4">
                {/* Kolom 1 */}
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

                {/* Kolom 2 */}
                <div className="flex flex-col gap-4">
                    {/* Variabel yang Digunakan */}
                    <div className="flex flex-row gap-4">
                    </div>

                    {/* Sumbu X */}
                    <div className="flex flex-row gap-4 h-[100px]">
                    </div>
                </div>
                    
                {/* Kolom 3 */}
                <div className="flex flex-col gap-4">
                    {/* Baris 1 */}
                    <div className="border-2 rounded-md w-[420px]">
                        <div className="w-full p-2 border-0 rounded-t-md flex flex-row gap-4 mt-2">
                            <div className="flex items-center ml-2">
                                <Label className="font-bold">Methods:</Label>
                            </div>
                            <Select onValueChange={(value) => handleSelectedMethod(value)}>
                                <SelectTrigger className="mr-2">
                                    <SelectValue placeholder="Choose Your Method">
                                        {selectedMethod || "Choose Your Method"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Single Moving Average">Single Moving Average</SelectItem>
                                    <SelectItem value="Double Moving Average">Double Moving Average</SelectItem>
                                    <SelectItem value="Single Exponential Smoothing">Single Exponential Smoothing</SelectItem>
                                    <SelectItem value="Brown's Method Exponential Smoothing">Brown's Method  Exponential Smoothing</SelectItem>
                                    <SelectItem value="Holt's Method Exponential Smoothing">Holt's Method Exponential Smoothing</SelectItem>
                                    <SelectItem value="Winter's Method Exponential Smoothing">Winter's Method Exponential Smoothing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2 p-2 ml-4">
                            {questions.map((question, index) => (
                            <div key={index} className="flex flex-row gap-4">
                                <div className="flex items-center">
                                    <Label>{question}</Label>
                                </div>
                                <Input type="number" className="w-[80px]" 
                                    placeholder={question != "Number of Periods" ? "0.1" : "3"} 
                                    min={question != "Number of Periods" ? "0.1" : "3"} 
                                    max={question != "Number of Periods" ? "0.9" : "9"} 
                                    step={question != "Number of Periods" ? "0.1" : "2"}
                                />
                                <div className="flex items-center">
                                    <Label>{defaultLimits[question]}</Label>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>

                    {/* Baris 2 */}
                    <div>
                        <div className="border-2 rounded-md w-[420px] pl-2 pt-2 pb-4 flex flex-col gap-2">
                            <div className="ml-2">
                                <Label className="font-bold">Save:</Label>
                            </div>
                            <div className="flex flex-row gap-2 ml-8">
                                <Checkbox 
                                    checked={selectedSave !== null} 
                                    onCheckedChange={(isChecked) => setSelectedSave(isChecked ? "selected" : null)}
                                />
                                <Label>Save Smoothing Result as Variable</Label>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        {/* Akhir Fitur Content */}

        <div className="flex justify-center pt-4">
            <DialogFooter>
                <Button variant="outline" onClick={onClose}> Cancel </Button>
                <Button variant="outline" onClick={handleReset}> Reset </Button>
                <Button variant="outline"onClick={handleAnalyze} disabled={isCalculating}>
                    {isCalculating ? "Calculating..." : "OK"}
                </Button>
            </DialogFooter>
        </div>
        
    </DialogContent>
  );
};

export default SmoothingModal;