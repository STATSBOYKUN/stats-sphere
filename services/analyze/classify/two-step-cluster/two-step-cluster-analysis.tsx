import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { TwoStepClusterAnalysisType } from "@/models/classify/two-step-cluster/two-step-cluste-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeTwoStepCluster({
    configData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: TwoStepClusterAnalysisType) {
    await init();

    const CategoricalVariables = configData.main.CategoricalVar || [];
    const ContinousVariables = configData.main.ContinousVar || [];

    const slicedDataForCategorical = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: CategoricalVariables,
    });

    const slicedDataForContinous = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: ContinousVariables,
    });

    const varDefsForCategorical = getVarDefs(variables, CategoricalVariables);
    const varDefsForContinous = getVarDefs(variables, ContinousVariables);

    console.log(configData);

    // const twostep = new TwoStepClusterAnalysis(
    //     slicedDataForCategorical,
    //     slicedDataForContinous,
    //     varDefsForCategorical,
    //     varDefsForContinous,
    //     configData
    // );

    // const result = twostep.get_results();
    // const error = twostep.get_all_errors();

    // console.log(result);
    // console.log(error);
}
