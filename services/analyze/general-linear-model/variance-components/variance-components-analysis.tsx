import { VarianceCompsAnalysisType } from "@/models/general-linear-model/variance-components/variance-components-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeVarianceComps({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: VarianceCompsAnalysisType) {
    await init();
}
