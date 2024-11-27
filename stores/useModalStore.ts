// stores/useModalStore.ts

import { create } from 'zustand';

export enum ModalType {
    OpenFile = 'openFile',
    SaveFile = 'saveFile',
    ExportData = 'exportData',
    ComputeVariable = 'computeVariable',
    ModalAutomaticLinearModeling = 'modalAutomaticLinearModeling'
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
