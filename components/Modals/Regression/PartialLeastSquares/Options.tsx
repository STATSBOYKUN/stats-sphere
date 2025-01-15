// components/Modals/PartialLeastSquares/Options.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const Options: React.FC = () => {
  const [saveIndividualCases, setSaveIndividualCases] = useState<boolean>(false);
  const [datasetNameIndividual, setDatasetNameIndividual] = useState<string>('');

  const [saveLatentFactors, setSaveLatentFactors] = useState<boolean>(false);
  const [datasetNameLatent, setDatasetNameLatent] = useState<string>('');

  const [saveIndependentVars, setSaveIndependentVars] = useState<boolean>(false);
  const [datasetNameIndependent, setDatasetNameIndependent] = useState<string>('');

  const handleIndividualCasesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaveIndividualCases(e.target.checked);
    if (!e.target.checked) setDatasetNameIndividual('');
  };

  const handleLatentFactorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaveLatentFactors(e.target.checked);
    if (!e.target.checked) setDatasetNameLatent('');
  };

  const handleIndependentVarsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaveIndependentVars(e.target.checked);
    if (!e.target.checked) setDatasetNameIndependent('');
  };

  return (
    <div className="p-4 space-y-6">
      {/* Option 1: Save estimates for individual cases */}
      <div>
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={saveIndividualCases}
            onChange={handleIndividualCasesChange}
            className="form-checkbox h-4 w-4 text-blue-600 mt-1"
          />
          <span className="ml-2 font-semibold">Save estimates for individual cases.</span>
        </label>
        <div className={`mt-2 ml-6 space-y-2 ${!saveIndividualCases ? 'opacity-50' : ''}`}>
          <input
            type="text"
            placeholder="Enter dataset name"
            value={datasetNameIndividual}
            onChange={(e) => setDatasetNameIndividual(e.target.value)}
            disabled={!saveIndividualCases}
            className={`w-full p-2 border rounded ${!saveIndividualCases ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          <p className={`text-sm ${!saveIndividualCases ? 'text-gray-400' : 'text-gray-600'}`}>
            This option saves predicted values, residuals, latent factor scores, and distances as SPSS Statistics data.
            It also generates plots for latent factor scores.
          </p>
        </div>
      </div>

      {/* Option 2: Save estimates for latent factors */}
      <div>
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={saveLatentFactors}
            onChange={handleLatentFactorsChange}
            className="form-checkbox h-4 w-4 text-blue-600 mt-1"
          />
          <span className="ml-2 font-semibold">Save estimates for latent factors.</span>
        </label>
        <div className={`mt-2 ml-6 space-y-2 ${!saveLatentFactors ? 'opacity-50' : ''}`}>
          <input
            type="text"
            placeholder="Enter dataset name"
            value={datasetNameLatent}
            onChange={(e) => setDatasetNameLatent(e.target.value)}
            disabled={!saveLatentFactors}
            className={`w-full p-2 border rounded ${!saveLatentFactors ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          <p className={`text-sm ${!saveLatentFactors ? 'text-gray-400' : 'text-gray-600'}`}>
            This option saves latent factor loadings and latent factor weights as SPSS Statistics data.
            It also generates plots for latent factor weights.
          </p>
        </div>
      </div>

      {/* Option 3: Save estimates for independent variables */}
      <div>
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={saveIndependentVars}
            onChange={handleIndependentVarsChange}
            className="form-checkbox h-4 w-4 text-blue-600 mt-1"
          />
          <span className="ml-2 font-semibold">Save estimates for independent variables.</span>
        </label>
        <div className={`mt-2 ml-6 space-y-2 ${!saveIndependentVars ? 'opacity-50' : ''}`}>
          <input
            type="text"
            placeholder="Enter dataset name"
            value={datasetNameIndependent}
            onChange={(e) => setDatasetNameIndependent(e.target.value)}
            disabled={!saveIndependentVars}
            className={`w-full p-2 border rounded ${!saveIndependentVars ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          <p className={`text-sm ${!saveIndependentVars ? 'text-gray-400' : 'text-gray-600'}`}>
            This option saves regression parameter estimates and variable importance to projection (VIP) values as SPSS Statistics data.
            It also generates plots of VIP by latent factor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Options;
