// components/modals/ModalContainer.tsx

import React from 'react';
import ReactDOM from 'react-dom';
import { useModal, ModalType } from '@/contexts/ModalContext';
import OpenFileModal from './OpenFileModal';
import SaveFileModal from './SaveFileModal';
import ExportDataModal from './ExportDataModal';

const ModalContainer: React.FC = () => {
    const { modals, closeModal } = useModal();

    if (modals.length === 0) return null;

    const currentModal = modals[modals.length - 1];

    const renderModal = () => {
        switch (currentModal.type) {
            case ModalType.OpenFile:
                return <OpenFileModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.SaveFile:
                return <SaveFileModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.ExportData:
                return <ExportDataModal onClose={closeModal} {...currentModal.props} />;
            default:
                return null;
        }
    };

    return ReactDOM.createPortal(
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
        </div>,
        document.body
    );
};

export default ModalContainer;
