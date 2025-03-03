// components/Modals/Regression/BinaryLogistic/ModalBinaryLogistic.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useVariableStore, VariableRow } from '@/stores/useVariableStore';
import { useDataStore } from '@/stores/useDataStore';
import {useResultStore} from '@/stores/useResultStore';
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

interface ModalBinaryLogisticProps {
  onClose: () => void;
}

const ModalBinaryLogistic: React.FC<ModalBinaryLogisticProps> = ({ onClose }) => {
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);
  const [selectedDependentVariable, setSelectedDependentVariable] = useState<Variable | null>(null);
  const [selectedCovariates, setSelectedCovariates] = useState<Variable[]>([]);
  const [selectedSelectionVariables, setSelectedSelectionVariables] = useState<Variable[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<number>(1);
  const [totalBlocks, setTotalBlocks] = useState<number>(1);
  const [highlightedVariable, setHighlightedVariable] = useState<Variable | null>(null);
  const [method, setMethod] = useState<string>('Enter');

  const variables = useVariableStore((state) => state.variables);
  const data = useDataStore((state) => state.data);

  // Import fungsi regresi dan store hasil
  const { calculateBinaryLogisticRegression } = useLinear();
  const { addLog, addAnalytic, addStatistic } = useResultStore();

  useEffect(() => {
    // Inisialisasi variabel yang tersedia
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

  const handleMoveToDependent = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      if (selectedDependentVariable) {
        // Kembalikan variabel dependen yang ada ke daftar tersedia
        setAvailableVariables((prev) => [...prev, selectedDependentVariable]);
      }
      setSelectedDependentVariable(highlightedVariable);
      setAvailableVariables((prev) => prev.filter((item) => item !== highlightedVariable));
      setHighlightedVariable(null);
    }
  };

  const handleMoveToCovariates = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      setSelectedCovariates((prev) => [...prev, highlightedVariable]);
      setAvailableVariables((prev) => prev.filter((item) => item !== highlightedVariable));
      setHighlightedVariable(null);
    }
  };

  const handleMoveToSelectionVariables = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      setSelectedSelectionVariables((prev) => [...prev, highlightedVariable]);
      setAvailableVariables((prev) => prev.filter((item) => item !== highlightedVariable));
      setHighlightedVariable(null);
    }
  };

  // Handlers untuk menghapus variabel
  const handleRemoveFromDependent = () => {
    if (selectedDependentVariable) {
      setAvailableVariables((prev) => [...prev, selectedDependentVariable]);
      setSelectedDependentVariable(null);
    }
  };

  const handleRemoveFromCovariates = (variable: Variable) => {
    setAvailableVariables((prev) => [...prev, variable]);
    setSelectedCovariates((prev) => prev.filter((item) => item !== variable));
  };

  const handleRemoveFromSelectionVariables = (variable: Variable) => {
    setAvailableVariables((prev) => [...prev, variable]);
    setSelectedSelectionVariables((prev) => prev.filter((item) => item !== variable));
  };

  const handleAddInteractionTerm = () => {
    // Implementasi untuk menambahkan interaksi antar kovariat
    // Misalnya, membuka dialog atau menambahkan ke state
    // Placeholder untuk tombol a > b >
    alert('Fitur penambahan interaksi belum diimplementasikan.');
  };

  const handleAddBlock = () => {
    setTotalBlocks((prev) => prev + 1);
    setSelectedBlock((prev) => prev + 1);
  };

  const handleRemoveBlock = () => {
    if (selectedBlock > 1) {
      setSelectedBlock((prev) => prev - 1);
      setTotalBlocks((prev) => prev - 1);
    }
  };

  const handleRule = () => {
    // Placeholder untuk fungsi tombol "Rule..."
    alert('Fitur Rule... belum diimplementasikan.');
  };

  const handleClose = () => {
    onClose();
  };

  // Fungsi handleAnalyze untuk melakukan regresi logistik biner
  const handleAnalyze = async () => {
    // Implementasi analisis regresi logistik biner
    // Placeholder: fungsi ini dapat diadaptasi dari ModalLinear
    try {
      const dependentVarName = selectedDependentVariable?.name;
      const covariateNames = selectedCovariates.map(v => v.name);
      const selectionVarNames = selectedSelectionVariables.map(v => v.name);

      if (!dependentVarName || covariateNames.length === 0) {
        alert('Silakan pilih variabel dependen dan setidaknya satu kovariat.');
        return;
      }

      // 1. Buat log command
      const logMessage = `LOGISTIC REGRESSION
/MISSING LISTWISE
/CRITERIA=PIN(0.05) POUT(0.10)
/METHOD=${method.toUpperCase()} ${covariateNames.join(' ')}.`;

      const log = { log: logMessage };
      const logId = await addLog(log);

      // 2. Tambahkan Analytic dengan judul "Binary Logistic Regression"
      const analytic = {
        title: "Binary Logistic Regression",
        log_id: logId,
        note: "",
      };
      const analyticId = await addAnalytic(analytic);

      // 3. Lakukan regresi logistik biner
      const allVariables = variables;
      const dataRows = data; // data adalah array dari baris, setiap baris adalah array string

      // Dapatkan indeks kolom
      const dependentVar = allVariables.find(v => v.name === dependentVarName);
      const covariates = covariateNames.map(name => allVariables.find(v => v.name === name)).filter(v => v) as VariableRow[];

      const dependentVarIndex = dependentVar?.columnIndex;
      const covarIndices = covariates.map(v => v.columnIndex);

      if (dependentVarIndex === undefined || covarIndices.includes(undefined)) {
        throw new Error('Indeks variabel tidak ditemukan.');
      }

      // Pastikan TypeScript mengetahui bahwa indeks tidak undefined
      const depVarIndex = dependentVarIndex as number;
      const covarIndicesValid = covarIndices as number[];

      // Dapatkan data untuk variabel
      const dependentData = dataRows.map(row => row[depVarIndex]);
      const covariateData = covarIndicesValid.map(index => dataRows.map(row => row[index]));

      // Handle missing data
      const validIndices = dependentData.map((value, idx) => {
        if (value === '' || covariateData.some(covar => covar[idx] === '')) {
          return false;
        }
        return true;
      });

      // Filter data yang valid
      const filteredDependentData = dependentData.filter((_, idx) => validIndices[idx]);
      const filteredCovariateData = covariateData.map(covar => covar.filter((_, idx) => validIndices[idx]));

      // Lakukan regresi logistik biner
      const regressionResults = calculateBinaryLogisticRegression(filteredDependentData, filteredCovariateData);

      // 4. Masukkan hasil ke dalam Statistic
      // Variables Entered/Removed
      const variablesEnteredRemoved = {
        title: "Variables Entered/Removed",
        data: [
          {
            "Model": 1,
            "Variables Entered": covariateNames.join(', '),
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
            "Log Likelihood": regressionResults.logLikelihood.toFixed(3),
            "Chi-Square": regressionResults.chiSquare.toFixed(3),
            "df": regressionResults.chiSquareDF,
            "Sig.": regressionResults.chiSquarePValue.toFixed(3),
          }
        ],
        footnotes: [
          `a Predictors: ${covariateNames.join(', ')}`,
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

      // Classification Table
      const classificationTable = {
        title: "Classification Table",
        data: [
          {
            "Observed Positive": regressionResults.observedPositive,
            "Observed Negative": regressionResults.observedNegative,
            "Predicted Positive": regressionResults.predictedPositive,
            "Predicted Negative": regressionResults.predictedNegative,
            "Overall Accuracy": `${regressionResults.overallAccuracy}%`,
          }
        ],
        footnotes: [
          `a Dependent Variable: ${dependentVarName}`,
        ],
      };

      const classificationStat = {
        analytic_id: analyticId,
        title: "Classification Table",
        output_data: JSON.stringify(classificationTable),
        output_type: "table",
        components: "ClassificationTable",
      };

      await addStatistic(classificationStat);

      // Coefficients
      const coefficientsData = regressionResults.coefficients.map((coef, idx) => {
        return {
          "Model": 1,
          "B": coef.coefficient.toFixed(3),
          "S.E.": coef.stdError.toFixed(3),
          "Wald": coef.wald.toFixed(3),
          "df": coef.df,
          "Sig.": coef.pValue.toFixed(3),
          "Exp(B)": coef.expCoefficient.toFixed(3),
          "Variable": idx === 0 ? "(Constant)" : covariateNames[idx - 1],
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
      console.error('Gagal melakukan regresi logistik biner:', error);
      alert('Gagal melakukan regresi logistik biner. Silakan periksa data Anda dan coba lagi.');
    }
  };

  return (
    <DialogContent className="sm:max-w-[900px]">
      <DialogHeader>
        <DialogTitle>Binary Logistic Regression</DialogTitle>
      </DialogHeader>

      <Separator className="my-0" />

      <div className="grid grid-cols-12 gap-4 py-4">
        {/* Panel Kiri: Daftar Variabel */}
        <div className="col-span-3 border p-4 rounded-md max-h-[500px] overflow-y-auto">
          <label className="font-semibold">Variable List</label>
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

        {/* Panel Tengah: Konfigurasi Utama */}
        <div className="col-span-6 space-y-6">
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

          {/* Block Structure */}
          <div className="flex items-center">
            <label className="font-semibold mr-4">Block Structure:</label>
            <span>Block {selectedBlock} of {totalBlocks}</span>
            <div className="ml-4 space-x-2">
              <Button
                variant="outline"
                onClick={handleRemoveBlock}
                disabled={selectedBlock === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleAddBlock}
              >
                Next
              </Button>
            </div>
          </div>

          {/* Kovariat */}
          <div className="flex items-start">
            {/* Tombol Panah */}
            <Button
              variant="outline"
              onClick={handleMoveToCovariates}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2 mt-2"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Covariates</label>
              <div className="mt-2 p-2 border rounded-md min-h-[100px]">
                {selectedCovariates.length > 0 ? (
                  selectedCovariates.map((variable) => (
                    <div
                      key={variable.name}
                      className="flex items-center p-1 cursor-pointer hover:bg-gray-100 rounded-md"
                      onClick={() => handleRemoveFromCovariates(variable)}
                    >
                      <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                      {variable.name}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">[None]</span>
                )}
              </div>
              {/* Tombol Interaksi */}
              <Button
                variant="outline"
                className="mt-2"
                onClick={handleAddInteractionTerm}
              >
                a &gt; b &gt;
              </Button>
            </div>
          </div>

          {/* Method Dropdown */}
          <div className="flex items-center">
            <label className="font-semibold mr-4">Method:</label>
            <Select onValueChange={(value) => setMethod(value)} value={method}>
              <SelectTrigger className="w-48">
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

          {/* Selection Variable */}
          <div className="flex items-center">
            {/* Tombol Panah */}
            <Button
              variant="outline"
              onClick={handleMoveToSelectionVariables}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2 mt-1"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1 flex items-center">
              <div className="flex-1">
                <label className="font-semibold">Selection Variable</label>
                <div className="mt-2 p-2 border rounded-md min-h-[50px]">
                  {selectedSelectionVariables.length > 0 ? (
                    selectedSelectionVariables.map((variable) => (
                      <div
                        key={variable.name}
                        className="flex items-center p-1 cursor-pointer hover:bg-gray-100 rounded-md"
                        onClick={() => handleRemoveFromSelectionVariables(variable)}
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
              {/* Tombol Rule... */}
              <Button
                variant="outline"
                className="ml-2 mt-6"
                onClick={handleRule}
              >
                Rule...
              </Button>
            </div>
          </div>
        </div>

        {/* Panel Kanan: Opsi Tambahan */}
        <div className="col-span-3 space-y-4">
          <Button variant="outline" className="w-full">
            Categorical...
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

export default ModalBinaryLogistic;
