import React from 'react';
import { useModal, ModalType } from '@/contexts/ModalContext';
import OpenFileModal from './OpenFileModal';
import SaveFileModal from './SaveFileModal';
import ExportDataModal from './ExportDataModal';
// Import modal lainnya di sini

const ModalContainer: React.FC = () => {
    const { modalType, closeModal } = useModal();

    if (!modalType) return null;

    const renderModal = () => {
        switch (modalType) {
            case ModalType.OpenFile:
                return <OpenFileModal onClose={closeModal} />;
            case ModalType.SaveFile:
                return <SaveFileModal onClose={closeModal} />;
            case ModalType.ExportData:
                return <ExportDataModal onClose={closeModal} />;
            // Tambahkan case untuk modal lainnya di sini
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 relative">
                <button
                    onClick={closeModal}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    aria-label="Close modal"
                >
                    &times;
                </button>
                {renderModal()}
            </div>
        </div>
    );
};

export default ModalContainer;
