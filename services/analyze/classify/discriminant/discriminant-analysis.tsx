import {getSlicedData, getVarDefs} from "@/hooks/useVariable";
import {
    DiscriminantAnalysisSummaryCanonicalType,
    DiscriminantAnalysisType
} from "@/models/classify/discriminant/discriminant-worker";
import init, {discriminant_analysis, DiscriminantAnalysisWasm} from "@/src/wasm/pkg/wasm";
import {analyzeCase} from "@/services/analyze/classify/discriminant/discriminant-analysis-check-data";
import {groupStatistics} from "@/services/analyze/classify/discriminant/discriminant-analysis-groups-statistics";
import {resultDiscriminant} from "@/services/analyze/classify/discriminant/discriminant-analysis-output";

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
    // const checkGroupingData = await analyzeCase({data: slicedDataForGrouping});
    // const checkIndependentData = await analyzeCase({data: slicedDataForIndependent});
    // const checkSelectionData = await analyzeCase({data: slicedDataForSelection});
    // const allCheckData = [checkGroupingData, checkIndependentData, checkSelectionData];

    /*
    * 📊 Group Statistics Process 📊
    * */
    // const groupStatisticsData = await groupStatistics({
    //     groupData: slicedDataForGrouping,
    //     groupDefs: varDefsForGrouping,
    //     independentData: slicedDataForIndependent,
    //     independentDefs: varDefsForIndependent,
    //     minRange: tempData.defineRange.minRange,
    //     maxRange: tempData.defineRange.maxRange
    // });

    /*
    * 🚀 Stepwise Statistics Process 🚀
    * (Optional)
    * */


    /*
    * 📜 Summary Canonical Process 📜
    * */
    const summaryCanonicalData = await summaryCanonicalProcess({
        groupData: slicedDataForGrouping,
        independentData: slicedDataForIndependent,
        minRange: tempData.defineRange.minRange,
        maxRange: tempData.defineRange.maxRange
    });


    /*
    * 🛠️ Standardized Function Process 🛠️
    * */


    /*
    * 🎯 Function Group Centroids Process 🎯
    * */


    /*
    * 🎉 Final Result Process 🎯
    * */

    // await resultDiscriminant({
    //     analysisCaseData: allCheckData,
    //     groupStatisticsData: groupStatisticsData,
    //     addLog, addAnalytic, addStatistic
    // });
}

export async function summaryCanonicalProcess({
                                                    groupData,
                                                    independentData,
                                                    minRange,
                                                    maxRange
                                              } : DiscriminantAnalysisSummaryCanonicalType) {
    await init();
    // Prior probabilities (opsional)
    const priors = null;
    console.log(groupData, independentData, minRange, maxRange, priors);

    const da = new DiscriminantAnalysisWasm(groupData, independentData, minRange ?? 0, maxRange ?? 0, priors);
    da.compute_canonical_discriminant_functions();
    da.cross_validate();

    const results = da.get_results();
    console.log(results);

    return "Success";
}