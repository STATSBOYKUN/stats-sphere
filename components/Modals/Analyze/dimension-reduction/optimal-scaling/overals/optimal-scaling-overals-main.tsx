import { OptScaOveralsDefineRange } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/overals/define-range";
import { OptScaOveralsDefineRangeScale } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/overals/define-range-scale";
import { OptScaOveralsDialog } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/overals/dialog";
import { OptScaOveralsOptions } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/overals/options";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { OptScaOveralsDefault } from "@/constants/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals-default";
import { useModal } from "@/hooks/useModal";
import { RawData, VariableDef } from "@/lib/db";
import {
    OptScaOveralsContainerProps,
    OptScaOveralsMainType,
    OptScaOveralsType,
} from "@/models/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals";
import { analyzeOptScaOverals } from "@/services/analyze/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals-analysis";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { useVariableStore } from "@/stores/useVariableStore";
import { useEffect, useState } from "react";

export const OptScaOveralsContainer = ({
    onClose,
}: OptScaOveralsContainerProps) => {
    const variables = useVariableStore(
        (state) => state.variables
    ) as VariableDef[];
    const dataVariables = useDataStore((state) => state.data) as RawData;
    const tempVariables = variables.map((variables) => variables.name);

    const [formData, setFormData] = useState<OptScaOveralsType>({
        ...OptScaOveralsDefault,
    });
    const [isMainOpen, setIsMainOpen] = useState(true);
    const [isDefineRangeScaleOpen, setIsDefineRangeScaleOpen] = useState(false);
    const [isDefineRangeOpen, setIsDefineRangeOpen] = useState(false);
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

    const executeOptScaOverals = async (mainData: OptScaOveralsMainType) => {
        try {
            const newFormData = {
                ...formData,
                main: mainData,
            };

            await analyzeOptScaOverals({
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
    };

    const resetFormData = () => {
        setFormData({ ...OptScaOveralsDefault });
    };

    const handleClose = () => {
        closeModal();
        onClose();
    };

    return (
        <Dialog open={isMainOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent>
                <OptScaOveralsDialog
                    isMainOpen={isMainOpen}
                    setIsMainOpen={setIsMainOpen}
                    setIsDefineRangeScaleOpen={setIsDefineRangeScaleOpen}
                    setIsDefineRangeOpen={setIsDefineRangeOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("main", field, value)
                    }
                    data={formData.main}
                    globalVariables={tempVariables}
                    onContinue={(mainData) => executeOptScaOverals(mainData)}
                    onReset={resetFormData}
                />

                {/* Define Range Scale */}
                <OptScaOveralsDefineRangeScale
                    isDefineRangeScaleOpen={isDefineRangeScaleOpen}
                    setIsDefineRangeScaleOpen={setIsDefineRangeScaleOpen}
                    updateFormData={(field, value) =>
                        updateFormData("defineRangeScale", field, value)
                    }
                    data={formData.defineRangeScale}
                />

                {/* Define Range */}
                <OptScaOveralsDefineRange
                    isDefineRangeOpen={isDefineRangeOpen}
                    setIsDefineRangeOpen={setIsDefineRangeOpen}
                    updateFormData={(field, value) =>
                        updateFormData("defineRange", field, value)
                    }
                    data={formData.defineRange}
                />

                {/* Options */}
                <OptScaOveralsOptions
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
