import { KMeansClusterAnalysisType } from "@/models/classify/k-means-cluster/k-means-cluster-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeKMeansCluster({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: KMeansClusterAnalysisType) {
    await init();
}
