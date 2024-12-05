import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateModelModalProps {
  onClose: () => void;
}

const CreateModelModal: React.FC<CreateModelModalProps> = ({ onClose }) => {
  const [variables, setVariables] = useState<string[]>([]);
  const [timeAxisLabels, setTimeAxisLabels] = useState<string[]>([]);
  const [transformations, setTransformations] = useState<string[]>([]);
  const [makeSeparateCharts, setMakeSeparateCharts] = useState<boolean>(false);
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);

  const availableVariables = [
    "suhu_minimum",
    "YEAR",
    "MONTH",
    "Date",
  ];

  const handleAddVariable = () => {
    if (selectedVariable && !variables.includes(selectedVariable)) {
      setVariables((prev) => [...prev, selectedVariable]);
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setVariables((prev) => prev.filter((v) => v !== variable));
  };

  const handleApplyTransform = (transform: string) => {
    setTransformations((prev) => [...prev, transform]);
  };

  const handleReset = () => {
    setVariables([]);
    setTimeAxisLabels([]);
    setTransformations([]);
    setMakeSeparateCharts(false);
  };

  return (
    <DialogContent className="max-w-[60vw] max-h-[80vh] grid grid-cols-1 overflow-y-auto">
        <div className="py-4">
            <DialogHeader>
                <DialogTitle>Create Model</DialogTitle>
                <DialogDescription>Adjust the variables, labels, and transformations for your data visualization.</DialogDescription>
            </DialogHeader>
        </div>
        <div className="grid grid-cols-3 gap-4 py-4">
            {/* Daftar Variabel */}
            <div className="flex-1 flex flex-col gap-4 max-w-[300px]">
                <div>
                    <Label>Available Variables</Label>
                        <ul className="border rounded-md p-2 max-h-[200px] overflow-y-auto">
                        {availableVariables.map((variable) => (
                            <li
                            key={variable}
                            className="flex justify-between items-center p-1 hover:bg-gray-100 cursor-pointer"
                            onClick={() => setSelectedVariable(variable)}
                            >
                            {variable}
                            </li>
                        ))}
                        </ul>
                    <Button className="mt-2 w-full" onClick={handleAddVariable} disabled={!selectedVariable}>
                        Add to Variables
                    </Button>
                </div>
            </div>

            {/* Middle Section: Variables & Time Axis */}
            <div className="flex-1 flex flex-col gap-4 max-w-[300px]">
                {/* Variables */}
                <div>
                    <Label>Variables</Label>
                    <ul className="border rounded-md p-2 max-h-[150px] overflow-y-auto">
                    {variables.map((variable) => (
                        <li key={variable} className="flex justify-between items-center p-1 hover:bg-gray-100">
                        {variable}
                        <Button variant="outline" size="sm" onClick={() => handleRemoveVariable(variable)}>
                            Remove
                        </Button>
                        </li>
                    ))}
                    </ul>
                </div>

                {/* Time Axis Labels */}
                <div>
                    <Label>Time Axis Labels</Label>
                    <Input placeholder="Add a label" onKeyDown={(e) => {
                        if (e.key === "Enter" && e.currentTarget.value) {
                            setTimeAxisLabels((prev) => [...prev, e.currentTarget.value]);
                            e.currentTarget.value = "";
                        }
                    }} />
                    <ul className="mt-2 border rounded-md p-2 max-h-[100px] overflow-y-auto">
                    {timeAxisLabels.map((label, index) => (
                        <li key={index} className="p-1">
                        {label}
                        </li>
                    ))}
                    </ul>
                </div>
            </div>

            {/* Right Section: Transformations & Settings */}
            <div className="flex-1 flex flex-col gap-4 max-w-[300px]">
                {/* Transformations */}
                <div>
                    <Label>Data Transformations</Label>
                    <div className="flex flex-col gap-2">
                        {["Natural Log", "Difference", "Seasonal Difference"].map((transform) => (
                        <div key={transform} className="flex items-center gap-2">
                            <Checkbox
                            checked={transformations.includes(transform)}
                            onCheckedChange={(checked) => {
                                setTransformations((prev) =>
                                checked
                                    ? [...prev, transform] // Tambahkan jika diaktifkan
                                    : prev.filter((t) => t !== transform) // Hapus jika dinonaktifkan
                                );
                            }}
                            />
                            <Label>{transform}</Label>
                        </div>
                        ))}
                    </div>
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-2">
                    <Checkbox
                    checked={makeSeparateCharts}
                    onCheckedChange={(checked) =>
                        setMakeSeparateCharts(Boolean(checked))
                    }
                    />
                    <Label>Make a separate chart for each variable</Label>
                </div>
            </div>
        </div>

        <div className="py-4">
            <DialogFooter>
                <Button variant="outline" onClick={onClose}> Cancel </Button>
                <Button variant="ghost" onClick={handleReset}> Reset </Button>
                <Button>OK</Button>
            </DialogFooter>
        </div>
        
    </DialogContent>

  );
};

export default CreateModelModal;