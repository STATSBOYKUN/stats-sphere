// components/Modals/ModalContainer.tsx

"use client";

import React from "react";
import { useModal, ModalType } from "@/hooks/useModal";
import SmoothingModal from "@/components/Modals/Analyze/TimeSeries/SmoothingModal";
import DecompositionModal from "@/components/Modals/Analyze/TimeSeries/DecompositionModal";
import StationaryTestModal from "@/components/Modals/Analyze/TimeSeries/StationaryTestModal";
import CreateModelModal from "@/components/Modals/Analyze/TimeSeries/CreateModelModal";
import OpenFileModal from "./File/OpenFileModal";
import SaveFileModal from "./File/SaveFileModal";
import ComputeVariableModal from "@/components/Modals/Transform/ComputeVariableModal";
import ChartBuilderModal from "@/components/Modals/Graphs/ChartBuilder/ChartBuilderModal";
import ExportDataModal from "./File/ExportDataModal";
import FrequenciesModal from "@/components/Modals/Analyze/DescriptiveStatistic/Frequencies/FrequenciesModal";
import DescriptivesModal from "@/components/Modals/Analyze/DescriptiveStatistic/DescriptivesModal";
import { Dialog } from "@/components/ui/dialog";
import SimpleBarModal from "./Graphs/LegacyDialogs/BarModal/SimpleBarModal";

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
        return (
          <ComputeVariableModal onClose={closeModal} {...currentModal.props} />
        );
      case ModalType.ChartBuilderModal:
        return (
          <ChartBuilderModal onClose={closeModal} {...currentModal.props} />
        );
      case ModalType.SimpleBarModal:
        return <SimpleBarModal onClose={closeModal} {...currentModal.props} />;
      case ModalType.Smoothing:
        return <SmoothingModal onClose={closeModal} {...currentModal.props} />;
      case ModalType.Decomposition:
        return (
          <DecompositionModal onClose={closeModal} {...currentModal.props} />
        );
      case ModalType.StationaryTest:
        return (
          <StationaryTestModal onClose={closeModal} {...currentModal.props} />
        );
      case ModalType.CreateModel:
        return (
          <CreateModelModal onClose={closeModal} {...currentModal.props} />
        );
      case ModalType.FrequenciesStatistic:
        return (
          <FrequenciesModal onClose={closeModal} {...currentModal.props} />
        );
      case ModalType.DescriptiveStatistic:
        return (
          <DescriptivesModal onClose={closeModal} {...currentModal.props} />
        );

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
