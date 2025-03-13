import { useState } from "react";
import {
    VarianceCompsContainerProps,
    VarianceCompsMainType,
    VarianceCompsType,
} from "@/models/general-linear-model/variance-components/variance-components";
import { VarianceCompsDefault } from "@/constants/general-linear-model/variance-components/variance-components-default";
import { VarianceCompsDialog } from "@/components/Modals/Analyze/general-linear-model/variance-components/dialog";
import { VarianceCompsModel } from "@/components/Modals/Analyze/general-linear-model/variance-components/model";
import { VarianceCompsOptions } from "@/components/Modals/Analyze/general-linear-model/variance-components/options";
import { VarianceCompsSave } from "@/components/Modals/Analyze/general-linear-model/variance-components/save";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModal";
import { useVariableStore } from "@/stores/useVariableStore";
import { RawData, VariableDef } from "@/lib/db";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { analyzeVarianceComps } from "@/services/analyze/general-linear-model/variance-components/variance-components-analysis";

export const VarianceCompsContainer = ({
    onClose,
}: VarianceCompsContainerProps) => {
    const variables = useVariableStore(
        (state) => state.variables
    ) as VariableDef[];
    const dataVariables = useDataStore((state) => state.data) as RawData;
    const tempVariables = variables.map((variables) => variables.name);

    const [formData, setFormData] = useState<VarianceCompsType>({
        ...VarianceCompsDefault,
    });
    const [isMainOpen, setIsMainOpen] = useState(false);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);

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

    const executeVarianceComps = async (mainData: VarianceCompsMainType) => {
        try {
            const newFormData = {
                ...formData,
                main: mainData,
            };

            await analyzeVarianceComps({
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
        setFormData({ ...VarianceCompsDefault });
    };

    const handleClose = () => {
        closeModal();
        onClose();
    };

    return (
        <Dialog open={isMainOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent>
                <VarianceCompsDialog
                    isMainOpen={isMainOpen}
                    setIsMainOpen={setIsMainOpen}
                    setIsModelOpen={setIsModelOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    updateFormData={(field, value) =>
                        updateFormData("main", field, value)
                    }
                    data={formData.main}
                    globalVariables={tempVariables}
                    onContinue={(mainData) => executeVarianceComps(mainData)}
                    onReset={resetFormData}
                />

                {/* Model */}
                <VarianceCompsModel
                    isModelOpen={isModelOpen}
                    setIsModelOpen={setIsModelOpen}
                    updateFormData={(field, value) =>
                        updateFormData("model", field, value)
                    }
                    data={formData.model}
                />

                {/* Options */}
                <VarianceCompsOptions
                    isOptionsOpen={isOptionsOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("options", field, value)
                    }
                    data={formData.options}
                />

                {/* Save */}
                <VarianceCompsSave
                    isSaveOpen={isSaveOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    updateFormData={(field, value) =>
                        updateFormData("save", field, value)
                    }
                    data={formData.save}
                />
            </DialogContent>
        </Dialog>
    );
};
