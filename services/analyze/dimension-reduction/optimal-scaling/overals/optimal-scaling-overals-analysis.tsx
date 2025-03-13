import { OptScaOveralsAnalysisType } from "@/models/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeOptScaOverals({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: OptScaOveralsAnalysisType) {
    await init();
}
