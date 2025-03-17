// components/Modals/Regression/MultinomialLogistic/ModalMultinomialLogistic.tsx

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
import { useVariableStore } from '@/stores/useVariableStore';
import { useDataStore } from '@/stores/useDataStore';
import {useResultStore} from '@/stores/useResultStore';
// Import komponen UI lainnya sesuai kebutuhan

interface Variable {
  name: string;
  type: 'numeric' | 'categorical';
  columnIndex: number;
}

interface ModalMultinomialLogisticProps {
  onClose: () => void;
}

const ModalMultinomialLogistic: React.FC<ModalMultinomialLogisticProps> = ({
  onClose,
}) => {
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);
  const [selectedDependentVariable, setSelectedDependentVariable] =
    useState<Variable | null>(null);
  const [selectedFactorVariables, setSelectedFactorVariables] = useState<
    Variable[]
  >([]);
  const [selectedCovariateVariables, setSelectedCovariateVariables] = useState<
    Variable[]
  >([]);
  const [highlightedVariable, setHighlightedVariable] =
    useState<Variable | null>(null);

  const variables = useVariableStore((state) => state.variables);
  const data = useDataStore((state) => state.data);

  useEffect(() => {
    // Map VariableRow ke Variable, asumsikan VariableRow memiliki 'name', 'type', 'columnIndex'
    const availableVars: Variable[] = variables
      .filter((v) => v.name) // Filter variabel tanpa nama
      .map((v) => ({
        name: v.name,
        type: v.type as 'numeric' | 'categorical',
        columnIndex: v.columnIndex,
      }));
    setAvailableVariables(availableVars);
  }, [variables]);

  // Handlers for selecting and moving variables
  const handleSelectAvailableVariable = (variable: Variable) => {
    setHighlightedVariable(variable);
  };

  const handleMoveToDependent = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      if (selectedDependentVariable) {
        // Pindahkan variabel dependen yang ada kembali ke variabel yang tersedia
        setAvailableVariables((prev) => [...prev, selectedDependentVariable]);
      }
      setSelectedDependentVariable(highlightedVariable);
      setAvailableVariables((prev) =>
        prev.filter((item) => item !== highlightedVariable)
      );
      setHighlightedVariable(null);
    }
  };

  const handleMoveToFactor = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      setSelectedFactorVariables((prev) => [...prev, highlightedVariable]);
      setAvailableVariables((prev) =>
        prev.filter((item) => item !== highlightedVariable)
      );
      setHighlightedVariable(null);
    }
  };

  const handleMoveToCovariate = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      setSelectedCovariateVariables((prev) => [...prev, highlightedVariable]);
      setAvailableVariables((prev) =>
        prev.filter((item) => item !== highlightedVariable)
      );
      setHighlightedVariable(null);
    }
  };

  // Handlers for removing variables
  const handleRemoveFromDependent = () => {
    if (selectedDependentVariable) {
      setAvailableVariables((prev) => [...prev, selectedDependentVariable]);
      setSelectedDependentVariable(null);
    }
  };

  const handleRemoveFromFactor = (variable: Variable) => {
    setAvailableVariables((prev) => [...prev, variable]);
    setSelectedFactorVariables((prev) =>
      prev.filter((item) => item !== variable)
    );
  };

  const handleRemoveFromCovariate = (variable: Variable) => {
    setAvailableVariables((prev) => [...prev, variable]);
    setSelectedCovariateVariables((prev) =>
      prev.filter((item) => item !== variable)
    );
  };

  const handleClose = () => {
    onClose();
  };

  // Handler untuk Reference Category (Placeholder)
  const handleReferenceCategory = () => {
    if (selectedDependentVariable) {
      // Implementasikan logika untuk memilih kategori referensi di sini
      alert(`Reference Category untuk ${selectedDependentVariable.name} belum diimplementasikan.`);
    }
  };

  return (
    <DialogContent className="sm:max-w-[900px]">
      <DialogHeader>
        <DialogTitle>Multinomial Logistic Regression</DialogTitle>
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
                className={`flex items-center p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${
                  highlightedVariable?.name === variable.name
                    ? 'bg-blue-100 border-blue-500'
                    : 'border-gray-300'
                }`}
                onClick={() => handleSelectAvailableVariable(variable)}
              >
                {/* Ikon Pensil */}
                <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                {variable.name}
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Panel Tengah: Kotak Dependent, Factor(s), Covariate(s) */}
        <div className="col-span-6 space-y-6">
          {/* Dependent Variable */}
          <div className="flex items-start">
            {/* Tombol Panah untuk Dependent Variable */}
            <Button
              variant="outline"
              onClick={handleMoveToDependent}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2 mt-1"
              title="Set as Dependent Variable"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Dependent Variable</label>
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
              <Button
                variant="outline"
                className="mt-2 w-full"
                disabled={!selectedDependentVariable}
                onClick={handleReferenceCategory}
              >
                Reference Category...
              </Button>
            </div>
          </div>

          {/* Factor(s) */}
          <div className="flex items-start">
            {/* Tombol Panah untuk Factor(s) */}
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
              <label className="font-semibold">Factor(s)</label>
              <div className="mt-2 p-2 border rounded-md min-h-[100px]">
                {selectedFactorVariables.length > 0 ? (
                  selectedFactorVariables.map((variable) => (
                    <div
                      key={variable.name}
                      className="flex items-center p-1 cursor-pointer hover:bg-gray-100 rounded-md"
                      onClick={() => handleRemoveFromFactor(variable)}
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

          {/* Covariate(s) */}
          <div className="flex items-start">
            {/* Tombol Panah untuk Covariate(s) */}
            <Button
              variant="outline"
              onClick={handleMoveToCovariate}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2 mt-1"
              title="Add as Covariate"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Covariate(s)</label>
              <div className="mt-2 p-2 border rounded-md min-h-[100px]">
                {selectedCovariateVariables.length > 0 ? (
                  selectedCovariateVariables.map((variable) => (
                    <div
                      key={variable.name}
                      className="flex items-center p-1 cursor-pointer hover:bg-gray-100 rounded-md"
                      onClick={() => handleRemoveFromCovariate(variable)}
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
        </div>

        {/* Panel Kanan: Tombol Tambahan */}
        <div className="col-span-3 space-y-2">
          <Button variant="outline" className="w-full">
            Model...
          </Button>
          <Button variant="outline" className="w-full">
            Statistics...
          </Button>
          <Button variant="outline" className="w-full">
            Criteria...
          </Button>
          <Button variant="outline" className="w-full">
            Options...
          </Button>
          <Button variant="outline" className="w-full">
            Save...
          </Button>
          <Button variant="outline" className="w-full">
            Bootstrap...
          </Button>
        </div>
      </div>

      {/* Tombol Aksi Bawah */}
      <DialogFooter className="flex justify-center space-x-4 mt-4">
        <Button
          variant="default"
          disabled={
            !selectedDependentVariable ||
            (selectedFactorVariables.length === 0 &&
              selectedCovariateVariables.length === 0)
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

export default ModalMultinomialLogistic;
