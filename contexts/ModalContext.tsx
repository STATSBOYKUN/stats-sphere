// contexts/ModalContext.tsx

"use client";

import React, { createContext, useContext, useState, ReactNode, FC } from 'react';
import ModalContainer from "@/components/Modals/ModalContainer";

export enum ModalType {
    OpenFile = 'openFile',
    SaveFile = 'saveFile',
    ExportData = 'exportData',
}

interface ModalInstance {
    type: ModalType;
    props?: any;
}

interface ModalContextProps {
    modals: ModalInstance[];
    openModal: (type: ModalType, props?: any) => void;
    closeModal: () => void;
    closeAllModals: () => void;
}

export const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [modals, setModals] = useState<ModalInstance[]>([]);

    const openModal = (type: ModalType, props?: any) => {
        setModals((prev) => [...prev, { type, props }]);
    };

    const closeModal = () => {
        setModals((prev) => prev.slice(0, -1));
    };

    const closeAllModals = () => {
        setModals([]);
    };

    return (
        <ModalContext.Provider value={{ modals, openModal, closeModal, closeAllModals }}>
            {children}
            <ModalContainer />
        </ModalContext.Provider>
    );
};

export const useModal = (): ModalContextProps => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
};
