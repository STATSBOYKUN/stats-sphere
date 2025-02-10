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
import useResultStore from '@/stores/useResultStore';

Chart.register(...registerables);

interface Variable {
  name: string;
  type: 'numeric' | 'categorical';
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
    tryExponential,
    generateRegressionSummary
  } = useCurveEstimation();

  const { addLog, addAnalytic, addStatistic } = useResultStore();

  useEffect(() => {
    const availableVars: Variable[] = variables
      .filter((v) => v.name)
      .map((v) => ({
        name: v.name,
        type: v.type as 'numeric' | 'categorical',
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

  const handleRunRegression = async () => {
    if (!selectedDependentVariable || selectedIndependentVariables.length === 0) {
      console.warn("Pilih dependent dan minimal satu independent variable.");
      return;
    }

    const depCol = selectedDependentVariable.columnIndex;
    const indepCols = selectedIndependentVariables.map(iv => iv.columnIndex);

    // Ubah data menjadi number[]
    const Y = data.map(row => parseFloat(row[depCol])).filter(val => !isNaN(val));
    const X = data.map(row => parseFloat(row[indepCols[0]])).filter(val => !isNaN(val));

    // Pastikan panjang X dan Y sama setelah filter NaN
    const length = Math.min(X.length, Y.length);
    const Xtrim = X.slice(0, length);
    const Ytrim = Y.slice(0, length);

    // Membuat log message
    const dependentVarName = selectedDependentVariable.name;
    const independentVarNames = selectedIndependentVariables.map(iv => iv.name);
    const method = selectedModels.join(', '); // Misalnya, "Linear, Quadratic"

    const logMessage = `REGRESSION 
/MISSING LISTWISE 
/STATISTICS COEFF OUTS R ANOVA 
/CRITERIA=PIN(.05) POUT(.10) 
/NOORIGIN 
/DEPENDENT ${dependentVarName} 
/METHOD=${method.toUpperCase()} ${independentVarNames.join(' ')}.`;

    const log = { log: logMessage };
    let logId: number;
    try {
      logId = await addLog(log);
    } catch (error) {
      console.error("Failed to add log:", error);
      return;
    }

    // Menambahkan Analytic
    const analytic = {
      title: "Regression",
      log_id: logId,
      note: "",
    };
    let analyticId: number;
    try {
      analyticId = await addAnalytic(analytic);
    } catch (error) {
      console.error("Failed to add analytic:", error);
      return;
    }

    // Generate Regression Summary
    const regressionSummary = generateRegressionSummary(selectedModels, Xtrim, Ytrim);
    console.log(JSON.stringify(regressionSummary, null, 2));

    // Menambahkan Statistik
    const regressionSummaryStat = {
      analytic_id: analyticId,
      title: "Regression Summary",
      output_data: JSON.stringify(regressionSummary),
      output_type: "json",
      components: "RegressionSummary",
    };

    try {
      await addStatistic(regressionSummaryStat);
    } catch (error) {
      console.error("Failed to add regression summary statistic:", error);
    }
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
    <DialogContent className="sm:max-w-[900px]">
      <DialogHeader>
        <DialogTitle className="text-lg">Curve Estimation</DialogTitle>
      </DialogHeader>
  
      <Separator className="my-1" />
  
      <div className="grid grid-cols-12 gap-2 py-2">
        {/* Panel Kiri: Daftar Variabel */}
        <div className="col-span-3 border p-2 rounded-md max-h-[500px] overflow-y-auto">
          <label className="font-semibold text-sm">Variables</label>
          <ScrollArea className="mt-1 h-[450px]">
            {availableVariables.map((variable) => (
              <div
                key={variable.name}
                className={`flex items-center p-1 border cursor-pointer rounded-md hover:bg-gray-100 ${
                  highlightedVariable?.name === variable.name ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                }`}
                onClick={() => handleSelectAvailableVariable(variable)}
              >
                <Pencil className="h-4 w-4 mr-1 text-gray-600" />
                <span className="text-sm">{variable.name}</span>
              </div>
            ))}
          </ScrollArea>
        </div>
  
        {/* Bagian Tengah */}
        <div className="col-span-6 space-y-4">
          {/* Dependent Variable */}
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={handleMoveToDependent}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-1 p-1"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <label className="font-semibold text-sm">Dependent Variable</label>
              <div
                className="mt-1 p-1 border rounded-md min-h-[40px] cursor-pointer text-sm"
                onClick={handleRemoveFromDependent}
              >
                {selectedDependentVariable ? (
                  <div className="flex items-center">
                    <Pencil className="h-4 w-4 mr-1 text-gray-600" />
                    {selectedDependentVariable.name}
                  </div>
                ) : (
                  <span className="text-gray-500">[None]</span>
                )}
              </div>
            </div>
          </div>
  
          {/* Independent Variables */}
          <div className="flex items-start">
            <Button
              variant="outline"
              onClick={handleMoveToIndependent}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-1 p-1 mt-1"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <label className="font-semibold text-sm">Independent Variables</label>
              <div className="mt-1 p-1 border rounded-md min-h-[80px] text-sm">
                {selectedIndependentVariables.length > 0 ? (
                  selectedIndependentVariables.map((variable) => (
                    <div
                      key={variable.name}
                      className="flex items-center p-0.5 cursor-pointer hover:bg-gray-100 rounded-md"
                      onClick={() => handleRemoveFromIndependent(variable)}
                    >
                      <Pencil className="h-4 w-4 mr-1 text-gray-600" />
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
            <div className="flex items-center mr-2 w-2/3">
              <Button
                variant="outline"
                onClick={handleMoveToCaseLabels}
                disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
                className="mr-1 p-1"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <label className="font-semibold text-sm">Case Labels</label>
                <div
                  className="mt-1 p-1 border rounded-md min-h-[50px] cursor-pointer text-sm"
                  onClick={handleRemoveFromCaseLabels}
                >
                  {selectedCaseLabels ? (
                    <div className="flex items-center">
                      <Pencil className="h-4 w-4 mr-1 text-gray-600" />
                      {selectedCaseLabels.name}
                    </div>
                  ) : (
                    <span className="text-gray-500">[None]</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-1 mt-2 w-1/3 text-sm">
              <div className="flex items-center">
                <Checkbox
                  checked={includeConstant}
                  onCheckedChange={(checked) => setIncludeConstant(checked)}
                />
                <span className="ml-1">Include constant</span>
              </div>
              <div className="flex items-center">
                <Checkbox
                  checked={plotModels}
                  onCheckedChange={(checked) => setPlotModels(checked)}
                />
                <span className="ml-1">Plot models</span>
              </div>
            </div>
          </div>
  
          {/* Models */}
          <div className="text-sm">
            <label className="font-semibold">Models</label>
            <div className="mt-1 grid grid-cols-3 gap-1">
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
                  <span className="ml-1">{model}</span>
                </div>
              ))}
            </div>
            {selectedModels.includes('Logistic') && (
              <div className="mt-1">
                <label className="font-semibold text-xs">Upper Bound</label>
                <Input
                  type="number"
                  placeholder="Enter upper bound"
                  value={upperBound}
                  onChange={(e) => setUpperBound(e.target.value)}
                  className="mt-0.5 p-1 text-sm"
                />
              </div>
            )}
          </div>
  
          {/* Display ANOVA Table */}
          <div className="flex items-center text-sm">
            <Checkbox
              checked={displayANOVA}
              onCheckedChange={(checked) => setDisplayANOVA(checked)}
            />
            <span className="ml-1">Display ANOVA table</span>
          </div>
        </div>
  
        {/* Panel Kanan: Tombol Save */}
        <div className="col-span-3 flex flex-col justify-start space-y-2">
          <Button variant="outline" onClick={() => alert('Save configuration')} className="p-2">
            Save
          </Button>
        </div>
      </div>
  
      <DialogFooter className="flex justify-center space-x-2 mt-2">
        <Button variant="default" onClick={handleRunRegression} className="px-3 py-1">
          OK
        </Button>
        <Button variant="default" className="px-3 py-1">Paste</Button>
        <Button variant="default" className="px-3 py-1">Reset</Button>
        <Button variant="outline" onClick={handleClose} className="px-3 py-1">
          Cancel
        </Button>
        <Button variant="default" className="px-3 py-1">Help</Button>
      </DialogFooter>
    </DialogContent>
  );
  
};

export default ModalCurveEstimation;
