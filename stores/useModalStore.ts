// stores/useModalStore.ts

import { create } from 'zustand';
import StatisticsSettingsModal
    from "@/components/Modals/Analyze/DescriptiveStatistic/Frequencies/FrequenciesStatistics";

export enum ModalType {
    OpenFile = 'openFile',
    SaveFile = 'saveFile',
    ExportData = 'exportData',
    ComputeVariable = 'computeVariable',

    // Time Series
    Smoothing = 'smoothing', //Time Series Smoothing
    Decomposition = 'decomposition', //Time Series Decomposition
    Autocorrelation = 'autocorrelation', //Time Series Stationary Test
    UnitRootTest = 'unitRootTest', //Time Series Stationary Test
    BoxJenkinsModel = 'BoxJenkinsModel', //Time Series Create Model
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
