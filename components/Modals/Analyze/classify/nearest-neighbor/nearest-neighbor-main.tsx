import {useState} from "react";
import {KNNDialog} from "@/components/Modals/Analyze/classify/nearest-neighbor/dialog";
import {KNNContainerProps, KNNType} from "@/models/classify/nearest-neighbor/nearest-neighbor";
import {KNNDefault} from "@/constants/classify/nearest-neighbor/nearest-neighbor-default";
import {KNNNeighbors} from "@/components/Modals/Analyze/classify/nearest-neighbor/neighbors";
import {KNNFeatures} from "@/components/Modals/Analyze/classify/nearest-neighbor/features";
import {KNNPartition} from "@/components/Modals/Analyze/classify/nearest-neighbor/partition";
import {KNNSave} from "@/components/Modals/Analyze/classify/nearest-neighbor/save";
import {KNNOutput} from "@/components/Modals/Analyze/classify/nearest-neighbor/output";
import {KNNOptions} from "@/components/Modals/Analyze/classify/nearest-neighbor/options";

export const KNNContainer = ({onClose} : KNNContainerProps) => {
    const [formData, setFormData] = useState<KNNType>({...KNNDefault});

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
    const [isNeighborsOpen, setIsNeighborsOpen] = useState(false);
    const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
    const [isPartitionOpen, setIsPartitionOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [isOutputOpen, setIsOutputOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

    return (
        <>
            <KNNDialog
                isMainOpen={isMainOpen}
                setIsMainOpen={setIsMainOpen}
                setIsNeighborsOpen={setIsNeighborsOpen}
                setIsFeaturesOpen={setIsFeaturesOpen}
                setIsPartitionOpen={setIsPartitionOpen}
                setIsSaveOpen={setIsSaveOpen}
                setIsOutputOpen={setIsOutputOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                updateFormData={(field, value) => updateFormData("main", field, value)}
                data={formData.main}
            />

            {/* Neighbors */}
            <KNNNeighbors
                isNeighborsOpen={isNeighborsOpen}
                setIsNeighborsOpen={setIsNeighborsOpen}
                updateFormData={(field, value) => updateFormData("neighbors", field, value)}
                data={formData.neighbors}
            />

            {/* Features */}
            <KNNFeatures
                isFeaturesOpen={isFeaturesOpen}
                setIsFeaturesOpen={setIsFeaturesOpen}
                updateFormData={(field, value) => updateFormData("features", field, value)}
                data={formData.features}
            />

            {/* Partition */}
            <KNNPartition
                isPartitionOpen={isPartitionOpen}
                setIsPartitionOpen={setIsPartitionOpen}
                updateFormData={(field, value) => updateFormData("partition", field, value)}
                data={formData.partition}
            />

            {/* Save */}
            <KNNSave
                isSaveOpen={isSaveOpen}
                setIsSaveOpen={setIsSaveOpen}
                updateFormData={(field, value) => updateFormData("save", field, value)}
                data={formData.save}
            />

            {/* Output */}
            <KNNOutput
                isOutputOpen={isOutputOpen}
                setIsOutputOpen={setIsOutputOpen}
                updateFormData={(field, value) => updateFormData("output", field, value)}
                data={formData.output}
            />

            {/* Options */}
            <KNNOptions
                isOptionsOpen={isOptionsOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                updateFormData={(field, value) => updateFormData("options", field, value)}
                data={formData.options}
            />
        </>
    );
}