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

    // const kmeans = new KMeansClusterAnalysis(
    //     slicedDataForTarget,
    //     slicedDataForCaseTarget,
    //     varDefsForTarget,
    //     varDefsForCaseTarget,
    //     configData
    // );

    // const results = kmeans.get_results();
    // console.log("kmeans results", results);

    // kmeans.perform_analysis();
    // const formattedResults = convertClusterAnalysisData(results);

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
