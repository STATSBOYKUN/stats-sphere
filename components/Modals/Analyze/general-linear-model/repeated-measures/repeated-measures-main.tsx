import { useState, useEffect } from "react";
import {
    RepeatedMeasuresContainerProps,
    RepeatedMeasuresMainType,
    RepeatedMeasuresType,
} from "@/models/general-linear-model/repeated-measures/repeated-measures";
import { RepeatedMeasuresDefault } from "@/constants/general-linear-model/repeated-measures/repeated-measures-default";
import { RepeatedMeasuresDialog } from "@/components/Modals/Analyze/general-linear-model/repeated-measures/dialog";
import { RepeatedMeasuresModel } from "@/components/Modals/Analyze/general-linear-model/repeated-measures/model";
import { RepeatedMeasuresContrast } from "@/components/Modals/Analyze/general-linear-model/repeated-measures/contrast";
import { RepeatedMeasuresPlots } from "@/components/Modals/Analyze/general-linear-model/repeated-measures/plots";
import { RepeatedMeasuresPostHoc } from "@/components/Modals/Analyze/general-linear-model/repeated-measures/posthoc";
import { RepeatedMeasuresEMMeans } from "@/components/Modals/Analyze/general-linear-model/repeated-measures/emmeans";
import { RepeatedMeasuresSave } from "@/components/Modals/Analyze/general-linear-model/repeated-measures/save";
import { RepeatedMeasuresOptions } from "@/components/Modals/Analyze/general-linear-model/repeated-measures/options";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModal";
import { useVariableStore } from "@/stores/useVariableStore";
import { RawData, VariableDef } from "@/lib/db";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { analyzeRepeatedMeasures } from "@/services/analyze/general-linear-model/repeated-measures/repeated-measures-analysis";

export const RepeatedMeasuresContainer = ({
    onClose,
    combinationVars,
    factorVars,
}: RepeatedMeasuresContainerProps) => {
    const variables = useVariableStore(
        (state) => state.variables
    ) as VariableDef[];
    const dataVariables = useDataStore((state) => state.data) as RawData;
    const tempVariables = variables.map((variables) => variables.name);

    const [formData, setFormData] = useState<RepeatedMeasuresType>({
        ...RepeatedMeasuresDefault,
    });
    const [isMainOpen, setIsMainOpen] = useState(true);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isContrastOpen, setIsContrastOpen] = useState(false);
    const [isPlotsOpen, setIsPlotsOpen] = useState(false);
    const [isPostHocOpen, setIsPostHocOpen] = useState(false);
    const [isEMMeansOpen, setIsEMMeansOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

    const { closeModal } = useModal();
    const { addLog, addAnalytic, addStatistic } = useResultStore();

    useEffect(() => {
        setFormData((prev) => {
            // Create a copy of the previous state to modify
            const newState = { ...prev };

            // Update discretize based on AnalysisVars (if it exists)
            if (prev.main.SubVar) {
                // newState.discretize = {
                //     ...prev.discretize,
                //     VariablesList: [...prev.main.AnalysisVars],
                // };
            }

            // Update missing.SupplementaryVariables based on SuppleVars (if it exists)
            if (prev.main.FactorsVar) {
                newState.contrast = {
                    ...prev.contrast,
                    FactorList: [...prev.main.FactorsVar],
                };
                newState.plots = {
                    ...prev.plots,
                    SrcList: [...prev.main.FactorsVar],
                };
                newState.posthoc = {
                    ...prev.posthoc,
                    SrcList: [...prev.main.FactorsVar],
                };
            }

            // Update based on LabelingVars (if it exists)
            if (prev.main.Covariates) {
                // newState.output = {
                //     ...newState.output, // Use the already updated output state
                //     LabelingVars: [...prev.main.LabelingVars],
                // };
            }

            // Combine AnalysisVars and SuppleVars for QuantifiedVars
            const subVars = prev.main.SubVar ? [...prev.main.SubVar] : [];
            const factorVars = prev.main.FactorsVar
                ? [...prev.main.FactorsVar]
                : [];
            const covariatesVars = prev.main.Covariates
                ? [...prev.main.Covariates]
                : [];
            const plotsVars = prev.plots.FixFactorVars
                ? [...prev.plots.FixFactorVars]
                : [];

            newState.model = {
                ...prev.model,
                BetSubVar: [...factorVars, ...covariatesVars],
            };

            newState.emmeans = {
                ...prev.emmeans,
                SrcList: [...factorVars],
            };

            const usedVariables = [
                ...subVars,
                ...factorVars,
                ...covariatesVars,
            ];
            return newState;
        });
    }, [
        formData.main.SubVar,
        formData.main.FactorsVar,
        formData.main.Covariates,
        formData.plots.FixFactorVars,
    ]);

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

    const executeRepeatedMeasures = async (
        mainData: RepeatedMeasuresMainType
    ) => {
        try {
            const newFormData = {
                ...formData,
                main: mainData,
            };

            await analyzeRepeatedMeasures({
                configData: newFormData,
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
        setFormData({ ...RepeatedMeasuresDefault });
    };

    const handleClose = () => {
        closeModal();
        onClose();
    };

    return (
        <Dialog open={isMainOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent>
                <RepeatedMeasuresDialog
                    isMainOpen={isMainOpen}
                    setIsMainOpen={setIsMainOpen}
                    setIsModelOpen={setIsModelOpen}
                    setIsContrastOpen={setIsContrastOpen}
                    setIsPlotsOpen={setIsPlotsOpen}
                    setIsPostHocOpen={setIsPostHocOpen}
                    setIsEMMeansOpen={setIsEMMeansOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("main", field, value)
                    }
                    data={formData.main}
                    globalVariables={tempVariables}
                    combinationVars={combinationVars}
                    onContinue={(mainData) => executeRepeatedMeasures(mainData)}
                    onReset={resetFormData}
                />

                {/* Model */}
                <RepeatedMeasuresModel
                    isModelOpen={isModelOpen}
                    setIsModelOpen={setIsModelOpen}
                    updateFormData={(field, value) =>
                        updateFormData("model", field, value)
                    }
                    data={formData.model}
                />

                {/* Contrast */}
                <RepeatedMeasuresContrast
                    isContrastOpen={isContrastOpen}
                    setIsContrastOpen={setIsContrastOpen}
                    updateFormData={(field, value) =>
                        updateFormData("contrast", field, value)
                    }
                    data={formData.contrast}
                />

                {/* Plots */}
                <RepeatedMeasuresPlots
                    isPlotsOpen={isPlotsOpen}
                    setIsPlotsOpen={setIsPlotsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("plots", field, value)
                    }
                    data={formData.plots}
                />

                {/* PostHoc */}
                <RepeatedMeasuresPostHoc
                    isPostHocOpen={isPostHocOpen}
                    setIsPostHocOpen={setIsPostHocOpen}
                    updateFormData={(field, value) =>
                        updateFormData("posthoc", field, value)
                    }
                    data={formData.posthoc}
                />

                {/* EMMeans */}
                <RepeatedMeasuresEMMeans
                    isEMMeansOpen={isEMMeansOpen}
                    setIsEMMeansOpen={setIsEMMeansOpen}
                    updateFormData={(field, value) =>
                        updateFormData("emmeans", field, value)
                    }
                    data={formData.emmeans}
                />

                {/* Save */}
                <RepeatedMeasuresSave
                    isSaveOpen={isSaveOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    updateFormData={(field, value) =>
                        updateFormData("save", field, value)
                    }
                    data={formData.save}
                />

                {/* Options */}
                <RepeatedMeasuresOptions
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
