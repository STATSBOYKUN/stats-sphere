import { useEffect, useState } from "react";
import {
    OptScaOveralsMainType,
    OptScaOveralsType,
} from "@/models/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals";
import { OptScaOveralsDefault } from "@/constants/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals-default";
import { OptScaOveralsDialog } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/overals/dialog";
import { OptScaOveralsDefineRange } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/overals/define-range";
import { OptScaOveralsDefineRangeScale } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/overals/define-range-scale";
import { OptScaOveralsOptions } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/overals/options";
import { OptScaOveralsContainerProps } from "@/models/dimension-reduction/optimal-scaling-define";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModal";
import { useVariableStore } from "@/stores/useVariableStore";
import { RawData, VariableDef } from "@/lib/db";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { analyzeOptScaOverals } from "@/services/analyze/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals-analysis";

export const OptScaOveralsContainer = ({
    isOptScaOverals,
    setIsOptScaOverals,
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

    useEffect(() => {
        if (isOptScaOverals) {
            setIsMainOpen(true);
            setIsOptScaOverals(false);
        }
    }, [isOptScaOverals, setIsOptScaOverals]);

    return (
        <>
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
        </>
    );
};
