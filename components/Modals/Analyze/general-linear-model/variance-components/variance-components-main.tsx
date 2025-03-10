import {useState} from "react";
import {
    VarianceCompsContainerProps,
    VarianceCompsType
} from "@/models/general-linear-model/variance-components/variance-components";
import {VarianceCompsDefault} from "@/constants/general-linear-model/variance-components/variance-components-default";
import {VarianceCompsDialog} from "@/components/Modals/Analyze/general-linear-model/variance-components/dialog";
import {VarianceCompsModel} from "@/components/Modals/Analyze/general-linear-model/variance-components/model";
import {VarianceCompsOptions} from "@/components/Modals/Analyze/general-linear-model/variance-components/options";
import {VarianceCompsSave} from "@/components/Modals/Analyze/general-linear-model/variance-components/save";

export const VarianceCompsContainer = ({onClose} : VarianceCompsContainerProps) => {
    const [formData, setFormData] = useState<VarianceCompsType>({...VarianceCompsDefault});

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
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);

    return (
        <>
            <VarianceCompsDialog
                isMainOpen={isMainOpen}
                setIsMainOpen={setIsMainOpen}
                setIsModelOpen={setIsModelOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                setIsSaveOpen={setIsSaveOpen}
                updateFormData={(field, value) => updateFormData("main", field, value)}
                data={formData.main}
            />

            {/* Model */}
            <VarianceCompsModel
                isModelOpen={isModelOpen}
                setIsModelOpen={setIsModelOpen}
                updateFormData={(field, value) => updateFormData("model", field, value)}
                data={formData.model}
            />

            {/* Options */}
            <VarianceCompsOptions
                isOptionsOpen={isOptionsOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                updateFormData={(field, value) => updateFormData("options", field, value)}
                data={formData.options}
            />

            {/* Save */}
            <VarianceCompsSave
                isSaveOpen={isSaveOpen}
                setIsSaveOpen={setIsSaveOpen}
                updateFormData={(field, value) => updateFormData("save", field, value)}
                data={formData.save}
            />
        </>
    );
}