import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { DiscriminantAnalysisType } from "@/models/classify/discriminant/discriminant-worker";
import init from "@/src/wasm/pkg/wasm";
import { resultDiscriminant } from "@/services/analyze/classify/discriminant/discriminant-analysis-output";
import { transformDiscriminantResult } from "./discriminant-analysis-formatter";

export async function analyzeDiscriminant({
    configData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: DiscriminantAnalysisType) {
    await init();
    const GroupingVariable = configData.main.GroupingVariable
        ? [configData.main.GroupingVariable]
        : [];
    const IndependentVariables = configData.main.IndependentVariables || [];
    const SelectionVariable = configData.main.SelectionVariable
        ? [configData.main.SelectionVariable]
        : [];

    const slicedDataForGrouping = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: GroupingVariable,
    });

    const slicedDataForIndependent = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: IndependentVariables,
    });

    const slicedDataForSelection = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: SelectionVariable,
    });

    const varDefsForGrouping = getVarDefs(variables, GroupingVariable);
    const varDefsForIndependent = getVarDefs(variables, IndependentVariables);
    const varDefsForSelection = getVarDefs(variables, SelectionVariable);

    console.log(
        slicedDataForGrouping,
        slicedDataForIndependent,
        slicedDataForSelection,
        varDefsForGrouping,
        varDefsForIndependent,
        varDefsForSelection
    );

    // const da = new DiscriminantAnalysis(
    //     slicedDataForGrouping,
    //     slicedDataForIndependent,
    //     slicedDataForSelection,
    //     varDefsForGrouping,
    //     varDefsForIndependent,
    //     varDefsForSelection,
    //     configData
    // );

    // const results = da.get_results();
    // const executed = da.get_executed_functions();
    // const errors = da.get_all_errors();

    // console.log("executed", executed);
    // console.log("errors", errors);
    // console.log("results", results);

    // const formattedResults = transformDiscriminantResult(results);
    // console.log("formattedResults", formattedResults);

    // /*
    //  * 🎉 Final Result Process 🎯
    //  * */
    // await resultDiscriminant({
    //     addLog,
    //     addAnalytic,
    //     addStatistic,
    //     formattedResult: formattedResults ?? [],
    // });
}
