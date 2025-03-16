import { KMeansClusterFinalResultType } from "@/models/classify/k-means-cluster/k-means-cluster-worker";

export async function resultKMeans({
    addLog,
    addAnalytic,
    addStatistic,
    initialClusterCentersTable,
    iterationHistoryTable,
    finalClusterCentersTable,
    numberOfCasesTable,
    clusterMembershipTable,
    clusterStatisticsTable,
    distancesFromClusterCentersTable,
}: KMeansClusterFinalResultType) {
    try {
        const discriminantResult = async () => {
            /*
             * 🎉 Title Result 🎉
             * */
            const titleMessage = "K-Means Cluster Analysis";
            const logId = await addLog({ log: titleMessage });
            const analyticId = await addAnalytic({
                log_id: logId,
                title: `K-Means Cluster Analysis Result`,
                note: "",
            });

            /*
             * 📊 Analysis Case Result 📊
             * * */
            const analyzeCaseId = await addAnalytic({
                log_id: logId,
                title: `Case Processing Summary`,
                note: "",
            });

            // const analyzeCaseTable = await addStatistic({
            //     analytic_id: analyzeCaseId,
            //     title: `Analyse Case Processing Summary`,
            //     output_data: caseProcessingSummary,
            //     components: `Analyse Case Processing Summary`,
            // });
        };

        discriminantResult();
    } catch (e) {
        console.error(e);
    }
}
