import { useState } from "react";
import {
    TreeContainerProps,
    TreeMainType,
    TreeType,
} from "@/models/classify/tree/tree";
import { TreeDefault } from "@/constants/classify/tree/tree-default";
import { TreeDialog } from "@/components/Modals/Analyze/classify/tree/dialog";
import { TreeCategories } from "@/components/Modals/Analyze/classify/tree/categories";
import { TreeSave } from "@/components/Modals/Analyze/classify/tree/save";
import { TreeOutput } from "@/components/Modals/Analyze/classify/tree/output";
import { TreeValidation } from "@/components/Modals/Analyze/classify/tree/validation";
import { TreeCriteria } from "@/components/Modals/Analyze/classify/tree/criteria";
import { TreeOptions } from "@/components/Modals/Analyze/classify/tree/options";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModal";
import { useVariableStore } from "@/stores/useVariableStore";
import { RawData, VariableDef } from "@/lib/db";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { analyzeTree } from "@/services/analyze/classify/tree/tree-analysis";

export const TreeContainer = ({ onClose }: TreeContainerProps) => {
    const variables = useVariableStore(
        (state) => state.variables
    ) as VariableDef[];
    const dataVariables = useDataStore((state) => state.data) as RawData;
    const tempVariables = variables.map((variables) => variables.name);

    const [formData, setFormData] = useState<TreeType>({ ...TreeDefault });
    const [isMainOpen, setIsMainOpen] = useState(true);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isOutputOpen, setIsOutputOpen] = useState(false);
    const [isValidationOpen, setIsValidationOpen] = useState(false);
    const [isCriteriaOpen, setIsCriteriaOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

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

    const executeTree = async (mainData: TreeMainType) => {
        try {
            const newFormData = {
                ...formData,
                main: mainData,
            };

            await analyzeTree({
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
        onClose();
    };

    const resetFormData = () => {
        setFormData({ ...TreeDefault });
    };

    const handleClose = () => {
        closeModal();
        onClose();
    };

    return (
        <Dialog open={isMainOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent>
                <TreeDialog
                    isMainOpen={isMainOpen}
                    setIsMainOpen={setIsMainOpen}
                    setIsCategoriesOpen={setIsCategoriesOpen}
                    setIsOutputOpen={setIsOutputOpen}
                    setIsValidationOpen={setIsValidationOpen}
                    setIsCriteriaOpen={setIsCriteriaOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("main", field, value)
                    }
                    data={formData.main}
                    globalVariables={tempVariables}
                    onContinue={(mainData) => executeTree(mainData)}
                    onReset={resetFormData}
                />

                {/* Categories */}
                <TreeCategories
                    isCategoriesOpen={isCategoriesOpen}
                    setIsCategoriesOpen={setIsCategoriesOpen}
                    updateFormData={(field, value) =>
                        updateFormData("categories", field, value)
                    }
                    data={formData.categories}
                />

                {/* Output */}
                <TreeOutput
                    isOutputOpen={isOutputOpen}
                    setIsOutputOpen={setIsOutputOpen}
                    updateFormData={(field, value) =>
                        updateFormData("output", field, value)
                    }
                    data={formData.output}
                />

                {/* Validation */}
                <TreeValidation
                    isValidationOpen={isValidationOpen}
                    setIsValidationOpen={setIsValidationOpen}
                    updateFormData={(field, value) =>
                        updateFormData("validation", field, value)
                    }
                    data={formData.validation}
                />

                {/* Criteria */}
                <TreeCriteria
                    isCriteriaOpen={isCriteriaOpen}
                    setIsCriteriaOpen={setIsCriteriaOpen}
                    updateFormData={(field, value) =>
                        updateFormData("criteria", field, value)
                    }
                    data={formData.criteria}
                />

                {/* Save */}
                <TreeSave
                    isSaveOpen={isSaveOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    updateFormData={(field, value) =>
                        updateFormData("save", field, value)
                    }
                    data={formData.save}
                />

                {/* Options */}
                <TreeOptions
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
