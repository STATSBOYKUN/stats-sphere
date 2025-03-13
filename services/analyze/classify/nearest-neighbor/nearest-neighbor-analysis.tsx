import { KNNAnalysisType } from "@/models/classify/nearest-neighbor/nearest-neighbor-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeKNN({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: KNNAnalysisType) {
    await init();
}
