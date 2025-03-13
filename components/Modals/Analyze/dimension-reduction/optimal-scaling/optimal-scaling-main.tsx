import {useState} from "react";
import {OptScaContainerProps, OptScaDefineType} from "@/models/dimension-reduction/optimal-scaling-define";
import {OptScaDefineDefault} from "@/constants/dimension-reduction/optimal-scaling/optimal-scaling-define-default";
import {OptScaInitial} from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/optimal-scaling-dialog";
import {
    OptScaCatpcaContainer
} from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/catpca/optimal-scaling-catpca-main";
import {OptScaMCAContainer} from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca-main";
import {
    OptScaOveralsContainer
} from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals-main";

export const OptScaContainer = ({onClose} : OptScaContainerProps) => {
    const [formData, setFormData] = useState<OptScaDefineType>({...OptScaDefineDefault});

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

    const [isDefineOpen, setIsDefineOpen] = useState(false);
    const [isOptScaCatpca, setIsOptScaCatpca] = useState(false);
    const [isOptScaMCA, setIsOptScaMCA] = useState(false);
    const [isOptScaOverals, setIsOptScaOverals] = useState(false);

    return (
        <>
            <OptScaInitial
                isDefineOpen={isDefineOpen}
                setIsDefineOpen={setIsDefineOpen}
                setIsOptScaCatpca={setIsOptScaCatpca}
                setIsOptScaMCA={setIsOptScaMCA}
                setIsOptScaOverals={setIsOptScaOverals}
                updateFormData={(field, value) => updateFormData("main", field, value)}
                data={formData.main}
            />

            <OptScaCatpcaContainer
                isOptScaCatpca={isOptScaCatpca}
                setIsOptScaCatpca={setIsOptScaCatpca}
            />

            <OptScaMCAContainer
                isOptScaMCA={isOptScaMCA}
                setIsOptScaMCA={setIsOptScaMCA}
            />

            <OptScaOveralsContainer
                isOptScaOverals={isOptScaOverals}
                setIsOptScaOverals={setIsOptScaOverals}
            />
        </>
    );
}
