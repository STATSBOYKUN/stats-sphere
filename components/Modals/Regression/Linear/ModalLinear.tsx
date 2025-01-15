// components/Modals/Regression/Linear/ModalLinear.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useVariableStore, VariableRow } from '@/stores/useVariableStore';
import { useDataStore } from '@/stores/useDataStore';
import useResultStore from '@/stores/useResultStore';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pencil, ArrowRight } from 'lucide-react';
import { useLinear } from '@/hooks/useLinear';

interface Variable {
  name: string;
  type: 'numeric' | 'categorical';
  columnIndex: number;
}

interface ModalLinearProps {
  onClose: () => void;
}

const ModalLinear: React.FC<ModalLinearProps> = ({ onClose }) => {
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);
  const [selectedDependentVariable, setSelectedDependentVariable] = useState<Variable | null>(null);
  const [selectedIndependentVariables, setSelectedIndependentVariables] = useState<Variable[]>([]);
  const [selectedSelectionVariable, setSelectedSelectionVariable] = useState<Variable | null>(null);
  const [selectedCaseLabelsVariable, setSelectedCaseLabelsVariable] = useState<Variable | null>(null);
  const [selectedWLSWeightVariable, setSelectedWLSWeightVariable] = useState<Variable | null>(null);
  const [highlightedVariable, setHighlightedVariable] = useState<Variable | null>(null);
  const [method, setMethod] = useState<string>('Enter');

  const variables = useVariableStore((state) => state.variables);
  const data = useDataStore((state) => state.data);

  // Import fungsi regresi dan store hasil
  const { calculateLinearRegression } = useLinear();
  const { addLog, addAnalytic, addStatistic } = useResultStore();

  useEffect(() => {
    // Map VariableRow ke Variable, asumsikan VariableRow memiliki 'name', 'type', 'columnIndex'
    const availableVars: Variable[] = variables
      .filter(v => v.name) // Filter variabel tanpa nama
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

  // Handlers for removing variables
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

  const handleRemoveFromSelectionVariable = () => {
    if (selectedSelectionVariable) {
      setAvailableVariables((prev) => [...prev, selectedSelectionVariable]);
      setSelectedSelectionVariable(null);
    }
  };

  const handleRemoveFromCaseLabelsVariable = () => {
    if (selectedCaseLabelsVariable) {
      setAvailableVariables((prev) => [...prev, selectedCaseLabelsVariable]);
      setSelectedCaseLabelsVariable(null);
    }
  };

  const handleRemoveFromWLSWeightVariable = () => {
    if (selectedWLSWeightVariable) {
      setAvailableVariables((prev) => [...prev, selectedWLSWeightVariable]);
      setSelectedWLSWeightVariable(null);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Fungsi handleAnalyze untuk melakukan regresi linier
  const handleAnalyze = async () => {
    try {
      const dependentVarName = selectedDependentVariable?.name;
      const independentVarNames = selectedIndependentVariables.map(v => v.name);

      if (!dependentVarName || independentVarNames.length === 0) {
        alert('Please select a dependent variable and at least one independent variable.');
        return;
      }

      // 1. Buat log command
      const logMessage = `REGRESSION 
  /MISSING LISTWISE 
  /STATISTICS COEFF OUTS R ANOVA 
  /CRITERIA=PIN(.05) POUT(.10) 
  /NOORIGIN 
  /DEPENDENT ${dependentVarName} 
  /METHOD=${method.toUpperCase()} ${independentVarNames.join(' ')}.`;

      const log = { log: logMessage };
      const logId = await addLog(log);

      // 2. Tambahkan Analytic dengan judul "Regression"
      const analytic = {
        title: "Regression",
        log_id: logId,
        note: "",
      };
      const analyticId = await addAnalytic(analytic);

      // 3. Lakukan regresi linier
      const allVariables = variables;
      const dataRows = data; // data adalah array dari baris, setiap baris adalah array string

      // Dapatkan indeks kolom
      const dependentVar = allVariables.find(v => v.name === dependentVarName);
      const independentVars = independentVarNames.map(name => allVariables.find(v => v.name === name)).filter(v => v) as VariableRow[];

      const dependentVarIndex = dependentVar?.columnIndex;
      const independentVarIndices = independentVars.map(v => v.columnIndex);

      if (dependentVarIndex === undefined || independentVarIndices.includes(undefined)) {
        throw new Error('Variable indices not found.');
      }

      // Pastikan TypeScript mengetahui bahwa indeks tidak undefined
      const depVarIndex = dependentVarIndex as number;
      const indepVarIndices = independentVarIndices as number[];

      // Dapatkan data untuk variabel
      const dependentData = dataRows.map(row => parseFloat(row[depVarIndex]));
      const independentData = indepVarIndices.map(index => dataRows.map(row => parseFloat(row[index])));

      // Handle missing data
      const validIndices = dependentData.map((value, idx) => {
        if (isNaN(value) || independentData.some(indepData => isNaN(indepData[idx]))) {
          return false;
        }
        return true;
      });

      // Filter data yang valid
      const filteredDependentData = dependentData.filter((_, idx) => validIndices[idx]);
      const filteredIndependentData = independentData.map(indepData => indepData.filter((_, idx) => validIndices[idx]));

      // Transpose independentData
      const independentDataTransposed = filteredIndependentData[0].map((_, idx) => filteredIndependentData.map(indepData => indepData[idx]));

      // Lakukan regresi linier
      const regressionResults = calculateLinearRegression(filteredDependentData, independentDataTransposed);

      // 4. Masukkan hasil ke dalam Statistic
      // Variables Entered/Removed
      const variablesEnteredRemoved = {
        title: "Variables Entered/Removed",
        data: [
          {
            "Model": 1,
            "Variables Entered": independentVarNames.join(', '),
            "Variables Removed": ".",
            "Method": method,
          }
        ],
        footnotes: [
          `a Dependent Variable: ${dependentVarName}`,
          "b All requested variables entered.",
        ],
      };

      const variablesEnteredRemovedStat = {
        analytic_id: analyticId,
        title: "Variables Entered/Removed",
        output_data: JSON.stringify(variablesEnteredRemoved),
        output_type: "table",
        components: "VariablesEnteredRemoved",
      };

      await addStatistic(variablesEnteredRemovedStat);

      // Model Summary
      const modelSummary = {
        title: "Model Summary",
        data: [
          {
            "Model": 1,
            "R": regressionResults.R.toFixed(3),
            "R Square": regressionResults.RSquare.toFixed(3),
            "Adjusted R Square": regressionResults.adjustedRSquare.toFixed(3),
            "Std. Error of the Estimate": regressionResults.stdErrorEstimate.toFixed(3),
          }
        ],
        footnotes: [
          `a Predictors: (Constant), ${independentVarNames.join(', ')}`,
        ],
      };

      const modelSummaryStat = {
        analytic_id: analyticId,
        title: "Model Summary",
        output_data: JSON.stringify(modelSummary),
        output_type: "table",
        components: "ModelSummary",
      };

      await addStatistic(modelSummaryStat);

      // ANOVA
      const anovaTable = {
        title: "ANOVA",
        data: [
          {
            "Model": "Regression",
            "Sum of Squares": regressionResults.regressionSS.toFixed(3),
            "df": regressionResults.regressionDF,
            "Mean Square": regressionResults.regressionMS.toFixed(3),
            "F": regressionResults.F.toFixed(3),
            "Sig.": regressionResults.pValue.toFixed(3),
          },
          {
            "Model": "Residual",
            "Sum of Squares": regressionResults.residualSS.toFixed(3),
            "df": regressionResults.residualDF,
            "Mean Square": regressionResults.residualMS.toFixed(3),
          },
          {
            "Model": "Total",
            "Sum of Squares": regressionResults.totalSS.toFixed(3),
            "df": regressionResults.totalDF,
          },
        ],
        footnotes: [
          `a Dependent Variable: ${dependentVarName}`,
          `b Predictors: (Constant), ${independentVarNames.join(', ')}`,
        ],
      };

      const anovaStat = {
        analytic_id: analyticId,
        title: "ANOVA",
        output_data: JSON.stringify(anovaTable),
        output_type: "table",
        components: "ANOVA",
      };

      await addStatistic(anovaStat);

      // Coefficients
      const coefficientsData = regressionResults.coefficients.map((coef, idx) => {
        return {
          "Model": 1,
          "Unstandardized Coefficients B": coef.coefficient.toFixed(3),
          "Std. Error": coef.stdError.toFixed(3),
          "Standardized Coefficients Beta": coef.standardizedCoefficient !== null ? coef.standardizedCoefficient.toFixed(3) : "",
          "t": coef.tValue.toFixed(3),
          "Sig.": coef.pValue.toFixed(3),
          "Variable": idx === 0 ? "(Constant)" : independentVarNames[idx - 1],
        };
      });

      const coefficientsTable = {
        title: "Coefficients",
        data: coefficientsData,
        footnotes: [
          `a Dependent Variable: ${dependentVarName}`,
        ],
      };

      const coefficientsStat = {
        analytic_id: analyticId,
        title: "Coefficients",
        output_data: JSON.stringify(coefficientsTable),
        output_type: "table",
        components: "Coefficients",
      };

      await addStatistic(coefficientsStat);

      // Tutup modal
      onClose();

    } catch (error) {
      console.error('Failed to perform linear regression:', error);
      alert('Failed to perform linear regression. Please check your data and try again.');
    }
  };

  return (
    <DialogContent className="sm:max-w-[900px]">
      <DialogHeader>
        <DialogTitle>Linear Regression</DialogTitle>
      </DialogHeader>

      <Separator className="my-0" />

      <div className="grid grid-cols-12 gap-4 py-4">
        {/* Kolom Pertama: Daftar Variabel */}
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
                {/* Hanya Ikon Pencil */}
                <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                {variable.name}
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Kolom Kedua: Tombol Panah dan Panel Variabel */}
        <div className="col-span-6 space-y-4">
          {/* Variabel Dependen */}
          <div className="flex items-center">
            {/* Tombol Panah */}
            <Button
              variant="outline"
              onClick={handleMoveToDependent}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2 mt-6"
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
            </div>
          </div>

          {/* Variabel Independen */}
          <div className="flex items-center">
            {/* Tombol Panah */}
            <Button
              variant="outline"
              onClick={handleMoveToIndependent}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2 mt-6"
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

          {/* Method */}
          <div className="flex items-center">
            <div className="flex-1 ml-[50%]">
              <label className="font-semibold">Method</label>
              <Select onValueChange={(value) => setMethod(value)} value={method}>
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder="Select a method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enter">Enter</SelectItem>
                  <SelectItem value="Stepwise">Stepwise</SelectItem>
                  <SelectItem value="Forward">Forward</SelectItem>
                  <SelectItem value="Backward">Backward</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Variabel lainnya... */}

        </div>

        {/* Kolom Ketiga: Tombol Tambahan */}
        <div className="col-span-3 space-y-4">
          <Button variant="outline" className="w-full">
            Statistics...
          </Button>
          <Button variant="outline" className="w-full">
            Plots...
          </Button>
          <Button variant="outline" className="w-full">
            Save...
          </Button>
          <Button variant="outline" className="w-full">
            Options...
          </Button>
          <Button variant="outline" className="w-full">
            Style...
          </Button>
          <Button variant="outline" className="w-full">
            Bootstrap...
          </Button>
        </div>
      </div>

      <DialogFooter className="flex justify-center space-x-4 mt-4">
        <Button onClick={handleAnalyze}>OK</Button>
        <Button variant="outline">Paste</Button>
        <Button variant="outline">Reset</Button>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="outline">Help</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ModalLinear;
