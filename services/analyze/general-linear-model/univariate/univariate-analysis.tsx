import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
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

    const DependentVariables = tempData.main.DepVar || [];
    const FixFactorVariables = tempData.main.FixFactor || [];
    const CovariateVariables = tempData.main.Covar || [];
    const RandomFactorVariables = tempData.main.RandFactor || [];
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

    const slicedDataForRandomFactor = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: RandomFactorVariables,
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
    const varDefsForRandomFactor = getVarDefs(variables, RandomFactorVariables);
    const varDefsForCovariate = getVarDefs(variables, CovariateVariables);
    const varDefsForWlsWeight = getVarDefs(variables, WlsWeightVariable);
}
