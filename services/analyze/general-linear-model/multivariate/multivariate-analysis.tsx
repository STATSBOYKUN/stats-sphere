import { MultivariateAnalysisType } from "@/models/general-linear-model/multivariate/multivariate-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeMultivariate({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: MultivariateAnalysisType) {
    await init();
}
