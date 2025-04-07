import { HierClusFinalResultType } from "@/models/classify/hierarchical-cluster/hierarchical-cluster-worker";

export async function resultHierClus({
    addLog,
    addAnalytic,
    addStatistic,
    proximityMatrixTable,
    agglomerationScheduleTable,
    clusterMembershipTable,
}: HierClusFinalResultType) {
    try {
        const discriminantResult = async () => {
            /*
             * 🎉 Title Result 🎉
             * */
            const titleMessage = "Hierarchical Cluster Analysis";
            const logId = await addLog({ log: titleMessage });
            const analyticId = await addAnalytic({
                log_id: logId,
                title: `Hierarchical Cluster Analysis Result`,
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

            /*
             * 📊 Proximity Matrix Result 📊
             * * */
            const proximityMatrixId = await addAnalytic({
                log_id: logId,
                title: `Proximity Matrix`,
                note: "",
            });

            const proximityMatrixTableId = await addStatistic({
                analytic_id: proximityMatrixId,
                title: `Proximity Matrix`,
                output_data: proximityMatrixTable,
                components: `Proximity Matrix`,
            });

            /*
             * 📊 Agglomeration Schedule Result 📊
             * * */
            const agglomerationScheduleId = await addAnalytic({
                log_id: logId,
                title: `Agglomeration Schedule`,
                note: "",
            });

            const agglomerationScheduleTableId = await addStatistic({
                analytic_id: agglomerationScheduleId,
                title: `Agglomeration Schedule`,
                output_data: agglomerationScheduleTable,
                components: `Agglomeration Schedule`,
            });

            /*
             * 📊 Cluster Membership Result 📊
             * * */
            const clusterMembershipId = await addAnalytic({
                log_id: logId,
                title: `Cluster Membership`,
                note: "",
            });

            const clusterMembershipTableId = await addStatistic({
                analytic_id: clusterMembershipId,
                title: `Cluster Membership`,
                output_data: clusterMembershipTable,
                components: `Cluster Membership`,
            });
        };

        discriminantResult();
    } catch (e) {
        console.error(e);
    }
}
