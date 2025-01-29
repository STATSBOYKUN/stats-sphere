// components/Modals/PartialLeastSquares/ModalPartialLeastSquares.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowRight } from 'lucide-react';
import { useVariableStore } from '@/stores/useVariableStore';
import { useDataStore } from '@/stores/useDataStore';

import Variables from './Variables';
import Models from './Models';
import Options from './Options';

interface Variable {
  name: string;
  type: 'numeric' | 'categorical';
  columnIndex: number;
}

interface ModalPartialLeastSquaresProps {
  onClose: () => void;
}

const ModalPartialLeastSquares: React.FC<ModalPartialLeastSquaresProps> = ({ onClose }) => {
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);
  const [selectedDependentVariable, setSelectedDependentVariable] = useState<Variable | null>(null);
  const [selectedIndependentVariables, setSelectedIndependentVariables] = useState<Variable[]>([]);
  const [selectedCaseIdentifierVariable, setSelectedCaseIdentifierVariable] = useState<Variable | null>(null);
  const [highlightedVariable, setHighlightedVariable] = useState<Variable | null>(null);

  const variables = useVariableStore((state) => state.variables);
  const data = useDataStore((state) => state.data);

  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState<string>('variables');

  useEffect(() => {
    const availableVars: Variable[] = variables
      .filter(v => v.name)
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

  const handleMoveToDependent = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      if (selectedDependentVariable) {
        setAvailableVariables((prev) => [...prev, selectedDependentVariable]);
      }
      setSelectedDependentVariable(highlightedVariable);
      setAvailableVariables((prev) => prev.filter((item) => item !== highlightedVariable));
      setHighlightedVariable(null);
    }
  };

  const handleMoveToIndependent = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      setSelectedIndependentVariables((prev) => [...prev, highlightedVariable]);
      setAvailableVariables((prev) => prev.filter((item) => item !== highlightedVariable));
      setHighlightedVariable(null);
    }
  };

  const handleMoveToCaseIdentifier = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      if (selectedCaseIdentifierVariable) {
        setAvailableVariables((prev) => [...prev, selectedCaseIdentifierVariable]);
      }
      setSelectedCaseIdentifierVariable(highlightedVariable);
      setAvailableVariables((prev) => prev.filter((item) => item !== highlightedVariable));
      setHighlightedVariable(null);
    }
  };

  // Handlers untuk menghapus variabel dari pilihan
  const handleRemoveFromDependent = () => {
    if (selectedDependentVariable) {
      setAvailableVariables((prev) => [...prev, selectedDependentVariable]);
      setSelectedDependentVariable(null);
    }
  };

  const handleRemoveFromIndependent = (variable: Variable) => {
    setAvailableVariables((prev) => [...prev, variable]);
    setSelectedIndependentVariables((prev) => prev.filter((item) => item !== variable));
  };

  const handleRemoveFromCaseIdentifier = () => {
    if (selectedCaseIdentifierVariable) {
      setAvailableVariables((prev) => [...prev, selectedCaseIdentifierVariable]);
      setSelectedCaseIdentifierVariable(null);
    }
  };

  const handleReset = () => {
    setAvailableVariables(variables.map(v => ({
      name: v.name,
      type: v.type as 'numeric' | 'categorical',
      columnIndex: v.columnIndex,
    })));
    setSelectedDependentVariable(null);
    setSelectedIndependentVariables([]);
    setSelectedCaseIdentifierVariable(null);
    setHighlightedVariable(null);
  };

  const handlePaste = () => {
    // Implementasikan fungsi paste sesuai kebutuhan Anda
    alert('Paste functionality is not implemented yet.');
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Partial Least Squares Regression
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex justify-start mb-4 border-b">
            <TabsTrigger value="variables" className="mr-4">
              Variables
            </TabsTrigger>
            <TabsTrigger value="model" className="mr-4">
              Model
            </TabsTrigger>
            <TabsTrigger value="options" className="mr-4">
              Options
            </TabsTrigger>
          </TabsList>

          {/* Konten Tabs */}
          <TabsContent value="variables">
            <Variables
              availableVariables={availableVariables}
              selectedDependentVariable={selectedDependentVariable}
              setSelectedDependentVariable={setSelectedDependentVariable}
              selectedIndependentVariables={selectedIndependentVariables}
              setSelectedIndependentVariables={setSelectedIndependentVariables}
              selectedCaseIdentifierVariable={selectedCaseIdentifierVariable}
              setSelectedCaseIdentifierVariable={setSelectedCaseIdentifierVariable}
              highlightedVariable={highlightedVariable}
              setHighlightedVariable={setHighlightedVariable}
              handleMoveToDependent={handleMoveToDependent}
              handleMoveToIndependent={handleMoveToIndependent}
              handleMoveToCaseIdentifier={handleMoveToCaseIdentifier}
              handleRemoveFromDependent={handleRemoveFromDependent}
              handleRemoveFromIndependent={handleRemoveFromIndependent}
              handleRemoveFromCaseIdentifier={handleRemoveFromCaseIdentifier}
            />
          </TabsContent>

          <TabsContent value="model">
            <Models />
          </TabsContent>

          <TabsContent value="options">
            <Options />
          </TabsContent>
        </Tabs>

        {/* Pesan Tambahan */}
        <p className="text-sm text-gray-600 mt-4">
          Special setup is required to run the Partial Least Squares Regression procedure. Click Help and see the Prerequisites section for details.
        </p>

        {/* Action Buttons */}
        <DialogFooter>
          <div className="flex justify-center space-x-4 w-full mt-4">
            <Button variant="outline" disabled className="mr-2">
              OK
            </Button>
            <Button variant="outline" onClick={handlePaste} className="mr-2">
              Paste
            </Button>
            <Button variant="outline" onClick={handleReset} className="mr-2">
              Reset
            </Button>
            <Button variant="outline" onClick={handleClose} className="mr-2">
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => alert('Help functionality is not implemented yet.')}
            >
              Help
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalPartialLeastSquares;
