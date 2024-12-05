// components/Modals/ModalContainer.tsx

"use client";

import React from 'react';
import { useModal, ModalType } from '@/hooks/useModal';
import OpenFileModal from './OpenFileModal';
import SaveFileModal from './SaveFileModal';
import ComputeVariableModal from "@/components/Modals/ComputeVariableModal";
import SmoothingModal from '@/components/Modals/Analyze/TimeSeries/SmoothingModal';
import DecompositionModal from '@/components/Modals/Analyze/TimeSeries/DecompositionModal';
import AutocorrelationModal from '@/components/Modals/Analyze/TimeSeries/AutocorrelationModal';
import UnitRootTestModal from '@/components/Modals/Analyze/TimeSeries/UnitRootTestModal';
import CreateModelModal from '@/components/Modals/Analyze/TimeSeries/CreateModelModal';
import ExportDataModal from './ExportDataModal';
import { Dialog } from '@/components/ui/dialog';

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
            case ModalType.ComputeVariable:
                return <ComputeVariableModal onClose={closeModal} {...currentModal.props} />;

            // Time Series
            case ModalType.Smoothing:
                return <SmoothingModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.Decomposition:
                return <DecompositionModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.Autocorrelation:
                return <AutocorrelationModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.UnitRootTest:
                return <UnitRootTestModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.CreateModel:
                return <CreateModelModal onClose={closeModal} {...currentModal.props} />;

            default:
                return null;
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && closeModal()}>
            {renderModal()}
        </Dialog>
    );
};

export default ModalContainer;
