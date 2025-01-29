"use client"; // Jika Anda menggunakan Next.js App Router (opsional)
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Contoh store, silakan disesuaikan
import { useVariableStore } from "@/stores/useVariableStore";
import { useDataStore } from "@/stores/useDataStore";

interface Variable {
  name: string;
  type: "numeric" | "categorical";
  columnIndex: number;
}

interface ModalWeightEstimationProps {
  onClose: () => void;
}

const ModalWeightEstimation: React.FC<ModalWeightEstimationProps> = ({
  onClose,
}) => {
  // Daftar variabel yang tersedia (semua yang belum dipindah)
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);

  // Variabel terpilih (highlight di panel kiri)
  const [highlightedVariable, setHighlightedVariable] = useState<Variable | null>(
    null
  );

  // Variabel Dependent (hanya satu)
  const [selectedDependent, setSelectedDependent] = useState<Variable | null>(
    null
  );
  // Variabel Independent(s) (bisa lebih dari satu)
  const [selectedIndependents, setSelectedIndependents] = useState<Variable[]>(
    []
  );
  // Variabel Weight
  const [selectedWeightVar, setSelectedWeightVar] = useState<Variable | null>(
    null
  );

  // Pengaturan Power Range
  const [powerRangeMin, setPowerRangeMin] = useState<string>("-2");
  const [powerRangeMax, setPowerRangeMax] = useState<string>("2");
  const [powerRangeStep, setPowerRangeStep] = useState<string>("0.5");

  // Checkbox: Include Constant
  const [includeConstant, setIncludeConstant] = useState<boolean>(true);

  // Mengambil data variabel dari store
  const variables = useVariableStore((state) => state.variables);
  const data = useDataStore((state) => state.data);

  // Inisialisasi daftar variabel
  useEffect(() => {
    const vars: Variable[] = variables
      .filter((v) => v.name)
      .map((v) => ({
        name: v.name,
        type: v.type as "numeric" | "categorical",
        columnIndex: v.columnIndex,
      }));
    setAvailableVariables(vars);
  }, [variables]);

  // ==============================
  // Handlers Memilih di Panel Kiri
  // ==============================
  const handleSelectAvailableVariable = (variable: Variable) => {
    setHighlightedVariable(variable);
  };

  // =========================
  // Handlers Pindah ke Dependent
  // =========================
  const handleMoveToDependent = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      // Jika sudah ada Dependent, kembalikan ke available
      if (selectedDependent) {
        setAvailableVariables((prev) => [...prev, selectedDependent]);
      }
      setSelectedDependent(highlightedVariable);
      setAvailableVariables((prev) =>
        prev.filter((item) => item !== highlightedVariable)
      );
      setHighlightedVariable(null);
    }
  };

  const handleRemoveDependent = () => {
    if (selectedDependent) {
      setAvailableVariables((prev) => [...prev, selectedDependent]);
      setSelectedDependent(null);
    }
  };

  // ============================
  // Handlers Pindah ke Independent
  // ============================
  const handleMoveToIndependents = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      setSelectedIndependents((prev) => [...prev, highlightedVariable]);
      setAvailableVariables((prev) =>
        prev.filter((item) => item !== highlightedVariable)
      );
      setHighlightedVariable(null);
    }
  };

  const handleRemoveFromIndependents = (variable: Variable) => {
    setAvailableVariables((prev) => [...prev, variable]);
    setSelectedIndependents((prev) => prev.filter((v) => v !== variable));
  };

  // ============================
  // Handlers Pindah ke Weight
  // ============================
  const handleMoveToWeight = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      if (selectedWeightVar) {
        setAvailableVariables((prev) => [...prev, selectedWeightVar]);
      }
      setSelectedWeightVar(highlightedVariable);
      setAvailableVariables((prev) =>
        prev.filter((item) => item !== highlightedVariable)
      );
      setHighlightedVariable(null);
    }
  };

  const handleRemoveWeight = () => {
    if (selectedWeightVar) {
      setAvailableVariables((prev) => [...prev, selectedWeightVar]);
      setSelectedWeightVar(null);
    }
  };

  // ================================
  // Tombol Bawah
  // ================================
  const handleOK = () => {
    // Implementasi logika "OK"
    alert("OK clicked!");
  };

  const handlePaste = () => {
    // Implementasi logika "Paste" (misal generate sintaks)
    alert("Paste clicked!");
  };

  const handleReset = () => {
    // Kembalikan semua variabel ke "availableVariables"
    const allSelected: Variable[] = [];
    if (selectedDependent) allSelected.push(selectedDependent);
    if (selectedWeightVar) allSelected.push(selectedWeightVar);
    if (selectedIndependents.length > 0) {
      allSelected.push(...selectedIndependents);
    }
    setAvailableVariables((prev) => [...prev, ...allSelected]);

    setSelectedDependent(null);
    setSelectedIndependents([]);
    setSelectedWeightVar(null);

    setPowerRangeMin("-2");
    setPowerRangeMax("2");
    setPowerRangeStep("0.5");
    setIncludeConstant(true);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleHelp = () => {
    // Implementasi logika "Help"
    alert("Help clicked!");
  };

  return (
    <DialogContent className="sm:max-w-[900px]">
      <DialogHeader className="flex justify-between items-center">
        <DialogTitle>Weight Estimation</DialogTitle>
      </DialogHeader>

      <Separator className="my-2" />

      {/* Grid 3 kolom -> col-span-1 dan col-span-2 */}
      <div className="grid grid-cols-3 gap-4 py-4">
        {/* Panel Kiri: Daftar Variabel (1/3) */}
        <div className="col-span-1 border p-4 rounded-md max-h-[500px] overflow-y-auto">
          <label className="font-semibold">Daftar Variabel</label>
          <ScrollArea className="mt-2 h-[450px]">
            {availableVariables.map((variable) => (
              <div
                key={variable.name}
                className={`flex items-center p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${
                  highlightedVariable?.name === variable.name
                    ? "bg-blue-100 border-blue-500"
                    : "border-gray-300"
                }`}
                onClick={() => handleSelectAvailableVariable(variable)}
              >
                <Pencil className="h-5 w-5 mr-2 text-yellow-500" />
                {variable.name}
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Panel Kanan (2/3): Dependent, Independents, Weight, Power Range */}
        <div className="col-span-2 space-y-4">
          {/* Dependent */}
          <div className="flex items-start">
            <Button
              variant="outline"
              onClick={handleMoveToDependent}
              disabled={
                !highlightedVariable ||
                !availableVariables.includes(highlightedVariable)
              }
              className="mr-2 mt-1"
              title="Set as Dependent"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Dependent</label>
              <div
                className="mt-2 p-2 border rounded-md min-h-[50px] cursor-pointer"
                onClick={handleRemoveDependent}
              >
                {selectedDependent ? (
                  <div className="flex items-center">
                    <Pencil className="h-5 w-5 mr-2 text-yellow-500" />
                    {selectedDependent.name}
                  </div>
                ) : (
                  <span className="text-gray-500">[Kosong]</span>
                )}
              </div>
            </div>
          </div>

          {/* Independent(s) */}
          <div className="flex items-start">
            <Button
              variant="outline"
              onClick={handleMoveToIndependents}
              disabled={
                !highlightedVariable ||
                !availableVariables.includes(highlightedVariable)
              }
              className="mr-2 mt-1"
              title="Add as Independent"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Independent(s)</label>
              <div className="mt-2 p-2 border rounded-md min-h-[80px]">
                {selectedIndependents.length > 0 ? (
                  selectedIndependents.map((variable) => (
                    <div
                      key={variable.name}
                      className="flex items-center p-1 cursor-pointer hover:bg-gray-100 rounded-md"
                      onClick={() => handleRemoveFromIndependents(variable)}
                    >
                      <Pencil className="h-5 w-5 mr-2 text-yellow-500" />
                      {variable.name}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">[Kosong]</span>
                )}
              </div>
            </div>
          </div>

          {/* Weight Variable */}
          <div className="flex items-start">
            <Button
              variant="outline"
              onClick={handleMoveToWeight}
              disabled={
                !highlightedVariable ||
                !availableVariables.includes(highlightedVariable)
              }
              className="mr-2 mt-1"
              title="Set as Weight Variable"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Weight Variable</label>
              <div
                className="mt-2 p-2 border rounded-md min-h-[50px] cursor-pointer"
                onClick={handleRemoveWeight}
              >
                {selectedWeightVar ? (
                  <div className="flex items-center">
                    <Pencil className="h-5 w-5 mr-2 text-yellow-500" />
                    {selectedWeightVar.name}
                  </div>
                ) : (
                  <span className="text-gray-500">[Kosong]</span>
                )}
              </div>
            </div>
          </div>

          {/* Power Range */}
          <div className="flex flex-col">
            <label className="font-semibold">Power Range</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <Label htmlFor="powerRangeMin">From</Label>
                <Input
                  id="powerRangeMin"
                  type="text"
                  value={powerRangeMin}
                  onChange={(e) => setPowerRangeMin(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="powerRangeMax">Through</Label>
                <Input
                  id="powerRangeMax"
                  type="text"
                  value={powerRangeMax}
                  onChange={(e) => setPowerRangeMax(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="powerRangeStep">By</Label>
                <Input
                  id="powerRangeStep"
                  type="text"
                  value={powerRangeStep}
                  onChange={(e) => setPowerRangeStep(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Include constant & Options */}
            <div className="flex items-center space-x-2 mt-3">
              <Checkbox
                id="includeConstant"
                checked={includeConstant}
                onCheckedChange={(checked) =>
                  setIncludeConstant(Boolean(checked))
                }
              />
              <Label htmlFor="includeConstant">
                Include constant in equation
              </Label>
              <Button variant="outline" className="ml-auto">
                Options...
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bawah: OK, Paste, Reset, Cancel, Help */}
      <DialogFooter className="flex justify-center space-x-4 mt-4">
        <Button
          variant="default"
          onClick={handleOK}
          disabled={
            !selectedDependent &&
            selectedIndependents.length === 0 &&
            !selectedWeightVar
          }
        >
          OK
        </Button>
        <Button variant="outline" onClick={handlePaste} disabled>
          Paste
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="outline" onClick={handleHelp}>
          Help
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ModalWeightEstimation;
