import { useEffect, useState } from "react";
import { OptScaCatpcaType } from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import { OptScaCatpcaDefault } from "@/constants/dimension-reduction/optimal-scaling/catpca/optimal-scaling-catpca-default";
import { OptScaCatpcaDialog } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/catpca/dialog";
import { OptScaCatpcaDefineRangeScale } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/catpca/define-range-scale";
import { OptScaCatpcaLoadingPlots } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/catpca/loading-plots";
import { OptScaCatpcaDefineScale } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/catpca/define-scale";
import { OptScaCatpcaDiscretize } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/catpca/discretize";
import { OptScaCatpcaMissing } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/catpca/missing";
import { OptScaCatpcaOptions } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/catpca/options";
import { OptScaCatpcaOutput } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/catpca/output";
import { OptScaCatpcaSave } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/catpca/save";
import { OptScaCatpcaBootstrap } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/catpca/bootstrap";
import { OptScaCatpcaObjectPlots } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/catpca/object-plots";
import { OptScaCatpcaCategoryPlots } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/catpca/category-plots";
import { OptScaCatpcaContainerProps } from "@/models/dimension-reduction/optimal-scaling-define";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModal";
import { useVariableStore } from "@/stores/useVariableStore";
import { RawData, VariableDef } from "@/lib/db";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";

export const OptScaCatpcaContainer = ({
    isOptScaCatpca,
    setIsOptScaCatpca,
}: OptScaCatpcaContainerProps) => {
    const variables = useVariableStore(
        (state) => state.variables
    ) as VariableDef[];
    const dataVariables = useDataStore((state) => state.data) as RawData;
    const tempVariables = variables.map((variables) => variables.name);

    const [formData, setFormData] = useState<OptScaCatpcaType>({
        ...OptScaCatpcaDefault,
    });
    const [isMainOpen, setIsMainOpen] = useState(false);
    const [isDefineRangeScaleOpen, setIsDefineRangeScaleOpen] = useState(false);
    const [isDefineScaleOpen, setIsDefineScaleOpen] = useState(false);
    const [isDiscretizeOpen, setIsDiscretizeOpen] = useState(false);
    const [isMissingOpen, setIsMissingOpen] = useState(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    const [isOutputOpen, setIsOutputOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [isBootstrapOpen, setIsBootstrapOpen] = useState(false);
    const [isObjectPlotsOpen, setIsObjectPlotsOpen] = useState(false);
    const [isCategoryPlotsOpen, setIsCategoryPlotsOpen] = useState(false);
    const [isLoadingPlotsOpen, setIsLoadingPlotsOpen] = useState(false);

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

    useEffect(() => {
        if (isOptScaCatpca) {
            setIsMainOpen(true);
            setIsOptScaCatpca(false);
        }
    }, [isOptScaCatpca, setIsOptScaCatpca]);

    const resetFormData = () => {
        setFormData({ ...OptScaCatpcaDefault });
    };

    return (
        <>
            <OptScaCatpcaDialog
                isMainOpen={isMainOpen}
                setIsMainOpen={setIsMainOpen}
                setIsDefineRangeScaleOpen={setIsDefineRangeScaleOpen}
                setIsDefineScaleOpen={setIsDefineScaleOpen}
                setIsDiscretizeOpen={setIsDiscretizeOpen}
                setIsMissingOpen={setIsMissingOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                setIsOutputOpen={setIsOutputOpen}
                setIsSaveOpen={setIsSaveOpen}
                setIsBootstrapOpen={setIsBootstrapOpen}
                setIsObjectPlotsOpen={setIsObjectPlotsOpen}
                setIsCategoryPlotsOpen={setIsCategoryPlotsOpen}
                setIsLoadingPlotsOpen={setIsLoadingPlotsOpen}
                updateFormData={(field, value) =>
                    updateFormData("main", field, value)
                }
                data={formData.main}
                globalVariables={tempVariables}
                onContinue={(mainData) => executeDiscriminant(mainData)}
                onReset={resetFormData}
            />

            {/* Define Range Scale */}
            <OptScaCatpcaDefineRangeScale
                isDefineRangeScaleOpen={isDefineRangeScaleOpen}
                setIsDefineRangeScaleOpen={setIsDefineRangeScaleOpen}
                updateFormData={(field, value) =>
                    updateFormData("defineRangeScale", field, value)
                }
                data={formData.defineRangeScale}
            />

            {/* Define Scale */}
            <OptScaCatpcaDefineScale
                isDefineScaleOpen={isDefineScaleOpen}
                setIsDefineScaleOpen={setIsDefineScaleOpen}
                updateFormData={(field, value) =>
                    updateFormData("defineScale", field, value)
                }
                data={formData.defineScale}
            />

            {/* Discretize */}
            <OptScaCatpcaDiscretize
                isDiscretizeOpen={isDiscretizeOpen}
                setIsDiscretizeOpen={setIsDiscretizeOpen}
                updateFormData={(field, value) =>
                    updateFormData("discretize", field, value)
                }
                data={formData.discretize}
            />

            {/* Missing */}
            <OptScaCatpcaMissing
                isMissingOpen={isMissingOpen}
                setIsMissingOpen={setIsMissingOpen}
                updateFormData={(field, value) =>
                    updateFormData("missing", field, value)
                }
                data={formData.missing}
            />

            {/* Options */}
            <OptScaCatpcaOptions
                isOptionsOpen={isOptionsOpen}
                setIsOptionsOpen={setIsOptionsOpen}
                updateFormData={(field, value) =>
                    updateFormData("options", field, value)
                }
                data={formData.options}
            />

            {/* Output */}
            <OptScaCatpcaOutput
                isOutputOpen={isOutputOpen}
                setIsOutputOpen={setIsOutputOpen}
                updateFormData={(field, value) =>
                    updateFormData("output", field, value)
                }
                data={formData.output}
            />

            {/* Save */}
            <OptScaCatpcaSave
                isSaveOpen={isSaveOpen}
                setIsSaveOpen={setIsSaveOpen}
                updateFormData={(field, value) =>
                    updateFormData("save", field, value)
                }
                data={formData.save}
            />

            {/* Bootstrap */}
            <OptScaCatpcaBootstrap
                isBootstrapOpen={isBootstrapOpen}
                setIsBootstrapOpen={setIsBootstrapOpen}
                updateFormData={(field, value) =>
                    updateFormData("bootstrap", field, value)
                }
                data={formData.bootstrap}
            />

            {/* Object Plots */}
            <OptScaCatpcaObjectPlots
                isObjectPlotsOpen={isObjectPlotsOpen}
                setIsObjectPlotsOpen={setIsObjectPlotsOpen}
                updateFormData={(field, value) =>
                    updateFormData("objectPlots", field, value)
                }
                data={formData.objectPlots}
            />

            {/* Category Plots */}
            <OptScaCatpcaCategoryPlots
                isCategoryPlotsOpen={isCategoryPlotsOpen}
                setIsCategoryPlotsOpen={setIsCategoryPlotsOpen}
                updateFormData={(field, value) =>
                    updateFormData("categoryPlots", field, value)
                }
                data={formData.categoryPlots}
            />

            {/* Loading Plots */}
            <OptScaCatpcaLoadingPlots
                isLoadingPlotsOpen={isLoadingPlotsOpen}
                setIsLoadingPlotsOpen={setIsLoadingPlotsOpen}
                updateFormData={(field, value) =>
                    updateFormData("loadingPlots", field, value)
                }
                data={formData.loadingPlots}
            />
        </>
    );
};
