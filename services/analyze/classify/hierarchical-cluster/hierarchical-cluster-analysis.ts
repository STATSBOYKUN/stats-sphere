import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { HierClusAnalysisType } from "@/models/classify/hierarchical-cluster/hierarchical-cluster-worker";
import init, { HierarchicalCluster } from "@/src/wasm/pkg/wasm";
import { convertClusteringData } from "./hierarchical-cluster-analysis-formatter";
import { resultHierClus } from "./hierarchical-cluster-analysis-output";

export async function analyzeHierClus({
    configData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: HierClusAnalysisType) {
    await init();

    const ClusterVariables = configData.main.Variables || [];

    const LabelCasesVariable = configData.main.LabelCases
        ? [configData.main.LabelCases]
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

    console.log(configData);

    const hc = new HierarchicalCluster(
        slicedDataForCluster,
        slicedDataForLabelCases,
        varDefsForCluster,
        varDefsForLabelCases,
        configData
    );

    const results = hc.get_results();
    const error = hc.get_all_errors();

    console.log("Results:", results);
    console.log("Errors:", error);

    // /*
    //  * 🎉 Final Result Process 🎯
    //  * */
    // await resultHierClus({
    //     addLog,
    //     addAnalytic,
    //     addStatistic,
    //     proximityMatrixTable: proximityMatrix,
    //     agglomerationScheduleTable: agglomerationSchedule,
    //     clusterMembershipTable: clusterMembership,
    // });
}
