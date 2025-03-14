import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
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

    const DependentVariables = tempData.main.DepVar || [];
    const FixFactorVariables = tempData.main.FixFactor || [];
    const CovariateVariables = tempData.main.Covar || [];
    const WlsWeightVariable = tempData.main.WlsWeight
        ? [tempData.main.WlsWeight]
        : [];

    const slicedDataForDependent = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: DependentVariables,
    });

    const slicedDataForFixFactor = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: FixFactorVariables,
    });

    const slicedDataForCovariate = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: CovariateVariables,
    });

    const slicedDataForWlsWeight = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: WlsWeightVariable,
    });

    const varDefsForDependent = getVarDefs(variables, DependentVariables);
    const varDefsForFixFactor = getVarDefs(variables, FixFactorVariables);
    const varDefsForCovariate = getVarDefs(variables, CovariateVariables);
    const varDefsForWlsWeight = getVarDefs(variables, WlsWeightVariable);
}
