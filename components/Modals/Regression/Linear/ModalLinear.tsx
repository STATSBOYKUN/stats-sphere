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
import { Statistics } from '@/components/Modals/Regression/Linear/Statistics';
import {ModalType} from "@/stores/useModalStore";
import {useModal} from "@/hooks/useModal";
import { SaveLinearParams } from './SaveLinear';
import { StatisticsParams } from './Statistics';

interface Variable {
  name: string;
  type: 'numeric' | 'categorical';
  columnIndex: number;
}

interface ModalLinearProps {
  onClose: () => void;
}

const ModalLinear: React.FC<ModalLinearProps> = ({ onClose }) => {
  // Tambahkan state untuk menyimpan statistics parameters
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);
  const [selectedDependentVariable, setSelectedDependentVariable] = useState<Variable | null>(null);
  const [selectedIndependentVariables, setSelectedIndependentVariables] = useState<Variable[]>([]);
  const [selectedSelectionVariable, setSelectedSelectionVariable] = useState<Variable | null>(null);
  const [selectedCaseLabelsVariable, setSelectedCaseLabelsVariable] = useState<Variable | null>(null);
  const [selectedWLSWeightVariable, setSelectedWLSWeightVariable] = useState<Variable | null>(null);
  const [highlightedVariable, setHighlightedVariable] = useState<Variable | null>(null);
  const [method, setMethod] = useState<string>('Enter');
  const [saveParams, setSaveParams] = useState<SaveLinearParams | null>(null);
  const { openModal } = useModal();

  // In ModalLinear.tsx, add this at the top of your component function
  const defaultStatsParams: StatisticsParams = {
    estimates: true,
    confidenceIntervals: false,
    covarianceMatrix: false,
    modelFit: true,
    rSquaredChange: false,
    descriptives: false,
    partAndPartial: false,
    collinearityDiagnostics: false,
    durbinWatson: false,
    casewiseDiagnostics: false,
    selectedResidualOption: '',
    outlierThreshold: '3'
  };

