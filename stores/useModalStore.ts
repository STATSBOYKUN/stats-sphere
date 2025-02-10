// stores/useModalStore.ts

import { create } from 'zustand';
import StatisticsSettingsModal
    from "@/components/Modals/Analyze/DescriptiveStatistic/Frequencies/FrequenciesStatistics";

export enum ModalType {
    OpenFile = 'openFile',
    SaveFile = 'saveFile',
    ExportData = 'exportData',
    ComputeVariable = 'computeVariable',
    // Punya Nopal
    ModalAutomaticLinearModeling = 'modalAutomaticLinearModeling',
    ModalLinear = 'modalLinear',
        Statistics = 'Statistics',
        SaveLinear = 'SaveLinear',
        OptionsLinear = 'OptionsLinear',
    ModalCurveEstimation = 'modalCurveEstimation',
    ModalPartialLeastSquares = 'modalPartialLeastSquares',
    ModalBinaryLogistic = 'modalBinaryLogistic',
    ModalMultinomialLogistic = 'modalMultinomialLogistic',
    ModalOrdinal= 'modalOrdinal',
    ModalProbit = 'modalProbit',
    ModalNonlinear = 'modalNonlinear',
    ModalWeightEstimation = 'modalWeightEstimation',
    ModalTwoStageLeastSquares = 'modalTwoStageLeastSquares',
    ModalQuantiles = 'modalQuantiles',
    ModalOptimalScaling = 'modalOptimalScaling',

    // Time Series
    Smoothing = 'smoothing', //Time Series Smoothing
    Decomposition = 'decomposition', //Time Series Decomposition
    StationaryTest = 'stationaryTest', //Time Series Stationary Test
    CreateModel = 'createModel', //Time Series Create Model

    FrequenciesStatistic = 'frequenciesStatistic',
    DescriptiveStatistic = 'descriptiveStatistic',
    StatisticsSettingsModal = 'statisticsSettingsModal',
    ChartSettingsModal = 'chartSettingsModal',
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

export const useModalStore = create<ModalStoreState>((set, get) => ({
    modals: [],
    openModal: (type, props) => {
        set((state) => ({ modals: [...state.modals, { type, props }] }));
    },
    closeModal: () => {
        set((state) => ({ modals: state.modals.slice(0, -1) }));
    },
    closeAllModals: () => {
        set({ modals: [] });
    },
}));
