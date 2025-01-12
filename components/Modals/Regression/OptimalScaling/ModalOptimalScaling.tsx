// components/Modals/OptimalScaling/ModalOptimalScaling.tsx

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
import { ArrowRight, ArrowLeft, Pencil } from 'lucide-react';
import { useVariableStore } from '@/stores/useVariableStore';
import { useDataStore } from '@/stores/useDataStore';
// Import komponen UI lainnya sesuai kebutuhan

interface Variable {
  name: string;
  type: 'numeric' | 'categorical';
  columnIndex: number;
}

interface ModalOptimalScalingProps {
  onClose: () => void;
}

const ModalOptimalScaling: React.FC<ModalOptimalScalingProps> = ({
  onClose,
}) => {
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);
  const [selectedDependentVariable, setSelectedDependentVariable] =
    useState<Variable | null>(null);
  const [selectedIndependentVariables, setSelectedIndependentVariables] =
    useState<Variable[]>([]);
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

  const handleMoveToIndependent = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      setSelectedIndependentVariables((prev) => [...prev, highlightedVariable]);
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

  const handleRemoveFromIndependent = (variable: Variable) => {
    setAvailableVariables((prev) => [...prev, variable]);
    setSelectedIndependentVariables((prev) =>
      prev.filter((item) => item !== variable)
    );
  };

  const handleClose = () => {
    onClose();
  };

  // Handler untuk Define Scale (Placeholder)
  const handleDefineScale = (variableType: 'dependent' | 'independent') => {
    if (variableType === 'dependent' && selectedDependentVariable) {
      // Implementasikan logika untuk mendefinisikan skala variabel dependen
      alert(`Define Scale untuk ${selectedDependentVariable.name} (Dependent Variable) belum diimplementasikan.`);
    } else if (variableType === 'independent' && selectedIndependentVariables.length > 0) {
      // Implementasikan logika untuk mendefinisikan skala variabel independen
      alert(`Define Scale untuk Independent Variable(s) belum diimplementasikan.`);
    }
  };

  return (
    <DialogContent className="sm:max-w-[1000px]">
      <DialogHeader>
        <DialogTitle>Optimal Scaling</DialogTitle>
      </DialogHeader>

      <Separator className="my-0" />

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
                <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                {variable.name}
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Panel Tengah: Kotak Dependent & Independent Variables dengan Tombol Pemindah */}
        <div className="col-span-6 space-y-6">
          {/* Dependent Variable */}
          <div className="flex items-start">
            {/* Tombol Panah Kanan untuk Memindahkan ke Dependent Variable */}
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
                className="mt-2 p-2 border rounded-md min-h-[50px] cursor-pointer flex items-center justify-between"
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
              {/* Tombol Define Scale di bawah Dependent Variable */}
              <Button
                variant="outline"
                className="mt-2 w-full"
                disabled={!selectedDependentVariable}
                onClick={() => handleDefineScale('dependent')}
              >
                Define Scale..
              </Button>
            </div>
          </div>

          {/* Independent Variables */}
          <div className="flex items-start">
            {/* Tombol Panah Kanan untuk Memindahkan ke Independent Variable(s) */}
            <Button
              variant="outline"
              onClick={handleMoveToIndependent}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2 mt-1"
              title="Add as Independent Variable"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Independent Variable(s)</label>
              <div className="mt-2 p-2 border rounded-md min-h-[100px]">
                {selectedIndependentVariables.length > 0 ? (
                  selectedIndependentVariables.map((variable) => (
                    <div
                      key={variable.name}
                      className="flex items-center p-1 cursor-pointer hover:bg-gray-100 rounded-md justify-between"
                      onClick={() => handleRemoveFromIndependent(variable)}
                    >
                      <div className="flex items-center">
                        <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                        {variable.name}
                      </div>
                      <ArrowLeft
                        className="h-4 w-4 text-gray-600"
                        onClick={() => handleRemoveFromIndependent(variable)}
                      />
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">[None]</span>
                )}
              </div>
              {/* Tombol Define Scale di bawah Independent Variables */}
              <Button
                variant="outline"
                className="mt-2 w-full"
                disabled={selectedIndependentVariables.length === 0}
                onClick={() => handleDefineScale('independent')}
              >
                Define Scale..
              </Button>
            </div>
          </div>
        </div>

        {/* Panel Kanan: Tombol Opsi Tambahan */}
        <div className="col-span-3 space-y-2">
          <Button variant="outline" className="w-full">
            Discretize...
          </Button>
          <Button variant="outline" className="w-full">
            Missing...
          </Button>
          <Button variant="outline" className="w-full">
            Options...
          </Button>
          <Button variant="outline" className="w-full">
            Regularization...
          </Button>
          <Button variant="outline" className="w-full">
            Output...
          </Button>
          <Button variant="outline" className="w-full">
            Save...
          </Button>
          <Button variant="outline" className="w-full">
            Plots...
          </Button>
        </div>
      </div>

      {/* Tombol Aksi Bawah */}
      <DialogFooter className="flex justify-center space-x-4 mt-4">
        <Button
          variant="default"
          disabled={
            !selectedDependentVariable ||
            selectedIndependentVariables.length === 0
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

export default ModalOptimalScaling;
