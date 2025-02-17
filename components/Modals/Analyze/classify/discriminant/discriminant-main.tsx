import {useState} from "react";
import {DiscriminantDialog} from "@/components/Modals/Analyze/classify/discriminant/dialog";
import {DiscriminantDefineRange} from "@/components/Modals/Analyze/classify/discriminant/define-range";
import {DiscriminantSetValue} from "@/components/Modals/Analyze/classify/discriminant/set-value";
import {DiscriminantStatistics} from "@/components/Modals/Analyze/classify/discriminant/statistics";
import {DiscriminantMethod} from "@/components/Modals/Analyze/classify/discriminant/method";
import {DiscriminantClassify} from "@/components/Modals/Analyze/classify/discriminant/classify";
import {DiscriminantSave} from "@/components/Modals/Analyze/classify/discriminant/save";
import {DiscriminantBootstrap} from "@/components/Modals/Analyze/classify/discriminant/bootstrap";
import {
    DiscriminantContainerProps,
    DiscriminantMainType,
    DiscriminantType
} from "@/models/classify/discriminant/discriminant";
import {DiscriminantDefault} from "@/constants/classify/discriminant/discriminant-default";
import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog";
import {useModal} from "@/hooks/useModal";
import {useVariableStore} from "@/stores/useVariableStore";
import {RawData, VariableDef} from "@/lib/db";
import {useDataStore} from "@/stores/useDataStore";
import {analyzeDiscriminant} from "@/services/analyze/classify/discriminant/discriminant-analysis";
import useResultStore from "@/stores/useResultStore";

export const DiscriminantContainer = ({onClose}: DiscriminantContainerProps) => {
    const variables = useVariableStore((state) => state.variables) as VariableDef[];
    const dataVariables = useDataStore((state) => state.data) as RawData;
    const tempVariables = variables.map((variables) => variables.name);

    const [formData, setFormData] = useState<DiscriminantType>({...DiscriminantDefault});
    const [isMainOpen, setIsMainOpen] = useState(true);
    const [isDefineRangeOpen, setIsDefineRangeOpen] = useState(false);
    const [isSetValueOpen, setIsSetValueOpen] = useState(false);
    const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
    const [isMethodOpen, setIsMethodOpen] = useState(false);
    const [isClassifyOpen, setIsClassifyOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);

    const {closeModal} = useModal();
    const { addLog, addAnalytic, addStatistic } = useResultStore();

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

    const executeDiscriminant = async (mainData: DiscriminantMainType) => {
        try {
            const newFormData = {
                ...formData,
                main: mainData,
            };

            await analyzeDiscriminant({
                tempData: newFormData,
                dataVariables: dataVariables,
                variables: variables,
                addLog,
                addAnalytic,
                addStatistic
            });

        } catch (error) {
            console.error(error);
        }

        closeModal();
        onClose();
    };

    const resetFormData = () => {
        setFormData({...DiscriminantDefault});
    };

    const handleClose = () => {
        closeModal();
        onClose();
    }

    return (
        <Dialog open={isMainOpen} onOpenChange={handleClose}>
            <DialogTitle>
            </DialogTitle>
            <DialogContent>
                <DiscriminantDialog
                    isMainOpen={isMainOpen}
                    setIsMainOpen={setIsMainOpen}
                    setIsDefineRangeOpen={setIsDefineRangeOpen}
                    setIsSetValueOpen={setIsSetValueOpen}
                    setIsStatisticsOpen={setIsStatisticsOpen}
                    setIsMethodOpen={setIsMethodOpen}
                    setIsClassifyOpen={setIsClassifyOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    setIsBootstrapOpen={setIsBootstrapOpen}
                    updateFormData={(field, value) => updateFormData("main", field, value)}
                    data={formData.main}
                    globalVariables={tempVariables}
                    onContinue={(mainData) => executeDiscriminant(mainData)}
                    onReset={resetFormData}
                />

                {/* Define Range */}
                <DiscriminantDefineRange
                    isDefineRangeOpen={isDefineRangeOpen}
                    setIsDefineRangeOpen={setIsDefineRangeOpen}
                    updateFormData={(field, value) => updateFormData("defineRange", field, value)}
                    data={formData.defineRange}
                />

                {/* Define Range */}
                <DiscriminantSetValue
                    isSetValueOpen={isSetValueOpen}
                    setIsSetValueOpen={setIsSetValueOpen}
                    updateFormData={(field, value) => updateFormData("setValue", field, value)}
                    data={formData.setValue}
                />

                {/* Statistics */}
                <DiscriminantStatistics
                    isStatisticsOpen={isStatisticsOpen}
                    setIsStatisticsOpen={setIsStatisticsOpen}
                    updateFormData={(field, value) => updateFormData("statistics", field, value)}
                    data={formData.statistics}
                />

                {/* Method */}
                <DiscriminantMethod
                    isMethodOpen={isMethodOpen}
                    setIsMethodOpen={setIsMethodOpen}
                    updateFormData={(field, value) => updateFormData("method", field, value)}
                    data={formData.method}
                />

                {/* Classify */}
                <DiscriminantClassify
                    isClassifyOpen={isClassifyOpen}
                    setIsClassifyOpen={setIsClassifyOpen}
                    updateFormData={(field, value) => updateFormData("classify", field, value)}
                    data={formData.classify}
                />

                {/* Save */}
                <DiscriminantSave
                    isSaveOpen={isSaveOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    updateFormData={(field, value) => updateFormData("save", field, value)}
                    data={formData.save}
                />

                {/* Bootstrap */}
                <DiscriminantBootstrap
                    isBootstrapOpen={isBootstrapOpen}
                    setIsBootstrapOpen={setIsBootstrapOpen}
                    updateFormData={(field, value) => updateFormData("bootstrap", field, value)}
                    data={formData.bootstrap}
                />
            </DialogContent>
        </Dialog>
    );
}