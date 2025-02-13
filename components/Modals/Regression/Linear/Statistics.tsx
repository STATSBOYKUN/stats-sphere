// components/Statistics.tsx
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { TrendingUp } from 'lucide-react';

interface StatisticsProps {
  onClose: () => void;
  onSubmit: (params: StatisticsParams) => void;
}


export interface StatisticsParams {
  estimates: boolean;
  confidenceIntervals: boolean;
  covarianceMatrix: boolean;
  modelFit: boolean;
  rSquaredChange: boolean;
  descriptives: boolean;
  partAndPartial: boolean;
  collinearityDiagnostics: boolean;
  durbinWatson: boolean;
  casewiseDiagnostics: boolean;
  selectedResidualOption: string;
  outlierThreshold: string;
}

const Statistics: React.FC<StatisticsProps> = ({ onClose, onSubmit }) => {
  // State untuk Regression Coefficients
  const [estimates, setEstimates] = useState<boolean>(true);
  const [confidenceIntervals, setConfidenceIntervals] = useState<boolean>(false);
  const [covarianceMatrix, setCovarianceMatrix] = useState<boolean>(false);
  // State untuk Model fit
  const [modelFit, setModelFit] = useState<boolean>(true);
  const [rSquaredChange, setRSquaredChange] = useState<boolean>(false);
  const [descriptives, setDescriptives] = useState<boolean>(false);
  const [partAndPartial, setPartAndPartial] = useState<boolean>(false);
  const [collinearityDiagnostics, setCollinearityDiagnostics] = useState<boolean>(false);
  // State untuk Residuals
  const [durbinWatson, setDurbinWatson] = useState<boolean>(false);
  const [casewiseDiagnostics, setCasewiseDiagnostics] = useState<boolean>(false);
  // State untuk radio button Residuals
  const [selectedResidualOption, setSelectedResidualOption] = useState<string>('');
  // State untuk threshold input (misal untuk nilai default 3)
  const [outlierThreshold, setOutlierThreshold] = useState<string>('3');

  const params: StatisticsParams = {
    estimates,
    confidenceIntervals,
    covarianceMatrix,
    modelFit,
    rSquaredChange,
    descriptives,
    partAndPartial,
    collinearityDiagnostics,
    durbinWatson,
    casewiseDiagnostics,
    selectedResidualOption,
    outlierThreshold,
  };
  const handleContinue = () => {
    onSubmit(params);
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-[800px]">
      {/* Header dengan ikon dan judul */}
      <DialogHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-gray-600" />
          <DialogTitle className="text-lg">Linear Regression: Statistics</DialogTitle>
        </div>
      </DialogHeader>

      <Separator className="my-2" />

      {/* Bagian Regression Coefficients & Model Fit */}
      <div className="grid grid-cols-2 gap-6">
        {/* Regression Coefficients */}
        <div>
          <h3 className="font-semibold text-md mb-2">Regression Coefficients</h3>
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              checked={estimates}
              onCheckedChange={(checked) => setEstimates(!!checked)}
              id="estimates"
            />
            <label htmlFor="estimates" className="text-sm">Estimates</label>
          </div>
          <div className="flex flex-col ml-6 mb-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={confidenceIntervals}
                onCheckedChange={(checked) => setConfidenceIntervals(!!checked)}
                id="confidenceIntervals"
              />
              <label htmlFor="confidenceIntervals" className="text-sm">Confidence intervals</label>
            </div>
            <div className="ml-6 mt-1">
              <label htmlFor="level" className="text-xs">Level(%):</label>
              <Input
                id="level"
                type="number"
                value="95"
                disabled={!confidenceIntervals}
                className="w-20 ml-2 p-1 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-6">
            <Checkbox
              checked={covarianceMatrix}
              onCheckedChange={(checked) => setCovarianceMatrix(!!checked)}
              id="covarianceMatrix"
            />
            <label htmlFor="covarianceMatrix" className="text-sm">Covariance matrix</label>
          </div>
        </div>

        {/* Model Fit */}
        <div>
          <h3 className="font-semibold text-md mb-2">Model fit</h3>
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              checked={modelFit}
              onCheckedChange={(checked) => setModelFit(!!checked)}
              id="modelFit"
            />
            <label htmlFor="modelFit" className="text-sm">Model fit</label>
          </div>
          <div className="flex flex-col ml-6 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={rSquaredChange}
                onCheckedChange={(checked) => setRSquaredChange(!!checked)}
                id="rSquaredChange"
              />
              <label htmlFor="rSquaredChange" className="text-sm">R squared change</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={descriptives}
                onCheckedChange={(checked) => setDescriptives(!!checked)}
                id="descriptives"
              />
              <label htmlFor="descriptives" className="text-sm">Descriptives</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={partAndPartial}
                onCheckedChange={(checked) => setPartAndPartial(!!checked)}
                id="partAndPartial"
              />
              <label htmlFor="partAndPartial" className="text-sm">Part and partial correlations</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={collinearityDiagnostics}
                onCheckedChange={(checked) => setCollinearityDiagnostics(!!checked)}
                id="collinearityDiagnostics"
              />
              <label htmlFor="collinearityDiagnostics" className="text-sm">Collinearity diagnostics</label>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Bagian Residuals */}
      <div className="border rounded-md p-4">
        <h3 className="font-semibold text-md mb-2">Residuals</h3>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={durbinWatson}
              onCheckedChange={(checked) => setDurbinWatson(!!checked)}
              id="durbinWatson"
            />
            <label htmlFor="durbinWatson" className="text-sm">Durbin-Watson</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={casewiseDiagnostics}
              onCheckedChange={(checked) => {
                setCasewiseDiagnostics(!!checked);
                if (!checked) {
                  setSelectedResidualOption('');
                }
              }}
              id="casewiseDiagnostics"
            />
            <label htmlFor="casewiseDiagnostics" className="text-sm">Casewise diagnostics</label>
          </div>
          <div className="flex flex-col ml-6 space-y-1">
            {/* Radio button: Outliers outside: [input] standard deviations */}
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="residualOption"
                id="outliers"
                value="outliers"
                disabled={!casewiseDiagnostics}
                checked={selectedResidualOption === 'outliers'}
                onChange={() => setSelectedResidualOption('outliers')}
                className="accent-gray-500"
              />
              <label htmlFor="outliers" className="text-sm">Outliers outside:</label>
              <Input
                type="number"
                value={outlierThreshold}
                onChange={(e) => setOutlierThreshold(e.target.value)}
                disabled={!casewiseDiagnostics || selectedResidualOption !== 'outliers'}
                className="w-16 p-1 text-sm"
              />
              <span className="text-sm">standard deviations</span>
            </div>
            {/* Radio button: All cases */}
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name="residualOption"
                id="allCases"
                value="allCases"
                disabled={!casewiseDiagnostics}
                checked={selectedResidualOption === 'allCases'}
                onChange={() => setSelectedResidualOption('allCases')}
                className="accent-gray-500"
              />
              <label htmlFor="allCases" className="text-sm">All cases</label>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Tombol Navigasi */}
      <DialogFooter className="flex justify-start space-x-3 mt-4">
      <Button
          variant="default"
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={handleContinue}
        >
          Continue
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default Statistics;
