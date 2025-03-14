import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { FactorAnalysisType } from "@/models/dimension-reduction/factor/factor-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeFactor({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: FactorAnalysisType) {
    await init();

    const targetVariables = tempData.main.TargetVar || [];
    const valueTarget = tempData.main.ValueTarget
        ? [tempData.main.ValueTarget]
        : [];

    const slicedDataForTarget = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: targetVariables,
    });

    const slicedDataForValue = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: valueTarget,
    });

    const varDefsForTarget = getVarDefs(variables, targetVariables);
    const varDefsForValue = getVarDefs(variables, valueTarget);
}
