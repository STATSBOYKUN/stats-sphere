import React, { useState } from "react";
import { HierClusDialog } from "@/components/Modals/Analyze/classify/hierarchical-cluster/dialog";
import {
    HierClusContainerProps,
    HierClusMainType,
    HierClusType,
} from "@/models/classify/hierarchical-cluster/hierarchical-cluster";
import { HierClusDefault } from "@/constants/classify/hierarchical-cluster/hierarchical-cluster-default";
import { HierClusStatistics } from "@/components/Modals/Analyze/classify/hierarchical-cluster/statistics";
import { HierClusPlots } from "@/components/Modals/Analyze/classify/hierarchical-cluster/plots";
import { HierClusSave } from "@/components/Modals/Analyze/classify/hierarchical-cluster/save";
import { HierClusMethod } from "@/components/Modals/Analyze/classify/hierarchical-cluster/method";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModal";
import { useVariableStore } from "@/stores/useVariableStore";
import { RawData, VariableDef } from "@/lib/db";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { analyzeHierClus } from "@/services/analyze/classify/hierarchical-cluster/hierarchical-cluster-analysis";

export const HierClusContainer = ({ onClose }: HierClusContainerProps) => {
    const variables = useVariableStore(
        (state) => state.variables
    ) as VariableDef[];
    const dataVariables = useDataStore((state) => state.data) as RawData;
    const tempVariables = variables.map((variables) => variables.name);

    const [formData, setFormData] = useState<HierClusType>({
        ...HierClusDefault,
    });
    const [isMainOpen, setIsMainOpen] = useState(true);
    const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
    const [isPlotsOpen, setIsPlotsOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [isMethodOpen, setIsMethodOpen] = useState(false);

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

    const executeHierClus = async (mainData: HierClusMainType) => {
        try {
            const newFormData = {
                ...formData,
                main: mainData,
            };

            await analyzeHierClus({
                tempData: newFormData,
                dataVariables: dataVariables,
                variables: variables,
                addLog,
                addAnalytic,
                addStatistic,
            });
        } catch (error) {
            console.error(error);
        }

        closeModal();
        onClose();
    };

    const resetFormData = () => {
        setFormData({ ...HierClusDefault });
    };

    const handleClose = () => {
        closeModal();
        onClose();
    };

    return (
        <Dialog open={isMainOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent>
                <HierClusDialog
                    isMainOpen={isMainOpen}
                    setIsMainOpen={setIsMainOpen}
                    setIsStatisticsOpen={setIsStatisticsOpen}
                    setIsPlotsOpen={setIsPlotsOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    setIsMethodOpen={setIsMethodOpen}
                    updateFormData={(field, value) =>
                        updateFormData("main", field, value)
                    }
                    data={formData.main}
                    globalVariables={tempVariables}
                    onContinue={(mainData) => executeHierClus(mainData)}
                    onReset={resetFormData}
                />

                {/* Statistics */}
                <HierClusStatistics
                    isStatisticsOpen={isStatisticsOpen}
                    setIsStatisticsOpen={setIsStatisticsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("statistics", field, value)
                    }
                    data={formData.statistics}
                />

                {/* Plots */}
                <HierClusPlots
                    isPlotsOpen={isPlotsOpen}
                    setIsPlotsOpen={setIsPlotsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("plots", field, value)
                    }
                    data={formData.plots}
                />

                {/* Save */}
                <HierClusSave
                    isSaveOpen={isSaveOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    updateFormData={(field, value) =>
                        updateFormData("save", field, value)
                    }
                    data={formData.save}
                />

                {/* Method */}
                <HierClusMethod
                    isMethodOpen={isMethodOpen}
                    setIsMethodOpen={setIsMethodOpen}
                    updateFormData={(field, value) =>
                        updateFormData("method", field, value)
                    }
                    data={formData.method}
                />
            </DialogContent>
        </Dialog>
    );
};
