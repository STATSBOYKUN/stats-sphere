// hooks/useModal.ts

import { useModalStore, ModalType } from '@/stores/useModalStore';

export { ModalType };

export const useModal = () => {
    const modals = useModalStore((state: { modals: any; }) => state.modals);
    const openModal = useModalStore((state: { openModal: any; }) => state.openModal);
    const closeModal = useModalStore((state: { closeModal: any; }) => state.closeModal);
    const closeAllModals = useModalStore((state: { closeAllModals: any; }) => state.closeAllModals);

    return { modals, openModal, closeModal, closeAllModals };
};
