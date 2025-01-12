// components/Modals/Regression/TwoStageLeastSquares/ModalTwoStageLeastSquares.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useVariableStore, VariableRow } from '@/stores/useVariableStore';
import { useDataStore } from '@/stores/useDataStore';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pencil, ArrowRight } from 'lucide-react';

// ------------ Tipe data lokal untuk modal ini -------------
interface Variable {
  name: string;
  type: 'numeric' | 'categorical';
  columnIndex: number;
}

interface ModalTwoStageLeastSquaresProps {
  onClose: () => void;
}

// ----------------------------------------------------------
const ModalTwoStageLeastSquares: React.FC<ModalTwoStageLeastSquaresProps> = ({ onClose }) => {
  // State untuk variabel-variabel yang tersedia (panel kiri)
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);

  // State untuk variabel yang di-highlight di panel kiri
  const [highlightedVariable, setHighlightedVariable] = useState<Variable | null>(null);

  // State untuk menampung variabel Dependent, Explanatory, Instrumental
  const [selectedDependentVariable, setSelectedDependentVariable] = useState<Variable | null>(null);
  const [selectedExplanatoryVariables, setSelectedExplanatoryVariables] = useState<Variable[]>([]);
  const [selectedInstrumentalVariables, setSelectedInstrumentalVariables] = useState<Variable[]>([]);

  // State untuk checkbox Include constant
  const [includeConstant, setIncludeConstant] = useState<boolean>(true);

  // Ambil data store
  const variables = useVariableStore((state) => state.variables);
  const data = useDataStore((state) => state.data);

  // ----------------------------------------------------------
  // useEffect untuk memetakan data store -> local state
  useEffect(() => {
    // Map VariableRow ke Variable
    const availableVars: Variable[] = variables
      .filter((v) => v.name) // Hilangkan variabel tanpa nama
      .map((v) => ({
        name: v.name,
        type: v.type as 'numeric' | 'categorical',
        columnIndex: v.columnIndex,
      }));
    setAvailableVariables(availableVars);
  }, [variables]);

  // ----------------------------------------------------------
  // Handler: pilih (highlight) variabel di panel kiri
  const handleSelectAvailableVariable = (variable: Variable) => {
    setHighlightedVariable(variable);
  };

  // ----------------------------------------------------------
  // Handler: pindah ke Dependent
  const handleMoveToDependent = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      // Kembalikan Dependent sebelumnya ke daftar (jika ada)
      if (selectedDependentVariable) {
        setAvailableVariables((prev) => [...prev, selectedDependentVariable]);
      }
      // Set Dependent dgn variable yg di-highlight
      setSelectedDependentVariable(highlightedVariable);
      // Hapus variable tsb dari panel kiri
      setAvailableVariables((prev) => prev.filter((item) => item !== highlightedVariable));
      // Hapus highlight
      setHighlightedVariable(null);
    }
  };

  // Handler: pindah ke Explanatory
  const handleMoveToExplanatory = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      setSelectedExplanatoryVariables((prev) => [...prev, highlightedVariable]);
      setAvailableVariables((prev) => prev.filter((item) => item !== highlightedVariable));
      setHighlightedVariable(null);
    }
  };

  // Handler: pindah ke Instrumental
  const handleMoveToInstrumental = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      setSelectedInstrumentalVariables((prev) => [...prev, highlightedVariable]);
      setAvailableVariables((prev) => prev.filter((item) => item !== highlightedVariable));
      setHighlightedVariable(null);
    }
  };

  // ----------------------------------------------------------
  // Handler: hapus dari Dependent (kembalikan ke panel kiri)
  const handleRemoveFromDependent = () => {
    if (selectedDependentVariable) {
      setAvailableVariables((prev) => [...prev, selectedDependentVariable]);
      setSelectedDependentVariable(null);
    }
  };

  // Handler: hapus dari Explanatory (kembalikan ke panel kiri)
  const handleRemoveFromExplanatory = (variable: Variable) => {
    setAvailableVariables((prev) => [...prev, variable]);
    setSelectedExplanatoryVariables((prev) => prev.filter((item) => item !== variable));
  };

  // Handler: hapus dari Instrumental (kembalikan ke panel kiri)
  const handleRemoveFromInstrumental = (variable: Variable) => {
    setAvailableVariables((prev) => [...prev, variable]);
    setSelectedInstrumentalVariables((prev) => prev.filter((item) => item !== variable));
  };

  // ----------------------------------------------------------
  // Handler: OK (placeholder untuk memanggil 2SLS)
  const handleAnalyze = () => {
    // Validasi sederhana
    if (!selectedDependentVariable) {
      alert('Please select a Dependent variable.');
      return;
    }
    if (selectedExplanatoryVariables.length === 0) {
      alert('Please select at least one Explanatory variable.');
      return;
    }
    if (selectedInstrumentalVariables.length === 0) {
      alert('Please select at least one Instrumental variable.');
      return;
    }
    // Lakukan hal lain sesuai kebutuhan...
    onClose();
  };

  // ----------------------------------------------------------
  // Handler: Paste, Reset, Cancel, Help
  const handlePaste = () => {
    alert('Paste command to syntax editor (placeholder).');
  };

  const handleReset = () => {
    setAvailableVariables((prev) => [
      ...(selectedDependentVariable ? [selectedDependentVariable] : []),
      ...selectedExplanatoryVariables,
      ...selectedInstrumentalVariables,
      ...prev,
    ]);
    setSelectedDependentVariable(null);
    setSelectedExplanatoryVariables([]);
    setSelectedInstrumentalVariables([]);
    setHighlightedVariable(null);
    setIncludeConstant(true);
  };

  const handleClose = () => {
    onClose();
  };

  const handleHelp = () => {
    alert('Show 2SLS help (placeholder).');
  };

  // ----------------------------------------------------------
  // Render Komponen
  return (
    <DialogContent className="sm:max-w-[700px]">
      <DialogHeader>
        <DialogTitle>2-Stage Least Squares</DialogTitle>
      </DialogHeader>

      <Separator className="my-0" />

      <div className="grid grid-cols-12 gap-4 py-4">
        {/* Panel Kiri: Daftar Variabel */}
        <div className="col-span-3 border p-4 rounded-md max-h-[500px] overflow-y-auto">
          <label className="font-semibold">Variables</label>
          <ScrollArea className="mt-2 h-[450px]">
            {availableVariables.map((variable) => (
              <div
                key={variable.name}
                className={`flex items-center p-2 border cursor-pointer rounded-md mb-1 hover:bg-gray-100 ${
                  highlightedVariable?.name === variable.name
                    ? 'bg-blue-100 border-blue-500'
                    : 'border-gray-300'
                }`}
                onClick={() => handleSelectAvailableVariable(variable)}
              >
                <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                {variable.name}
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Panel Tengah: Tombol Panah + 3 field (Dependent, Explanatory, Instrumental) */}
        <div className="col-span-6 space-y-6">
          {/* DEPENDENT */}
          <div className="flex items-start">
            {/* Tombol panah: Dependent */}
            <Button
              variant="outline"
              onClick={handleMoveToDependent}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Dependent</label>
              <div
                className="mt-2 p-2 border rounded-md min-h-[50px] cursor-pointer"
                onClick={handleRemoveFromDependent}
              >
                {selectedDependentVariable ? (
                  <div className="flex items-center">
                    <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                    {selectedDependentVariable.name}
                  </div>
                ) : (
                  <span className="text-gray-500">[None]</span>
                )}
              </div>
            </div>
          </div>

          {/* EXPLANATORY */}
          <div className="flex items-start">
            {/* Tombol panah: Explanatory */}
            <Button
              variant="outline"
              onClick={handleMoveToExplanatory}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Explanatory</label>
              <div className="mt-2 p-2 border rounded-md min-h-[80px]">
                {selectedExplanatoryVariables.length > 0 ? (
                  selectedExplanatoryVariables.map((variable) => (
                    <div
                      key={variable.name}
                      className="flex items-center p-1 cursor-pointer hover:bg-gray-100 rounded-md"
                      onClick={() => handleRemoveFromExplanatory(variable)}
                    >
                      <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                      {variable.name}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">[None]</span>
                )}
              </div>
            </div>
          </div>

          {/* INSTRUMENTAL */}
          <div className="flex items-start">
            {/* Tombol panah: Instrumental */}
            <Button
              variant="outline"
              onClick={handleMoveToInstrumental}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Instrumental</label>
              <div className="mt-2 p-2 border rounded-md min-h-[80px]">
                {selectedInstrumentalVariables.length > 0 ? (
                  selectedInstrumentalVariables.map((variable) => (
                    <div
                      key={variable.name}
                      className="flex items-center p-1 cursor-pointer hover:bg-gray-100 rounded-md"
                      onClick={() => handleRemoveFromInstrumental(variable)}
                    >
                      <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                      {variable.name}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">[None]</span>
                )}
              </div>
            </div>
          </div>

          {/* Include constant checkbox */}
          <div className="flex items-center space-x-2">
            <input
              id="include-constant"
              type="checkbox"
              checked={includeConstant}
              onChange={(e) => setIncludeConstant(e.target.checked)}
            />
            <label htmlFor="include-constant" className="select-none">
              Include constant in equation
            </label>
          </div>
        </div>

        {/* Panel Kanan: Tombol Options di kolom sendiri */}
        <div className="col-span-3 space-y-4">
          <Button variant="outline" className="w-full">
            Options...
          </Button>
          {/* Tambahkan tombol lain di sini jika diperlukan */}
        </div>
      </div>

      <DialogFooter className="flex justify-center space-x-4 mt-4">
        <Button onClick={handleAnalyze}>OK</Button>
        <Button variant="outline" onClick={handlePaste}>Paste</Button>
        <Button variant="outline" onClick={handleReset}>Reset</Button>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="outline" onClick={handleHelp}>Help</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ModalTwoStageLeastSquares;
