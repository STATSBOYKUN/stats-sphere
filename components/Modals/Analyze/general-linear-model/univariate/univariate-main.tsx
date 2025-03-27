import { useState, useEffect } from "react";
import {
    UnivariateContainerProps,
    UnivariateMainType,
    UnivariateType,
} from "@/models/general-linear-model/univariate/univariate";
import { UnivariateDefault } from "@/constants/general-linear-model/univariate/univariate-default";
import { UnivariateDialog } from "@/components/Modals/Analyze/general-linear-model/univariate/dialog";
import { UnivariateModel } from "@/components/Modals/Analyze/general-linear-model/univariate/model";
import { UnivariateContrast } from "@/components/Modals/Analyze/general-linear-model/univariate/contrast";
import { UnivariatePlots } from "@/components/Modals/Analyze/general-linear-model/univariate/plots";
import { UnivariatePostHoc } from "@/components/Modals/Analyze/general-linear-model/univariate/posthoc";
import { UnivariateEMMeans } from "@/components/Modals/Analyze/general-linear-model/univariate/emmeans";
import { UnivariateSave } from "@/components/Modals/Analyze/general-linear-model/univariate/save";
import { UnivariateOptions } from "@/components/Modals/Analyze/general-linear-model/univariate/options";
import { UnivariateBootstrap } from "@/components/Modals/Analyze/general-linear-model/univariate/bootstrap";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModal";
import { useVariableStore } from "@/stores/useVariableStore";
import { RawData, VariableDef } from "@/lib/db";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { analyzeUnivariate } from "@/services/analyze/general-linear-model/univariate/univariate-analysis";

export const UnivariateContainer = ({ onClose }: UnivariateContainerProps) => {
    const variables = useVariableStore(
        (state) => state.variables
    ) as VariableDef[];
    const dataVariables = useDataStore((state) => state.data) as RawData;
    const tempVariables = variables.map((variables) => variables.name);

    const [formData, setFormData] = useState<UnivariateType>({
        ...UnivariateDefault,
    });
    const [isMainOpen, setIsMainOpen] = useState(true);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isContrastOpen, setIsContrastOpen] = useState(false);
    const [isPlotsOpen, setIsPlotsOpen] = useState(false);
    const [isPostHocOpen, setIsPostHocOpen] = useState(false);
    const [isEMMeansOpen, setIsEMMeansOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);

    const { closeModal } = useModal();
    const { addLog, addAnalytic, addStatistic } = useResultStore();

    useEffect(() => {
        setFormData((prev) => {
            const newState = { ...prev };

            if (prev.main.FixFactor) {
                newState.posthoc = {
                    ...prev.posthoc,
                    SrcList: [...prev.main.FixFactor],
                };
            }

            const depVars = prev.main.DepVar ? [prev.main.DepVar] : [];
            const factorVars = prev.main.FixFactor
                ? [...prev.main.FixFactor]
                : [];
            const randVars = prev.main.RandFactor
                ? [...prev.main.RandFactor]
                : [];
            const covarVars = prev.main.Covar ? [...prev.main.Covar] : [];
            const wlsVars = prev.main.WlsWeight ? [prev.main.WlsWeight] : [];

            newState.model = {
                ...prev.model,
                FactorsVar: [...factorVars, ...randVars, ...covarVars],
            };

            newState.contrast = {
                ...prev.contrast,
                FactorList: [...factorVars, ...randVars],
            };

            newState.plots = {
                ...prev.plots,
                SrcList: [...factorVars, ...randVars],
            };

            newState.emmeans = {
                ...prev.emmeans,
                SrcList: [...factorVars, ...randVars],
            };

            const usedVariables = [
                ...depVars,
                ...factorVars,
                ...randVars,
                ...covarVars,
                ...wlsVars,
            ];

            const updatedVariables = tempVariables.filter(
                (variable) => !usedVariables.includes(variable)
            );

            newState.bootstrap = {
                ...prev.bootstrap,
                Variables: updatedVariables,
            };

            return newState;
        });
    }, [
        formData.main.DepVar,
        formData.main.FixFactor,
        formData.main.RandFactor,
        formData.main.Covar,
        formData.main.WlsWeight,
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

    const executeUnivariate = async (mainData: UnivariateMainType) => {
        try {
            const newFormData = {
                ...formData,
                main: mainData,
            };

            await analyzeUnivariate({
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
        setFormData({ ...UnivariateDefault });
    };

    const handleClose = () => {
        closeModal();
        onClose();
    };

    return (
        <Dialog open={isMainOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent>
                <UnivariateDialog
                    isMainOpen={isMainOpen}
                    setIsMainOpen={setIsMainOpen}
                    setIsModelOpen={setIsModelOpen}
                    setIsContrastOpen={setIsContrastOpen}
                    setIsPlotsOpen={setIsPlotsOpen}
                    setIsPostHocOpen={setIsPostHocOpen}
                    setIsEMMeansOpen={setIsEMMeansOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    setIsBootstrapOpen={setIsBootstrapOpen}
                    updateFormData={(field, value) =>
                        updateFormData("main", field, value)
                    }
                    data={formData.main}
                    globalVariables={tempVariables}
                    onContinue={(mainData) => executeUnivariate(mainData)}
                    onReset={resetFormData}
                />

                {/* Model */}
                <UnivariateModel
                    isModelOpen={isModelOpen}
                    setIsModelOpen={setIsModelOpen}
                    updateFormData={(field, value) =>
                        updateFormData("model", field, value)
                    }
                    data={formData.model}
                />

                {/* Contrast */}
                <UnivariateContrast
                    isContrastOpen={isContrastOpen}
                    setIsContrastOpen={setIsContrastOpen}
                    updateFormData={(field, value) =>
                        updateFormData("contrast", field, value)
                    }
                    data={formData.contrast}
                />

                {/* Plots */}
                <UnivariatePlots
                    isPlotsOpen={isPlotsOpen}
                    setIsPlotsOpen={setIsPlotsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("plots", field, value)
                    }
                    data={formData.plots}
                />

                {/* PostHoc */}
                <UnivariatePostHoc
                    isPostHocOpen={isPostHocOpen}
                    setIsPostHocOpen={setIsPostHocOpen}
                    updateFormData={(field, value) =>
                        updateFormData("posthoc", field, value)
                    }
                    data={formData.posthoc}
                />

                {/* EMMeans */}
                <UnivariateEMMeans
                    isEMMeansOpen={isEMMeansOpen}
                    setIsEMMeansOpen={setIsEMMeansOpen}
                    updateFormData={(field, value) =>
                        updateFormData("emmeans", field, value)
                    }
                    data={formData.emmeans}
                />

                {/* Save */}
                <UnivariateSave
                    isSaveOpen={isSaveOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    updateFormData={(field, value) =>
                        updateFormData("save", field, value)
                    }
                    data={formData.save}
                />

                {/* Options */}
                <UnivariateOptions
                    isOptionsOpen={isOptionsOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("options", field, value)
                    }
                    data={formData.options}
                />

                {/* Bootstrap */}
                <UnivariateBootstrap
                    isBootstrapOpen={isBootstrapOpen}
                    setIsBootstrapOpen={setIsBootstrapOpen}
                    updateFormData={(field, value) =>
                        updateFormData("bootstrap", field, value)
                    }
                    data={formData.bootstrap}
                />
            </DialogContent>
        </Dialog>
    );
};
