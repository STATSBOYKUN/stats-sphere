import {useState} from "react";
import {MultivariateContainerProps, MultivariateType} from "@/models/general-linear-model/multivariate/multivariate";
import {MultivariateDefault} from "@/constants/general-linear-model/multivariate/multivariate-default";
import {MultivariateDialog} from "@/components/Modals/Analyze/general-linear-model/multivariate/dialog";
import {MultivariateModel} from "@/components/Modals/Analyze/general-linear-model/multivariate/model";
import {MultivariateContrast} from "@/components/Modals/Analyze/general-linear-model/multivariate/contrast";
import {MultivariatePlots} from "@/components/Modals/Analyze/general-linear-model/multivariate/plots";
import {MultivariatePostHoc} from "@/components/Modals/Analyze/general-linear-model/multivariate/posthoc";
import {MultivariateEMMeans} from "@/components/Modals/Analyze/general-linear-model/multivariate/emmeans";
import {MultivariateSave} from "@/components/Modals/Analyze/general-linear-model/multivariate/save";
import {MultivariateOptions} from "@/components/Modals/Analyze/general-linear-model/multivariate/options";
import {MultivariateBootstrap} from "@/components/Modals/Analyze/general-linear-model/multivariate/bootstrap";

export const MultivariateContainer = ({onClose} : MultivariateContainerProps) => {
    const [formData, setFormData] = useState<MultivariateType>({...MultivariateDefault});

    const updateFormData = <T extends keyof typeof formData>(
        section: T,
        field: keyof typeof formData[T],
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

    const [isMainOpen, setIsMainOpen] = useState(false);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isContrastOpen, setIsContrastOpen] = useState(false);
    const [isPlotsOpen, setIsPlotsOpen] = useState(false);
    const [isPostHocOpen, setIsPostHocOpen] = useState(false);
    const [isEMMeansOpen, setIsEMMeansOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);

    return (
        <>
            <MultivariateDialog
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
                updateFormData={(field, value) => updateFormData("main", field, value)}
                data={formData.main}
            />

            {/* Model */}
            <MultivariateModel
                isModelOpen={isModelOpen}
                setIsModelOpen={setIsModelOpen}
                updateFormData={(field, value) => updateFormData("model", field, value)}
                data={formData.model}
            />

            {/* Contrast */}
            <MultivariateContrast
                isContrastOpen={isContrastOpen}
                setIsContrastOpen={setIsContrastOpen}
                updateFormData={(field, value) => updateFormData("contrast", field, value)}
                data={formData.contrast}
            />

            {/* Plots */}
            <MultivariatePlots
                isPlotsOpen={isPlotsOpen}
                setIsPlotsOpen={setIsPlotsOpen}
                updateFormData={(field, value) => updateFormData("plots", field, value)}
                data={formData.plots}
            />

            {/* PostHoc */}
            <MultivariatePostHoc
                isPostHocOpen={isPostHocOpen}
                setIsPostHocOpen={setIsPostHocOpen}
                updateFormData={(field, value) => updateFormData("posthoc", field, value)}
                data={formData.posthoc}
            />

            {/* EMMeans */}
            <MultivariateEMMeans
                isEMMeansOpen={isEMMeansOpen}
                setIsEMMeansOpen={setIsEMMeansOpen}
                updateFormData={(field, value) => updateFormData("emmeans", field, value)}
                data={formData.emmeans}
            />

            {/* Save */}
            <MultivariateSave
                isSaveOpen={isSaveOpen}
                setIsSaveOpen={setIsSaveOpen}
                updateFormData={(field, value) => updateFormData("save", field, value)}
                data={formData.save}
            />

            {/* Options */}
            <MultivariateOptions
                isOptionsOpen={isOptionsOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                updateFormData={(field, value) => updateFormData("options", field, value)}
                data={formData.options}
            />

            {/* Bootstrap */}
            <MultivariateBootstrap
                isBootstrapOpen={isBootstrapOpen}
                setIsBootstrapOpen={setIsBootstrapOpen}
                updateFormData={(field, value) => updateFormData("bootstrap", field, value)}
                data={formData.bootstrap}
            />
        </>
    );
}