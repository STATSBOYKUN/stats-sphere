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
import ExploreModal from './Analyze/DescriptiveStatistic/ExploreModal';
import CrosstabsModal from './Analyze/DescriptiveStatistic/CrosstabsModal';
import OneSampleTTestModal from './Analyze/Compare Means/OneSampleTTestModal';
import IndependentSamplesTTestModal from './Analyze/Compare Means/IndependentSamplesTTestModal';
import PairedSamplesTTestModal from './Analyze/Compare Means/PairedSamplesTTestModal';
import OneWayAnovaModal from './Analyze/Compare Means/OneWayAnovaModal';
import UnivariateModal from './Analyze/General Linear Model/UnivariateModal';
import BivariateModal from './Analyze/Correlate/BivariateModal';
import ChiSquareModal from './Analyze/Nonparametric Tests/Legacy Dialogs/ChiSquareModal';
import RunsModal from './Analyze/Nonparametric Tests/Legacy Dialogs/RunsModal';
import TwoIndependentSamplesTestModal from './Analyze/Nonparametric Tests/Legacy Dialogs/TwoIndependentSamplesTestModal';
import { Dialog } from '@/components/ui/dialog';
import KIndependentSamplesTestModal from './Analyze/Nonparametric Tests/Legacy Dialogs/KIndependentSamplesTestModal';
import KRelatedSamplesTestModal from './Analyze/Nonparametric Tests/Legacy Dialogs/KRelatedSamplesTestModal';

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
            case ModalType.Explore:
                return <ExploreModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.Crosstabs:
                return <CrosstabsModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.OneSampleTTest:
                return <OneSampleTTestModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.IndependentSamplesTTest:
                return <IndependentSamplesTTestModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.PairedSamplesTTest:
                return <PairedSamplesTTestModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.OneWayAnova:
                return <OneWayAnovaModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.Univariate:
                return <UnivariateModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.Bivariate:
                return <BivariateModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.ChiSquare:
                return <ChiSquareModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.Runs:
                return <RunsModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.TwoIndependentSamplesTest:
                return <TwoIndependentSamplesTestModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.KIndependentSamplesTest:
                return <KIndependentSamplesTestModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.KRelatedSamplesTest:
                return <KRelatedSamplesTestModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.FrequenciesStatistic:
                return <FrequenciesModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.DescriptiveStatistic:
                return <DescriptivesModal onClose={closeModal} {...currentModal.props} />;
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
