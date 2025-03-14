import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { DiscriminantAnalysisType } from "@/models/classify/discriminant/discriminant-worker";
import init, { DiscriminantAnalysisWasm } from "@/src/wasm/pkg/wasm";
import { convertStatisticalData } from "@/services/analyze/classify/discriminant/discriminant-analysis-formatter";
import { resultDiscriminant } from "@/services/analyze/classify/discriminant/discriminant-analysis-output";

export async function analyzeDiscriminant({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: DiscriminantAnalysisType) {
    await init();
    const GroupingVariable = tempData.main.GroupingVariable
        ? [tempData.main.GroupingVariable]
        : [];
    const IndependentVariables = tempData.main.IndependentVariables || [];
    const SelectionVariable = tempData.main.SelectionVariable
        ? [tempData.main.SelectionVariable]
        : [];

    const slicedDataForGrouping = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: GroupingVariable,
    });

    const slicedDataForIndependent = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: IndependentVariables,
    });

    const slicedDataForSelection = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: SelectionVariable,
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
    da.perform_stepwise_analysis();

    const results = da.get_results();
    const formattedResults = convertStatisticalData(results);

    /*
     * 🧩 Analysis Case Process 🧩
     */
    const caseProcessingSummary = JSON.stringify({
        tables: [formattedResults.tables[0]],
    });

    /*
     * 📊 Group Statistics Process 📊
     */
    const groupStatistics = JSON.stringify({
        tables: [formattedResults.tables[1]],
    });

    /*
     * 📊 Homogeneity Test Process 📊
     */
    const testsOfEquality = JSON.stringify({
        tables: [formattedResults.tables[2]],
    });

    const pooledMatrices = JSON.stringify({
        tables: [formattedResults.tables[3]],
    });

    const covarianceMatrices = JSON.stringify({
        tables: [formattedResults.tables[4]],
    });

    /*
     * 🔍 Box’s M Test Process 🔍
     */
    const boxTestLogDeterminants = JSON.stringify({
        tables: [formattedResults.tables[5]],
    });

    const boxTestResults = JSON.stringify({
        tables: [formattedResults.tables[6]],
    });

    /*
     * 📊 Stepwise Statistics (Optional) 📊
     */
    const variablesEnteredTable = JSON.stringify({
        tables: [formattedResults.tables[16]],
    });

    const variablesInAnalysisTable = JSON.stringify({
        tables: [formattedResults.tables[17]],
    });

    const variablesNotInAnalysisTable = JSON.stringify({
        tables: [formattedResults.tables[18]],
    });

    const wilksLambdaStepsTable = JSON.stringify({
        tables: [formattedResults.tables[19]],
    });

    const pairwiseGroupComparisonsTable = JSON.stringify({
        tables: [formattedResults.tables[20]],
    });

    /*
     * 📜 Summary Canonical Process 📜
     */
    const eigenvaluesTable = JSON.stringify({
        tables: [formattedResults.tables[7]],
    });

    const wilksLambdaTable = JSON.stringify({
        tables: [formattedResults.tables[8]],
    });

    /*
     * 🛠️ Standardized Function Process 🛠️
     */
    const stdCoefficientsTable = JSON.stringify({
        tables: [formattedResults.tables[9]],
    });

    const structureMatrixTable = JSON.stringify({
        tables: [formattedResults.tables[10]],
    });

    /*
     * 🎯 Function Group Centroids Process 🎯
     */
    const groupCentroidsTable = JSON.stringify({
        tables: [formattedResults.tables[11]],
    });

    /*
     * 🎯 Classification Results Process 🎯
     */
    const classificationResultsTable = JSON.stringify({
        tables: [formattedResults.tables[12]],
    });

    const classificationSummaryTable = JSON.stringify({
        tables: [formattedResults.tables[13]],
    });

    const priorProbabilitiesTable = JSON.stringify({
        tables: [formattedResults.tables[14]],
    });

    console.log(
        JSON.stringify({
            tables: [formattedResults.tables[14]],
        })
    );

    const classificationFunctionCoefficientsTable = JSON.stringify({
        tables: [formattedResults.tables[15]],
    });

    /*
     * 🎉 Final Result Process 🎯
     * */
    await resultDiscriminant({
        addLog,
        addAnalytic,
        addStatistic,
        caseProcessingSummary,
        groupStatistics,
        testsOfEquality,
        pooledMatrices,
        covarianceMatrices,
        boxTestLogDeterminants,
        boxTestResults,
        eigenvaluesTable,
        wilksLambdaTable,
        variablesEnteredTable,
        variablesInAnalysisTable,
        variablesNotInAnalysisTable,
        wilksLambdaStepsTable,
        pairwiseGroupComparisonsTable,
        stdCoefficientsTable,
        structureMatrixTable,
        groupCentroidsTable,
        classificationResultsTable,
        classificationSummaryTable,
        priorProbabilitiesTable,
        classificationFunctionCoefficientsTable,
    });
}
