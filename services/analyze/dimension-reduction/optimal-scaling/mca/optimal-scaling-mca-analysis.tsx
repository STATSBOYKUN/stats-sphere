import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { OptScaMCAAnalysisType } from "@/models/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeOptScaMCA({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: OptScaMCAAnalysisType) {
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
