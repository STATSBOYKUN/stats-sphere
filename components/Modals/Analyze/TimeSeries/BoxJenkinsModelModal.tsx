import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"; 
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface BoxJenkinsModelModalProps {
  onClose: () => void;
}

const BoxJenkinsModelModal: React.FC<BoxJenkinsModelModalProps> = ({ onClose }) => {
    const [availableVariables, setAvailableVariables] = useState<string[]>([ 
        "PDB",
        "Nilai_Tukar_Petani",
        "Inflasi",
        "YEAR",
        "MONTH",
        "Date",
    ]);
    const [usedVariable, setUsedVariable] = useState<string[]>([]);
    const [xAxisVariables, setXAxisVariables] = useState<string[]>([]);
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
        setUsedVariable(usedVariable.filter((v) => v !== variable));
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
        setUsedVariable([])
        setXAxisVariables([]);
        setSelectedVariable(null);
        setSelectedSave(null);
        setCheckedSeasonal(null);
        setSelectedFrequency("Monthly");
        setInputP(1);
        setInputD(0);
        setInputQ(0);
    };

    // State untuk menyimpan metode yang dipilih
    const [selectedSave, setSelectedSave] = useState<string | null>(null);
    const [isCheckedSeasonal, setCheckedSeasonal] = useState<string | null>(null);
    const [selectedFrequency, setSelectedFrequency] = useState<string | null>("Monthly");
    const [inputP, setInputP] = useState<number>(1);
    const [inputD, setInputD] = useState<number>(0);
    const [inputQ, setInputQ] = useState<number>(0);

    const handleSelectedFrequency = (frequency: string) => {
        setSelectedFrequency(frequency);
    };

    const handleInputP = (value: number) => {
        setInputP(value);
    };
    
    const handleInputD = (value: number) => {
        setInputD(value);
    };

    const handleInputQ = (value: number) => {
        setInputQ(value);
    };

  return (
    <DialogContent className="max-w-[75vw] max-h-[90vh] flex flex-col space-y-0 overflow-y-auto">
        <div className="pb-4 ml-4">
            <DialogHeader>
                <DialogTitle className="font-bold text-2xl">BoxJenkinsModel</DialogTitle>
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
                                <li
                                key={variable} onClick={() => handleSelectVariable(variable)}
                                className="flex justify-start items-center p-1 hover:bg-gray-100 cursor-pointer gap-2">
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
                                    <li key={variable} className="flex justify-start items-center p-1 hover:bg-gray-100">
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
                    <div className="border-2 rounded-md w-[420px] py-2">
                        <div className="w-full p-2 border-0 rounded-t-md flex flex-row gap-4">
                            <div className="flex items-center ml-2 min-w-max">
                                <Label className="font-bold">Parameters:</Label>
                            </div>
                        </div>
                        <div className="flex flex-row ml-4 mt-2">
                            <div className="flex flex-row gap-4 ml-4">
                                <div className="flex items-center">
                                    <Label>p:</Label>
                                </div>
                                <Input type="number" className="w-[80px]" 
                                    placeholder="1" min="0" max="10" step="1"
                                    value={inputP}
                                    onChange={(e) => handleInputP(Number(e.target.value))}
                                />
                            </div>
                            <div className="flex flex-row gap-4 ml-4">
                                <div className="flex items-center">
                                    <Label>d:</Label>
                                </div>
                                <Input type="number" className="w-[80px]" 
                                    placeholder="1" min="0" max="10" step="1"
                                    value={inputD}
                                    onChange={(e) => handleInputD(Number(e.target.value))}
                                />
                            </div>
                            <div className="flex flex-row gap-4 ml-4">
                                <div className="flex items-center">
                                    <Label>q:</Label>
                                </div>
                                <Input type="number" className="w-[80px]" 
                                    placeholder="1" min="0" max="10" step="1"
                                    value={inputQ}
                                    onChange={(e) => handleInputQ(Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 p-2 mt-2">
                            <div className="flex flex-row gap-2 ml-6">
                                <Checkbox 
                                    checked={isCheckedSeasonal !== null}
                                    onCheckedChange={(isChecked)=>setCheckedSeasonal(isChecked? "selected" : null)}
                                />
                                <Label>Contains Seasonal Influences</Label>
                            </div>
                            {isCheckedSeasonal? 
                                <>
                                    <div className="flex flex-row ml-2 mt-2">
                                        <div className="flex flex-row gap-4 ml-4">
                                            <div className="flex items-center">
                                                <Label>P:</Label>
                                            </div>
                                            <Input type="number" className="w-[80px]" 
                                                placeholder="1" min="0" max="10" step="1"
                                            />
                                        </div>
                                        <div className="flex flex-row gap-4 ml-4">
                                            <div className="flex items-center">
                                                <Label>D:</Label>
                                            </div>
                                            <Input type="number" className="w-[80px]" 
                                                placeholder="1" min="0" max="10" step="1"
                                            />
                                        </div>
                                        <div className="flex flex-row gap-4 ml-4">
                                            <div className="flex items-center">
                                                <Label>Q:</Label>
                                            </div>
                                            <Input type="number" className="w-[80px]" 
                                                placeholder="1" min="0" max="10" step="1"
                                            />
                                        </div>
                                    </div>
                                    <div className="ml-6 flex flex-row gap-2 mt-2">
                                        <div className="flex items-center">
                                                <Label>Frequency:</Label>
                                        </div>
                                        <div>
                                        <Select 
                                                onValueChange={(value) => handleSelectedFrequency(value)} 
                                                defaultValue={selectedFrequency || "Choose Your Frequency"}
                                                >
                                                <SelectTrigger className="mr-2 w-[200px]">
                                                    <SelectValue>{selectedFrequency || "Choose Your Frequency"}</SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Monthly">Monthly</SelectItem>
                                                    <SelectItem value="Three-Month Period">Three-Month Period</SelectItem>
                                                    <SelectItem value="Four-Month Period">Four-Month Period</SelectItem>
                                                    <SelectItem value="Six-Month Period">Six-Month Period</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </>
                            :""}
                        </div>
                    </div>

                    {/* Baris 2 */}
                    <div>
                        <div className="border-2 rounded-md w-[420px] pl-2 pt-2 pb-4 flex flex-col gap-2">
                            <div className="ml-2">
                                <Label className="font-bold">Save:</Label>
                            </div>
                            <div className="flex flex-row gap-2 ml-6">
                                <Checkbox 
                                    checked={selectedSave !== null} 
                                    onCheckedChange={(isChecked) => setSelectedSave(isChecked ? "selected" : null)}
                                />
                                <Label>Save Forecasting Result as Variable</Label>
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

export default BoxJenkinsModelModal;