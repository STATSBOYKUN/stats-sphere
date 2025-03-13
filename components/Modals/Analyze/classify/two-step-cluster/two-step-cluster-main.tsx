import { useState } from "react";
import {
    TwoStepClusterContainerProps,
    TwoStepClusterMainType,
    TwoStepClusterType,
} from "@/models/classify/two-step-cluster/two-step-cluster";
import { TwoStepClusterDefault } from "@/constants/classify/two-step-cluster/two-step-cluster-default";
import { TwoStepClusterDialog } from "@/components/Modals/Analyze/classify/two-step-cluster/dialog";
import { TwoStepClusterOptions } from "@/components/Modals/Analyze/classify/two-step-cluster/options";
import { TwoStepClusterOutput } from "@/components/Modals/Analyze/classify/two-step-cluster/output";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModal";
import { useVariableStore } from "@/stores/useVariableStore";
import { RawData, VariableDef } from "@/lib/db";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { analyzeTwoStepCluster } from "@/services/analyze/classify/two-step-cluster/two-step-cluster-analysis";

export const TwoStepClusterContainer = ({
    onClose,
}: TwoStepClusterContainerProps) => {
    const variables = useVariableStore(
        (state) => state.variables
    ) as VariableDef[];
    const dataVariables = useDataStore((state) => state.data) as RawData;
    const tempVariables = variables.map((variables) => variables.name);

    const [formData, setFormData] = useState<TwoStepClusterType>({
        ...TwoStepClusterDefault,
    });
    const [isMainOpen, setIsMainOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [isOutputOpen, setIsOutputOpen] = useState(false);

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

    const executeTwoStepCluster = async (mainData: TwoStepClusterMainType) => {
        try {
            const newFormData = {
                ...formData,
                main: mainData,
            };

            await analyzeTwoStepCluster({
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
        setFormData({ ...TwoStepClusterDefault });
    };

    const handleClose = () => {
        closeModal();
        onClose();
    };

    return (
        <Dialog open={isMainOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent>
                <TwoStepClusterDialog
                    isMainOpen={isMainOpen}
                    setIsMainOpen={setIsMainOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    setIsOutputOpen={setIsOutputOpen}
                    updateFormData={(field, value) =>
                        updateFormData("main", field, value)
                    }
                    data={formData.main}
                    globalVariables={tempVariables}
                    onContinue={(mainData) => executeTwoStepCluster(mainData)}
                    onReset={resetFormData}
                />

                {/* Options */}
                <TwoStepClusterOptions
                    isOptionsOpen={isOptionsOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("options", field, value)
                    }
                    data={formData.options}
                />

                {/* Output */}
                <TwoStepClusterOutput
                    isOutputOpen={isOutputOpen}
                    setIsOutputOpen={setIsOutputOpen}
                    updateFormData={(field, value) =>
                        updateFormData("output", field, value)
                    }
                    data={formData.output}
                />
            </DialogContent>
        </Dialog>
    );
};
