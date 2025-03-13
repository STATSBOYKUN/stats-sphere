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
}
