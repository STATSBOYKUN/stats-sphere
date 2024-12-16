import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";  
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";

interface SmoothingModalProps {
  onClose: () => void;
}

const SmoothingModal: React.FC<SmoothingModalProps> = ({ onClose }) => {
    const [availableVariables, setAvailableVariables] = useState<string[]>([ 
        "PDB",
        "Nilai_Tukar_Petani",
        "Inflasi",
        "YEAR",
        "MONTH",
        "Date",
    ]);
    const [usedVariables, setUsedVariables] = useState<string[]>([]);
    const [xAxisVariables, setXAxisVariables] = useState<string[]>([]);
    const [selectedVariable, setSelectedVariable] = useState<string | null>(null);

    const handleSelectVariable = (variable: string) => {
        setSelectedVariable(variable);
    };

    const handleAddToUsedVariables = () => {
        if (selectedVariable) {
            setUsedVariables([...usedVariables, selectedVariable]);
            setAvailableVariables(availableVariables.filter((v) => v !== selectedVariable));
            setSelectedVariable(null);
        }
    };
    
    const handleAddToXAxis = () => {
        if (selectedVariable && xAxisVariables.length === 0) {
        setXAxisVariables([selectedVariable]);
        setAvailableVariables(availableVariables.filter((v) => v !== selectedVariable));
        setSelectedVariable(null);
        } else {
        alert("X-Axis can only contain one variable.");
        }
    };
  
    const handleRemoveVariable = (variable: string, target: "used" | "xAxis") => {
        if (target === "used") {
        setUsedVariables(usedVariables.filter((v) => v !== variable));
        } else if (target === "xAxis") {
        setXAxisVariables([]);
        }
        setAvailableVariables([...availableVariables, variable]);
    };

    const handleReset = () => {
        setAvailableVariables([
            "PDB",
            "Nilai_Tukar_Petani",
            "Inflasi",
            "YEAR",
            "MONTH",
            "Date",
        ]);
        setUsedVariables([])
        setXAxisVariables([]);
        setSelectedVariable(null);
        setSelectedMethod(null);
        setSelectedSave(null);
    };

    // State untuk menyimpan metode yang dipilih
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    // Data untuk setiap metode (dinamis)
    const methodQuestions: Record<string, string[]> = {
        "Single Moving Average": ["Number of Periods"],
        "Double Moving Average": ["Number of Periods"],
        "Single Exponential Smoothing": ["Exponentially Smoothed"],
        "Brown's Method Exponential Smoothing": ["Exponentially Smoothed", "Trend"],
        "Holt's Method Exponential Smoothing": ["Exponentially Smoothed", "Trend"],
        "Winter's Method Exponential Smoothing": ["Exponentially Smoothed", "Trend", "Seasonality"],
    };

    // Default valueLimit untuk setiap pertanyaan
    const defaultLimits: Record<string, string> = {
        "Exponentially Smoothed": "0 < Alpha < 1",
        "Trend": "0 < Beta < 1",
        "Seasonality": "0 < Gamma < 1",
        "Number of Periods": "3 < Move < 9",
    };

    // Ambil pertanyaan berdasarkan metode yang dipilih
    const questions = selectedMethod ? methodQuestions[selectedMethod] || [] : [];

    const [selectedSave, setSelectedSave] = useState<string | null>(null);

    const handleSelectedMethod = (value: string) => {
        setSelectedMethod(value);
        setSelectedSave('selected');
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
                <div>
                    <div className="border-2 rounded-md w-[200px]">
                        <div className="font-bold bg-gray-400 w-full p-2 border-0 rounded-t-md text-center">Variable Available</div>
                        <ul className="p-2 h-[300px] overflow-y-auto">
                            {availableVariables.map((variable) => (
                                <li key={variable} onClick={() => handleSelectVariable(variable)}
                                className="flex justify-start gap-2 items-center p-1 hover:bg-gray-100 cursor-pointer hover:rounded-md">
                                <Checkbox checked={selectedVariable === variable}/> {variable}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Kolom 2 */}
                <div className="flex flex-col gap-4">
                    {/* Variabel yang Digunakan */}
                    <div className="flex flex-row gap-4">
                        <div className="flex items-center">
                            <Button onClick={handleAddToUsedVariables} disabled={!selectedVariable}>Add</Button>
                        </div>
                        <div>
                            <div className="border-2 rounded-md w-[200px]">
                                <div className="font-bold bg-gray-400 w-full p-2 border-0 rounded-t-md text-center">Used Variables:</div>
                                <ul className="border rounded-md p-2 h-[180px] overflow-y-auto">
                                {usedVariables.map((variable) => (
                                    <li key={variable} className="flex justify-start items-center p-1 hover:bg-gray-100 hover:rounded-md">
                                    {variable}
                                    <Button variant="outline" size="sm" 
                                        className="p-3 ml-2"
                                        onClick={() => handleRemoveVariable(variable, "used")}>
                                        <img src="/icon/close.png" alt="remove" width={"8px"}/>
                                    </Button>
                                    </li>
                                ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Sumbu X */}
                    <div className="flex flex-row gap-4 h-[100px]">
                        <div className="flex items-center">
                            <Button onClick={handleAddToXAxis} disabled={!selectedVariable || xAxisVariables.length > 0}>Add</Button>
                        </div>
                        <div>
                            <div className="border-2 rounded-md w-[200px]">
                                <div className="font-bold bg-gray-400 w-full p-2 border-0 rounded-t-md text-center">X-Axis:</div>
                                <ul className="border rounded-md p-2 h-[60px]">
                                {xAxisVariables.map((variable) => (
                                    <li key={variable} className="flex justify-start items-center p-1 hover:bg-gray-100 hover:rounded-md">
                                    {variable}
                                    <Button variant="outline" size="sm" 
                                        className="p-3 ml-2"
                                        onClick={() => handleRemoveVariable(variable, "xAxis")}>
                                        <img src="/icon/close.png" alt="remove" width={"8px"}/>
                                    </Button>
                                    </li>
                                ))}
                                </ul>
                            </div>
                        </div>
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
                <Button variant="outline">OK</Button>
            </DialogFooter>
        </div>
        
    </DialogContent>
  );
};

export default SmoothingModal;