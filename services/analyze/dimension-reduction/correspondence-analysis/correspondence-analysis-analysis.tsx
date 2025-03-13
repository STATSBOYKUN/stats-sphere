import { CorrespondenceAnalysisType } from "@/models/dimension-reduction/correspondence-analysis/correspondence-analysis-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeCorrespondence({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: CorrespondenceAnalysisType) {
    await init();
}
