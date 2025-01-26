// components/Modals/Quantiles/ModalQuantiles.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pencil, ArrowRight } from 'lucide-react';
import { useVariableStore } from '@/stores/useVariableStore';
import { useDataStore } from '@/stores/useDataStore';
import useResultStore from '@/stores/useResultStore';

interface Variable {
  name: string;
  type: 'numeric' | 'categorical';
  columnIndex: number;
}

interface ModalQuantilesProps {
  onClose: () => void;
}

const ModalQuantiles: React.FC<ModalQuantilesProps> = ({ onClose }) => {
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);
  const [selectedTargetVariable, setSelectedTargetVariable] = useState<Variable | null>(null);
  const [selectedFactors, setSelectedFactors] = useState<Variable[]>([]);
  const [selectedCovariates, setSelectedCovariates] = useState<Variable[]>([]);
  const [selectedWeightVariable, setSelectedWeightVariable] = useState<Variable | null>(null);
  const [highlightedVariable, setHighlightedVariable] = useState<Variable | null>(null);
  const [conserveMemory, setConserveMemory] = useState<boolean>(false);

  const variables = useVariableStore((state) => state.variables);
  const data = useDataStore((state) => state.data);

  const resultStore = useResultStore(); // Jika diperlukan untuk log atau hasil

  useEffect(() => {
    // Menggunakan data dari store, tidak menggunakan data dummy
    const availableVars: Variable[] = variables
      .filter(v => v.name) // Filter variabel tanpa nama
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

  const handleMoveToTarget = () => {
    if (highlightedVariable) {
      setSelectedTargetVariable(highlightedVariable);
      setAvailableVariables((prev) => prev.filter((v) => v.name !== highlightedVariable.name));
      setHighlightedVariable(null);
    }
  };

  const handleMoveToFactors = () => {
    if (highlightedVariable) {
      setSelectedFactors((prev) => [...prev, highlightedVariable]);
      setAvailableVariables((prev) => prev.filter((v) => v.name !== highlightedVariable.name));
      setHighlightedVariable(null);
    }
  };

  const handleMoveToCovariates = () => {
    if (highlightedVariable) {
      setSelectedCovariates((prev) => [...prev, highlightedVariable]);
      setAvailableVariables((prev) => prev.filter((v) => v.name !== highlightedVariable.name));
      setHighlightedVariable(null);
    }
  };

  const handleMoveToWeight = () => {
    if (highlightedVariable) {
      setSelectedWeightVariable(highlightedVariable);
      setAvailableVariables((prev) => prev.filter((v) => v.name !== highlightedVariable.name));
      setHighlightedVariable(null);
    }
  };

  // Handlers untuk menghapus variabel dari field
  const handleRemoveTarget = () => {
    if (selectedTargetVariable) {
      setAvailableVariables((prev) => [...prev, selectedTargetVariable]);
      setSelectedTargetVariable(null);
    }
  };

  const handleRemoveFactor = (variable: Variable) => {
    setAvailableVariables((prev) => [...prev, variable]);
    setSelectedFactors((prev) => prev.filter((v) => v.name !== variable.name));
  };

  const handleRemoveCovariate = (variable: Variable) => {
    setAvailableVariables((prev) => [...prev, variable]);
    setSelectedCovariates((prev) => prev.filter((v) => v.name !== variable.name));
  };

  const handleRemoveWeight = () => {
    if (selectedWeightVariable) {
      setAvailableVariables((prev) => [...prev, selectedWeightVariable]);
      setSelectedWeightVariable(null);
    }
  };

  const handleReset = () => {
    setSelectedTargetVariable(null);
    setSelectedFactors([]);
    setSelectedCovariates([]);
    setSelectedWeightVariable(null);
    setHighlightedVariable(null);
    setConserveMemory(false);
    // Reset availableVariables sesuai kebutuhan, misalnya fetch ulang
    const availableVars: Variable[] = variables
      .filter(v => v.name)
      .map((v) => ({
        name: v.name,
        type: v.type as 'numeric' | 'categorical',
        columnIndex: v.columnIndex,
      }));
    setAvailableVariables(availableVars);
  };

  const handleClose = () => {
    onClose();
  };

  // Handler untuk menjalankan analisis (placeholder)
  const handleRunAnalysis = () => {
    // Implementasi analisis kuantil akan dilakukan di sini
    // Saat ini hanya menutup modal
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-[1000px]">
      <DialogHeader>
        <DialogTitle>Quantile Regression</DialogTitle>
      </DialogHeader>

      <Separator className="my-4" />

      <div className="grid grid-cols-12 gap-4 py-4">
        {/* Bagian Kiri: List Variabel */}
        <div className="col-span-3 border p-4 rounded-md max-h-[500px] overflow-y-auto">
          <label className="font-semibold">Variables</label>
          <ScrollArea className="mt-2 h-[450px]">
            {availableVariables.map((variable) => (
              <div
                key={variable.name}
                className={`flex items-center p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${
                  highlightedVariable?.name === variable.name ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                }`}
                onClick={() => handleSelectAvailableVariable(variable)}
              >
                <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                {variable.name}
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Bagian Tengah-Kanan: Field Input Kategori */}
        <div className="col-span-6 space-y-6">
          {/* Target Variable */}
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={handleMoveToTarget}
              disabled={!highlightedVariable}
              className="mr-2"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Target Variable</label>
              <div
                className="mt-2 p-2 border rounded-md min-h-[50px] cursor-pointer flex items-center"
                onClick={handleRemoveTarget}
              >
                {selectedTargetVariable ? (
                  <>
                    <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                    {selectedTargetVariable.name}
                  </>
                ) : (
                  <span className="text-gray-500">[None]</span>
                )}
              </div>
            </div>
          </div>

          {/* Factors */}
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={handleMoveToFactors}
              disabled={!highlightedVariable}
              className="mr-2"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Factor(s)</label>
              <div className="mt-2 p-2 border rounded-md min-h-[100px]">
                {selectedFactors.length > 0 ? (
                  selectedFactors.map((variable) => (
                    <div
                      key={variable.name}
                      className="flex items-center p-1 cursor-pointer hover:bg-gray-100 rounded-md"
                      onClick={() => handleRemoveFactor(variable)}
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
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={handleMoveToCovariates}
              disabled={!highlightedVariable}
              className="mr-2"
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
                      onClick={() => handleRemoveCovariate(variable)}
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

          {/* Weight Variable */}
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={handleMoveToWeight}
              disabled={!highlightedVariable}
              className="mr-2"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Weight Variable</label>
              <div
                className="mt-2 p-2 border rounded-md min-h-[50px] cursor-pointer flex items-center"
                onClick={handleRemoveWeight}
              >
                {selectedWeightVariable ? (
                  <>
                    <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                    {selectedWeightVariable.name}
                  </>
                ) : (
                  <span className="text-gray-500">[None]</span>
                )}
              </div>
            </div>
          </div>

          {/* Checkbox Conserve Memory */}
          <div className="mt-4 flex items-center">
            <Checkbox
              id="conserve-memory"
              checked={conserveMemory}
              onCheckedChange={(checked) => setConserveMemory(checked)}
            />
            <label htmlFor="conserve-memory" className="ml-2 text-sm">
              Conserve memory for complex analysis or large datasets
            </label>
          </div>
        </div>

        {/* Bagian Samping Kanan: Opsi dan Menu */}
        <div className="col-span-3 space-y-4">
          <Button variant="outline" className="w-full">
            Criteria...
          </Button>
          <Button variant="outline" className="w-full">
            Model...
          </Button>
          <Button variant="outline" className="w-full">
            Display...
          </Button>
          <Button variant="outline" className="w-full">
            Save...
          </Button>
          <Button variant="outline" className="w-full">
            Export...
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Bagian Bawah: Tombol Navigasi */}
      <DialogFooter className="flex justify-center space-x-4 mt-4">
        <Button onClick={handleRunAnalysis}>OK</Button>
        <Button variant="outline">Paste</Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="outline">Help</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ModalQuantiles;