// Initialize state with default values
  const [statsParams, setStatsParams] = useState<StatisticsParams | null>(defaultStatsParams);

  const [showStatistics, setShowStatistics] = useState<boolean>(false);
  const handleStatisticsSubmit = (params: StatisticsParams) => {
    // Store the parameters in localStorage
    localStorage.setItem('temp_stats_params', JSON.stringify(params));
    setStatsParams(params);
    console.log("Statistics parameters received:", params);
  };
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

  const handleReset = () => {
    // Clear the statistics parameters from localStorage
    localStorage.removeItem('temp_stats_params');

    // Reset the statsParams state to default
    setStatsParams(defaultStatsParams);

    // Move dependent variable back to available variables if it exists
    if (selectedDependentVariable) {
      setAvailableVariables(prev => [...prev, selectedDependentVariable]);
    }

    // Move independent variables back to available variables
    if (selectedIndependentVariables.length > 0) {
      setAvailableVariables(prev => [...prev, ...selectedIndependentVariables]);
    }

    // Move selection variable back if it exists
    if (selectedSelectionVariable) {
      setAvailableVariables(prev => [...prev, selectedSelectionVariable]);
    }

    // Move case labels variable back if it exists
    if (selectedCaseLabelsVariable) {
      setAvailableVariables(prev => [...prev, selectedCaseLabelsVariable]);
    }

    // Move WLS weight variable back if it exists
    if (selectedWLSWeightVariable) {
      setAvailableVariables(prev => [...prev, selectedWLSWeightVariable]);
    }

    // Now clear all selection states
    setSelectedDependentVariable(null);
    setSelectedIndependentVariables([]);
    setSelectedSelectionVariable(null);
    setSelectedCaseLabelsVariable(null);
    setSelectedWLSWeightVariable(null);
    setHighlightedVariable(null);

    // Reset method to default
    setMethod('Enter');

    console.log("Reset button clicked - All selections returned to available variables");
  };

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

  // --- Tambahan fungsi untuk field baru ---
  const handleMoveToSelectionVariable = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      if (selectedSelectionVariable) {
        setAvailableVariables((prev) => [...prev, selectedSelectionVariable]);
      }
      setSelectedSelectionVariable(highlightedVariable);
      setAvailableVariables((prev) => prev.filter((item) => item !== highlightedVariable));
      setHighlightedVariable(null);
    }
  };

  const handleMoveToCaseLabelsVariable = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      if (selectedCaseLabelsVariable) {
        setAvailableVariables((prev) => [...prev, selectedCaseLabelsVariable]);
      }
      setSelectedCaseLabelsVariable(highlightedVariable);
      setAvailableVariables((prev) => prev.filter((item) => item !== highlightedVariable));
      setHighlightedVariable(null);
    }
  };

  const handleMoveToWLSWeightVariable = () => {
    if (highlightedVariable && availableVariables.includes(highlightedVariable)) {
      if (selectedWLSWeightVariable) {
        setAvailableVariables((prev) => [...prev, selectedWLSWeightVariable]);
      }
      setSelectedWLSWeightVariable(highlightedVariable);
      setAvailableVariables((prev) => prev.filter((item) => item !== highlightedVariable));
      setHighlightedVariable(null);
    }
  };
  // --- Akhir tambahan fungsi untuk field baru ---

  const handleClose = () => {
    onClose();
  };

  

  const handleAnalyze = async () => {
    try {
      const dependentVarName = selectedDependentVariable?.name;
      const independentVarNames = selectedIndependentVariables.map(v => v.name);
  
      if (!dependentVarName || independentVarNames.length === 0) {
        alert('Please select a dependent variable and at least one independent variable.');
        return;
      }
  
      const storedParams = localStorage.getItem('temp_stats_params');
      const retrievedStatsParams = storedParams
          ? JSON.parse(storedParams)
          : defaultStatsParams;
  
      console.log("[Analyze] Using statistics parameters:", retrievedStatsParams);
  
      // 1. Create log command
      const logMessage = `REGRESSION 
      /MISSING LISTWISE 
      /STATISTICS COEFF OUTS R ANOVA 
      /CRITERIA=PIN(.05) POUT(.10) 
      /NOORIGIN 
      /DEPENDENT ${dependentVarName} 
      /METHOD=${method.toUpperCase()} ${independentVarNames.join(' ')}.`;
      
      console.log("[Analyze] Log message:", logMessage);
      const log = { log: logMessage };
      const logId = await addLog(log);
  
      // 2. Add Analytic with title "Regression"
      const analytic = {
        title: "Linear Regression",
        log_id: logId,
        note: "",
      };
      const analyticId = await addAnalytic(analytic);
      console.log("[Analyze] Analytic ID:", analyticId);
  
      // 3. Perform linear regression
      const allVariables = variables;
      const dataRows = data; // data adalah array dari baris, tiap baris adalah array string
  
      // Dapatkan kolom indeks
      const dependentVar = allVariables.find(v => v.name === dependentVarName);
      const independentVars = independentVarNames
        .map(name => allVariables.find(v => v.name === name))
        .filter(v => v);
  
      const dependentVarIndex = dependentVar?.columnIndex;
      const independentVarIndices = independentVars.map(v => v.columnIndex);
  
      if (dependentVarIndex === undefined || independentVarIndices.includes(undefined)) {
        throw new Error('Variable indices not found.');
      }
  
      const depVarIndex = dependentVarIndex;
      const indepVarIndices = independentVarIndices;
  
      // Ekstrak data untuk variabel
      const dependentData = dataRows.map(row => parseFloat(row[depVarIndex]));
      const independentData = indepVarIndices.map(index => dataRows.map(row => parseFloat(row[index])));
      console.log("[Analyze] Data awal - Dependent:", dependentData);
      console.log("[Analyze] Data awal - Independent (per variable):", independentData);
  
      // Tangani missing data
      const validIndices = dependentData.map((value, idx) => {
        if (isNaN(value) || independentData.some(indepData => isNaN(indepData[idx]))) {
          return false;
        }
        return true;
      });
  
      // Filter data valid
      const filteredDependentData = dependentData.filter((_, idx) => validIndices[idx]);
      const filteredIndependentData = independentData.map(indepData => indepData.filter((_, idx) => validIndices[idx]));
      console.log("[Analyze] Data valid - Dependent:", filteredDependentData);
      console.log("[Analyze] Data valid - Independent (per variable):", filteredIndependentData);
  
      // Transpose data independent jika diperlukan (untuk multiple regression)
      const independentDataTransposed = filteredIndependentData[0].map((_, idx) =>
        filteredIndependentData.map(indepData => indepData[idx])
      );
  
      // Lakukan perhitungan regresi linear (fungsi ini harus mengembalikan detail squared changes)
      const regressionResults = calculateLinearRegression(filteredDependentData, independentDataTransposed);
      console.log("[Analyze] Hasil regresi (calculateLinearRegression):", regressionResults);

      // Variables Entered/Removed Worker - Always included in the analysis
const variablesEnteredRemovedWorker = new Worker('/workers/Regression/variables.js');
console.log("[Analyze] Mengirim data ke Worker untuk Variables Entered/Removed...");
variablesEnteredRemovedWorker.postMessage({
  dependent: filteredDependentData,
  independent: filteredIndependentData,
  dependentName: dependentVarName,
  independentNames: independentVarNames
});

variablesEnteredRemovedWorker.onmessage = async (e) => {
  const variablesEnteredRemovedResults = e.data;
  console.log("[Analyze] Hasil dari Worker Variables Entered/Removed:", variablesEnteredRemovedResults);

  const variablesEnteredRemovedStat = {
    analytic_id: analyticId,
    title: "Variables Entered/Removed",
    output_data: JSON.stringify(variablesEnteredRemovedResults),
    output_type: "table",
    components: "VariablesEnteredRemoved",
  };

  await addStatistic(variablesEnteredRemovedStat);
  console.log("[Analyze] Statistik Variables Entered/Removed disimpan.");
  variablesEnteredRemovedWorker.terminate();
};

variablesEnteredRemovedWorker.onerror = (error) => {
  console.error("[Analyze] Worker Variables Entered/Removed error:", error);
  variablesEnteredRemovedWorker.terminate();
};

      const anovaWorker = new Worker('/workers/Regression/anovaWorker.js');
      console.log("[Analyze] Sending data to ANOVA Worker...");
      anovaWorker.postMessage({
        dependentData: filteredDependentData,
        independentData: filteredIndependentData
      });

      anovaWorker.onmessage = async (e) => {
        const anovaStat = e.data;
        if (anovaStat.error) {
          console.error("[Analyze] ANOVA Worker Error:", anovaStat.error);
          alert(`ANOVA Worker Error: ${anovaStat.error}`);
        } else {
          // Add the analyticId here in the main thread
          const completeStats = {
            ...anovaStat,
            analytic_id: analyticId
          };
          await addStatistic(completeStats);
          console.log("[Analyze] ANOVA statistics saved.");
        }
        anovaWorker.terminate();
      };

      anovaWorker.onerror = (error) => {
        console.error("[Analyze] ANOVA Worker error:", error, error.message);
        alert("An error occurred in the ANOVA Worker: " + (error.message || "Unknown error"));
        anovaWorker.terminate();
      };

// Coefficients Worker
// Coefficients Worker - Now just sending raw data
      const coefficientsWorker = new Worker('/workers/Regression/coefficients.js');
      console.log("[Analyze] Sending data to Coefficients Worker...");

      coefficientsWorker.postMessage({
        dependentData: filteredDependentData,
        independentData: filteredIndependentData,
        independentVarNames: independentVarNames
      });

      coefficientsWorker.onmessage = async (e) => {
        const { success, result, error } = e.data;

        if (success) {
          const coefficientsTable = result;
          const coefficientsStat = {
            analytic_id: analyticId,
            title: "Coefficients",
            output_data: JSON.stringify(coefficientsTable),
            output_type: "table",
            components: "Coefficients",
          };

          await addStatistic(coefficientsStat);
          console.log("[Analyze] Coefficients statistics saved.");
        } else {
          console.error("[Analyze] Coefficients Worker error:", error);
          alert(`Coefficients Worker Error: ${error}`);
        }

        coefficientsWorker.terminate();
      };

      coefficientsWorker.onerror = (error) => {
        console.error("[Analyze] Coefficients Worker error:", error, error.message);
        alert("An error occurred in the Coefficients Worker: " + (error.message || "Unknown error"));
        coefficientsWorker.terminate();
      };

      // RSquare Change Worker
      if (retrievedStatsParams.rSquaredChange) {
        const worker = new Worker('/workers/Regression/rsquare.js');
        console.log("[Analyze] Mengirim data ke Worker untuk perhitungan regresi (squared changes)...");
        worker.postMessage({
          dependent: filteredDependentData,
          independent: filteredIndependentData[0]
        });
  
        worker.onmessage = async (e) => {
          const workerResults = e.data;
          console.log("[Analyze] Hasil dari Worker:", workerResults);
          const rSquareStat = {
            analytic_id: analyticId,
            title: "Model Summary (R Square Change)",
            output_data: JSON.stringify(workerResults),
            output_type: "table",
            components: "RSquareChange",
          };
          await addStatistic(rSquareStat);
          console.log("[Analyze] Statistik R Square Change disimpan.");
          
          worker.terminate();
        };
  
        worker.onerror = (error) => {
          console.error("[Analyze] Worker error:", error);
          worker.terminate();
        };
      } else {
        console.log("[Analyze] Skipping R Square Change calculation (not selected).");
      }
  
      // Confidence Interval Worker
      if (retrievedStatsParams.confidenceIntervals) {
        const confidenceWorker = new Worker('/workers/Regression/confidence_interval.js');
        console.log("[Analyze] Mengirim data ke Worker untuk Confidence Interval...");
        confidenceWorker.postMessage({
          dependent: filteredDependentData,
          independent: filteredIndependentData[0]
        });
  
        confidenceWorker.onmessage = async (e) => {
          const confidenceResults = e.data;
          console.log("[Analyze] Hasil Confidence Interval dari Worker:", confidenceResults);
          const confidenceStat = {
            analytic_id: analyticId,
            title: "Confidence Interval",
            output_data: JSON.stringify(confidenceResults),
            output_type: "table",
            components: "ConfidenceInterval",
          };
          await addStatistic(confidenceStat);
          console.log("[Analyze] Statistik Confidence Interval disimpan.");
          confidenceWorker.terminate();
        };
  
        confidenceWorker.onerror = (error) => {
          console.error("[Analyze] Worker Confidence Interval error:", error);
          confidenceWorker.terminate();
        };
      } else {
        console.log("[Analyze] Skipping Confidence Interval calculation (not selected).");
      }
  
      // Part & Partial Correlations Worker
      if (retrievedStatsParams.partAndPartial) {
        const partAndPartialWorker = new Worker('/workers/Regression/coefficients_partandpartial.js');
        console.log("[Analyze] Mengirim data ke Worker untuk Coefficients Part & Partial Correlations...");
        partAndPartialWorker.postMessage({
          dependent: filteredDependentData,
          independents: filteredIndependentData
        });
  
        partAndPartialWorker.onmessage = async (e) => {
          const partAndPartialResults = e.data;
          console.log("[Analyze] Hasil dari Worker Coefficients Part & Partial:", partAndPartialResults);
          const partAndPartialStat = {
            analytic_id: analyticId,
            title: "Coefficients (Part & Partial Correlations)",
            output_data: JSON.stringify(partAndPartialResults),
            output_type: "table",
            components: "CoefficientsPartAndPartial",
          };
          await addStatistic(partAndPartialStat);
          console.log("[Analyze] Statistik Coefficients Part & Partial disimpan.");
          partAndPartialWorker.terminate();
        };
  
        partAndPartialWorker.onerror = (error) => {
          console.error("[Analyze] Worker Coefficients Part & Partial error:", error);
          partAndPartialWorker.terminate();
        };
      } else {
        console.log("[Analyze] Skipping Part & Partial Correlations (not selected).");
      }
  
      // Collinearity Statistics Worker
      if (retrievedStatsParams.collinearityDiagnostics) {
        const collinearityWorker = new Worker('/workers/Regression/coefficients_collinearity.js');
        console.log("[Analyze] Mengirim data ke Worker untuk Coefficients Collinearity...");
        collinearityWorker.postMessage({
          dependent: filteredDependentData,
          independent: filteredIndependentData
        });
  
        collinearityWorker.onmessage = async (e) => {
          const collinearityResults = e.data;
          console.log("[Analyze] Hasil dari Worker Coefficients Collinearity:", collinearityResults);
          const collinearityStat = {
            analytic_id: analyticId,
            title: "Collinearity Diagnostics",
            output_data: JSON.stringify(collinearityResults),
            output_type: "table",
            components: "CollinearityStatistics",
          };
          await addStatistic(collinearityStat);
          console.log("[Analyze] Statistik Collinearity Diagnostics disimpan.");
          collinearityWorker.terminate();
        };
  
        collinearityWorker.onerror = (error) => {
          console.error("[Analyze] Worker Coefficients Collinearity error:", error);
          collinearityWorker.terminate();
        };
        
        // Also run collinearity diagnostics worker if this option is selected
        const collinearityDiagnosticsWorker = new Worker('/workers/Regression/collinearity_diagnostics.js');
        console.log("[Analyze] Mengirim data ke Worker untuk Collinearity Diagnostics...");
        collinearityDiagnosticsWorker.postMessage({
          dependent: filteredDependentData,
          independent: filteredIndependentData
        });
  
        collinearityDiagnosticsWorker.onmessage = async (e) => {
          const collinearityDiagnosticsResults = e.data;
          console.log("[Analyze] Hasil dari Worker Collinearity Diagnostics:", collinearityDiagnosticsResults);
          const collinearityDiagnosticsStat = {
            analytic_id: analyticId,
            title: "Collinearity Diagnostics",
            output_data: JSON.stringify(collinearityDiagnosticsResults),
            output_type: "table",
            components: "CollinearityDiagnostics",
          };
          await addStatistic(collinearityDiagnosticsStat);
          console.log("[Analyze] Statistik Collinearity Diagnostics disimpan.");
          collinearityDiagnosticsWorker.terminate();
        };
  
        collinearityDiagnosticsWorker.onerror = (error) => {
          console.error("[Analyze] Worker Collinearity Diagnostics error:", error);
          collinearityDiagnosticsWorker.terminate();
        };
      } else {
        console.log("[Analyze] Skipping Collinearity Diagnostics (not selected).");
      }
  
      // Durbin-Watson Worker
      if (retrievedStatsParams.durbinWatson) {
        const modelDurbinWorker = new Worker('/workers/Regression/model_durbin.js');
        console.log("[Analyze] Mengirim data ke Worker untuk Model Durbin...");
        modelDurbinWorker.postMessage({
          dependent: filteredDependentData,
          independent: filteredIndependentData[0]
        });
  
        modelDurbinWorker.onmessage = async (e) => {
          const modelDurbinResults = e.data;
          console.log("[Analyze] Hasil dari Worker Model Durbin:", modelDurbinResults);
          const modelDurbinStat = {
            analytic_id: analyticId,
            title: "Model Summary (Durbin-Watson)",
            output_data: JSON.stringify(modelDurbinResults),
            output_type: "table",
            components: "ModelDurbin",
          };
          await addStatistic(modelDurbinStat);
          console.log("[Analyze] Statistik Model Durbin disimpan.");
          modelDurbinWorker.terminate();
        };
  
        modelDurbinWorker.onerror = (error) => {
          console.error("[Analyze] Worker Model Durbin error:", error);
          modelDurbinWorker.terminate();
        };
      } else {
        console.log("[Analyze] Skipping Durbin-Watson test (not selected).");
      }
  
      // Check if Residuals are required
      if (retrievedStatsParams.durbinWatson || retrievedStatsParams.casewiseDiagnostics) {
        // Residuals Statistics Worker
        const residualsStatisticsWorker = new Worker('/workers/Regression/residuals_statistics.js');
        console.log("[Analyze] Mengirim data ke Worker untuk Residuals Statistics...");
        residualsStatisticsWorker.postMessage({
          dependent: filteredDependentData,
          independent: filteredIndependentData[0]
        });
  
        residualsStatisticsWorker.onmessage = async (e) => {
          const residualsStatisticsResults = e.data;
          console.log("[Analyze] Hasil dari Worker Residuals Statistics:", residualsStatisticsResults);
          const residualsStatisticsStat = {
            analytic_id: analyticId,
            title: "Residuals Statistics",
            output_data: JSON.stringify(residualsStatisticsResults),
            output_type: "table",
            components: "ResidualsStatistics",
          };
          await addStatistic(residualsStatisticsStat);
          console.log("[Analyze] Statistik Residuals Statistics disimpan.");
          residualsStatisticsWorker.terminate();
        };
  
        residualsStatisticsWorker.onerror = (error) => {
          console.error("[Analyze] Worker Residuals Statistics error:", error);
          residualsStatisticsWorker.terminate();
        };
      } else {
        console.log("[Analyze] Skipping Residuals Statistics (no residual option selected).");
      }
  
      // Casewise Diagnostics Worker
      if (retrievedStatsParams.casewiseDiagnostics) {
        const casewiseDiagnosticsWorker = new Worker('/workers/Regression/casewise_diagnostics.js');
        console.log("[Analyze] Mengirim data ke Worker untuk Casewise Diagnostics...");
        casewiseDiagnosticsWorker.postMessage({
          dependent: filteredDependentData,
          independent: filteredIndependentData[0],
          threshold: parseFloat(retrievedStatsParams.outlierThreshold) || 3  // Default to 3 if not specified
        });
  
        casewiseDiagnosticsWorker.onmessage = async (e) => {
          const casewiseDiagnosticsResults = e.data;
          console.log("[Analyze] Hasil dari Worker Casewise Diagnostics:", casewiseDiagnosticsResults);
          const casewiseDiagnosticsStat = {
            analytic_id: analyticId,
            title: "Casewise Diagnostics",
            output_data: JSON.stringify(casewiseDiagnosticsResults),
            output_type: "table",
            components: "CasewiseDiagnostics",
          };
          await addStatistic(casewiseDiagnosticsStat);
          console.log("[Analyze] Statistik Casewise Diagnostics disimpan.");
          casewiseDiagnosticsWorker.terminate();
        };
  
        casewiseDiagnosticsWorker.onerror = (error) => {
          console.error("[Analyze] Worker Casewise Diagnostics error:", error);
          casewiseDiagnosticsWorker.terminate();
        };
      } else {
        console.log("[Analyze] Skipping Casewise Diagnostics (not selected).");
      }
  
      // Covariance Matrix - Includes correlations
      if (retrievedStatsParams.covarianceMatrix) {
        
        // Coefficient Correlations Worker
        const coefficientCorrelationsWorker = new Worker('/workers/Regression/coefficient_correlations.js');
        console.log("[Analyze] Mengirim data ke Worker untuk Coefficient Correlations...");
        coefficientCorrelationsWorker.postMessage({
          dependent: filteredDependentData,
          independent: filteredIndependentData[0]
        });
  
        coefficientCorrelationsWorker.onmessage = async (e) => {
          const correlationsResults = e.data;
          console.log("[Analyze] Hasil dari Worker Coefficient Correlations:", correlationsResults);
          const correlationsStat = {
            analytic_id: analyticId,
            title: "Coefficient Correlations",
            output_data: JSON.stringify(correlationsResults),
            output_type: "table",
            components: "CoefficientCorrelations",
          };
          await addStatistic(correlationsStat);
          console.log("[Analyze] Statistik Coefficient Correlations disimpan.");
          coefficientCorrelationsWorker.terminate();
        };
  
        coefficientCorrelationsWorker.onerror = (error) => {
          console.error("[Analyze] Worker Coefficient Correlations error:", error);
          coefficientCorrelationsWorker.terminate();
        };
      } else {
        console.log("[Analyze] Skipping Correlation calculations (covariance matrix not selected).");
      }
  
      // Descriptive Statistics
      if (retrievedStatsParams.descriptives) {
        const descriptiveWorker = new Worker('/workers/Regression/descriptive_statistics.js');
        console.log("[Analyze] Mengirim data ke Worker untuk Descriptive Statistics...");
        descriptiveWorker.postMessage({
          dependent: filteredDependentData,
          independent: filteredIndependentData[0]
        });
  
        descriptiveWorker.onmessage = async (e) => {
          const descriptiveResults = e.data;
          console.log("[Analyze] Hasil Descriptive Statistics dari Worker:", descriptiveResults);
          const descriptiveStat = {
            analytic_id: analyticId,
            title: "Descriptive Statistics",
            output_data: JSON.stringify(descriptiveResults),
            output_type: "table",
            components: "DescriptiveStatistics",
          };
          await addStatistic(descriptiveStat);
          console.log("[Analyze] Statistik Descriptive Statistics disimpan.");
          descriptiveWorker.terminate();
        };
  
        descriptiveWorker.onerror = (error) => {
          console.error("[Analyze] Worker Descriptive Statistics error:", error);
          descriptiveWorker.terminate();
        };
        // Correlations Worker
        const correlationsWorker = new Worker('/workers/Regression/correlations.js');
        console.log("[Analyze] Mengirim data ke Worker untuk Correlations...");
        correlationsWorker.postMessage({
          dependent: filteredDependentData,
          independent: filteredIndependentData[0]
        });
  
        correlationsWorker.onmessage = async (e) => {
          const correlationsResults = e.data;
          console.log("[Analyze] Hasil dari Worker Correlations:", correlationsResults);
          const correlationsStat = {
            analytic_id: analyticId,
            title: "Correlations",
            output_data: JSON.stringify(correlationsResults),
            output_type: "table",
            components: "Correlations",
          };
          await addStatistic(correlationsStat);
          console.log("[Analyze] Statistik Correlations disimpan.");
          correlationsWorker.terminate();
        };
  
        correlationsWorker.onerror = (error) => {
          console.error("[Analyze] Worker Correlations error:", error);
          correlationsWorker.terminate();
        };
  
      } else {
        console.log("[Analyze] Skipping Descriptive Statistics (not selected).");
      }
  
      // Model Summary - Always run if modelFit is true
      if (retrievedStatsParams.modelFit || retrievedStatsParams.descriptives) {
        const modelSummaryWorker = new Worker('/workers/Regression/model_summary.js');
        console.log("[Analyze] Mengirim data ke Worker untuk Model Summary...");
        modelSummaryWorker.postMessage({
          dependent: filteredDependentData,
          independent: filteredIndependentData[0]
        });
  
        modelSummaryWorker.onmessage = async (e) => {
          const modelSummaryResults = e.data;
          console.log("[Analyze] Hasil dari Worker Model Summary:", modelSummaryResults);
          const modelSummaryStat = {
            analytic_id: analyticId,
            title: "Model Summary",
            output_data: JSON.stringify(modelSummaryResults),
            output_type: "table",
            components: "ModelSummary",
          };
          await addStatistic(modelSummaryStat);
          console.log("[Analyze] Statistik Model Summary disimpan.");
          modelSummaryWorker.terminate();
        };
  
        modelSummaryWorker.onerror = (error) => {
          console.error("[Analyze] Worker Model Summary error:", error);
          modelSummaryWorker.terminate();
        };
      } else {
        console.log("[Analyze] Skipping Model Summary (model fit not selected).");
      }

  
      // Tutup modal setelah semua proses selesai
      onClose();
  
    } catch (error) {
      console.error('[Analyze] Failed to perform linear regression:', error);
      alert('Failed to perform linear regression. Please check your data and try again.');
    }
  };
  

