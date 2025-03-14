import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { OptScaCatpcaAnalysisType } from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeOptScaCatpca({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: OptScaCatpcaAnalysisType) {
    await init();

    const AnalysisVariables = tempData.main.AnalysisVars || [];
    const SupplementVariables = tempData.main.SuppleVars || [];
    const LabelingVariables = tempData.main.LabelingVars || [];

    const slicedDataForAnalysis = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: AnalysisVariables,
    });

    const slicedDataForSupplement = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: SupplementVariables,
    });

    const slicedDataForLabeling = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: LabelingVariables,
    });

    const varDefsForAnalysis = getVarDefs(variables, AnalysisVariables);
    const varDefsForSupplement = getVarDefs(variables, SupplementVariables);
    const varDefsForLabeling = getVarDefs(variables, LabelingVariables);
}
