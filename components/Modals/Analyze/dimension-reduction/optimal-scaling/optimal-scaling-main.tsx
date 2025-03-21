import { OptScaInitial } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/optimal-scaling-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { OptScaDefineDefault } from "@/constants/dimension-reduction/optimal-scaling/optimal-scaling-define-default";
import { useModal } from "@/hooks/useModal";
import {
    OptScaContainerProps,
    OptScaDefineType,
} from "@/models/dimension-reduction/optimal-scaling-define";
import { useState } from "react";

export const OptScaContainer = ({ onClose }: OptScaContainerProps) => {
    const [formData, setFormData] = useState<OptScaDefineType>({
        ...OptScaDefineDefault,
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
        setFormData({ ...OptScaDefineDefault });
    };

    const handleClose = () => {
        closeModal();
        onClose();
    };

    return (
        <Dialog open={isDefineOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent className="sm:max-w-sm">
                <OptScaInitial
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