//   const handleAnalyze = () => {
//     const dependentVarName = selectedDependentVariable?.name;
//     const independentVarNames = selectedIndependentVariables.map(v => v.name);

//     if (!dependentVarName || independentVarNames.length === 0) {
//       alert('Please select a dependent variable and at least one independent variable.');
//       return;
//     }

//     // Ekstrak columnIndex untuk variabel yang dipilih
//     const dependentIndex = selectedDependentVariable.columnIndex;
//     const independentIndices = selectedIndependentVariables.map(v => v.columnIndex);

//     // Siapkan data untuk dikirim ke Web Worker
//     const regressionData = data
//       .map(row => {
//         const yValue = parseFloat(row[dependentIndex]);
//         const xValues = independentIndices.map(idx => parseFloat(row[idx]));
//         // Pastikan semua nilai adalah angka
//         if (isNaN(yValue) || xValues.some(x => isNaN(x))) {
//           return null; // Exclude baris dengan data tidak valid
//         }
//         const record = { y: yValue };
//         independentVarNames.forEach((name, i) => {
//           record[name] = xValues[i];
//         });
//         return record;
//       })
//       .filter(record => record !== null);

//     if (regressionData.length === 0) {
//       alert('No valid data available for regression.');
//       return;
//     }

//     // Inisialisasi Web Worker
//     const worker = new Worker('/workers/Regression/modal_summary.js');

