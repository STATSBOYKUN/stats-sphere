import { TwoStepClusterAnalysisType } from "@/models/classify/two-step-cluster/two-step-cluste-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeTwoStepCluster({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: TwoStepClusterAnalysisType) {
    await init();
}
