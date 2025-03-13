import { RepeatedMeasuresAnalysisType } from "@/models/general-linear-model/repeated-measures/repeated-measures-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeRepeatedMeasures({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: RepeatedMeasuresAnalysisType) {
    await init();
}
