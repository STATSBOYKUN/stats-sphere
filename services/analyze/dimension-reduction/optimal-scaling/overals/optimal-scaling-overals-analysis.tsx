import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { OptScaOveralsAnalysisType } from "@/models/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeOptScaOverals({
    configData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: OptScaOveralsAnalysisType) {
    await init();

    const SetTargetVariable =
        configData?.main?.SetTargetVariable?.flat().map((variable) => {
            const match = variable.match(/^(\w+)/);
            return match ? match[1] : variable;
        }) || [];
    const PlotsTargetVariable = configData.main.PlotsTargetVariable || [];

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

    console.log(configData);
}
