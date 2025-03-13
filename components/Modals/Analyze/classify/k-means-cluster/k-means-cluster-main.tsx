import {useState} from "react";
import {KMeansClusterDefault} from "@/constants/classify/k-means-cluster/k-means-cluster-default";
import {KMeansClusterContainerProps, KMeansClusterType} from "@/models/classify/k-means-cluster/k-means-cluster";
import {KMeansClusterDialog} from "@/components/Modals/Analyze/classify/k-means-cluster/dialog";
import {KMeansClusterIterate} from "@/components/Modals/Analyze/classify/k-means-cluster/iterate";
import {KMeansClusterSave} from "@/components/Modals/Analyze/classify/k-means-cluster/save";
import {KMeansClusterOptions} from "@/components/Modals/Analyze/classify/k-means-cluster/options";

export const KMeansClusterContainer = ({onClose} : KMeansClusterContainerProps) => {
    const [formData, setFormData] = useState<KMeansClusterType>({...KMeansClusterDefault});

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
    const [isIterateOpen, setIsIterateOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

    return (
        <>
            <KMeansClusterDialog
                isMainOpen={isMainOpen}
                setIsMainOpen={setIsMainOpen}
                setIsIterateOpen={setIsIterateOpen}
                setIsSaveOpen={setIsSaveOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                updateFormData={(field, value) => updateFormData("main", field, value)}
                data={formData.main}
            />

            {/* Iterate */}
            <KMeansClusterIterate
                isIterateOpen={isIterateOpen}
                setIsIterateOpen={setIsIterateOpen}
                updateFormData={(field, value) => updateFormData("iterate", field, value)}
                data={formData.iterate}
            />

            {/* Save */}
            <KMeansClusterSave
                isSaveOpen={isSaveOpen}
                setIsSaveOpen={setIsSaveOpen}
                updateFormData={(field, value) => updateFormData("save", field, value)}
                data={formData.save}
            />

            {/* Options */}
            <KMeansClusterOptions
                isOptionsOpen={isOptionsOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                updateFormData={(field, value) => updateFormData("options", field, value)}
                data={formData.options}
            />
        </>
    );
}