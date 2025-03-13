import { OptScaMCAAnalysisType } from "@/models/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeOptScaMCA({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: OptScaMCAAnalysisType) {
    await init();
}
