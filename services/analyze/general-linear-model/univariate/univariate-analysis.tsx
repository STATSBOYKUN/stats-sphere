import { UnivariateAnalysisType } from "@/models/general-linear-model/univariate/univariate-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeUnivariate({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: UnivariateAnalysisType) {
    await init();
}
