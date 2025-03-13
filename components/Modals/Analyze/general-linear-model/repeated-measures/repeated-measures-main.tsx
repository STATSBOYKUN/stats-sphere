import {useState} from "react";
import {
    RepeatedMeasuresContainerProps,
    RepeatedMeasuresType
} from "@/models/general-linear-model/repeated-measures/repeated-measures";
import {RepeatedMeasuresDefault} from "@/constants/general-linear-model/repeated-measures/repeated-measures-default";
import {RepeatedMeasuresDialog} from "@/components/Modals/Analyze/general-linear-model/repeated-measures/dialog";
import {RepeatedMeasuresModel} from "@/components/Modals/Analyze/general-linear-model/repeated-measures/model";
import {RepeatedMeasuresContrast} from "@/components/Modals/Analyze/general-linear-model/repeated-measures/contrast";
import {RepeatedMeasuresPlots} from "@/components/Modals/Analyze/general-linear-model/repeated-measures/plots";
import {RepeatedMeasuresPostHoc} from "@/components/Modals/Analyze/general-linear-model/repeated-measures/posthoc";
import {RepeatedMeasuresEMMeans} from "@/components/Modals/Analyze/general-linear-model/repeated-measures/emmeans";
import {RepeatedMeasuresSave} from "@/components/Modals/Analyze/general-linear-model/repeated-measures/save";
import {RepeatedMeasuresOptions} from "@/components/Modals/Analyze/general-linear-model/repeated-measures/options";

export const RepeatedMeasuresContainer = ({onClose} : RepeatedMeasuresContainerProps) => {
    const [formData, setFormData] = useState<RepeatedMeasuresType>({...RepeatedMeasuresDefault});

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

    return (
        <>
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
                updateFormData={(field, value) => updateFormData("main", field, value)}
                data={formData.main}
            />

            {/* Model */}
            <RepeatedMeasuresModel
                isModelOpen={isModelOpen}
                setIsModelOpen={setIsModelOpen}
                updateFormData={(field, value) => updateFormData("model", field, value)}
                data={formData.model}
            />

            {/* Contrast */}
            <RepeatedMeasuresContrast
                isContrastOpen={isContrastOpen}
                setIsContrastOpen={setIsContrastOpen}
                updateFormData={(field, value) => updateFormData("contrast", field, value)}
                data={formData.contrast}
            />

            {/* Plots */}
            <RepeatedMeasuresPlots
                isPlotsOpen={isPlotsOpen}
                setIsPlotsOpen={setIsPlotsOpen}
                updateFormData={(field, value) => updateFormData("plots", field, value)}
                data={formData.plots}
            />

            {/* PostHoc */}
            <RepeatedMeasuresPostHoc
                isPostHocOpen={isPostHocOpen}
                setIsPostHocOpen={setIsPostHocOpen}
                updateFormData={(field, value) => updateFormData("posthoc", field, value)}
                data={formData.posthoc}
            />

            {/* EMMeans */}
            <RepeatedMeasuresEMMeans
                isEMMeansOpen={isEMMeansOpen}
                setIsEMMeansOpen={setIsEMMeansOpen}
                updateFormData={(field, value) => updateFormData("emmeans", field, value)}
                data={formData.emmeans}
            />

            {/* Save */}
            <RepeatedMeasuresSave
                isSaveOpen={isSaveOpen}
                setIsSaveOpen={setIsSaveOpen}
                updateFormData={(field, value) => updateFormData("save", field, value)}
                data={formData.save}
            />

            {/* Options */}
            <RepeatedMeasuresOptions
                isOptionsOpen={isOptionsOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                updateFormData={(field, value) => updateFormData("options", field, value)}
                data={formData.options}
            />
        </>
    );
}