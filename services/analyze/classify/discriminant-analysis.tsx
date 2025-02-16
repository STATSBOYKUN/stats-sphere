import {getSlicedData, getVarDefs} from "@/hooks/useVariable";
import {
    DiscriminantAnalysisType,
    DiscriminantFinalResultType
} from "@/models/classify/discriminant/discriminant-worker";
import init, {check_sliced_data} from "@/src/wasm/pkg/wasm";

export async function analyzeDiscriminant({
                                              tempData,
                                              dataVariables,
                                              variables,
                                              addLog,
                                              addAnalytic,
                                              addStatistic
                                          }: DiscriminantAnalysisType) {
    await init();
    const GroupingVariable = tempData.main.GroupingVariable ? [tempData.main.GroupingVariable] : [];
    const IndependentVariables = tempData.main.IndependentVariables || [];
    const SelectionVariable = tempData.main.SelectionVariable ? [tempData.main.SelectionVariable] : [];

    const slicedDataForGrouping = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: GroupingVariable
    });

    const slicedDataForIndependent = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: IndependentVariables
    });

    const slicedDataForSelection = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: SelectionVariable
    });

    const varDefsForGrouping = getVarDefs(variables, GroupingVariable);
    const varDefsForIndependent = getVarDefs(variables, IndependentVariables);
    const varDefsForSelection = getVarDefs(variables, SelectionVariable);

    /*
    * 🧩 Analysis Case Process 🧩
    * */
    const checkGroupingData = await analyzeCase(slicedDataForGrouping);
    const checkIndependentData = await analyzeCase(slicedDataForIndependent);
    const checkSelectionData = await analyzeCase(slicedDataForSelection);
    const allCheckData = [checkGroupingData, checkIndependentData, checkSelectionData];

    await resultDiscriminant({analysisCaseData: allCheckData, addLog, addAnalytic, addStatistic});

    /*
    * 📊 Group Statistics Process 📊
    * */


    /*
    * 🚀 Stepwise Statistics Process 🚀
    * */


    /*
    * 📜 Summary Canonical Process 📜
    * */


    /*
    * 🛠️ Standardized Function Process 🛠️
    * */


    /*
    * 🎯 Function Group Centroids Process 🎯
    * */


    /*
    * 🎉 Final Result Process 🎯
    * */


}

export async function analyzeCase(data: any[]) {
    const result = await check_sliced_data(data);
    const validCases = result.valid_cases;
    const excludedCases = result.excluded_cases;
    const totalCases = result.total_cases;

    return JSON.stringify({
        tables: [
            {
                title: "Case Processing Summary",
                columnHeaders: [
                    {header: "Unweighted Cases"},
                    {header: "N"},
                    {header: "Percent"}
                ],
                rows: [
                    {
                        rowHeader: ["Valid"],
                        value: [validCases, ((validCases / totalCases) * 100).toFixed(2)]
                    },
                    {
                        rowHeader: ["Excluded"],
                        value: [excludedCases, ((excludedCases / totalCases) * 100).toFixed(2)]
                    },
                    {
                        rowHeader: ["Total"],
                        value: [totalCases, "100"]
                    }
                ]
            }
        ]
    });
}

export async function resultDiscriminant({
                                             analysisCaseData,
                                             addLog,
                                             addAnalytic,
                                             addStatistic
                                         } : DiscriminantFinalResultType) {
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
                    title= 'Grouping Variable';
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

            console.log("🎉 Discriminant Analysis Result 🎉");

            /*
            * 📈 Group Statistics Result 📈
            * */


            /*
            * 🚀 Stepwise Statistics Result 🚀
            * */


            /*
            * 📜 Summary Canonical Result 📜
            * */


            /*
            * 🛠️ Standardized Function Result 🛠️
            * */


            /*
            * 🎯 Function Group Centroids Result 🎯
            * */
        }

        discriminantResult();
    } catch (e) {
        console.error(e);
    }
}