//     worker.postMessage(regressionData);

//     worker.onmessage = async function(e) {
//       const { success, result, error } = e.data;

//       if (success) {
//         const regressionResult = result;

//         // Buat log command
//         const logMessage = `REGRESSION 
// /MISSING LISTWISE 
// /STATISTICS COEFF OUTS R ANOVA 
// /CRITERIA=PIN(.05) POUT(.10) 
// /NOORIGIN 
// /DEPENDENT ${dependentVarName} 
// /METHOD=ENTER ${independentVarNames.join(' ')}.`;

//         const log = { log: logMessage };
//         const logId = await addLog(log);

//         // Tambahkan Analytic dengan judul "Regression"
//         const analytic = {
//           title: "Regression",
//           log_id: logId,
//           note: "",
//         };
//         const analyticId = await addAnalytic(analytic);

//         // Susun objek modelSummaryStat
//         const modelSummaryStat = {
//           analytic_id: analyticId,
//           title: "Model Summary",
//           output_data: JSON.stringify(regressionResult),
//           output_type: "table",
//           components: "ModelSummary",
//         };

//         await addStatistic(modelSummaryStat);

//         // Opsional: Anda bisa mengupdate state atau memberikan feedback kepada pengguna
//         alert('Regression analysis completed successfully.');

