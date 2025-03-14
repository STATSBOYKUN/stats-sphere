import { useState } from "react";
import { RocAnalysisDialog } from "@/components/Modals/Analyze/classify/roc-analysis/dialog";
import {
    RocAnalysisContainerProps,
    RocAnalysisMainType,
    RocAnalysisType,
} from "@/models/classify/roc-analysis/roc-analysis";
import { RocAnalysisDefault } from "@/constants/classify/roc-analysis/roc-analysis-default";
import { RocAnalysisOptions } from "@/components/Modals/Analyze/classify/roc-analysis/options";
import { RocAnalysisDisplay } from "@/components/Modals/Analyze/classify/roc-analysis/display";
import { RocAnalysisDefineGroups } from "@/components/Modals/Analyze/classify/roc-analysis/define-groups";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModal";
import { useVariableStore } from "@/stores/useVariableStore";
import { RawData, VariableDef } from "@/lib/db";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { analyzeRocAnalysis } from "@/services/analyze/classify/roc-analysis/roc-analysis-analysis";

export const RocAnalysisContainer = ({
    onClose,
}: RocAnalysisContainerProps) => {
    const variables = useVariableStore(
        (state) => state.variables
    ) as VariableDef[];
    const dataVariables = useDataStore((state) => state.data) as RawData;
    const tempVariables = variables.map((variables) => variables.name);

    const [formData, setFormData] = useState<RocAnalysisType>({
        ...RocAnalysisDefault,
    });
    const [isMainOpen, setIsMainOpen] = useState(true);
    const [isDefineGroupsOpen, setIsDefineGroupsOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [isDisplayOpen, setIsDisplayOpen] = useState(false);

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

    const executeRocAnalysis = async (mainData: RocAnalysisMainType) => {
        try {
            const newFormData = {
                ...formData,
                main: mainData,
            };

            await analyzeRocAnalysis({
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
        setFormData({ ...RocAnalysisDefault });
    };

    const handleClose = () => {
        closeModal();
        onClose();
    };

    return (
        <Dialog open={isMainOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent>
                <RocAnalysisDialog
                    isMainOpen={isMainOpen}
                    setIsMainOpen={setIsMainOpen}
                    setIsDefineGroupsOpen={setIsDefineGroupsOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    setIsDisplayOpen={setIsDisplayOpen}
                    updateFormData={(field, value) =>
                        updateFormData("main", field, value)
                    }
                    data={formData.main}
                    globalVariables={tempVariables}
                    onContinue={(mainData) => executeRocAnalysis(mainData)}
                    onReset={resetFormData}
                />

                {/* Define Groups */}
                <RocAnalysisDefineGroups
                    isDefineGroupsOpen={isDefineGroupsOpen}
                    setIsDefineGroupsOpen={setIsDefineGroupsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("defineGroups", field, value)
                    }
                    data={formData.defineGroups}
                />

                {/* Options */}
                <RocAnalysisOptions
                    isOptionsOpen={isOptionsOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("options", field, value)
                    }
                    data={formData.options}
                />

                {/* Display */}
                <RocAnalysisDisplay
                    isDisplayOpen={isDisplayOpen}
                    setIsDisplayOpen={setIsDisplayOpen}
                    updateFormData={(field, value) =>
                        updateFormData("display", field, value)
                    }
                    data={formData.display}
                />
            </DialogContent>
        </Dialog>
    );
};
