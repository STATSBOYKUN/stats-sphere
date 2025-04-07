import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { FactorAnalysisType } from "@/models/dimension-reduction/factor/factor-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeFactor({
    configData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: FactorAnalysisType) {
    await init();

    const targetVariables = configData.main.TargetVar || [];
    const valueTarget = configData.main.ValueTarget
        ? [configData.main.ValueTarget]
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

    console.log(configData);

    // const factor = new FactorAnalysis(
    //     slicedDataForTarget,
    //     slicedDataForValue,
    //     varDefsForTarget,
    //     varDefsForValue,
    //     configData
    // );

    // const result = factor.get_results();
    // const error = factor.get_all_errors();

    // console.log(result);
    // console.log(error);
}
