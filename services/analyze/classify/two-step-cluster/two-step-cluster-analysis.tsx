import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { TwoStepClusterAnalysisType } from "@/models/classify/two-step-cluster/two-step-cluste-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeTwoStepCluster({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: TwoStepClusterAnalysisType) {
    await init();

    const CategoricalVariables = tempData.main.CategoricalVar || [];
    const ContinousVariables = tempData.main.ContinousVar || [];

    const slicedDataForCategorical = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: CategoricalVariables,
    });

    const slicedDataForContinous = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: ContinousVariables,
    });

    const varDefsForCategorical = getVarDefs(variables, CategoricalVariables);
    const varDefsForContinous = getVarDefs(variables, ContinousVariables);
}
