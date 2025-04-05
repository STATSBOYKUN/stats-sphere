import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { RocCurveAnalysisType } from "@/models/classify/roc-curve/roc-curve-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeRocCurve({
    configData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: RocCurveAnalysisType) {
    await init();

    const TestVariables = configData.main.TestTargetVariable || [];
    const StateVariable = configData.main.StateTargetVariable
        ? [configData.main.StateTargetVariable]
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

    console.log(configData);

    // const rocCurve = new RocCurve(
    //     slicedDataForTest,
    //     slicedDataForState,
    //     varDefsForTest,
    //     varDefsForState,
    //     configData
    // );

    // const result = rocCurve.get_results();
    // const error = rocCurve.get_all_errors();

    // console.log("result", result);
    // console.log("error", error);

    /*
     * 1. Case Processing Summary
     * 2. ROC Curve
     * 3. Area Under the Curve
     * 4. Coordinates of the Curve
     */
}
