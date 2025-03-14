import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { RocAnalysisAnalysisType } from "@/models/classify/roc-analysis/roc-analysis-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeRocAnalysis({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: RocAnalysisAnalysisType) {
    await init();

    const TestVariables = tempData.main.TestTargetVariable || [];
    const StateVariable = tempData.main.StateTargetVariable
        ? [tempData.main.StateTargetVariable]
        : [];
    const TargetGroupVariable = tempData.main.TargetGroupVar
        ? [tempData.main.TargetGroupVar]
        : [];

    const slicedDataForTest = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: TestVariables,
    });

    const slicedDataForState = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: StateVariable,
    });

    const slicedDataForTargetGroup = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: TargetGroupVariable,
    });

    const varDefsForTest = getVarDefs(variables, TestVariables);
    const varDefsForState = getVarDefs(variables, StateVariable);
    const varDefsForTargetGroup = getVarDefs(variables, TargetGroupVariable);
}
