import { useEffect, useState, useRef } from "react";
import {
    OptScaCatpcaContainerProps,
    OptScaCatpcaMainType,
    OptScaCatpcaType,
    OptScaCatpcaDefineRangeScaleType,
    OptScaCatpcaDefineScaleType,
} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import { OptScaCatpcaDefault } from "@/constants/dimension-reduction/optimal-scaling/catpca/optimal-scaling-catpca-default";
import {
    OptScaCatpcaDialog,
    DialogHandlers,
} from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/catpca/dialog";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useModal } from "@/hooks/useModal";
import { useVariableStore } from "@/stores/useVariableStore";
import { RawData, VariableDef } from "@/lib/db";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { analyzeOptScaCatpca } from "@/services/analyze/dimension-reduction/optimal-scaling/catpca/optimal-scaling-catpca-analysis";

export const OptScaCatpcaContainer = ({
    onClose,
}: OptScaCatpcaContainerProps) => {
    const variables = useVariableStore(
        (state) => state.variables
    ) as VariableDef[];
    const dataVariables = useDataStore((state) => state.data) as RawData;
    const tempVariables = variables.map((variables) => variables.name);

    const [formData, setFormData] = useState<OptScaCatpcaType>({
        ...OptScaCatpcaDefault,
    });
    const [isMainOpen, setIsMainOpen] = useState(true);
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

    // Ref untuk mengakses fungsi dialog
    const dialogRef = useRef<DialogHandlers>(null);

    const { closeModal } = useModal();
    const { addLog, addAnalytic, addStatistic } = useResultStore();

    useEffect(() => {
        setFormData((prev) => {
            // Create a copy of the previous state to modify
            const newState = { ...prev };

            // Update discretize based on AnalysisVars (if it exists)
            if (prev.main.AnalysisVars) {
                newState.discretize = {
                    ...prev.discretize,
                    VariablesList: [...prev.main.AnalysisVars],
                };

                newState.missing = {
                    ...prev.missing,
                    AnalysisVariables: [...prev.main.AnalysisVars],
                };
            }

            // Update missing.SupplementaryVariables based on SuppleVars (if it exists)
            if (prev.main.SuppleVars) {
                newState.missing = {
                    ...(newState.missing || prev.missing),
                    SupplementaryVariables: [...prev.main.SuppleVars],
                };
            }

            // Combine AnalysisVars and SuppleVars for QuantifiedVars
            const analysisVars = prev.main.AnalysisVars
                ? [...prev.main.AnalysisVars]
                : [];
            const suppleVars = prev.main.SuppleVars
                ? [...prev.main.SuppleVars]
                : [];

            newState.output = {
                ...prev.output,
                QuantifiedVars: [...analysisVars, ...suppleVars],
            };

            // Update based on LabelingVars (if it exists)
            if (prev.main.LabelingVars) {
                newState.output = {
                    ...newState.output, // Use the already updated output state
                    LabelingVars: [...prev.main.LabelingVars],
                };
            }

            return newState;
        });
    }, [
        formData.main.AnalysisVars,
        formData.main.SuppleVars,
        formData.main.LabelingVars,
    ]);

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

    // Callback untuk pembaruan definisi range scale
    const handleDefineRangeScaleUpdate = (
        data: OptScaCatpcaDefineRangeScaleType
    ) => {
        console.log("Define Range Scale data updated:", data);
        // Panggil fungsi di komponen dialog untuk memperbarui variabel
        if (dialogRef.current) {
            dialogRef.current.handleDefineRangeScaleContinue(data);
        }
    };

    // Callback untuk pembaruan definisi scale
    const handleDefineScaleUpdate = (data: OptScaCatpcaDefineScaleType) => {
        console.log("Define Scale data updated:", data);
        // Panggil fungsi di komponen dialog untuk memperbarui variabel
        if (dialogRef.current) {
            dialogRef.current.handleDefineScaleContinue(data);
        }
    };

    const executeOptScaCatpca = async (mainData: OptScaCatpcaMainType) => {
        try {
            const newFormData = {
                ...formData,
                main: mainData,
            };

            await analyzeOptScaCatpca({
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
    };

    const resetFormData = () => {
        setFormData({ ...OptScaCatpcaDefault });
    };

    const handleClose = () => {
        closeModal();
        onClose();
    };

    return (
        <Dialog open={isMainOpen} onOpenChange={handleClose}>
            <DialogTitle></DialogTitle>
            <DialogContent>
                <OptScaCatpcaDialog
                    ref={dialogRef}
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
                    onContinue={(mainData) => executeOptScaCatpca(mainData)}
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
                    onContinue={handleDefineRangeScaleUpdate}
                />

                {/* Define Scale */}
                <OptScaCatpcaDefineScale
                    isDefineScaleOpen={isDefineScaleOpen}
                    setIsDefineScaleOpen={setIsDefineScaleOpen}
                    updateFormData={(field, value) =>
                        updateFormData("defineScale", field, value)
                    }
                    data={formData.defineScale}
                    onContinue={handleDefineScaleUpdate}
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
            </DialogContent>
        </Dialog>
    );
};
