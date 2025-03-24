import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RepeatedMeasureDefineDefault } from "@/constants/general-linear-model/repeated-measures/repeated-measures-define-default";
import { useModal } from "@/hooks/useModal";
import {
    RepeatedMeasuresDefineContainerProps,
    RepeatedMeasureDefineType,
} from "@/models/general-linear-model/repeated-measures/repeated-measure-define";
import { useState } from "react";
import { RepeatedMeasureDefineDialog } from "./repeated-measures-dialog";

export const RepeatedMeasuresDefineContainer = ({
    onClose,
}: RepeatedMeasuresDefineContainerProps) => {
    const [formData, setFormData] = useState<RepeatedMeasureDefineType>({
        ...RepeatedMeasureDefineDefault,
    });
    const [isDefineOpen, setIsDefineOpen] = useState(true);

    const { closeModal } = useModal();

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

    const resetFormData = () => {
        setFormData({ ...RepeatedMeasureDefineDefault });
    };

    const handleClose = () => {
        closeModal();
        onClose();
    };

    return (
        <Dialog open={isDefineOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent className="sm:max-w-sm">
                <RepeatedMeasureDefineDialog
                    isDefineOpen={isDefineOpen}
                    setIsDefineOpen={setIsDefineOpen}
                    updateFormData={(field, value) =>
                        updateFormData("main", field, value)
                    }
                    data={formData.main}
                    onReset={resetFormData}
                />
            </DialogContent>
        </Dialog>
    );
};
