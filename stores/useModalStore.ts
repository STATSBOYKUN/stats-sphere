// stores/useModalStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import zukeper from "zukeeper";

export enum ModalType {
  OpenFile = "openFile",
  SaveFile = "saveFile",
  ExportData = "exportData",
  ComputeVariable = "computeVariable",
  // Punya Nopal
  ModalAutomaticLinearModeling = "modalAutomaticLinearModeling",
  ModalLinear = "modalLinear",
  ModalCurveEstimation = "modalCurveEstimation",
  ModalPartialLeastSquares = "modalPartialLeastSquares",
  ModalBinaryLogistic = "modalBinaryLogistic",
  ModalMultinomialLogistic = "modalMultinomialLogistic",
  ModalOrdinal = "modalOrdinal",
  ModalProbit = "modalProbit",
  ModalNonlinear = "modalNonlinear",
  ModalWeightEstimation = "modalWeightEstimation",
  ModalTwoStageLeastSquares = "modalTwoStageLeastSquares",
  ModalQuantiles = "modalQuantiles",
  ModalOptimalScaling = "modalOptimalScaling",

  // Time Series
  Smoothing = "smoothing", //Time Series Smoothing
  Decomposition = "decomposition", //Time Series Decomposition
  Autocorrelation = 'autocorrelation', //Time Series Stationary Test
    UnitRootTest = "unitRootTest", //Time Series Stationary Test
  BoxJenkinsModel = "BoxJenkinsModel", //Time Series Create Model
  FrequenciesStatistic = "frequenciesStatistic",
  DescriptiveStatistic = "descriptiveStatistic",
  StatisticsSettingsModal = "statisticsSettingsModal",
  ChartSettingsModal = "chartSettingsModal",

  // File
  NewFile = "newFile",
  OpenData = "openData",
  OpenOutput = "openOutput",
  ImportExcel = "importExcel",
  ImportCSV = "importCSV",
  ExportDatabase = "exportDatabase",
  ExportExcel = "exportExcel",
  ExportCSV = "exportCSV",
  PrintPreview = "printPreview",
  Print = "print",
  Exit = "exit",

  // Edit
  Find = "find",
  Replace = "replace",
  GoToCase = "goToCase",
  GoToVariable = "goToVariable",

  // Data
  DefineVariableProperties = "defineVariableProperties",
  SetMeasurementLevel = "setMeasurementLevel",
  DefineDateTime = "defineDateTime",
  SortCases = "sortCases",
  SortVariables = "sortVariables",
  Transpose = "transpose",
  MergeFiles = "mergeFiles",
  Restructure = "restructure",
  SplitFile = "splitFile",
  WeightCases = "weightCases",

  // Descriptive
  Frequencies = "frequencies",
  Descriptive = "descriptive",
  Explore = "explore",
  Crosstabs = "crosstabs",
  Ratio = "ratio",
  QQPlots = "qqPlots",
  ReadCSVFile = "readCSVFile",
  ReadExcelFile = "ReadExcelFile",

  //Chart Builder
  ChartBuilderModal = "chartBuilderModal",
  SimpleBarModal = "simpleBarModal",
}

interface ModalInstance {
  type: ModalType;
  props?: any;
}

interface ModalStoreState {
  modals: ModalInstance[];
  openModal: (type: ModalType, props?: any) => void;
  closeModal: () => void;
  closeAllModals: () => void;
}

export const useModalStore = create<ModalStoreState>()(
    devtools(
        zukeper((set, get) => ({
            modals: [],
            openModal: (type, props) => {
                console.log('openModal', type, props);
                set((state) => ({ modals: [...state.modals, { type, props }] }));
            },
            closeModal: () => {
                set((state) => ({ modals: state.modals.slice(0, -1) }));
            },
            closeAllModals: () => {
                set({ modals: [] });
            },
        }))
    )
);
