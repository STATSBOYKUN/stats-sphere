import {DiscriminantFinalResultType} from "@/models/classify/discriminant/discriminant-worker";

export async function resultDiscriminant({
                                             analysisCaseData,
                                             groupStatisticsData,
                                             addLog,
                                             addAnalytic,
                                             addStatistic
                                         }: DiscriminantFinalResultType) {
    try {
        const discriminantResult = async () => {
            /*
            * 🎉 Title Result 🎉
            * */
            const titleMessage = "Discriminant Analysis";
            const logId = await addLog({log: titleMessage});
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

            for (let i = 0; i < analysisCaseData.length; i++) {
                let title;
                if (i === 0) {
                    title = 'Grouping Variable';
                } else if (i === 1) {
                    title = 'Independent Variables';
                } else {
                    title = 'Selection Variable';
                }

                const analyzeCaseTable = await addStatistic({
                    analytic_id: analyzeCaseId,
                    title: `${title}`,
                    output_data: analysisCaseData[i],
                    components: `${title}`,
                });
            }

            /*
            * 📈 Group Statistics Result 📈
            * */
            const groupStatisticsId = await addAnalytic({
                log_id: logId,
                title: `Group Statistics`,
                note: "",
            });

            const analyzeCaseTable = await addStatistic({
                analytic_id: groupStatisticsId,
                title: `Group Statistics`,
                output_data: groupStatisticsData,
                components: `Group Statistics`,
            });

            console.log("🎉 Discriminant Analysis Result 🎉");

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


            /*
            * 🛠️ Standardized Function Result 🛠️
            * */
            const standardizedFunctionId = await addAnalytic({
                log_id: logId,
                title: `Standardized Function`,
                note: "",
            });


            /*
            * 🎯 Function Group Centroids Result 🎯
            * */
            const functionGroupCentroidsId = await addAnalytic({
                log_id: logId,
                title: `Function Group Centroids`,
                note: "",
            });

        }

        discriminantResult();
    } catch (e) {
        console.error(e);
    }
}