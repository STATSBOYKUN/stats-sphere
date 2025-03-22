// components/ModalCurveEstimation.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useVariableStore } from '@/stores/useVariableStore';
import { useDataStore } from '@/stores/useDataStore';
import { Scatter } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Pencil, ArrowRight, Loader2 } from 'lucide-react';
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
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Reference to worker
  const workerRef = useRef<Worker | null>(null);

  const variables = useVariableStore((state) => state.variables);
  const data = useDataStore((state) => state.data);
  const { addLog, addAnalytic, addStatistic } = useResultStore();

  // Initialize variables from store
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

  // Variable selection handlers
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
    // Cleanup worker if needed
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    onClose();
  };

  const handleModelChange = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const handleReset = () => {
    // Reset all selections
    if (selectedDependentVariable) {
      setAvailableVariables(prev => [...prev, selectedDependentVariable]);
    }
    
    if (selectedIndependentVariables.length > 0) {
      setAvailableVariables(prev => [...prev, ...selectedIndependentVariables]);
    }
    
    if (selectedCaseLabels) {
      setAvailableVariables(prev => [...prev, selectedCaseLabels]);
    }
    
    setSelectedDependentVariable(null);
    setSelectedIndependentVariables([]);
    setSelectedCaseLabels(null);
    setHighlightedVariable(null);
    setSelectedModels(['Linear']);
    setIncludeConstant(true);
    setPlotModels(true);
    setDisplayANOVA(false);
    setUpperBound('');
    setErrorMessage(null);
  };

  const handleRunRegression = async () => {
    if (!selectedDependentVariable || selectedIndependentVariables.length === 0) {
      setErrorMessage("Please select a dependent variable and at least one independent variable.");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const depCol = selectedDependentVariable.columnIndex;
      const indepCols = selectedIndependentVariables.map(iv => iv.columnIndex);

      // Prepare data
      const Y = data.map(row => parseFloat(row[depCol])).filter(val => !isNaN(val));
      const X = data.map(row => parseFloat(row[indepCols[0]])).filter(val => !isNaN(val));

      // Ensure data lengths match after filtering
      const length = Math.min(X.length, Y.length);
      const Xtrim = X.slice(0, length);
      const Ytrim = Y.slice(0, length);

      // Create log message
      const dependentVarName = selectedDependentVariable.name;
      const independentVarNames = selectedIndependentVariables.map(iv => iv.name);
      const method = selectedModels.join(', ');

      const logMessage = `REGRESSION 
/MISSING LISTWISE 
/STATISTICS COEFF OUTS R ANOVA 
/CRITERIA=PIN(.05) POUT(.10) 
/NOORIGIN 
/DEPENDENT ${dependentVarName} 
/METHOD=${method.toUpperCase()} ${independentVarNames.join(' ')}.`;

      // Add log entry
      const log = { log: logMessage };
      const logId = await addLog(log);
      console.log("[CurveEstimation] Log created with ID:", logId);

      // Add analytic
      const analytic = {
        title: "Curve Estimation",
        log_id: logId,
        note: "",
      };
      const analyticId = await addAnalytic(analytic);
      console.log("[CurveEstimation] Analytic created with ID:", analyticId);

      // Create and configure web worker
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      
      // Create new worker, using the correct path
      workerRef.current = new Worker('/workers/CurveEstimation/curve_estimation.js');
      
      // Set up message handler for worker results
      workerRef.current.onmessage = async (event) => {
        const { action, data } = event.data;
        
        if (action === 'regressionResults') {
          console.log("[CurveEstimation] Received regression results:", data);
          
          if (data.success) {
            // Create statistic entry with results
            const regressionSummaryStat = {
              analytic_id: analyticId,
              title: "Curve Estimation",
              output_data: JSON.stringify(data.result),
              output_type: "table",
              components: "CurveEstimationSummary",
            };

            try {
              await addStatistic(regressionSummaryStat);
              console.log("[CurveEstimation] Statistics saved successfully");
              
              // Close modal on success if needed
              // onClose();
            } catch (error) {
              console.error("[CurveEstimation] Failed to save statistics:", error);
              setErrorMessage("Failed to save regression results.");
            }
          } else {
            console.error("[CurveEstimation] Worker returned an error:", data.message);
            setErrorMessage(data.message || "An error occurred during regression analysis.");
          }
          
          setIsProcessing(false);
        } else if (action === 'error') {
          console.error("[CurveEstimation] Worker error:", data.message);
          setErrorMessage(data.message || "An error occurred during calculation.");
          setIsProcessing(false);
        }
      };
      
      // Handle worker errors
      workerRef.current.onerror = (error) => {
        console.error("[CurveEstimation] Worker error:", error.message);
        setErrorMessage(`Worker error: ${error.message}`);
        setIsProcessing(false);
        
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }
      };
      
      // Send data to worker
      console.log("[CurveEstimation] Sending data to worker");
      workerRef.current.postMessage({
        action: 'runRegression',
        data: {
          models: selectedModels,
          X: Xtrim,
          Y: Ytrim,
          dependentName: dependentVarName,
          independentNames: independentVarNames
        }
      });
      
    } catch (error) {
      console.error("[CurveEstimation] Error in regression processing:", error);
      setErrorMessage(`Error: ${error.message || "Unknown error occurred"}`);
      setIsProcessing(false);
    }
  };
  
  // Helper function to get color for different regression models
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
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2">
          {errorMessage}
        </div>
      )}
  
      <div className="grid grid-cols-12 gap-2 py-2">
        {/* Left Panel: Variable List */}
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
  
        {/* Middle Section */}
        <div className="col-span-6 space-y-4">
          {/* Dependent Variable */}
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={handleMoveToDependent}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable) || isProcessing}
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
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable) || isProcessing}
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
  
          {/* Case Labels and Checkboxes */}
          <div className="flex items-start">
            <div className="flex items-center mr-2 w-2/3">
              <Button
                variant="outline"
                onClick={handleMoveToCaseLabels}
                disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable) || isProcessing}
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
                  onCheckedChange={(checked) => setIncludeConstant(checked as boolean)}
                  disabled={isProcessing}
                />
                <span className="ml-1">Include constant</span>
              </div>
              <div className="flex items-center">
                <Checkbox
                  checked={plotModels}
                  onCheckedChange={(checked) => setPlotModels(checked as boolean)}
                  disabled={isProcessing}
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
                    disabled={isProcessing}
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
                  disabled={isProcessing}
                />
              </div>
            )}
          </div>
  
          {/* Display ANOVA Table */}
          <div className="flex items-center text-sm">
            <Checkbox
              checked={displayANOVA}
              onCheckedChange={(checked) => setDisplayANOVA(checked as boolean)}
              disabled={isProcessing}
            />
            <span className="ml-1">Display ANOVA table</span>
          </div>
        </div>
  
        {/* Right Panel: Save Button */}
        <div className="col-span-3 flex flex-col justify-start space-y-2">
          <Button 
            variant="outline" 
            onClick={() => alert('Save configuration')} 
            className="p-2"
            disabled={isProcessing}
          >
            Save
          </Button>
        </div>
      </div>
  
      <DialogFooter className="flex justify-center space-x-2 mt-2">
        <Button 
          variant="default" 
          onClick={handleRunRegression} 
          className="px-3 py-1"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "OK"
          )}
        </Button>
        <Button variant="default" className="px-3 py-1" disabled={isProcessing}>Paste</Button>
        <Button variant="default" className="px-3 py-1" disabled={isProcessing} onClick={handleReset}>Reset</Button>
        <Button variant="outline" onClick={handleClose} className="px-3 py-1" disabled={isProcessing}>
          Cancel
        </Button>
        <Button variant="default" className="px-3 py-1" disabled={isProcessing}>Help</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ModalCurveEstimation;