// components/SaveLinear.tsx
import React, { useState } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface SaveLinearProps {
  onClose: () => void;
}

const SaveLinear: React.FC<SaveLinearProps> = ({ onClose }) => {
  /* --- State untuk grup Predicted Values --- */
  const [predictedUnstandardized, setPredictedUnstandardized] = useState(false);
  const [predictedStandardized, setPredictedStandardized] = useState(false);
  const [predictedAdjusted, setPredictedAdjusted] = useState(false);
  const [predictedSE, setPredictedSE] = useState(false);

  /* --- State untuk grup Residuals --- */
  const [residualUnstandardized, setResidualUnstandardized] = useState(false);
  const [residualStandardized, setResidualStandardized] = useState(false);
  const [residualStudentized, setResidualStudentized] = useState(false);
  const [residualDeleted, setResidualDeleted] = useState(false);
  const [residualStudentizedDeleted, setResidualStudentizedDeleted] = useState(false);

  /* --- State untuk grup Distances --- */
  const [distanceMahalanobis, setDistanceMahalanobis] = useState(false);
  const [distanceCooks, setDistanceCooks] = useState(false);
  const [distanceLeverage, setDistanceLeverage] = useState(false);

  /* --- State untuk grup Influence Statistics --- */
  const [influenceDfBetas, setInfluenceDfBetas] = useState(false);
  const [influenceStandardizedDfBetas, setInfluenceStandardizedDfBetas] = useState(false);
  const [influenceDfFits, setInfluenceDfFits] = useState(false);
  const [influenceStandardizedDfFits, setInfluenceStandardizedDfFits] = useState(false);
  const [influenceCovarianceRatios, setInfluenceCovarianceRatios] = useState(false);

  /* --- State untuk grup Prediction Intervals --- */
  const [predictionMean, setPredictionMean] = useState(false);
  const [predictionIndividual, setPredictionIndividual] = useState(false);
  const [confidenceInterval, setConfidenceInterval] = useState('95');

  /* --- State untuk grup Coefficient statistics --- */
  const [createCoefficientStats, setCreateCoefficientStats] = useState(false);
  const [coefficientOption, setCoefficientOption] = useState<'newDataset' | 'newDataFile'>('newDataset');
  const [datasetName, setDatasetName] = useState('');

  /* --- State untuk grup Export model information to XML file --- */
  const [xmlFilePath, setXmlFilePath] = useState('');
  const [includeCovarianceMatrixXml, setIncludeCovarianceMatrixXml] = useState(false);

  return (
    <DialogContent className="sm:max-w-[800px] relative">
      <DialogHeader>
        <DialogTitle className="text-lg">Linear Regression: Save</DialogTitle>
      </DialogHeader>

      <Separator className="my-2" />

      {/* --- Baris 1: Predicted Values (kiri) & Residuals (kanan) --- */}
      <div className="grid grid-cols-2 gap-4">
        {/* Predicted Values */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Predicted Values</h3>
          <div className="flex items-center mb-2">
            <Checkbox
              checked={predictedUnstandardized}
              onCheckedChange={(checked) => setPredictedUnstandardized(!!checked)}
              id="predictedUnstandardized"
            />
            <label htmlFor="predictedUnstandardized" className="ml-2 text-sm">
              Unstandardized
            </label>
          </div>
          <div className="flex items-center mb-2">
            <Checkbox
              checked={predictedStandardized}
              onCheckedChange={(checked) => setPredictedStandardized(!!checked)}
              id="predictedStandardized"
            />
            <label htmlFor="predictedStandardized" className="ml-2 text-sm">
              Standardized
            </label>
          </div>
          <div className="flex items-center mb-2">
            <Checkbox
              checked={predictedAdjusted}
              onCheckedChange={(checked) => setPredictedAdjusted(!!checked)}
              id="predictedAdjusted"
            />
            <label htmlFor="predictedAdjusted" className="ml-2 text-sm">
              Adjusted
            </label>
          </div>
          <div className="flex items-center">
            <Checkbox
              checked={predictedSE}
              onCheckedChange={(checked) => setPredictedSE(!!checked)}
              id="predictedSE"
            />
            <label htmlFor="predictedSE" className="ml-2 text-sm">
              S.E. of mean predictions
            </label>
          </div>
        </div>

        {/* Residuals */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Residuals</h3>
          <div className="flex items-center mb-2">
            <Checkbox
              checked={residualUnstandardized}
              onCheckedChange={(checked) => setResidualUnstandardized(!!checked)}
              id="residualUnstandardized"
            />
            <label htmlFor="residualUnstandardized" className="ml-2 text-sm">
              Unstandardized
            </label>
          </div>
          <div className="flex items-center mb-2">
            <Checkbox
              checked={residualStandardized}
              onCheckedChange={(checked) => setResidualStandardized(!!checked)}
              id="residualStandardized"
            />
            <label htmlFor="residualStandardized" className="ml-2 text-sm">
              Standardized
            </label>
          </div>
          <div className="flex items-center mb-2">
            <Checkbox
              checked={residualStudentized}
              onCheckedChange={(checked) => setResidualStudentized(!!checked)}
              id="residualStudentized"
            />
            <label htmlFor="residualStudentized" className="ml-2 text-sm">
              Studentized
            </label>
          </div>
          <div className="flex items-center mb-2">
            <Checkbox
              checked={residualDeleted}
              onCheckedChange={(checked) => setResidualDeleted(!!checked)}
              id="residualDeleted"
            />
            <label htmlFor="residualDeleted" className="ml-2 text-sm">
              Deleted
            </label>
          </div>
          <div className="flex items-center">
            <Checkbox
              checked={residualStudentizedDeleted}
              onCheckedChange={(checked) => setResidualStudentizedDeleted(!!checked)}
              id="residualStudentizedDeleted"
            />
            <label htmlFor="residualStudentizedDeleted" className="ml-2 text-sm">
              Studentized deleted
            </label>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* --- Baris 2: Distances (kiri) & Influence Statistics (kanan) --- */}
      <div className="grid grid-cols-2 gap-4">
        {/* Distances */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Distances</h3>
          <div className="flex items-center mb-2">
            <Checkbox
              checked={distanceMahalanobis}
              onCheckedChange={(checked) => setDistanceMahalanobis(!!checked)}
              id="distanceMahalanobis"
            />
            <label htmlFor="distanceMahalanobis" className="ml-2 text-sm">
              Mahalanobis
            </label>
          </div>
          <div className="flex items-center mb-2">
            <Checkbox
              checked={distanceCooks}
              onCheckedChange={(checked) => setDistanceCooks(!!checked)}
              id="distanceCooks"
            />
            <label htmlFor="distanceCooks" className="ml-2 text-sm">
              Cook&apos;s
            </label>
          </div>
          <div className="flex items-center">
            <Checkbox
              checked={distanceLeverage}
              onCheckedChange={(checked) => setDistanceLeverage(!!checked)}
              id="distanceLeverage"
            />
            <label htmlFor="distanceLeverage" className="ml-2 text-sm">
              Leverage values
            </label>
          </div>
        </div>

        {/* Influence Statistics */}
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Influence Statistics</h3>
          <div className="grid grid-cols-2 gap-x-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <Checkbox
                  checked={influenceDfBetas}
                  onCheckedChange={(checked) => setInfluenceDfBetas(!!checked)}
                  id="influenceDfBetas"
                />
                <label htmlFor="influenceDfBetas" className="ml-2 text-sm">
                  DfBetas
                </label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  checked={influenceDfFits}
                  onCheckedChange={(checked) => setInfluenceDfFits(!!checked)}
                  id="influenceDfFits"
                />
                <label htmlFor="influenceDfFits" className="ml-2 text-sm">
                  DfFits
                </label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  checked={influenceCovarianceRatios}
                  onCheckedChange={(checked) => setInfluenceCovarianceRatios(!!checked)}
                  id="influenceCovarianceRatios"
                />
                <label htmlFor="influenceCovarianceRatios" className="ml-2 text-sm">
                  Covariance ratios
                </label>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <Checkbox
                  checked={influenceStandardizedDfBetas}
                  onCheckedChange={(checked) => setInfluenceStandardizedDfBetas(!!checked)}
                  id="influenceStandardizedDfBetas"
                />
                <label htmlFor="influenceStandardizedDfBetas" className="ml-2 text-sm">
                  Standardized DfBetas
                </label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  checked={influenceStandardizedDfFits}
                  onCheckedChange={(checked) => setInfluenceStandardizedDfFits(!!checked)}
                  id="influenceStandardizedDfFits"
                />
                <label htmlFor="influenceStandardizedDfFits" className="ml-2 text-sm">
                  Standardized DfFits
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* --- Baris 3: Prediction Intervals --- */}
      <div className="border rounded p-4 max-w-md">
        <h3 className="font-semibold mb-2">Prediction Intervals</h3>
        <div className="flex items-center mb-2">
          <Checkbox
            checked={predictionMean}
            onCheckedChange={(checked) => setPredictionMean(!!checked)}
            id="predictionMean"
          />
          <label htmlFor="predictionMean" className="ml-2 text-sm">
            Mean
          </label>
        </div>
        <div className="flex items-center mb-2">
          <Checkbox
            checked={predictionIndividual}
            onCheckedChange={(checked) => setPredictionIndividual(!!checked)}
            id="predictionIndividual"
          />
          <label htmlFor="predictionIndividual" className="ml-2 text-sm">
            Individual
          </label>
        </div>
        <div className="flex items-center">
          <span className="text-sm mr-2">Confidence Interval:</span>
          <Input
            type="number"
            value={confidenceInterval}
            onChange={(e) => setConfidenceInterval(e.target.value)}
            className="w-16 p-1 text-sm"
          />
          <span className="ml-2 text-sm">%</span>
        </div>
      </div>

      <Separator className="my-4" />

      {/* --- Baris 4: Coefficient statistics --- */}
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">Coefficient statistics</h3>
        <div className="flex items-center mb-2">
          <Checkbox
            checked={createCoefficientStats}
            onCheckedChange={(checked) => setCreateCoefficientStats(!!checked)}
            id="createCoefficientStats"
          />
          <label htmlFor="createCoefficientStats" className="ml-2 text-sm">
            Create coefficient statistics
          </label>
        </div>
        {createCoefficientStats && (
          <div className="ml-6 space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                name="coefficientOption"
                id="newDataset"
                value="newDataset"
                checked={coefficientOption === 'newDataset'}
                onChange={() => setCoefficientOption('newDataset')}
                className="accent-gray-500"
              />
              <label htmlFor="newDataset" className="ml-2 text-sm">
                Create a new dataset
              </label>
              {coefficientOption === 'newDataset' && (
                <div className="ml-4 flex items-center">
                  <label htmlFor="datasetName" className="text-xs">
                    Dataset name:
                  </label>
                  <Input
                    id="datasetName"
                    type="text"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    className="ml-2 p-1 text-sm"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                name="coefficientOption"
                id="newDataFile"
                value="newDataFile"
                checked={coefficientOption === 'newDataFile'}
                onChange={() => setCoefficientOption('newDataFile')}
                className="accent-gray-500"
              />
              <label htmlFor="newDataFile" className="ml-2 text-sm">
                Write a new data file
              </label>
              <Button
                variant="outline"
                className="ml-4"
                disabled={coefficientOption !== 'newDataFile'}
              >
                File...
              </Button>
            </div>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* --- Baris 5: Export model information to XML file --- */}
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">Export model information to XML file</h3>
        <div className="flex items-center mb-2">
          <Input
            type="text"
            placeholder="File path..."
            value={xmlFilePath}
            onChange={(e) => setXmlFilePath(e.target.value)}
            className="flex-1 p-1 text-sm"
          />
          <Button variant="outline" className="ml-2">
            Browse...
          </Button>
        </div>
        <div className="flex items-center">
          <Checkbox
            checked={includeCovarianceMatrixXml}
            onCheckedChange={(checked) => setIncludeCovarianceMatrixXml(!!checked)}
            id="includeCovarianceMatrixXml"
          />
          <label htmlFor="includeCovarianceMatrixXml" className="ml-2 text-sm">
            Include the covariance matrix
          </label>
        </div>
      </div>

      {/* --- Tombol Aksi --- */}
      <DialogFooter className="flex justify-end space-x-3 mt-4">
        <Button
          variant="default"
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => alert('Continue')}
        >
          Continue
        </Button>
        <Button variant="outline" onClick={() => alert('Cancel')}>
          Cancel
        </Button>
        <Button variant="outline" onClick={() => alert('Help')}>
          Help
        </Button>
      </DialogFooter>

      {/* Tombol Close (X) di pojok kanan atas */}
      <div className="absolute top-2 right-2">
        <Button variant="ghost" onClick={onClose}>
          X
        </Button>
      </div>
    </DialogContent>
  );
};

export default SaveLinear;
