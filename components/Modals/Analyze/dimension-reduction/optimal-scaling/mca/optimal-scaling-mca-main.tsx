import { useEffect, useState } from "react";
import {
    OptScaMCAContainerProps,
    OptScaMCAMainType,
    OptScaMCAType,
} from "@/models/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca";
import { OptScaMCADefault } from "@/constants/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca-default";
import { OptScaMCADialog } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/mca/dialog";
import { OptScaMCADefineVariable } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/mca/define-variable";
import { OptScaMCAVariablePlots } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/mca/variable-plots";
import { OptScaMCADiscretize } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/mca/discretize";
import { OptScaMCAMissing } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/mca/missing";
import { OptScaMCAOptions } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/mca/options";
import { OptScaMCAOutput } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/mca/output";
import { OptScaMCASave } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/mca/save";
import { OptScaMCAObjectPlots } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/mca/object-plots";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModal";
import { useVariableStore } from "@/stores/useVariableStore";
import { RawData, VariableDef } from "@/lib/db";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { analyzeOptScaMCA } from "@/services/analyze/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca-analysis";

export const OptScaMCAContainer = ({ onClose }: OptScaMCAContainerProps) => {
    const variables = useVariableStore(
        (state) => state.variables
    ) as VariableDef[];
    const dataVariables = useDataStore((state) => state.data) as RawData;
    const tempVariables = variables.map((variables) => variables.name);

    const [formData, setFormData] = useState<OptScaMCAType>({
        ...OptScaMCADefault,
    });
    const [isMainOpen, setIsMainOpen] = useState(true);
    const [isDefineVariableOpen, setIsDefineVariableOpen] = useState(false);
    const [isDiscretizeOpen, setIsDiscretizeOpen] = useState(false);
    const [isMissingOpen, setIsMissingOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [isOutputOpen, setIsOutputOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [isObjectPlotsOpen, setIsObjectPlotsOpen] = useState(false);
    const [isVariablePlotsOpen, setIsVariablePlotsOpen] = useState(false);

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

    const executeOptScaMCA = async (mainData: OptScaMCAMainType) => {
        try {
            const newFormData = {
                ...formData,
                main: mainData,
            };

            await analyzeOptScaMCA({
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
        setFormData({ ...OptScaMCADefault });
    };

    const handleClose = () => {
        closeModal();
        onClose();
    };

    return (
        <Dialog open={isMainOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent>
                <OptScaMCADialog
                    isMainOpen={isMainOpen}
                    setIsMainOpen={setIsMainOpen}
                    setIsDefineVariableOpen={setIsDefineVariableOpen}
                    setIsDiscretizeOpen={setIsDiscretizeOpen}
                    setIsMissingOpen={setIsMissingOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    setIsOutputOpen={setIsOutputOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    setIsObjectPlotsOpen={setIsObjectPlotsOpen}
                    setIsVariablePlotsOpen={setIsVariablePlotsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("main", field, value)
                    }
                    data={formData.main}
                    globalVariables={tempVariables}
                    onContinue={(mainData) => executeOptScaMCA(mainData)}
                    onReset={resetFormData}
                />

                {/* Define Variable */}
                <OptScaMCADefineVariable
                    isDefineVariableOpen={isDefineVariableOpen}
                    setIsDefineVariableOpen={setIsDefineVariableOpen}
                    updateFormData={(field, value) =>
                        updateFormData("defineVariable", field, value)
                    }
                    data={formData.defineVariable}
                />

                {/* Discretize */}
                <OptScaMCADiscretize
                    isDiscretizeOpen={isDiscretizeOpen}
                    setIsDiscretizeOpen={setIsDiscretizeOpen}
                    updateFormData={(field, value) =>
                        updateFormData("discretize", field, value)
                    }
                    data={formData.discretize}
                />

                {/* Missing */}
                <OptScaMCAMissing
                    isMissingOpen={isMissingOpen}
                    setIsMissingOpen={setIsMissingOpen}
                    updateFormData={(field, value) =>
                        updateFormData("missing", field, value)
                    }
                    data={formData.missing}
                />

                {/* Options */}
                <OptScaMCAOptions
                    isOptionsOpen={isOptionsOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("options", field, value)
                    }
                    data={formData.options}
                />

                {/* Output */}
                <OptScaMCAOutput
                    isOutputOpen={isOutputOpen}
                    setIsOutputOpen={setIsOutputOpen}
                    updateFormData={(field, value) =>
                        updateFormData("output", field, value)
                    }
                    data={formData.output}
                />

                {/* Save */}
                <OptScaMCASave
                    isSaveOpen={isSaveOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    updateFormData={(field, value) =>
                        updateFormData("save", field, value)
                    }
                    data={formData.save}
                />

                {/* Object Plots */}
                <OptScaMCAObjectPlots
                    isObjectPlotsOpen={isObjectPlotsOpen}
                    setIsObjectPlotsOpen={setIsObjectPlotsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("objectPlots", field, value)
                    }
                    data={formData.objectPlots}
                />

                {/* Variable Plots */}
                <OptScaMCAVariablePlots
                    isVariablePlotsOpen={isVariablePlotsOpen}
                    setIsVariablePlotsOpen={setIsVariablePlotsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("variablePlots", field, value)
                    }
                    data={formData.variablePlots}
                />
            </DialogContent>
        </Dialog>
    );
};
