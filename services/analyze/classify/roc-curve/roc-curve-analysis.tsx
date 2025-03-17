import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { RocCurveAnalysisType } from "@/models/classify/roc-curve/roc-curve-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeRocCurve({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: RocCurveAnalysisType) {
    await init();

    const TestVariables = tempData.main.TestTargetVariable || [];
    const StateVariable = tempData.main.StateTargetVariable
        ? [tempData.main.StateTargetVariable]
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

    const varDefsForTest = getVarDefs(variables, TestVariables);
    const varDefsForState = getVarDefs(variables, StateVariable);

    /*
     * 1. Case Processing Summary
     * 2. ROC Curve
     * 3. Area Under the Curve
     * 4. Coordinates of the Curve
     */
}
