import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { KMeansClusterAnalysisType } from "@/models/classify/k-means-cluster/k-means-cluster-worker";
import init from "@/src/wasm/pkg/wasm";
import { convertClusterAnalysisData } from "./k-means-cluster-analysis-formatter";
import { resultKMeans } from "./k-means-cluster-analysis-output";

export async function analyzeKMeansCluster({
    configData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: KMeansClusterAnalysisType) {
    await init();

    const TargetVariables = configData.main.TargetVar || [];
    const CaseTargetVariable = configData.main.CaseTarget
        ? [configData.main.CaseTarget]
        : [];

    const slicedDataForTarget = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: TargetVariables,
    });

    const slicedDataForCaseTarget = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: CaseTargetVariable,
    });

    const varDefsForTarget = getVarDefs(variables, TargetVariables);
    const varDefsForCaseTarget = getVarDefs(variables, CaseTargetVariable);
    console.log(configData);

    // console.log({
    //     configData,
    //     slicedDataForTarget,
    //     slicedDataForCaseTarget,
    //     varDefsForTarget,
    //     varDefsForCaseTarget,
    // });

    // const kmeans = new KMeansClusteringWasm(
    //     configData,
    //     slicedDataForTarget,
    //     slicedDataForCaseTarget,
    //     varDefsForTarget,
    //     varDefsForCaseTarget
    // );

    // kmeans.perform_analysis();
    // const results = kmeans.get_results();
    // const formattedResults = convertClusterAnalysisData(results);

    // /*
    //  * 📊 Initial Cluster Centers 📊
    //  */
    // const initialClusterCentersTable = JSON.stringify({
    //     tables: [formattedResults.tables[1]],
    // });

    // /*
    //  * 📈 Iteration History 📈
    //  */
    // const iterationHistoryTable = JSON.stringify({
    //     tables: [formattedResults.tables[2]],
    // });

    // /*
    //  * 🧩 Final Cluster Centers 🧩
    //  */
    // const finalClusterCentersTable = JSON.stringify({
    //     tables: [formattedResults.tables[3]],
    // });

    // /*
    //  * 📊 Number of Cases 📊
    //  */
    // const numberOfCasesTable = JSON.stringify({
    //     tables: [formattedResults.tables[4]],
    // });

    // /*
    //  * 📊 Cluster Membership 📊
    //  */
    // const clusterMembershipTable = JSON.stringify({
    //     tables: [formattedResults.tables[5]],
    // });

    // /*
    //  * 📊 Cluster Statistics 📊
    //  */
    // const clusterStatisticsTable = JSON.stringify({
    //     tables: [formattedResults.tables[6]],
    // });

    // /*
    //  * Distances from Cluster Centers
    //  */
    // const distancesFromClusterCentersTable = JSON.stringify({
    //     tables: [formattedResults.tables[0]],
    // });

    // /*
    //  * 🎉 Final Result Process 🎯
    //  * */
    // await resultKMeans({
    //     addLog,
    //     addAnalytic,
    //     addStatistic,
    //     initialClusterCentersTable,
    //     iterationHistoryTable,
    //     finalClusterCentersTable,
    //     numberOfCasesTable,
    //     clusterMembershipTable,
    //     clusterStatisticsTable,
    //     distancesFromClusterCentersTable,
    // });
}
