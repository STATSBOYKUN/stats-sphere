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
}