//         // Tutup Web Worker
//         worker.terminate();
//       } else {
//         alert(`Error: ${error}`);
//         // Tutup Web Worker
//         worker.terminate();
//       }
//     };

//     worker.onerror = function(e) {
//       alert(`Worker error: ${e.message}`);
//       // Tutup Web Worker
//       worker.terminate();
//     };
//   };

  

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

          {/* --- Field Baru --- */}

          {/* Selection Variable */}
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={handleMoveToSelectionVariable}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2 mt-6"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Selection Variable</label>
              <div
                className="mt-2 p-2 border rounded-md min-h-[50px] cursor-pointer"
                onClick={handleRemoveFromSelectionVariable}
              >
                {selectedSelectionVariable ? (
                  <div className="flex items-center">
                    <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                    {selectedSelectionVariable.name}
                  </div>
                ) : (
                  <span className="text-gray-500">[None]</span>
                )}
              </div>
            </div>
          </div>

          {/* Case Labels */}
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={handleMoveToCaseLabelsVariable}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2 mt-6"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">Case Labels</label>
              <div
                className="mt-2 p-2 border rounded-md min-h-[50px] cursor-pointer"
                onClick={handleRemoveFromCaseLabelsVariable}
              >
                {selectedCaseLabelsVariable ? (
                  <div className="flex items-center">
                    <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                    {selectedCaseLabelsVariable.name}
                  </div>
                ) : (
                  <span className="text-gray-500">[None]</span>
                )}
              </div>
            </div>
          </div>

          {/* WLS Weight */}
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={handleMoveToWLSWeightVariable}
              disabled={!highlightedVariable || !availableVariables.includes(highlightedVariable)}
              className="mr-2 mt-6"
            >
              <ArrowRight />
            </Button>
            <div className="flex-1">
              <label className="font-semibold">WLS Weight</label>
              <div
                className="mt-2 p-2 border rounded-md min-h-[50px] cursor-pointer"
                onClick={handleRemoveFromWLSWeightVariable}
              >
                {selectedWLSWeightVariable ? (
                  <div className="flex items-center">
                    <Pencil className="h-5 w-5 mr-2 text-gray-600" />
                    {selectedWLSWeightVariable.name}
                  </div>
                ) : (
                  <span className="text-gray-500">[None]</span>
                )}
              </div>
            </div>
          </div>
          {/* --- Akhir Field Baru --- */}

        </div>

        {/* Kolom Ketiga: Tombol Tambahan */}
        <div className="col-span-3 space-y-4">
        <Button
          onClick={() => openModal(ModalType.Statistics, { onSubmit: handleStatisticsSubmit })}
          variant="outline"
          className="w-full"
        >
          Statistics...
        </Button>
          <Button onClick={() => openModal(ModalType.PlotsLinear)} variant="outline" className="w-full">
            Plots...
          </Button>
          <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                  openModal(ModalType.SaveLinear, {
                    onSave: (params: SaveLinearParams) => {
                      setSaveParams(params);
                      console.log(params);
                    },
                  })
              }
          >
            Save...
          </Button>
          <Button onClick={() => openModal(ModalType.OptionsLinear)} variant="outline" className="w-full">
            Options...
          </Button>
          <Button onClick={() => openModal(ModalType.BootstrapLinear)} variant="outline" className="w-full">
            Bootstrap...
          </Button>
        </div>
      </div>

      <DialogFooter className="flex justify-center space-x-4 mt-4">
        <Button onClick={handleAnalyze}>OK</Button>
        <Button variant="outline">Paste</Button>
        <Button variant="outline" onClick={handleReset}>Reset</Button>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="outline">Help</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ModalLinear;
