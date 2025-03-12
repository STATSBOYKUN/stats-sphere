import { useState } from "react";
import {
    CorrespondenceContainerProps,
    CorrespondenceType,
} from "@/models/dimension-reduction/correspondence-analysis/correspondence-analysis";
import { CorrespondenceDefault } from "@/constants/dimension-reduction/correspondence-analysis/correspondence-analysis-default";
import { CorrespondenceDialog } from "@/components/Modals/Analyze/dimension-reduction/correspondence-analysis/dialog";
import { CorrespondenceDefineRangeRow } from "@/components/Modals/Analyze/dimension-reduction/correspondence-analysis/define-range-row";
import { CorrespondenceDefineRangeColumn } from "@/components/Modals/Analyze/dimension-reduction/correspondence-analysis/define-range-column";
import { CorrespondencePlots } from "@/components/Modals/Analyze/dimension-reduction/correspondence-analysis/plots";
import { CorrespondenceModel } from "@/components/Modals/Analyze/dimension-reduction/correspondence-analysis/model";
import { CorrespondenceStatistics } from "@/components/Modals/Analyze/dimension-reduction/correspondence-analysis/statistics";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModal";
import { useVariableStore } from "@/stores/useVariableStore";
import { RawData, VariableDef } from "@/lib/db";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";

export const CorrespondenceContainer = ({
    onClose,
}: CorrespondenceContainerProps) => {
    const variables = useVariableStore(
        (state) => state.variables
    ) as VariableDef[];
    const dataVariables = useDataStore((state) => state.data) as RawData;
    const tempVariables = variables.map((variables) => variables.name);

    const [formData, setFormData] = useState<CorrespondenceType>({
        ...CorrespondenceDefault,
    });
    const [isMainOpen, setIsMainOpen] = useState(false);
    const [isDefineRangeRowOpen, setIsDefineRangeRowOpen] = useState(false);
    const [isDefineRangeColumnOpen, setIsDefineRangeColumnOpen] =
        useState(false);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
    const [isPlotsOpen, setIsPlotsOpen] = useState(false);

    const { closeModal } = useModal();
    const { addLog, addAnalytic, addStatistic } = useResultStore();

    const updateFormData = <T extends keyof typeof formData>(
        section: T,
        field: keyof (typeof formData)[T],
        value: unknown
    ) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const resetFormData = () => {
        setFormData({ ...CorrespondenceDefault });
    };

    const handleClose = () => {
        closeModal();
        onClose();
    };

    return (
        <Dialog open={isMainOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent>
                <CorrespondenceDialog
                    isMainOpen={isMainOpen}
                    setIsMainOpen={setIsMainOpen}
                    setIsDefineRangeRowOpen={setIsDefineRangeRowOpen}
                    setIsDefineRangeColumnOpen={setIsDefineRangeColumnOpen}
                    setIsModelOpen={setIsModelOpen}
                    setIsStatisticsOpen={setIsStatisticsOpen}
                    setIsPlotsOpen={setIsPlotsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("main", field, value)
                    }
                    data={formData.main}
                    globalVariables={tempVariables}
                    onContinue={(mainData) => executeDiscriminant(mainData)}
                    onReset={resetFormData}
                />

                {/* Define Range Row */}
                <CorrespondenceDefineRangeRow
                    isDefineRangeRowOpen={isDefineRangeRowOpen}
                    setIsDefineRangeRowOpen={setIsDefineRangeRowOpen}
                    updateFormData={(field, value) =>
                        updateFormData("defineRangeRow", field, value)
                    }
                    data={formData.defineRangeRow}
                />

                {/* Define Range Column */}
                <CorrespondenceDefineRangeColumn
                    isDefineRangeColumnOpen={isDefineRangeColumnOpen}
                    setIsDefineRangeColumnOpen={setIsDefineRangeColumnOpen}
                    updateFormData={(field, value) =>
                        updateFormData("defineRangeColumn", field, value)
                    }
                    data={formData.defineRangeColumn}
                />

                {/* Model */}
                <CorrespondenceModel
                    isModelOpen={isModelOpen}
                    setIsModelOpen={setIsModelOpen}
                    updateFormData={(field, value) =>
                        updateFormData("model", field, value)
                    }
                    data={formData.model}
                />

                {/* Statistics */}
                <CorrespondenceStatistics
                    isStatisticsOpen={isStatisticsOpen}
                    setIsStatisticsOpen={setIsStatisticsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("statistics", field, value)
                    }
                    data={formData.statistics}
                />

                {/* Plots */}
                <CorrespondencePlots
                    isPlotsOpen={isPlotsOpen}
                    setIsPlotsOpen={setIsPlotsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("plots", field, value)
                    }
                    data={formData.plots}
                />
            </DialogContent>
        </Dialog>
    );
};
