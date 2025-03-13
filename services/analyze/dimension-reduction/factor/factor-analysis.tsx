import { FactorAnalysisType } from "@/models/dimension-reduction/factor/factor.worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeFactor({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: FactorAnalysisType) {
    await init();
}
