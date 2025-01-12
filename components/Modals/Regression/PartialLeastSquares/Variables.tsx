// components/Modals/PartialLeastSquares/Variables.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight } from 'lucide-react';

interface Variable {
  name: string;
  type: 'numeric' | 'categorical';
  columnIndex: number;
}

interface VariablesProps {
  availableVariables: Variable[];
  selectedDependentVariable: Variable | null;
  setSelectedDependentVariable: React.Dispatch<React.SetStateAction<Variable | null>>;
  selectedIndependentVariables: Variable[];
  setSelectedIndependentVariables: React.Dispatch<React.SetStateAction<Variable[]>>;
  selectedCaseIdentifierVariable: Variable | null;
  setSelectedCaseIdentifierVariable: React.Dispatch<React.SetStateAction<Variable | null>>;
  highlightedVariable: Variable | null;
  setHighlightedVariable: React.Dispatch<React.SetStateAction<Variable | null>>;
  handleMoveToDependent: () => void;
  handleMoveToIndependent: () => void;
  handleMoveToCaseIdentifier: () => void;
  handleRemoveFromDependent: () => void;
  handleRemoveFromIndependent: (variable: Variable) => void;
  handleRemoveFromCaseIdentifier: () => void;
}

const Variables: React.FC<VariablesProps> = ({
  availableVariables,
  selectedDependentVariable,
  setSelectedDependentVariable,
  selectedIndependentVariables,
  setSelectedIndependentVariables,
  selectedCaseIdentifierVariable,
  setSelectedCaseIdentifierVariable,
  highlightedVariable,
  setHighlightedVariable,
  handleMoveToDependent,
  handleMoveToIndependent,
  handleMoveToCaseIdentifier,
  handleRemoveFromDependent,
  handleRemoveFromIndependent,
  handleRemoveFromCaseIdentifier,
}) => {
  const [maxLatentFactors, setMaxLatentFactors] = useState<number>(5);

  const handleSelectAvailableVariable = (variable: Variable) => {
    setHighlightedVariable(variable);
  };

  const handleMaxLatentFactorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setMaxLatentFactors(isNaN(value) ? 1 : value);
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Panel Kiri - Variables */}
      <div className="col-span-4 border p-4 rounded-md max-h-[500px] overflow-y-auto">
        <label className="font-semibold">Variables:</label>
        <ScrollArea className="mt-2 h-[400px]">
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
              <Pencil className="h-5 w-5 mr-2 text-gray-600" />
              {variable.name}
            </div>
          ))}
        </ScrollArea>
        <p className="text-sm text-gray-600 mt-4">
          To change the measurement level of a variable, right-click the variable in the Variables list.
        </p>
      </div>

      {/* Panel Kanan - Target Fields dengan Tombol Panah di Sebelah Kiri */}
      <div className="col-span-8 space-y-6">
        {/* Dependent Variable */}
        <div className="flex items-center">
          <Button
            variant="outline" // Ubah variant menjadi 'outline'
            onClick={handleMoveToDependent}
            disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
            className="mr-2" // Ubah className menjadi 'mr-2'
            aria-label="Move to Dependent Variable"
          >
            <ArrowRight />
          </Button>
          <div className="flex-1">
            <label className="font-semibold">Dependent Variable</label>
            <div
              className="mt-2 p-2 border rounded-md min-h-[50px] cursor-pointer flex items-center"
              onClick={handleRemoveFromDependent}
            >
              {selectedDependentVariable ? (
                <>
                  <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                  {selectedDependentVariable.name}
                </>
              ) : (
                <span className="text-gray-500">[None]</span>
              )}
            </div>
          </div>
        </div>

        {/* Independent Variables */}
        <div className="flex items-start">
          <Button
            variant="outline" // Ubah variant menjadi 'outline'
            onClick={handleMoveToIndependent}
            disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
            className="mr-2" // Ubah className menjadi 'mr-2'
            aria-label="Move to Independent Variables"
          >
            <ArrowRight />
          </Button>
          <div className="flex-1">
            <label className="font-semibold">Independent Variables</label>
            <div className="mt-2 p-2 border rounded-md min-h-[100px]">
              {selectedIndependentVariables.length > 0 ? (
                selectedIndependentVariables.map((variable) => (
                  <div
                    key={variable.name}
                    className="flex items-center p-1 cursor-pointer hover:bg-gray-100 rounded-md"
                    onClick={() => handleRemoveFromIndependent(variable)}
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

        {/* Case Identifier Variable */}
        <div className="flex items-center">
          <Button
            variant="outline" // Ubah variant menjadi 'outline'
            onClick={handleMoveToCaseIdentifier}
            disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
            className="mr-2" // Ubah className menjadi 'mr-2'
            aria-label="Move to Case Identifier Variable"
          >
            <ArrowRight />
          </Button>
          <div className="flex-1">
            <label className="font-semibold">Case Identifier Variable</label>
            <div
              className="mt-2 p-2 border rounded-md min-h-[50px] cursor-pointer flex items-center"
              onClick={handleRemoveFromCaseIdentifier}
            >
              {selectedCaseIdentifierVariable ? (
                <>
                  <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                  {selectedCaseIdentifierVariable.name}
                </>
              ) : (
                <span className="text-gray-500">[None]</span>
              )}
            </div>
          </div>
        </div>

        {/* Maximum Number of Latent Factors */}
        <div className="mt-4 flex justify-end items-center">
          <label className="font-semibold mr-2">Maximum number of latent factors:</label>
          <input
            type="number"
            min={1}
            value={maxLatentFactors}
            onChange={handleMaxLatentFactorsChange}
            className="w-1/4 p-2 border rounded"
          />
        </div>
      </div>
    </div>
  );
};

export default Variables;
