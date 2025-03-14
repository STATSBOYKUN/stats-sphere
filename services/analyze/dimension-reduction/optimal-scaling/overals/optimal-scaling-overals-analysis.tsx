import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { OptScaOveralsAnalysisType } from "@/models/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeOptScaOverals({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: OptScaOveralsAnalysisType) {
    await init();

    const SetTargetVariable = tempData.main.SetTargetVariable || [];
    const PlotsTargetVariable = tempData.main.PlotsTargetVariable || [];

    const slicedDataForSetTarget = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: SetTargetVariable,
    });

    const slicedDataForPlotsTarget = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: PlotsTargetVariable,
    });

    const varDefsForSetTarget = getVarDefs(variables, SetTargetVariable);
    const varDefsForPlotsTarget = getVarDefs(variables, PlotsTargetVariable);
}
