import {useState} from "react";
import {FactorDialog} from "@/components/Modals/Analyze/dimension-reduction/factor/dialog";
import {FactorContainerProps, FactorType} from "@/models/dimension-reduction/factor/factor";
import {FactorDefault} from "@/constants/dimension-reduction/factor/factor-default";
import {FactorValue} from "@/components/Modals/Analyze/dimension-reduction/factor/value";
import {FactorScores} from "@/components/Modals/Analyze/dimension-reduction/factor/scores";
import {FactorRotation} from "@/components/Modals/Analyze/dimension-reduction/factor/rotation";
import {FactorExtraction} from "@/components/Modals/Analyze/dimension-reduction/factor/extraction";
import {FactorDescriptives} from "@/components/Modals/Analyze/dimension-reduction/factor/descriptives";
import {FactorOptions} from "@/components/Modals/Analyze/dimension-reduction/factor/options";

export const FactorContainer = ({onClose} : FactorContainerProps) => {
    const [formData, setFormData] = useState<FactorType>({...FactorDefault});

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
    const [isValueOpen, setIsValueOpen] = useState(false);
    const [isDescriptivesOpen, setIsDescriptivesOpen] = useState(false);
    const [isExtractionOpen, setIsExtractionOpen] = useState(false);
    const [isRotationOpen, setIsRotationOpen] = useState(false);
    const [isScoresOpen, setIsScoresOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

    return (
        <>
            <FactorDialog
                isMainOpen={isMainOpen}
                setIsMainOpen={setIsMainOpen}
                setIsValueOpen={setIsValueOpen}
                setIsDescriptivesOpen={setIsDescriptivesOpen}
                setIsExtractionOpen={setIsExtractionOpen}
                setIsRotationOpen={setIsRotationOpen}
                setIsScoresOpen={setIsScoresOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                updateFormData={(field, value) => updateFormData("main", field, value)}
                data={formData.main}
            />

            {/* Value */}
            <FactorValue
                isValueOpen={isValueOpen}
                setIsValueOpen={setIsValueOpen}
                updateFormData={(field, value) => updateFormData("value", field, value)}
                data={formData.value}
            />

            {/* Descriptives */}
            <FactorDescriptives
                isDescriptivesOpen={isDescriptivesOpen}
                setIsDescriptivesOpen={setIsDescriptivesOpen}
                updateFormData={(field, value) => updateFormData("descriptives", field, value)}
                data={formData.descriptives}
            />

            {/* Extraction */}
            <FactorExtraction
                isExtractionOpen={isExtractionOpen}
                setIsExtractionOpen={setIsExtractionOpen}
                updateFormData={(field, value) => updateFormData("extraction", field, value)}
                data={formData.extraction}
            />

            {/* Rotation */}
            <FactorRotation
                isRotationOpen={isRotationOpen}
                setIsRotationOpen={setIsRotationOpen}
                updateFormData={(field, value) => updateFormData("rotation", field, value)}
                data={formData.rotation}
            />

            {/* Scores */}
            <FactorScores
                isScoresOpen={isScoresOpen}
                setIsScoresOpen={setIsScoresOpen}
                updateFormData={(field, value) => updateFormData("scores", field, value)}
                data={formData.scores}
            />

            {/* Options */}
            <FactorOptions
                isOptionsOpen={isOptionsOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                updateFormData={(field, value) => updateFormData("options", field, value)}
                data={formData.options}
            />
        </>
    );
}