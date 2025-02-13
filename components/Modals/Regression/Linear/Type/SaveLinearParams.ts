export interface SaveLinearParams {
    predictedUnstandardized: boolean;
    predictedStandardized: boolean;
    predictedAdjusted: boolean;
    predictedSE: boolean;
    residualUnstandardized: boolean;
    residualStandardized: boolean;
    residualStudentized: boolean;
    residualDeleted: boolean;
    residualStudentizedDeleted: boolean;
    distanceMahalanobis: boolean;
    distanceCooks: boolean;
    distanceLeverage: boolean;
    influenceDfBetas: boolean;
    influenceStandardizedDfBetas: boolean;
    influenceDfFits: boolean;
    influenceStandardizedDfFits: boolean;
    influenceCovarianceRatios: boolean;
    predictionMean: boolean;
    predictionIndividual: boolean;
    confidenceInterval: string;
    createCoefficientStats: boolean;
    coefficientOption: 'newDataset' | 'newDataFile';
    datasetName: string;
    xmlFilePath: string;
    includeCovarianceMatrixXml: boolean;
  }