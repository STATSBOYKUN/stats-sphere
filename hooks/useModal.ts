// hooks/useModal.ts
import { useContext } from 'react';
import { ModalContext } from "@/contexts/ModalContext";

export const useModal = () => {
    return useContext(ModalContext);
};
