import { DiscriminantFinalResultType } from "@/models/classify/discriminant/discriminant-worker";

export async function resultDiscriminant({
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
    stdCoefficientsTable,
    structureMatrixTable,
    groupCentroidsTable,
    classificationResultsTable,
    classificationSummaryTable,
    priorProbabilitiesTable,
    classificationFunctionCoefficientsTable,
}: DiscriminantFinalResultType) {
    try {
        const discriminantResult = async () => {
            /*
             * 🎉 Title Result 🎉
             * */
            const titleMessage = "Discriminant Analysis";
            const logId = await addLog({ log: titleMessage });
            const analyticId = await addAnalytic({
                log_id: logId,
                title: `Discriminant Analysis Result`,
                note: "",
            });

            /*
             * 📊 Analysis Case Result 📊
             * * */
            const analyzeCaseId = await addAnalytic({
                log_id: logId,
                title: `Analysis Case Processing Summary`,
                note: "",
            });

            const analyzeCaseTable = await addStatistic({
                analytic_id: analyzeCaseId,
                title: `Analyse Case Processing Summary`,
                output_data: caseProcessingSummary,
                components: `Analyse Case Processing Summary`,
            });

            /*
             * 📈 Group Statistics Result 📈
             * */
            const groupStatisticsId = await addAnalytic({
                log_id: logId,
                title: `Group Statistics`,
                note: "",
            });

            const groupCaseTable = await addStatistic({
                analytic_id: groupStatisticsId,
                title: `Group Statistics`,
                output_data: groupStatistics,
                components: `Group Statistics`,
            });

            /*
             * 📊 Tests of Equality Result 📊
             * */
            const testsOfEqualityId = await addAnalytic({
                log_id: logId,
                title: `Tests of Equality of Group Means`,
                note: "",
            });

            const testsOfEqualityTable = await addStatistic({
                analytic_id: testsOfEqualityId,
                title: `Tests of Equality of Group Means`,
                output_data: testsOfEquality,
                components: `Tests of Equality of Group Means`,
            });

            /*
             * 📈 Pooled Within-Group Covariance Matrices Result 📈
             * */
            const pooledMatricesId = await addAnalytic({
                log_id: logId,
                title: `Pooled Within-Group Covariance Matrices`,
                note: "",
            });

            const pooledMatricesTable = await addStatistic({
                analytic_id: pooledMatricesId,
                title: `Pooled Within-Group Covariance Matrices`,
                output_data: pooledMatrices,
                components: `Pooled Within-Group Covariance Matrices`,
            });

            /*
             * 📈 Covariance Matrices Result 📈
             * */
            const covarianceMatricesId = await addAnalytic({
                log_id: logId,
                title: `Covariance Matrices`,
                note: "",
            });

            const covarianceMatricesTable = await addStatistic({
                analytic_id: covarianceMatricesId,
                title: `Covariance Matrices`,
                output_data: covarianceMatrices,
                components: `Covariance Matrices`,
            });

            /*
             * 📊 Box's Test of Equality of Covariance Matrices Result 📊
             * */
            const boxTest = await addAnalytic({
                log_id: logId,
                title: `Box's Test of Equality of Covariance Matrices`,
                note: "",
            });

            const boxTestLogDeterminantsTable = await addStatistic({
                analytic_id: boxTest,
                title: `Box's Test of Equality of Covariance Matrices`,
                output_data: boxTestLogDeterminants,
                components: `Box's Test of Equality of Covariance Matrices`,
            });

            const boxTestResultsTable = await addStatistic({
                analytic_id: boxTest,
                title: `Box's Test of Equality of Covariance Matrices`,
                output_data: boxTestResults,
                components: `Box's Test of Equality of Covariance Matrices`,
            });

            /*
             * 🚀 Stepwise Statistics Result 🚀
             * */
            const stepwiseStatisticsId = await addAnalytic({
                log_id: logId,
                title: `Stepwise Statistics`,
                note: "",
            });

            /*
             * 📜 Summary Canonical Result 📜
             * */
            const summaryCanonicalId = await addAnalytic({
                log_id: logId,
                title: `Summary Canonical`,
                note: "",
            });

            const eigenvaluesTableId = await addStatistic({
                analytic_id: summaryCanonicalId,
                title: `Eigenvalues`,
                output_data: eigenvaluesTable,
                components: `Eigenvalues`,
            });

            const wilksLambdaTableId = await addStatistic({
                analytic_id: summaryCanonicalId,
                title: `Wilks' Lambda`,
                output_data: wilksLambdaTable,
                components: `Wilks' Lambda`,
            });

            /*
             * 🛠️ Standardized Function Result 🛠️
             * */
            const standardizedFunctionId = await addAnalytic({
                log_id: logId,
                title: `Standardized Function`,
                note: "",
            });

            const stdCoefficientsTableId = await addStatistic({
                analytic_id: standardizedFunctionId,
                title: `Standardized Coefficients`,
                output_data: stdCoefficientsTable,
                components: `Standardized Coefficients`,
            });

            const structureMatrixTableId = await addStatistic({
                analytic_id: standardizedFunctionId,
                title: `Structure Matrix`,
                output_data: structureMatrixTable,
                components: `Structure Matrix`,
            });

            /*
             * 🎯 Function Group Centroids Result 🎯
             * */
            const functionGroupCentroidsId = await addAnalytic({
                log_id: logId,
                title: `Function Group Centroids`,
                note: "",
            });

            const groupCentroidsTableId = await addStatistic({
                analytic_id: functionGroupCentroidsId,
                title: `Group Centroids`,
                output_data: groupCentroidsTable,
                components: `Group Centroids`,
            });

            /*
             * 🎯 Classification Results 🎯
             * */
            const classificationResultsId = await addAnalytic({
                log_id: logId,
                title: `Classification Results`,
                note: "",
            });

            const classificationSummaryTableId = await addStatistic({
                analytic_id: classificationResultsId,
                title: `Classification Processing Summary`,
                output_data: classificationSummaryTable,
                components: `Classification Processing Summary`,
            });

            const priorProbabilitiesTableId = await addStatistic({
                analytic_id: classificationResultsId,
                title: `Prior Probabilites for Groups`,
                output_data: priorProbabilitiesTable,
                components: `Prior Probabilites for Groups`,
            });

            const classificationFunctionCoefficientsTableId =
                await addStatistic({
                    analytic_id: classificationResultsId,
                    title: `Classification Function Coefficients`,
                    output_data: classificationFunctionCoefficientsTable,
                    components: `Classification Function Coefficients`,
                });

            const classificationResultsTableId = await addStatistic({
                analytic_id: classificationResultsId,
                title: `Classification Results`,
                output_data: classificationResultsTable,
                components: `Classification Results`,
            });
        };

        discriminantResult();
    } catch (e) {
        console.error(e);
    }
}
