"use client";

import React, { createContext, useContext, useState, ReactNode, FC } from 'react';
import ModalContainer from "@/components/Modals/ModalContainer";

export enum ModalType {
    OpenFile = 'openFile',
    SaveFile = 'saveFile',
    ExportData = 'exportData',
}

interface ModalContextProps {
    modalType: ModalType | null;
    openModal: (type: ModalType) => void;
    closeModal: () => void;
}

export const ModalContext = createContext<ModalContextProps | undefined>(undefined);

// ModalProvider yang membungkus aplikasi
export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [modalType, setModalType] = useState<ModalType | null>(null);

    const openModal = (type: ModalType) => setModalType(type);
    const closeModal = () => setModalType(null);

    return (
        <ModalContext.Provider value={{ modalType, openModal, closeModal }}>
            {children}
            <ModalContainer /> {/* Tambahkan ModalContainer di sini */}
        </ModalContext.Provider>
    );
};

// Custom hook untuk menggunakan context
export const useModal = (): ModalContextProps => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
};
