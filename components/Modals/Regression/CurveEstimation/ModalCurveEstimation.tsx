// components/ModalCurveEstimation.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useVariableStore } from '@/stores/useVariableStore';
import { useDataStore } from '@/stores/useDataStore';
import { useCurveEstimation } from '@/hooks/useCurveEstimation';
import { Scatter } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Pencil, ArrowRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

Chart.register(...registerables);

interface Variable {
  name: string;
  type: string; // Changed to string to be compatible with Variable.ts
  columnIndex: number;
}

interface ModalCurveEstimationProps {
  onClose: () => void;
}

const ModalCurveEstimation: React.FC<ModalCurveEstimationProps> = ({ onClose }) => {
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);
  const [selectedDependentVariable, setSelectedDependentVariable] = useState<Variable | null>(null);
  const [selectedIndependentVariables, setSelectedIndependentVariables] = useState<Variable[]>([]);
  const [selectedCaseLabels, setSelectedCaseLabels] = useState<Variable | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>(['Linear']);
  const [includeConstant, setIncludeConstant] = useState<boolean>(true);
  const [plotModels, setPlotModels] = useState<boolean>(true);
  const [displayANOVA, setDisplayANOVA] = useState<boolean>(false);
  const [highlightedVariable, setHighlightedVariable] = useState<Variable | null>(null);
  const [upperBound, setUpperBound] = useState<string>('');

  const variables = useVariableStore((state) => state.variables);
  const data = useDataStore((state) => state.data);

  const {
    tryLinear,
    tryLogarithmic,
    tryInverse,
    tryQuadratic,
    tryCubic,
    tryPower,
    tryCompound,
    trySCurve,
    tryGrowth,
    tryExponential
  } = useCurveEstimation();

  useEffect(() => {
    const availableVars: Variable[] = variables
        .filter((v) => v.name)
        .map((v) => ({
          name: v.name,
          type: String(v.type), // Cast to string instead of specific type
          columnIndex: v.columnIndex,
        }));
    setAvailableVariables(availableVars);
  }, [variables]);

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

  const handleMoveToCaseLabels = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      if (selectedCaseLabels) {
        setAvailableVariables((prev) => [...prev, selectedCaseLabels]);
      }
      setSelectedCaseLabels(highlightedVariable);
      setAvailableVariables((prev) => prev.filter((item) => item !== highlightedVariable));
      setHighlightedVariable(null);
    }
  };

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

  const handleRemoveFromCaseLabels = () => {
    if (selectedCaseLabels) {
      setAvailableVariables((prev) => [...prev, selectedCaseLabels]);
      setSelectedCaseLabels(null);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleModelChange = (model: string) => {
    setSelectedModels((prev) =>
        prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const handleRunRegression = () => {
    // Dapatkan kolom dependent dan independent dari data
    if (!selectedDependentVariable || selectedIndependentVariables.length === 0) {
      console.warn("Pilih dependent dan minimal satu independent variable.");
      return;
    }

    // Ambil data dari store (data: string[][])
    const depCol = selectedDependentVariable.columnIndex;
    const indepCols = selectedIndependentVariables.map(iv => iv.columnIndex);

    // Ubah data menjadi number[] - convert to string first to ensure type safety
    const Y = data.map(row => parseFloat(String(row[depCol] || "0"))).filter(val => !isNaN(val));
    // Untuk kesederhanaan, gunakan hanya independent variable pertama
    const X = data.map(row => parseFloat(String(row[indepCols[0]] || "0"))).filter(val => !isNaN(val));

    // Pastikan panjang X dan Y sama setelah filter NaN
    const length = Math.min(X.length, Y.length);
    const Xtrim = X.slice(0, length);
    const Ytrim = Y.slice(0, length);

    // Jalankan model yang dipilih
    selectedModels.forEach((model) => {
      let result: any = null;
      switch (model) {
        case 'Linear':
          result = tryLinear(Xtrim, Ytrim);
          console.log("=== Linear Model: Y = b0 + b1*X ===");
          console.log("b0:", result.b0, "b1:", result.b1, "R²:", result.r2);
          break;
        case 'Logarithmic':
          result = tryLogarithmic(Xtrim, Ytrim);
          if (result) {
            console.log("=== Logarithmic Model: Y = b0 + b1*ln(X) ===");
            console.log("b0:", result.b0, "b1:", result.b1, "R²:", result.r2);
          } else {
            console.log("Logarithmic Model gagal (X<=0).");
          }
          break;
        case 'Inverse':
          result = tryInverse(Xtrim, Ytrim);
          if (result) {
            console.log("=== Inverse Model: Y = b0 + b1*(1/X) ===");
            console.log("b0:", result.b0, "b1:", result.b1, "R²:", result.r2);
          } else {
            console.log("Inverse Model gagal (X=0).");
          }
          break;
        case 'Quadratic':
          // Quadratic membutuhkan multipleLinearRegression, hasil coefficients[0], [1], [2]
          const quadResult = tryQuadratic(Xtrim, Ytrim);
          console.log("=== Quadratic Model: Y = b0 + b1*X + b2*X² ===");
          console.log("b0:", quadResult.coefficients[0], "b1:", quadResult.coefficients[1], "b2:", quadResult.coefficients[2], "R²:", quadResult.r2);
          break;
        case 'Cubic':
          const cubicResult = tryCubic(Xtrim, Ytrim);
          console.log("=== Cubic Model: Y = b0 + b1*X + b2*X² + b3*X³ ===");
          console.log("b0:", cubicResult.coefficients[0], "b1:", cubicResult.coefficients[1], "b2:", cubicResult.coefficients[2], "b3:", cubicResult.coefficients[3], "R²:", cubicResult.r2);
          break;
        case 'Power':
          result = tryPower(Xtrim, Ytrim);
          if (result) {
            console.log("=== Power Model: Y = b0 * X^(b1) ===");
            console.log("b0:", result.b0, "b1:", result.b1, "R²:", result.r2);
          } else {
            console.log("Power Model gagal (X<=0 atau Y<=0).");
          }
          break;
        case 'Compound':
          result = tryCompound(Xtrim, Ytrim);
          if (result) {
            console.log("=== Compound Model: Y = b0 * (b1^X) ===");
            console.log("b0:", result.b0, "b1:", result.b1, "R²:", result.r2);
          } else {
            console.log("Compound Model gagal (Y<=0).");
          }
          break;
        case 'S':
          result = trySCurve(Xtrim, Ytrim);
          if (result) {
            console.log("=== S-curve Model: Y = exp(b0 + b1*(1/X)) ===");
            console.log("b0:", result.b0, "b1:", result.b1, "R²:", result.r2);
          } else {
            console.log("S-curve Model gagal (X=0 atau Y<=0).");
          }
          break;
        case 'Growth':
          result = tryGrowth(Xtrim, Ytrim);
          if (result) {
            console.log("=== Growth Model: Y = exp(b0 + b1*X) ===");
            console.log("b0:", result.b0, "b1:", result.b1, "R²:", result.r2);
          } else {
            console.log("Growth Model gagal (Y<=0).");
          }
          break;
        case 'Exponential':
          result = tryExponential(Xtrim, Ytrim);
          if (result) {
            console.log("=== Exponential Model: Y = b0 * exp(b1*X) ===");
            console.log("b0:", result.b0, "b1:", result.b1, "R²:", result.r2);
          } else {
            console.log("Exponential Model gagal (Y<=0).");
          }
          break;
        case 'Logistic':
          console.log("Model Logistic belum diimplementasikan dalam contoh ini.");
          break;
        default:
          console.log(`Model ${model} belum diimplementasikan.`);
      }
    });
  };

  const getColorForModel = (model: string) => {
    const colors: { [key: string]: string } = {
      'Linear': 'rgba(255,99,132,1)',
      'Quadratic': 'rgba(54,162,235,1)',
      'Cubic': 'rgba(255,206,86,1)',
      'Logarithmic': 'rgba(75,192,192,1)',
      'Inverse': 'rgba(153,102,255,1)',
      'Power': 'rgba(255,159,64,1)',
      'Compound': 'rgba(199,199,199,1)',
      'S': 'rgba(255,99,255,1)',
      'Logistic': 'rgba(99,255,132,1)',
      'Growth': 'rgba(132,99,255,1)',
      'Exponential': 'rgba(255,50,50,1)',
    };
    return colors[model] || 'rgba(0,0,0,1)';
  };

  return (
      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Curve Estimation</DialogTitle>
        </DialogHeader>

        <Separator className="my-2" />

        <div className="grid grid-cols-12 gap-4 py-4">
          {/* Panel Kiri: Daftar Variabel */}
          <div className="col-span-3 border p-4 rounded-md max-h-[600px] overflow-y-auto">
            <label className="font-semibold">Variables</label>
            <ScrollArea className="mt-2 h-[550px]">
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

          {/* Bagian Tengah */}
          <div className="col-span-6 space-y-6">
            {/* Dependent Variable */}
            <div className="flex items-center">
              <Button
                  variant="outline"
                  onClick={handleMoveToDependent}
                  disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
                  className="mr-2"
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

            {/* Independent Variables */}
            <div className="flex items-center">
              <Button
                  variant="outline"
                  onClick={handleMoveToIndependent}
                  disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
                  className="mr-2"
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

            {/* Case Labels dan Checkboxes */}
            <div className="flex items-start">
              <div className="flex items-center mr-4 w-2/3">
                <Button
                    variant="outline"
                    onClick={handleMoveToCaseLabels}
                    disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
                    className="mr-2"
                >
                  <ArrowRight />
                </Button>
                <div className="flex-1">
                  <label className="font-semibold">Case Labels</label>
                  <div
                      className="mt-2 p-2 border rounded-md min-h-[70px] cursor-pointer"
                      onClick={handleRemoveFromCaseLabels}
                  >
                    {selectedCaseLabels ? (
                        <div className="flex items-center">
                          <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                          {selectedCaseLabels.name}
                        </div>
                    ) : (
                        <span className="text-gray-500">[None]</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2 mt-4 w-1/3">
                <div className="flex items-center">
                  <Checkbox
                      checked={includeConstant}
                      onCheckedChange={(checked: boolean) => setIncludeConstant(checked)}
                  />
                  <span className="ml-2">Include constant in equation</span>
                </div>
                <div className="flex items-center">
                  <Checkbox
                      checked={plotModels}
                      onCheckedChange={(checked: boolean) => setPlotModels(checked)}
                  />
                  <span className="ml-2">Plot models</span>
                </div>
              </div>
            </div>

            {/* Models */}
            <div>
              <label className="font-semibold">Models</label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {[
                  'Linear',
                  'Quadratic',
                  'Compound',
                  'Growth',
                  'Logarithmic',
                  'Cubic',
                  'S',
                  'Exponential',
                  'Inverse',
                  'Power',
                  'Logistic',
                ].map((model) => (
                    <div key={model} className="flex items-center">
                      <Checkbox
                          checked={selectedModels.includes(model)}
                          onCheckedChange={() => handleModelChange(model)}
                      />
                      <span className="ml-2">{model}</span>
                    </div>
                ))}
              </div>
              {selectedModels.includes('Logistic') && (
                  <div className="mt-2">
                    <label className="font-semibold">Upper Bound</label>
                    <Input
                        type="number"
                        placeholder="Enter upper bound"
                        value={upperBound}
                        onChange={(e) => setUpperBound(e.target.value)}
                        className="mt-1"
                    />
                  </div>
              )}
            </div>

            {/* Display ANOVA Table */}
            <div className="flex items-center">
              <Checkbox
                  checked={displayANOVA}
                  onCheckedChange={(checked: boolean) => setDisplayANOVA(checked)}
              />
              <span className="ml-2">Display ANOVA table</span>
            </div>
          </div>

          {/* Panel Kanan: Tombol Save */}
          <div className="col-span-3 flex flex-col justify-start space-y-4">
            <Button variant="outline" onClick={() => alert('Save configuration')}>
              Save
            </Button>
          </div>
        </div>

        <DialogFooter className="flex justify-center space-x-4 mt-4">
          <Button variant="default" onClick={handleRunRegression}>
            OK
          </Button>
          <Button variant="default">Paste</Button>
          <Button variant="default">Reset</Button>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="default">Help</Button>
        </DialogFooter>

      </DialogContent>
  );
};

export default ModalCurveEstimation;