import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
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

    const RowVariable = tempData.main.RowTargetVar
        ? [tempData.main.RowTargetVar]
        : [];
    const ColVariable = tempData.main.ColTargetVar
        ? [tempData.main.ColTargetVar]
        : [];

    const slicedDataForRow = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: RowVariable,
    });

    const slicedDataForCol = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: ColVariable,
    });

    const varDefsForRow = getVarDefs(variables, RowVariable);
    const varDefsForCol = getVarDefs(variables, ColVariable);
}
