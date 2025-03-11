import {getSlicedData, getVarDefs} from "@/hooks/useVariable";
import {DiscriminantAnalysisType} from "@/models/classify/discriminant/discriminant-worker";
import init, {DiscriminantAnalysisWasm} from "@/src/wasm/pkg/wasm";
import {convertStatisticalData} from "@/services/analyze/classify/discriminant/discriminant-analysis-formatter";
import {resultDiscriminant} from "@/services/analyze/classify/discriminant/discriminant-analysis-output";

export async function analyzeDiscriminant({
                                              tempData,
                                              dataVariables,
                                              variables,
                                              addLog,
                                              addAnalytic,
                                              addStatistic
                                          }: DiscriminantAnalysisType) {
    await init();
    const GroupingVariable = tempData.main.GroupingVariable ? [tempData.main.GroupingVariable] : [];
    const IndependentVariables = tempData.main.IndependentVariables || [];
    const SelectionVariable = tempData.main.SelectionVariable ? [tempData.main.SelectionVariable] : [];

    const slicedDataForGrouping = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: GroupingVariable
    });

    const slicedDataForIndependent = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: IndependentVariables
    });

    const slicedDataForSelection = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: SelectionVariable
    });

    const varDefsForGrouping = getVarDefs(variables, GroupingVariable);
    const varDefsForIndependent = getVarDefs(variables, IndependentVariables);
    const varDefsForSelection = getVarDefs(variables, SelectionVariable);

    const da = new DiscriminantAnalysisWasm(
        slicedDataForGrouping,
        slicedDataForIndependent,
        tempData.defineRange.minRange ?? 0,
        tempData.defineRange.maxRange ?? 0,
        null
    );

    da.compute_canonical_discriminant_functions();
    da.cross_validate();

    const results = da.get_results();
    console.log(results);
    const caseProcessingSummary = convertStatisticalData(results);
    console.log(caseProcessingSummary.tables[0]);

    /*
     * 🧩 Analysis Case Process 🧩
     */
    // const caseProcessingSummary = convertStatisticalData(results, "caseProcessingSummary");

    /*
     * 📊 Group Statistics Process 📊
     */
    // const groupStatistics = convertStatisticalData(results, "groupStatistics");

    /*
     * 📊 Homogeneity Test Process 📊
     */
    // const testsOfEquality = convertStatisticalData(results, "testsOfEquality");
    // const pooledMatrices = convertStatisticalData(results, "pooledMatrices");
    // const covarianceMatrices = convertStatisticalData(results, "covarianceMatrices");

    /*
     * 🔍 Box’s M Test Process 🔍
     */
    // const boxTestLogDeterminants = convertStatisticalData(results, "boxTestLogDeterminants");
    // const boxTestResults = convertStatisticalData(results, "boxTestResults");

    /*
     * 📜 Summary Canonical Process 📜
     */
    // const eigenvaluesTable = convertStatisticalData(results, "eigenvaluesTable");
    // const wilksLambdaTable = convertStatisticalData(results, "wilksLambdaTable");

    /*
     * 🛠️ Standardized Function Process 🛠️
     */
    // const stdCoefficientsTable = convertStatisticalData(results, "stdCoefficientsTable");
    // const structureMatrixTable = convertStatisticalData(results, "structureMatrixTable");

    /*
     * 🎯 Function Group Centroids Process 🎯
     */
    // const groupCentroidsTable = convertStatisticalData(results, "groupCentroidsTable");
    // const classificationResultsTable = convertStatisticalData(results, "classificationResultsTable");

    /*
    * 🎉 Final Result Process 🎯
    * */
    // await resultDiscriminant({
    //     addLog, addAnalytic, addStatistic,
    //     caseProcessingSummary,
    //     groupStatistics,
    //     testsOfEquality,
    //     pooledMatrices,
    //     covarianceMatrices,
    //     boxTestLogDeterminants,
    //     boxTestResults,
    //     eigenvaluesTable,
    //     wilksLambdaTable,
    //     stdCoefficientsTable,
    //     structureMatrixTable,
    //     groupCentroidsTable,
    //     classificationResultsTable
    // });
}

