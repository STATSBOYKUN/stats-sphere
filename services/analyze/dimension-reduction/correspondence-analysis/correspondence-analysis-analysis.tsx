import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { CorrespondenceAnalysisType } from "@/models/dimension-reduction/correspondence-analysis/correspondence-analysis-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeCorrespondence({
    configData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: CorrespondenceAnalysisType) {
    await init();

    const RowVariable = configData.main.RowTargetVar
        ? [configData.main.RowTargetVar]
        : [];
    const ColVariable = configData.main.ColTargetVar
        ? [configData.main.ColTargetVar]
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

    console.log(configData);
}
