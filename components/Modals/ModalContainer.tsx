// components/Modals/ModalContainer.tsx

"use client";

import React from 'react';
import { useModal, ModalType } from '@/hooks/useModal';
import SmoothingModal from '@/components/Modals/Analyze/TimeSeries/SmoothingModal';
import DecompositionModal from '@/components/Modals/Analyze/TimeSeries/DecompositionModal';
import StationaryTestModal from '@/components/Modals/Analyze/TimeSeries/StationaryTestModal';
import CreateModelModal from '@/components/Modals/Analyze/TimeSeries/CreateModelModal';
import OpenFileModal from './File/OpenFileModal';
import SaveFileModal from './File/SaveFileModal';
import ComputeVariableModal from "@/components/Modals/Transform/ComputeVariableModal";
import ExportDataModal from './File/ExportDataModal';
import FrequenciesModal from "@/components/Modals/Analyze/DescriptiveStatistic/Frequencies/FrequenciesModal";
import DescriptivesModal from "@/components/Modals/Analyze/DescriptiveStatistic/DescriptivesModal";
import OneSampleTTestModal from './Analyze/Compare Means/OneSampleTTestModal';
import IndependentSamplesTTestModal from './Analyze/Compare Means/IndependentSamplesTTestModal';
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
            case ModalType.OneSampleTTest:
                return <OneSampleTTestModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.IndependentSamplesTTest:
                return <IndependentSamplesTTestModal onClose={closeModal} {...currentModal.props} />;
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
