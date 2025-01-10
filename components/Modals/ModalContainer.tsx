// components/Modals/ModalContainer.tsx

"use client";

import React from "react";
import { useModal, ModalType } from "@/hooks/useModal";
import OpenFileModal from "./OpenFileModal";
import SaveFileModal from "./SaveFileModal";
import ComputeVariableModal from "@/components/Modals/ComputeVariableModal";
import ChartBuilderModal from "@/components/Modals/Graphs/ChartBuilder/ChartBuilderModal";
import ExportDataModal from "./ExportDataModal";
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
