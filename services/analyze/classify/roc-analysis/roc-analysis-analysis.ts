import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { RocAnalysisAnalysisType } from "@/models/classify/roc-analysis/roc-analysis-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeRocAnalysis({
    configData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: RocAnalysisAnalysisType) {
    await init();

    const TestVariables = configData.main.TestTargetVariable || [];
    const StateVariable = configData.main.StateTargetVariable
        ? [configData.main.StateTargetVariable]
        : [];
    const TargetGroupVariable = configData.main.TargetGroupVar
        ? [configData.main.TargetGroupVar]
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

    console.log(configData);

    // const rocAnalysis = new RocAnalysis(
    //     slicedDataForTest,
    //     slicedDataForState,
    //     slicedDataForTargetGroup,
    //     varDefsForTest,
    //     varDefsForState,
    //     varDefsForTargetGroup,
    //     configData
    // );

    // const result = rocAnalysis.get_results();
    // const error = rocAnalysis.get_all_errors();

    // console.log("result", result);
    // console.log("error", error);

    /*
     * 1. Case Processing Summary
     * 2. ROC Curve
     * 3. Precission-Recall Curve
     * 4. Area Under the ROC Curve
     * 5. Classifier Evaluation Metrics
     * 6. Independent-Group Area Difference Under the ROC Curve
     * 7. Overall Model Quality
     * 8. Coordinates of the ROC Curve
     * 9. Coordinates of the Precision-Recall Curve
     */
}
