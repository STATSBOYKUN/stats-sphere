import {useState} from "react";
import {RocCurveContainerProps, RocCurveType} from "@/models/classify/roc-curve/roc-curve";
import {RocCurveDefault} from "@/constants/classify/roc-curve/roc-curve-default";
import {RocCurveDialog} from "@/components/Modals/Analyze/classify/roc-curve/dialog";
import {RocCurveOptions} from "@/components/Modals/Analyze/classify/roc-curve/options";

export const RocCurveContainer = ({onClose} : RocCurveContainerProps) => {
    const [formData, setFormData] = useState<RocCurveType>({...RocCurveDefault});

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
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

    return (
        <>
            <RocCurveDialog
                isMainOpen={isMainOpen}
                setIsMainOpen={setIsMainOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                updateFormData={(field, value) => updateFormData("main", field, value)}
                data={formData.main}
            />

            {/* Define Range */}
            <RocCurveOptions
                isOptionsOpen={isOptionsOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                updateFormData={(field, value) => updateFormData("options", field, value)}
                data={formData.options}
            />
        </>
    );
}