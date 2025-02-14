import {useState} from "react";
import {RocAnalysisDialog} from "@/components/Modals/Analyze/classify/roc-analysis/dialog";
import {RocAnalysisContainerProps, RocAnalysisType} from "@/models/classify/roc-analysis/roc-analysis";
import {RocAnalysisDefault} from "@/constants/classify/roc-analysis/roc-analysis-default";
import {RocAnalysisOptions} from "@/components/Modals/Analyze/classify/roc-analysis/options";
import {RocAnalysisDisplay} from "@/components/Modals/Analyze/classify/roc-analysis/display";
import {RocAnalysisDefineGroups} from "@/components/Modals/Analyze/classify/roc-analysis/define-groups";

export const RocAnalysisContainer = ({onClose} : RocAnalysisContainerProps) => {
    const [formData, setFormData] = useState<RocAnalysisType>({...RocAnalysisDefault});

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
    const [isDefineGroupsOpen, setIsDefineGroupsOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [isDisplayOpen, setIsDisplayOpen] = useState(false);

    return (
        <>
            <RocAnalysisDialog
                isMainOpen={isMainOpen}
                setIsMainOpen={setIsMainOpen}
                setIsDefineGroupsOpen={setIsDefineGroupsOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                setIsDisplayOpen={setIsDisplayOpen}
                updateFormData={(field, value) => updateFormData("main", field, value)}
                data={formData.main}
            />

            {/* Define Groups */}
            <RocAnalysisDefineGroups
                isDefineGroupsOpen={isDefineGroupsOpen}
                setIsDefineGroupsOpen={setIsDefineGroupsOpen}
                updateFormData={(field, value) => updateFormData("defineGroups", field, value)}
                data={formData.defineGroups}
            />

            {/* Options */}
            <RocAnalysisOptions
                isOptionsOpen={isOptionsOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                updateFormData={(field, value) => updateFormData("options", field, value)}
                data={formData.options}
            />

            {/* Display */}
            <RocAnalysisDisplay
                isDisplayOpen={isDisplayOpen}
                setIsDisplayOpen={setIsDisplayOpen}
                updateFormData={(field, value) => updateFormData("display", field, value)}
                data={formData.display}
            />
        </>
    );
}