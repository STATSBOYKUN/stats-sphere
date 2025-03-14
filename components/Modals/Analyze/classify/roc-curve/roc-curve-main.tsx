import { useState } from "react";
import {
    RocCurveContainerProps,
    RocCurveMainType,
    RocCurveType,
} from "@/models/classify/roc-curve/roc-curve";
import { RocCurveDefault } from "@/constants/classify/roc-curve/roc-curve-default";
import { RocCurveDialog } from "@/components/Modals/Analyze/classify/roc-curve/dialog";
import { RocCurveOptions } from "@/components/Modals/Analyze/classify/roc-curve/options";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModal";
import { useVariableStore } from "@/stores/useVariableStore";
import { RawData, VariableDef } from "@/lib/db";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { analyzeRocCurve } from "@/services/analyze/classify/roc-curve/roc-curve-analysis";

export const RocCurveContainer = ({ onClose }: RocCurveContainerProps) => {
    const variables = useVariableStore(
        (state) => state.variables
    ) as VariableDef[];
    const dataVariables = useDataStore((state) => state.data) as RawData;
    const tempVariables = variables.map((variables) => variables.name);

    const [formData, setFormData] = useState<RocCurveType>({
        ...RocCurveDefault,
    });
    const [isMainOpen, setIsMainOpen] = useState(true);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

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

    const executeRocCurve = async (mainData: RocCurveMainType) => {
        try {
            const newFormData = {
                ...formData,
                main: mainData,
            };

            await analyzeRocCurve({
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
        setFormData({ ...RocCurveDefault });
    };

    const handleClose = () => {
        closeModal();
        onClose();
    };

    return (
        <Dialog open={isMainOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent>
                <RocCurveDialog
                    isMainOpen={isMainOpen}
                    setIsMainOpen={setIsMainOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("main", field, value)
                    }
                    data={formData.main}
                    globalVariables={tempVariables}
                    onContinue={(mainData) => executeRocCurve(mainData)}
                    onReset={resetFormData}
                />

                {/* Define Range */}
                <RocCurveOptions
                    isOptionsOpen={isOptionsOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("options", field, value)
                    }
                    data={formData.options}
                />
            </DialogContent>
        </Dialog>
    );
};
