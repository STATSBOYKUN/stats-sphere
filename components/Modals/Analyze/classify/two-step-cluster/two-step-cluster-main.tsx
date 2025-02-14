import {useState} from "react";
import {TwoStepClusterContainerProps, TwoStepClusterType} from "@/models/classify/two-step-cluster/two-step-cluster";
import {TwoStepClusterDefault} from "@/constants/classify/two-step-cluster/two-step-cluster-default";
import {TwoStepClusterDialog} from "@/components/Modals/Analyze/classify/two-step-cluster/dialog";
import {TwoStepClusterOptions} from "@/components/Modals/Analyze/classify/two-step-cluster/options";
import {TwoStepClusterOutput} from "@/components/Modals/Analyze/classify/two-step-cluster/output";

export const TwoStepClusterContainer = ({onClose} : TwoStepClusterContainerProps) => {
    const [formData, setFormData] = useState<TwoStepClusterType>({...TwoStepClusterDefault});

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
    const [isOutputOpen, setIsOutputOpen] = useState(false);

    return (
        <>
            <TwoStepClusterDialog
                isMainOpen={isMainOpen}
                setIsMainOpen={setIsMainOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                setIsOutputOpen={setIsOutputOpen}
                updateFormData={(field, value) => updateFormData("main", field, value)}
                data={formData.main}
            />

            {/* Options */}
            <TwoStepClusterOptions
                isOptionsOpen={isOptionsOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                updateFormData={(field, value) => updateFormData("options", field, value)}
                data={formData.options}
            />

            {/* Output */}
            <TwoStepClusterOutput
                isOutputOpen={isOutputOpen}
                setIsOutputOpen={setIsOutputOpen}
                updateFormData={(field, value) => updateFormData("output", field, value)}
                data={formData.output}
            />
        </>
    );
}