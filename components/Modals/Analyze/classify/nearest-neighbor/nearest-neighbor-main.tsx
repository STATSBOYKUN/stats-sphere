import { useState, useEffect } from "react";
import { KNNDialog } from "@/components/Modals/Analyze/classify/nearest-neighbor/dialog";
import {
    KNNContainerProps,
    KNNMainType,
    KNNType,
} from "@/models/classify/nearest-neighbor/nearest-neighbor";
import { KNNDefault } from "@/constants/classify/nearest-neighbor/nearest-neighbor-default";
import { KNNNeighbors } from "@/components/Modals/Analyze/classify/nearest-neighbor/neighbors";
import { KNNFeatures } from "@/components/Modals/Analyze/classify/nearest-neighbor/features";
import { KNNPartition } from "@/components/Modals/Analyze/classify/nearest-neighbor/partition";
import { KNNSave } from "@/components/Modals/Analyze/classify/nearest-neighbor/save";
import { KNNOutput } from "@/components/Modals/Analyze/classify/nearest-neighbor/output";
import { KNNOptions } from "@/components/Modals/Analyze/classify/nearest-neighbor/options";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModal";
import { useVariableStore } from "@/stores/useVariableStore";
import { RawData, VariableDef } from "@/lib/db";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { analyzeKNN } from "@/services/analyze/classify/nearest-neighbor/nearest-neighbor-analysis";

export const KNNContainer = ({ onClose }: KNNContainerProps) => {
    const variables = useVariableStore(
        (state) => state.variables
    ) as VariableDef[];
    const dataVariables = useDataStore((state) => state.data) as RawData;
    const tempVariables = variables.map((variables) => variables.name);

    const [formData, setFormData] = useState<KNNType>({ ...KNNDefault });
    const [isMainOpen, setIsMainOpen] = useState(true);
    const [isNeighborsOpen, setIsNeighborsOpen] = useState(false);
    const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
    const [isPartitionOpen, setIsPartitionOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [isOutputOpen, setIsOutputOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

    const { closeModal } = useModal();
    const { addLog, addAnalytic, addStatistic } = useResultStore();

    useEffect(() => {
        if (formData.main.FeatureVar) {
            setFormData((prev) => ({
                ...prev,
                features: {
                    ...prev.features,
                    ForwardSelection: prev.main.FeatureVar
                        ? [...prev.main.FeatureVar]
                        : [],
                },
                partition: {
                    ...prev.partition,
                    SrcVar: prev.main.FeatureVar
                        ? [...prev.main.FeatureVar]
                        : [],
                },
            }));
        }
    }, [formData.main.FeatureVar]);

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

    const executeKNN = async (mainData: KNNMainType) => {
        try {
            const newFormData = {
                ...formData,
                main: mainData,
            };

            await analyzeKNN({
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
        setFormData({ ...KNNDefault });
    };

    const handleClose = () => {
        closeModal();
        onClose();
    };

    return (
        <Dialog open={isMainOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent>
                <KNNDialog
                    isMainOpen={isMainOpen}
                    setIsMainOpen={setIsMainOpen}
                    setIsNeighborsOpen={setIsNeighborsOpen}
                    setIsFeaturesOpen={setIsFeaturesOpen}
                    setIsPartitionOpen={setIsPartitionOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    setIsOutputOpen={setIsOutputOpen}
                    setIsOptionsOpen={setIsOptionsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("main", field, value)
                    }
                    data={formData.main}
                    globalVariables={tempVariables}
                    onContinue={(mainData) => executeKNN(mainData)}
                    onReset={resetFormData}
                />

                {/* Neighbors */}
                <KNNNeighbors
                    isNeighborsOpen={isNeighborsOpen}
                    setIsNeighborsOpen={setIsNeighborsOpen}
                    updateFormData={(field, value) =>
                        updateFormData("neighbors", field, value)
                    }
                    data={formData.neighbors}
                />

                {/* Features */}
                <KNNFeatures
                    isFeaturesOpen={isFeaturesOpen}
                    setIsFeaturesOpen={setIsFeaturesOpen}
                    updateFormData={(field, value) =>
                        updateFormData("features", field, value)
                    }
                    data={formData.features}
                />

                {/* Partition */}
                <KNNPartition
                    isPartitionOpen={isPartitionOpen}
                    setIsPartitionOpen={setIsPartitionOpen}
                    updateFormData={(field, value) =>
                        updateFormData("partition", field, value)
                    }
                    data={formData.partition}
                />

                {/* Save */}
                <KNNSave
                    isSaveOpen={isSaveOpen}
                    setIsSaveOpen={setIsSaveOpen}
                    updateFormData={(field, value) =>
                        updateFormData("save", field, value)
                    }
                    data={formData.save}
                />

                {/* Output */}
                <KNNOutput
                    isOutputOpen={isOutputOpen}
                    setIsOutputOpen={setIsOutputOpen}
                    updateFormData={(field, value) =>
                        updateFormData("output", field, value)
                    }
                    data={formData.output}
                />

                {/* Options */}
                <KNNOptions
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
