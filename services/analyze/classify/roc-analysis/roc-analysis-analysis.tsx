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
