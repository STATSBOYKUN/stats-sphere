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
import { Dialog } from '@/components/ui/dialog';
import ModalAutomaticLinearModeling from '@/components/Modals/Regression/AutomaticLinearModeling/ModalAutomaticLinearModeling'
import ModalLinear from './Regression/Linear/ModalLinear';
import ModalCurveEstimation from './Regression/CurveEstimation/ModalCurveEstimation';
import ModalPartialLeastSquares from './Regression/PartialLeastSquares/ModalPartialLeastSquares';
import ModalBinaryLogistic from './Regression/BinaryLogistic/ModalBinaryLogistic';
import ModalMultinomialLogistic from './Regression/MultinomialLogistic/ModalMultinomialLogistic';
import ModalOrdinal from './Regression/Ordinal/ModalOrdinal';
import ModalProbit from './Regression/Probit/ModalProbit';
import ModalNonlinear from './Regression/Nonlinear/ModalNonlinear';

import ModalTwoStageLeastSquares from './Regression/TwoStageLeastSquares/ModalTwoStageLeastSquares';
import ModalWeightEstimation from './Regression/WeightEstimation/ModalWeightEstimation';
import ModalQuantiles from './Regression/Quantiles/ModalQuantiles';
import ModalOptimalScaling from './Regression/OptimalScaling/ModalOptimalScaling';
import Statistics from './Regression/Linear/Statistics';
import SaveLinear from './Regression/Linear/SaveLinear';
import OptionsLinear from './Regression/Linear/OptionsLinear';
import BootstrapLinear from './Regression/Linear/BootstrapLinear';
import PlotsLinear from './Regression/Linear/PlotsLinear';

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

            // Regression Nopal
            case ModalType.ModalAutomaticLinearModeling:
                return <ModalAutomaticLinearModeling onClose={closeModal} {...currentModal.props}/>;
            case ModalType.ModalLinear:
                return <ModalLinear onClose={closeModal} {...currentModal.props}/>;
                    case ModalType.Statistics:
                        return <Statistics onClose={closeModal} {...currentModal.props}/>;
                    case ModalType.SaveLinear:
                        return <SaveLinear onClose={closeModal} {...currentModal.props}/>;
                    case ModalType.OptionsLinear:
                        return <OptionsLinear onClose={closeModal} {...currentModal.props}/>;
                    case ModalType.BootstrapLinear:
                        return <BootstrapLinear onClose={closeModal} {...currentModal.props}/>;
                    case ModalType.PlotsLinear:
                        return <PlotsLinear onClose={closeModal} {...currentModal.props}/>;
            case ModalType.ModalCurveEstimation:
                return <ModalCurveEstimation onClose={closeModal} {...currentModal.props}/>;
            case ModalType.ModalPartialLeastSquares:
                return <ModalPartialLeastSquares onClose={closeModal} {...currentModal.props}/>;
            case ModalType.ModalBinaryLogistic:
                return <ModalBinaryLogistic onClose={closeModal} {...currentModal.props}/>;
            case ModalType.ModalMultinomialLogistic:
                return <ModalMultinomialLogistic onClose={closeModal} {...currentModal.props}/>;
            case ModalType.ModalOrdinal:
                return <ModalOrdinal onClose={closeModal} {...currentModal.props}/>;
            case ModalType.ModalProbit:
                return <ModalProbit onClose={closeModal} {...currentModal.props}/>;
            case ModalType.ModalNonlinear:
                return <ModalNonlinear onClose={closeModal} {...currentModal.props}/>;
            case ModalType.ModalWeightEstimation:
                return <ModalWeightEstimation onClose={closeModal} {...currentModal.props}/>;
            case ModalType.ModalTwoStageLeastSquares:
                return <ModalTwoStageLeastSquares onClose={closeModal} {...currentModal.props}/>;
            case ModalType.ModalQuantiles:
                return <ModalQuantiles onClose={closeModal} {...currentModal.props}/>;
            case ModalType.ModalOptimalScaling:
                return <ModalOptimalScaling onClose={closeModal} {...currentModal.props}/>;

            // Time Series
            case ModalType.Smoothing:
                return <SmoothingModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.Decomposition:
                return <DecompositionModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.StationaryTest:
                return <StationaryTestModal onClose={closeModal} {...currentModal.props} />;
            case ModalType.CreateModel:
                return <CreateModelModal onClose={closeModal} {...currentModal.props} />;

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
