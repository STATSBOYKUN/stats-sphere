// components/Modals/Probit/ModalProbit.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useVariableStore } from '@/stores/useVariableStore';
import { useDataStore } from '@/stores/useDataStore';

interface Variable {
  name: string;
  type: 'numeric' | 'categorical';
  columnIndex: number;
}

interface ModalProbitProps {
  onClose: () => void;
}

const ModalProbit: React.FC<ModalProbitProps> = ({ onClose }) => {
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);
  const [selectedResponseFrequency, setSelectedResponseFrequency] = useState<Variable | null>(null);
  const [selectedTotalObserved, setSelectedTotalObserved] = useState<Variable | null>(null);
  const [selectedFactor, setSelectedFactor] = useState<Variable | null>(null);
  const [selectedCovariates, setSelectedCovariates] = useState<Variable[]>([]);
  const [highlightedVariable, setHighlightedVariable] = useState<Variable | null>(null);
  const [transformOption, setTransformOption] = useState<string>('None');

  const variables = useVariableStore((state) => state.variables);
  const data = useDataStore((state) => state.data);

  useEffect(() => {
    // Memetakan VariableRow ke Variable
    const availableVars: Variable[] = variables
      .filter((v) => v.name) // Filter variabel tanpa nama
      .map((v) => ({
        name: v.name,
        type: v.type as 'numeric' | 'categorical',
        columnIndex: v.columnIndex,
      }));
    setAvailableVariables(availableVars);
  }, [variables]);

  // Handlers untuk memilih dan memindahkan variabel
  const handleSelectAvailableVariable = (variable: Variable) => {
    setHighlightedVariable(variable);
  };

  const handleMoveToResponseFrequency = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      if (selectedResponseFrequency) {
        // Pindahkan variabel yang ada kembali ke variabel yang tersedia
        setAvailableVariables((prev) => [...prev, selectedResponseFrequency]);
      }
      setSelectedResponseFrequency(highlightedVariable);
      setAvailableVariables((prev) =>
        prev.filter((item) => item !== highlightedVariable)
      );
      setHighlightedVariable(null);
    }
  };

  const handleMoveToTotalObserved = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      if (selectedTotalObserved) {
        // Pindahkan variabel yang ada kembali ke variabel yang tersedia
        setAvailableVariables((prev) => [...prev, selectedTotalObserved]);
      }
      setSelectedTotalObserved(highlightedVariable);
      setAvailableVariables((prev) =>
        prev.filter((item) => item !== highlightedVariable)
      );
      setHighlightedVariable(null);
    }
  };

  const handleMoveToFactor = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      if (selectedFactor) {
        // Pindahkan variabel factor yang ada kembali ke variabel yang tersedia
        setAvailableVariables((prev) => [...prev, selectedFactor]);
      }
      setSelectedFactor(highlightedVariable);
      setAvailableVariables((prev) =>
        prev.filter((item) => item !== highlightedVariable)
      );
      setHighlightedVariable(null);
    }
  };

  const handleMoveToCovariates = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      setSelectedCovariates((prev) => [...prev, highlightedVariable]);
      setAvailableVariables((prev) =>
        prev.filter((item) => item !== highlightedVariable)
      );
      setHighlightedVariable(null);
    }
  };

  // Handlers untuk menghapus variabel
  const handleRemoveFromResponseFrequency = () => {
    if (selectedResponseFrequency) {
      setAvailableVariables((prev) => [...prev, selectedResponseFrequency]);
      setSelectedResponseFrequency(null);
    }
  };

  const handleRemoveFromTotalObserved = () => {
    if (selectedTotalObserved) {
      setAvailableVariables((prev) => [...prev, selectedTotalObserved]);
      setSelectedTotalObserved(null);
    }
  };

  const handleRemoveFromFactor = () => {
    if (selectedFactor) {
      setAvailableVariables((prev) => [...prev, selectedFactor]);
      setSelectedFactor(null);
    }
  };

  const handleRemoveFromCovariates = (variable: Variable) => {
    setAvailableVariables((prev) => [...prev, variable]);
    setSelectedCovariates((prev) =>
      prev.filter((item) => item !== variable)
    );
  };

  const handleClose = () => {
    onClose();
  };

  // Handler untuk Reference Range (Placeholder)
  const handleReferenceRange = () => {
    if (selectedFactor) {
      // Implementasikan logika untuk memilih range referensi di sini
      alert(`Reference Range untuk ${selectedFactor.name} belum diimplementasikan.`);
    }
  };

  return (
    <DialogContent className="sm:max-w-[900px]">
      <DialogHeader className="flex justify-between items-center">
        <DialogTitle>Probit Regression</DialogTitle>
        {/* Menghapus tombol Options di sini */}
      </DialogHeader>

      <Separator className="my-2" />

      <div className="grid grid-cols-12 gap-4 py-4">
        {/* Panel Kiri: Daftar Variabel */}
        <div className="col-span-3 border p-4 rounded-md max-h-[500px] overflow-y-auto">
          <label className="font-semibold">Daftar Variabel</label>
          <ScrollArea className="mt-2 h-[450px]">
            {availableVariables.map((variable) => (
              <div
                key={variable.name}
                className={`flex items-center p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${
                  highlightedVariable?.name === variable.name
                    ? 'bg-blue-100 border-blue-500'
                    : 'border-gray-300'
                }`}
                onClick={() => handleSelectAvailableVariable(variable)}
              >
                {/* Ikon Pensil */}
                <Pencil className="h-5 w-5 mr-2 text-yellow-500" />
                {variable.name}
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Panel Tengah-Kanan: Input Fields */}
        <div className="col-span-6 space-y-6">
          {/* Response Frequency */}
          <div className="flex items-start">
            {/* Tombol Panah untuk Response Frequency */}
            <Button
              variant="outline"
              onClick={handleMoveToResponseFrequency}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2 mt-1"
              title="Set as Response Frequency"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Response Frequency</label>
              <div
                className="mt-2 p-2 border rounded-md min-h-[50px] cursor-pointer"
                onClick={handleRemoveFromResponseFrequency}
              >
                {selectedResponseFrequency ? (
                  <div className="flex items-center">
                    <Pencil className="h-5 w-5 mr-2 text-yellow-500" />
                    {selectedResponseFrequency.name}
                  </div>
                ) : (
                  <span className="text-gray-500">[Kosong]</span>
                )}
              </div>
            </div>
          </div>

          {/* Total Observed */}
          <div className="flex items-start">
            {/* Tombol Panah untuk Total Observed */}
            <Button
              variant="outline"
              onClick={handleMoveToTotalObserved}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2 mt-1"
              title="Set as Total Observed"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Total Observed</label>
              <div
                className="mt-2 p-2 border rounded-md min-h-[50px] cursor-pointer"
                onClick={handleRemoveFromTotalObserved}
              >
                {selectedTotalObserved ? (
                  <div className="flex items-center">
                    <Pencil className="h-5 w-5 mr-2 text-yellow-500" />
                    {selectedTotalObserved.name}
                  </div>
                ) : (
                  <span className="text-gray-500">[Kosong]</span>
                )}
              </div>
            </div>
          </div>

          {/* Factor */}
          <div className="flex items-start">
            {/* Tombol Panah untuk Factor */}
            <Button
              variant="outline"
              onClick={handleMoveToFactor}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2 mt-1"
              title="Add as Factor"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Factor</label>
              <div
                className="mt-2 p-2 border rounded-md min-h-[50px] cursor-pointer"
                onClick={handleRemoveFromFactor}
              >
                {selectedFactor ? (
                  <div className="flex items-center">
                    <Pencil className="h-5 w-5 mr-2 text-yellow-500" />
                    {selectedFactor.name}
                  </div>
                ) : (
                  <span className="text-gray-500">[Kosong]</span>
                )}
              </div>
              <Button
                variant="outline"
                className="mt-2 w-full"
                disabled={!selectedFactor}
                onClick={handleReferenceRange}
              >
                Define Range...
              </Button>
            </div>
          </div>

          {/* Covariate(s) */}
          <div className="flex items-start">
            {/* Tombol Panah untuk Covariate(s) */}
            <Button
              variant="outline"
              onClick={handleMoveToCovariates}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2 mt-1"
              title="Add as Covariate"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Covariate(s)</label>
              <div className="mt-2 p-2 border rounded-md min-h-[100px]">
                {selectedCovariates.length > 0 ? (
                  selectedCovariates.map((variable) => (
                    <div
                      key={variable.name}
                      className="flex items-center p-1 cursor-pointer hover:bg-gray-100 rounded-md"
                      onClick={() => handleRemoveFromCovariates(variable)}
                    >
                      <Pencil className="h-5 w-5 mr-2 text-yellow-500" />
                      {variable.name}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">[Kosong]</span>
                )}
              </div>
              {/* Mengganti input field dengan label "Transform :" */}
              <div className="flex items-center mt-2 space-x-2">
                <span className="font-semibold">Transform:</span>
                <Select value={transformOption} onValueChange={setTransformOption}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Log">Log</SelectItem>
                    <SelectItem value="Square">Square</SelectItem>
                    <SelectItem value="Square Root">Square Root</SelectItem>
                    {/* Tambahkan opsi transformasi lainnya jika diperlukan */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div className="flex flex-col">
            <label className="font-semibold">Model Selection</label>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="probit"
                  name="model"
                  defaultChecked
                  className="mr-2"
                />
                <label htmlFor="probit">Probit</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="logit"
                  name="model"
                  className="mr-2"
                />
                <label htmlFor="logit">Logit</label>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Kanan: Tombol Tambahan */}
        <div className="col-span-3 space-y-2">
          <Button variant="outline" className="w-full">
            Options...
          </Button>
        </div>
      </div>

      {/* Tombol Navigasi Bawah */}
      <DialogFooter className="flex justify-center space-x-4 mt-4">
        <Button
          variant="default"
          disabled={
            !selectedResponseFrequency &&
            !selectedTotalObserved &&
            !selectedFactor &&
            selectedCovariates.length === 0
          }
        >
          OK
        </Button>
        <Button variant="outline" disabled>
          Paste
        </Button>
        <Button variant="outline">
          Reset
        </Button>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="outline">
          Help
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ModalProbit;
