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

interface AutocorrelationModalProps {
  onClose: () => void;
}

const AutocorrelationModal: React.FC<AutocorrelationModalProps> = ({ onClose }) => {
    const [availableVariables, setAvailableVariables] = useState<string[]>([ 
        "PDB",
        "Nilai_Tukar_Petani",
        "Inflasi",
        "YEAR",
        "MONTH",
        "Date",
    ]);
    const [usedVariable, setUsedVariable] = useState<string[]>([]);
    const [selectedVariable, setSelectedVariable] = useState<string | null>(null);

    const handleSelectVariable = (variable: string) => {
        setSelectedVariable(variable);
    };

    const handleAddToUsedVariable = () => {
        if (selectedVariable && usedVariable.length === 0) {
        setUsedVariable([selectedVariable]);
        setAvailableVariables(availableVariables.filter((v) => v !== selectedVariable));
        setSelectedVariable(null);
        } else {
        alert("Used variable can only contain one variable.");
        }
    };
  
    const handleRemoveVariable = (variable: string, target: "used") => {
        if (target === "used") {
            setUsedVariable(usedVariable.filter((v) => v !== variable));
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
        setUsedVariable([])
        setSelectedVariable(null);
        setSelectedSave(null);
        setSelectedTrend(null);
        setSelectedLevel(null);
        setSelectedMethod(null);
        setInputMaximumLags(10);
        setIsCheckedDetrended(null);
        setIsCheckedSeasonal(null);
    };

    const [selectedSave, setSelectedSave] = useState<string | null>(null);
    const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [inputMaximumLags, setInputMaximumLags] = useState<number>(10);
    const [isCheckedDetrended, setIsCheckedDetrended] = useState<string | null>(null);
    const [isCheckedSeasonal, setIsCheckedSeasonal] = useState<string | null>(null);

    const handleSelectedTrend = (trend: string) => {
        setSelectedTrend(trend);
    };
    
    const handleSelectedLevel = (level: string) => {
        setSelectedLevel(level);
    };
    
    const handleSelectedMethod = (method: string) => {
        setSelectedMethod(method);
    };
    
    const handleInputMaximumLags = (value: number) => {
        setInputMaximumLags(value);
    };

  return (
    <DialogContent className="max-w-[75vw] max-h-[90vh] flex flex-col space-y-0 overflow-y-auto">
        <div className="pb-4 ml-4">
            <DialogHeader>
                <DialogTitle className="font-bold text-2xl">Autocorrelation</DialogTitle>
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
                    <div className="flex flex-row gap-4 h-[100px]">
                        <div className="flex items-center">
                            <Button onClick={handleAddToUsedVariable} disabled={!selectedVariable || usedVariable.length > 0}>Add</Button>
                        </div>
                        <div>
                            <div className="border-2 rounded-md w-[200px]">
                                <div className="font-bold bg-gray-400 w-full p-2 border-0 rounded-t-md text-center">Used Variables:</div>
                                <ul className="border rounded-md p-2 h-[60px]">
                                {usedVariable.map((variable) => (
                                    <li key={variable} className="flex justify-start items-center p-1 hover:bg-gray-100">
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

                    {/* Option */}
                    <div className="flex flex-col gap-4 border-2 rounded-md p-2">
                        <div className="ml-2">
                            <Label className="font-bold">Option:</Label>
                        </div>
                        <div className="ml-4 flex flex-row gap-4">
                            <div className="flex items-center">
                                <Label>Maximum Lags:</Label>
                            </div>
                            <Input type="number" className="w-[80px]" 
                                placeholder="10" min="10" max="20" step="1"
                                value={inputMaximumLags}
                                onChange={(e) => handleInputMaximumLags(Number(e.target.value))}
                            />
                        </div>
                        <div className="ml-4">
                            <Label>Q-Stat:</Label>
                        </div>
                        <div className="ml-4 mb-2">
                            <Select onValueChange={(value)=>handleSelectedMethod(value)}>
                                <SelectTrigger className="mr-2">
                                    <SelectValue placeholder="Choose Your Method">
                                        {selectedMethod || "Choose Your Method"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Ljung-Box">Ljung-Box</SelectItem>
                                    <SelectItem value="Box-Pierce">Box-Pierce</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                    
                {/* Kolom 3 */}
                <div className="flex flex-col gap-4">
                    {/* Baris 1 */}
                    <div className="border-2 rounded-md w-[380px] flex flex-col gap-4 p-2">
                        <div className="mt-2 ml-2">
                            <Label className="font-bold">Transform:</Label>
                        </div>
                        <div className="ml-4 flex flex-row gap-2">
                            <Checkbox
                                checked={isCheckedSeasonal !== null}
                                onCheckedChange={(isChecked)=>setIsCheckedSeasonal(isChecked? "selected" : null)}
                            />
                            <Label>Seasonally Differencing</Label>
                        </div>
                        <div className="ml-4 flex flex-row gap-2">
                        <div className="flex items-center">
                                <div className="flex flex-row gap-2">
                                    <Checkbox
                                        checked={isCheckedDetrended !== null}
                                        onCheckedChange={(isChecked)=>setIsCheckedDetrended(isChecked? "selected" : null)}
                                    />
                                    <Label>Detrended:</Label>
                                </div>
                            </div>
                            {isCheckedDetrended? <Select onValueChange={(value) => handleSelectedTrend(value)}>
                                <SelectTrigger className="mr-2 w-[200px]">
                                    <SelectValue placeholder="Choose Your Trend">
                                        {selectedTrend || "Choose Your Trend"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Linear">Linear</SelectItem>
                                    <SelectItem value="Quadratic">Quadratic</SelectItem>
                                    <SelectItem value="Exponential">Exponential</SelectItem>
                                </SelectContent>
                            </Select>:""}
                        </div>
                        <div className="ml-4 flex flex-row gap-2">
                            <div className="flex items-center">
                                <div className="flex flex-row gap-2">
                                    <Label>Autocorrelation on:</Label>
                                </div>
                            </div>
                            <Select onValueChange={(value)=>handleSelectedLevel(value)}>
                                <SelectTrigger className="mr-2 w-[200px] mb-2">
                                    <SelectValue placeholder="Choose Your Level">
                                        {selectedLevel || "Choose Your Level"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Level">Level</SelectItem>
                                    <SelectItem value="First Difference">First Difference</SelectItem>
                                    <SelectItem value="Second Difference">Second Difference</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Baris 2 */}
                    <div>
                        <div className="border-2 rounded-md w-[380px] pl-2 pt-2 pb-4 flex flex-col gap-2">
                            <div className="ml-2">
                                <Label className="font-bold">Save:</Label>
                            </div>
                            <div className="flex flex-row gap-2 ml-8">
                                <Checkbox 
                                    checked={selectedSave !== null} 
                                    onCheckedChange={(isChecked) => setSelectedSave(isChecked ? "selected" : null)}
                                />
                                <Label>Save Transform Result as Variable</Label>
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

export default AutocorrelationModal;