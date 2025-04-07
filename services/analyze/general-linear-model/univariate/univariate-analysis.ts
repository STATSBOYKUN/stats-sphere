import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { UnivariateAnalysisType } from "@/models/general-linear-model/univariate/univariate-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeUnivariate({
    configData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: UnivariateAnalysisType) {
    await init();

    const DependentVariables = configData.main.DepVar || [];
    const FixFactorVariables = configData.main.FixFactor || [];
    const CovariateVariables = configData.main.Covar || [];
    const RandomFactorVariables = configData.main.RandFactor || [];
    const WlsWeightVariable = configData.main.WlsWeight
        ? [configData.main.WlsWeight]
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

    console.log(configData);

    // const univariate = new UnivariateAnalysis(
    //     slicedDataForDependent,
    //     slicedDataForFixFactor,
    //     slicedDataForRandomFactor,
    //     slicedDataForCovariate,
    //     slicedDataForWlsWeight,
    //     varDefsForDependent,
    //     varDefsForFixFactor,
    //     varDefsForRandomFactor,
    //     varDefsForCovariate,
    //     varDefsForWlsWeight,
    //     configData
    // );

    // const result = univariate.get_results();
    // const error = univariate.get_all_errors();

    // console.log(result);
    // console.log(error);
}
