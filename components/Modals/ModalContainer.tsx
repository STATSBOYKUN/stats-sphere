// components/Modals/ModalContainer.tsx

"use client";

import React from "react";
import { useModal, ModalType } from "@/hooks/useModal";

// Time Series Tolong Jangan Dihapus
import SmoothingModal from "@/components/Modals/Analyze/TimeSeries/SmoothingModal";
import DecompositionModal from "@/components/Modals/Analyze/TimeSeries/DecompositionModal";
import AutocorrelationModal from '@/components/Modals/Analyze/TimeSeries/AutocorrelationModal';
import UnitRootTestModal from '@/components/Modals/Analyze/TimeSeries/UnitRootTestModal';
import BoxJenkinsModelModal from '@/components/Modals/Analyze/TimeSeries/BoxJenkinsModelModal';

import ComputeVariableModal from "@/components/Modals/Transform/ComputeVariableModal";
import { Dialog } from "@/components/ui/dialog";
import SimpleBarModal from "./Graphs/LegacyDialogs/BarModal/SimpleBarModal";
import FrequenciesModal from "@/components/Modals/Analyze/DescriptiveStatistic/Frequencies/FrequenciesModal";
import ImportCSV from "@/components/Modals/File/ImportCSV";
// import OpenData from "@/components/Modals/File/OpenData";
import ReadCSVFile from "@/components/Modals/File/ReadCSVFile";
import ImportExcel from "@/components/Modals/File/ImportExcel";
import ReadExcelFile from "@/components/Modals/File/ReadExcelFile";
import ModalAutomaticLinearModeling from "@/components/Modals/Regression/AutomaticLinearModeling/ModalAutomaticLinearModeling";
import ModalLinear from "./Regression/Linear/ModalLinear";
import ModalCurveEstimation from "./Regression/CurveEstimation/ModalCurveEstimation";
import ModalPartialLeastSquares from "./Regression/PartialLeastSquares/ModalPartialLeastSquares";
import ModalBinaryLogistic from "./Regression/BinaryLogistic/ModalBinaryLogistic";
import ModalMultinomialLogistic from "./Regression/MultinomialLogistic/ModalMultinomialLogistic";
import ModalOrdinal from "./Regression/Ordinal/ModalOrdinal";
import ModalProbit from "./Regression/Probit/ModalProbit";
import ModalNonlinear from "./Regression/Nonlinear/ModalNonlinear";

import ModalTwoStageLeastSquares from "./Regression/TwoStageLeastSquares/ModalTwoStageLeastSquares";
import ModalWeightEstimation from "./Regression/WeightEstimation/ModalWeightEstimation";
import ModalQuantiles from "./Regression/Quantiles/ModalQuantiles";
import ModalOptimalScaling from "./Regression/OptimalScaling/ModalOptimalScaling";
import ChartBuilderModal from "./Graphs/ChartBuilder/ChartBuilderModal";

const ModalContainer: React.FC = () => {
  const { modals, closeModal } = useModal();

  if (modals.length === 0) return null;

  const currentModal = modals[modals.length - 1];

  const renderModal = () => {
    switch (currentModal.type) {
      case ModalType.ImportCSV:
        return <ImportCSV onClose={closeModal} {...currentModal.props} />;
      case ModalType.ReadCSVFile:
        return <ReadCSVFile onClose={closeModal} {...currentModal.props} />;
      case ModalType.ImportExcel:
        return <ImportExcel onClose={closeModal} {...currentModal.props} />;
      case ModalType.ReadExcelFile:
        return <ReadExcelFile onClose={closeModal} {...currentModal.props} />;
      // case ModalType.OpenData:
      //   return <OpenData onClose={closeModal} {...currentModal.props} />;
      case ModalType.ComputeVariable:
        return (
          <ComputeVariableModal onClose={closeModal} {...currentModal.props} />
        );

      // Regression Nopal
      case ModalType.ModalAutomaticLinearModeling:
        return (
          <ModalAutomaticLinearModeling
            onClose={closeModal}
            {...currentModal.props}
          />
        );
      case ModalType.ModalLinear:
        return <ModalLinear onClose={closeModal} {...currentModal.props} />;
      case ModalType.ModalCurveEstimation:
        return (
          <ModalCurveEstimation onClose={closeModal} {...currentModal.props} />
        );
      case ModalType.ModalPartialLeastSquares:
        return (
          <ModalPartialLeastSquares
            onClose={closeModal}
            {...currentModal.props}
          />
        );
      case ModalType.ModalBinaryLogistic:
        return (
          <ModalBinaryLogistic onClose={closeModal} {...currentModal.props} />
        );
      case ModalType.ModalMultinomialLogistic:
        return (
          <ModalMultinomialLogistic
            onClose={closeModal}
            {...currentModal.props}
          />
        );
      case ModalType.ModalOrdinal:
        return <ModalOrdinal onClose={closeModal} {...currentModal.props} />;
      case ModalType.ModalProbit:
        return <ModalProbit onClose={closeModal} {...currentModal.props} />;
      case ModalType.ModalNonlinear:
        return <ModalNonlinear onClose={closeModal} {...currentModal.props} />;
      case ModalType.ModalWeightEstimation:
        return (
          <ModalWeightEstimation onClose={closeModal} {...currentModal.props} />
        );
      case ModalType.ModalTwoStageLeastSquares:
        return (
          <ModalTwoStageLeastSquares
            onClose={closeModal}
            {...currentModal.props}
          />
        );
      case ModalType.ModalQuantiles:
        return <ModalQuantiles onClose={closeModal} {...currentModal.props} />;
      case ModalType.ModalOptimalScaling:
        return (
          <ModalOptimalScaling onClose={closeModal} {...currentModal.props} />
        );

      // Time Series
      case ModalType.Smoothing:
        return <SmoothingModal onClose={closeModal} {...currentModal.props} />;
      case ModalType.Decomposition:
        return (
          <DecompositionModal onClose={closeModal} {...currentModal.props} />
        );
      case ModalType.Autocorrelation:
        return (
          <AutocorrelationModal onClose={closeModal} {...currentModal.props} />
        );
      case ModalType.UnitRootTest:
          return (
            <UnitRootTestModal onClose={closeModal} {...currentModal.props} />
          );
      case ModalType.BoxJenkinsModel:
        return (
          <BoxJenkinsModelModal onClose={closeModal} {...currentModal.props} />
        );

      case ModalType.Frequencies:
      case ModalType.FrequenciesStatistic:
        return (
          <FrequenciesModal onClose={closeModal} {...currentModal.props} />
        );

      // Chart Builder
      case ModalType.ChartBuilderModal:
        return (
          <ChartBuilderModal onClose={closeModal} {...currentModal.props} />
        );
      case ModalType.SimpleBarModal:
        return <SimpleBarModal onClose={closeModal} {...currentModal.props} />;

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
