import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { KMeansClusterAnalysisType } from "@/models/classify/k-means-cluster/k-means-cluster-worker";
import init, { KMeansClusteringWasm } from "@/src/wasm/pkg/wasm";

export async function analyzeKMeansCluster({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: KMeansClusterAnalysisType) {
    await init();

    const TargetVariables = tempData.main.TargetVar || [];
    const CaseTargetVariable = tempData.main.CaseTarget
        ? [tempData.main.CaseTarget]
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

    console.log({
        tempData,
        slicedDataForTarget,
        slicedDataForCaseTarget,
        varDefsForTarget,
        varDefsForCaseTarget,
    });

    const kmeans = new KMeansClusteringWasm(
        tempData,
        slicedDataForTarget,
        slicedDataForCaseTarget,
        varDefsForTarget,
        varDefsForCaseTarget
    );

    kmeans.perform_analysis();
    const results = kmeans.get_results();
    console.log(JSON.stringify(results));
}
