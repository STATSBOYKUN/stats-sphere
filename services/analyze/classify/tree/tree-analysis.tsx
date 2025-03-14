import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { TreeAnalysisType } from "@/models/classify/tree/tree-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeTree({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: TreeAnalysisType) {
    await init();

    const DependentVariable = tempData.main.DependentTargetVar
        ? [tempData.main.DependentTargetVar]
        : [];
    const IndependentVariables = tempData.main.IndependentTargetVar || [];
    const InfluenceVariable = tempData.main.InfluenceTargetVar
        ? [tempData.main.InfluenceTargetVar]
        : [];
    const slicedDataForDependent = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: DependentVariable,
    });

    const slicedDataForIndependent = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: IndependentVariables,
    });

    const slicedDataForInfluence = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: InfluenceVariable,
    });

    const varDefsForDependent = getVarDefs(variables, DependentVariable);
    const varDefsForIndependent = getVarDefs(variables, IndependentVariables);
    const varDefsForInfluence = getVarDefs(variables, InfluenceVariable);
}
