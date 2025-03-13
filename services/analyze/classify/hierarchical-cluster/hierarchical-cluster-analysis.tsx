import { HierClusAnalysisType } from "@/models/classify/hierarchical-cluster/hierarchical-cluster-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeHierClus({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: HierClusAnalysisType) {
    await init();
}
