import {getSlicedData, getVarDefs} from "@/hooks/useVariable";
import {DiscriminantAnalysisType} from "@/models/classify/discriminant/discriminant-worker";

export function analyzeDiscriminant({ tempData, dataVariables, variables }: DiscriminantAnalysisType) {
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


    return "Success"
}