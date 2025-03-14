import { useState } from "react";
import { KMeansClusterDefault } from "@/constants/classify/k-means-cluster/k-means-cluster-default";
import {
    KMeansClusterContainerProps,
    KMeansClusterMainType,
    KMeansClusterType,
} from "@/models/classify/k-means-cluster/k-means-cluster";
import { KMeansClusterDialog } from "@/components/Modals/Analyze/classify/k-means-cluster/dialog";
import { KMeansClusterIterate } from "@/components/Modals/Analyze/classify/k-means-cluster/iterate";
import { KMeansClusterSave } from "@/components/Modals/Analyze/classify/k-means-cluster/save";
import { KMeansClusterOptions } from "@/components/Modals/Analyze/classify/k-means-cluster/options";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModal";
import { useVariableStore } from "@/stores/useVariableStore";
import { RawData, VariableDef } from "@/lib/db";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { analyzeKMeansCluster } from "@/services/analyze/classify/k-means-cluster/k-means-cluster-analysis";

export const KMeansClusterContainer = ({
    onClose,
}: KMeansClusterContainerProps) => {
    const variables = useVariableStore(
        (state) => state.variables
    ) as VariableDef[];
    const dataVariables = useDataStore((state) => state.data) as RawData;
    const tempVariables = variables.map((variables) => variables.name);

    const [formData, setFormData] = useState<KMeansClusterType>({
        ...KMeansClusterDefault,
    });
    const [isMainOpen, setIsMainOpen] = useState(true);
    const [isIterateOpen, setIsIterateOpen] = useState(false);
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

    const executeKMeansCluster = async (mainData: KMeansClusterMainType) => {
        try {
            const newFormData = {
                ...formData,
                main: mainData,
            };

            await analyzeKMeansCluster({
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
        setFormData({ ...KMeansClusterDefault });
    };

    const handleClose = () => {
        closeModal();
        onClose();
    };

    return (
        <Dialog open={isMainOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent>
                <KMeansClusterDialog
                    isMainOpen={isMainOpen}
                    setIsMainOpen={setIsMainOpen}
                    setIsIterateOpen={setIsIterateOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("main", field, value)
                    }
                    data={formData.main}
                    globalVariables={tempVariables}
                    onContinue={(mainData) => executeKMeansCluster(mainData)}
                    onReset={resetFormData}
                />

                {/* Iterate */}
                <KMeansClusterIterate
                    isIterateOpen={isIterateOpen}
                    setIsIterateOpen={setIsIterateOpen}
                    updateFormData={(field, value) =>
                        updateFormData("iterate", field, value)
                    }
                    data={formData.iterate}
                />

                {/* Save */}
                <KMeansClusterSave
                    isSaveOpen={isSaveOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    updateFormData={(field, value) =>
                        updateFormData("save", field, value)
                    }
                    data={formData.save}
                />

                {/* Options */}
                <KMeansClusterOptions
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
