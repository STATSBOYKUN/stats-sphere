import { OptScaCatpcaAnalysisType } from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeOptScaCatpca({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: OptScaCatpcaAnalysisType) {
    await init();
}
