import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { HierClusAnalysisType } from "@/models/classify/hierarchical-cluster/hierarchical-cluster-worker";
import init, { HierarchicalClusteringWasm } from "@/src/wasm/pkg/wasm";
import { convertClusteringData } from "./hierarchical-cluster-analysis-formatter";
import { json } from "d3";
import { resultHierClus } from "./hierarchical-cluster-analysis-output";

export async function analyzeHierClus({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: HierClusAnalysisType) {
    await init();

    const ClusterVariables = tempData.main.Variables || [];

    const LabelCasesVariable = tempData.main.LabelCases
        ? [tempData.main.LabelCases]
        : [];

    const slicedDataForCluster = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: ClusterVariables,
    });

    const slicedDataForLabelCases = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: LabelCasesVariable,
    });

    const varDefsForCluster = getVarDefs(variables, ClusterVariables);
    const varDefsForLabelCases = getVarDefs(variables, LabelCasesVariable);

    const hc = new HierarchicalClusteringWasm(
        tempData,
        slicedDataForCluster,
        slicedDataForLabelCases,
        varDefsForCluster,
        varDefsForLabelCases
    );

    // perform anaylsis and etc
    hc.perform_analysis();

    // get results
    const results = hc.get_results();
    const formattedResults = convertClusteringData(results);

    /*
     * 🧩 Analysis Case Process 🧩
     */

    /*
     * 📊 Proximity Matrix 📊
     */
    const proximityMatrix = JSON.stringify({
        tables: [formattedResults.tables[1]],
    });

    /*
     * 📊 Aggloromeration Schedule 📊
     */
    const agglomerationSchedule = JSON.stringify({
        tables: [formattedResults.tables[2]],
    });

    /*
     * 📊 Cluster Membership 📊
     */
    const clusterMembership = JSON.stringify({
        tables: [formattedResults.tables[0]],
    });

    /*
     * 🎉 Final Result Process 🎯
     * */
    await resultHierClus({
        addLog,
        addAnalytic,
        addStatistic,
        proximityMatrixTable: proximityMatrix,
        agglomerationScheduleTable: agglomerationSchedule,
        clusterMembershipTable: clusterMembership,
    });
}
