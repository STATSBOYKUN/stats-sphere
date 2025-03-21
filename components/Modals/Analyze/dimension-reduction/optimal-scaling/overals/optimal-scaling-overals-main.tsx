import {useEffect, useState} from "react";
import {OptScaOveralsType} from "@/models/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals";
import {
    OptScaOveralsDefault
} from "@/constants/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals-default";
import {OptScaOveralsDialog} from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/overals/dialog";
import {OptScaOveralsDefineRange} from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/overals/define-range";
import {
    OptScaOveralsDefineRangeScale
} from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/overals/define-range-scale";
import {OptScaOveralsOptions} from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/overals/options";
import {OptScaOveralsContainerProps} from "@/models/dimension-reduction/optimal-scaling-define";

export const OptScaOveralsContainer = (
    {
        isOptScaOverals,
        setIsOptScaOverals,
    }: OptScaOveralsContainerProps
) => {
    const [formData, setFormData] = useState<OptScaOveralsType>({...OptScaOveralsDefault});

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
    const [isDefineRangeScaleOpen, setIsDefineRangeScaleOpen] = useState(false);
    const [isDefineRangeOpen, setIsDefineRangeOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

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
                updateFormData={(field, value) => updateFormData("main", field, value)}
                data={formData.main}
            />

            {/* Define Range Scale */}
            <OptScaOveralsDefineRangeScale
                isDefineRangeScaleOpen={isDefineRangeScaleOpen}
                setIsDefineRangeScaleOpen={setIsDefineRangeScaleOpen}
                updateFormData={(field, value) => updateFormData("defineRangeScale", field, value)}
                data={formData.defineRangeScale}
            />

            {/* Define Range */}
            <OptScaOveralsDefineRange
                isDefineRangeOpen={isDefineRangeOpen}
                setIsDefineRangeOpen={setIsDefineRangeOpen}
                updateFormData={(field, value) => updateFormData("defineRange", field, value)}
                data={formData.defineRange}
            />

            {/* Options */}
            <OptScaOveralsOptions
                isOptionsOpen={isOptionsOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                updateFormData={(field, value) => updateFormData("options", field, value)}
                data={formData.options}
            />
        </>
    );
}