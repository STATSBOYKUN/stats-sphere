import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { RepeatedMeasuresAnalysisType } from "@/models/general-linear-model/repeated-measures/repeated-measures-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeRepeatedMeasures({
    configData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: RepeatedMeasuresAnalysisType) {
    await init();

    const SubjectVariables = configData.main.SubVar || [];
    const FactorsVariables = configData.main.FactorsVar || [];
    const CovariateVariables = configData.main.Covariates || [];

    const slicedDataForSubject = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: SubjectVariables,
    });

    const slicedDataForFactors = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: FactorsVariables,
    });

    const slicedDataForCovariate = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: CovariateVariables,
    });

    const varDefsForSubject = getVarDefs(variables, SubjectVariables);
    const varDefsForFactors = getVarDefs(variables, FactorsVariables);
    const varDefsForCovariate = getVarDefs(variables, CovariateVariables);
}
