"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronsRight } from "lucide-react";

interface Variable {
  name: string;
}

interface PlotsLinearProps {
  onClose: () => void;
}

const PlotsLinear: React.FC<PlotsLinearProps> = ({ onClose }) => {
  // Inisialisasi daftar variabel yang tersedia
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([
    { name: "DEPENDNT" },
    { name: "*ZPRED" },
    { name: "*ZRESID" },
    { name: "*DRESID" },
    { name: "*ADJPRED" },
    { name: "*SRESID" },
    { name: "*SDRESID" },
  ]);

  // Variabel yang disorot pada panel kiri
  const [highlightedVariable, setHighlightedVariable] = useState<Variable | null>(null);
  // Variabel yang dipilih untuk bidang Y dan X
  const [selectedY, setSelectedY] = useState<Variable | null>(null);
  const [selectedX, setSelectedX] = useState<Variable | null>(null);

  // State untuk checkbox pada bagian Standardized Residual Plots
  const [histogramChecked, setHistogramChecked] = useState(false);
  const [normalProbabilityChecked, setNormalProbabilityChecked] = useState(false);
  const [producePartialChecked, setProducePartialChecked] = useState(false);

  // ============================
  // Handler Pemilihan Variabel
  // ============================
  const handleSelectAvailableVariable = (variable: Variable) => {
    setHighlightedVariable(variable);
  };

  // Memindahkan variabel yang disorot ke bidang Y
  const handleMoveToY = () => {
    if (highlightedVariable) {
      // Jika sudah ada variabel di bidang Y, kembalikan ke available
      if (selectedY) {
        setAvailableVariables((prev) => [...prev, selectedY]);
      }
      setSelectedY(highlightedVariable);
      setAvailableVariables((prev) =>
        prev.filter((item) => item.name !== highlightedVariable.name)
      );
      setHighlightedVariable(null);
    }
  };

  // Memindahkan variabel yang disorot ke bidang X
  const handleMoveToX = () => {
    if (highlightedVariable) {
      if (selectedX) {
        setAvailableVariables((prev) => [...prev, selectedX]);
      }
      setSelectedX(highlightedVariable);
      setAvailableVariables((prev) =>
        prev.filter((item) => item.name !== highlightedVariable.name)
      );
      setHighlightedVariable(null);
    }
  };

  // Menghapus variabel yang telah dipilih di bidang Y (kembali ke daftar variabel)
  const handleRemoveY = () => {
    if (selectedY) {
      setAvailableVariables((prev) => [...prev, selectedY]);
      setSelectedY(null);
    }
  };

  // Menghapus variabel yang telah dipilih di bidang X (kembali ke daftar variabel)
  const handleRemoveX = () => {
    if (selectedX) {
      setAvailableVariables((prev) => [...prev, selectedX]);
      setSelectedX(null);
    }
  };

  // ============================
  // Handler Tombol Aksi
  // ============================
  const handleContinue = () => {
    // Misalnya, menampilkan nilai variabel yang terpilih untuk Y dan X
    alert(
      `Selected Y: ${selectedY ? selectedY.name : "None"}\nSelected X: ${
        selectedX ? selectedX.name : "None"
      }`
    );
  };

  const handleHelp = () => {
    alert("Help clicked!");
  };

  return (
    <DialogContent className="sm:max-w-[900px]">
      {/* Header Modal */}
      <DialogHeader>
        <DialogTitle>Linear Regression: Plots</DialogTitle>
      </DialogHeader>

      <Separator className="my-2" />

      {/* Dua area utama: Panel kiri (list box variabel) & Panel kanan (Scatter dan Residual Plot) */}
      <div className="grid grid-cols-2 gap-4 py-4">
        {/* --- Panel Kiri: Daftar Variabel --- */}
        <div className="border p-4 rounded-md max-h-[500px] overflow-y-auto">
          <Label className="font-semibold">Daftar Variabel</Label>
          <ScrollArea className="mt-2 h-[450px]">
            {availableVariables.map((variable) => (
              <div
                key={variable.name}
                onClick={() => handleSelectAvailableVariable(variable)}
                className={`p-2 border-b cursor-pointer hover:bg-gray-100 ${
                  highlightedVariable?.name === variable.name
                    ? "bg-blue-100 border-blue-500"
                    : "border-gray-300"
                }`}
              >
                {variable.name}
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* --- Panel Kanan: Scatter dan Residual Plot --- */}
        <div className="flex flex-col space-y-4">
          {/* Bagian Scatter 1 of 1 */}
          <div className="border p-4 rounded-md">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold">Scatter 1 of 1</span>
              <div className="flex space-x-2">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <Button variant="outline" disabled>
                  Next
                </Button>
              </div>
            </div>

            {/* Bidang teks untuk Y */}
            <div className="flex items-center mb-3">
              <Label className="w-10">Y:</Label>
              <Input
                type="text"
                className="flex-1 cursor-pointer"
                placeholder="Pilih variabel untuk Y"
                value={selectedY ? selectedY.name : ""}
                readOnly
                onClick={handleRemoveY}
              />
              <Button variant="outline" className="ml-2" onClick={handleMoveToY}>
                <ChevronsRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Bidang teks untuk X */}
            <div className="flex items-center">
              <Label className="w-10">X:</Label>
              <Input
                type="text"
                className="flex-1 cursor-pointer"
                placeholder="Pilih variabel untuk X"
                value={selectedX ? selectedX.name : ""}
                readOnly
                onClick={handleRemoveX}
              />
              <Button variant="outline" className="ml-2" onClick={handleMoveToX}>
                <ChevronsRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Bagian Standardized Residual Plots */}
          <div className="border p-4 rounded-md">
            <div className="mb-4 font-semibold">Standardized Residual Plots</div>
            <div className="flex justify-between">
              {/* Checkbox di sebelah kiri */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <Checkbox
                    id="histogram"
                    checked={histogramChecked}
                    onCheckedChange={(checked) => setHistogramChecked(Boolean(checked))}
                  />
                  <Label htmlFor="histogram" className="ml-2">
                    Histogram
                  </Label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="normalProbabilityPlot"
                    checked={normalProbabilityChecked}
                    onCheckedChange={(checked) => setNormalProbabilityChecked(Boolean(checked))}
                  />
                  <Label htmlFor="normalProbabilityPlot" className="ml-2">
                    Normal probability plot
                  </Label>
                </div>
              </div>
              {/* Checkbox di sisi kanan */}
              <div className="flex items-center">
                <Checkbox
                  id="produceAllPartialPlots"
                  checked={producePartialChecked}
                  onCheckedChange={(checked) => setProducePartialChecked(Boolean(checked))}
                />
                <Label htmlFor="produceAllPartialPlots" className="ml-2">
                  Produce all partial plots
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Tombol Aksi */}
      <DialogFooter className="flex justify-end space-x-3">
        <Button variant="default" onClick={handleContinue}>
          Continue
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="outline" onClick={handleHelp}>
          Help
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default PlotsLinear;
