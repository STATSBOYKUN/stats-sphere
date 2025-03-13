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
}
