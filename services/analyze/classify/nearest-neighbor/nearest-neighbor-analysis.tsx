import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { KNNAnalysisType } from "@/models/classify/nearest-neighbor/nearest-neighbor-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeKNN({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: KNNAnalysisType) {
    await init();

    const TargetVariable = tempData.main.DepVar ? [tempData.main.DepVar] : [];
    const FeaturesVariables = tempData.main.FeatureVar || [];
    const FocalCaseIdentifierVariable = tempData.main.FocalCaseIdenVar
        ? [tempData.main.FocalCaseIdenVar]
        : [];
    const CaseIdentifierVariable = tempData.main.CaseIdenVar
        ? [tempData.main.CaseIdenVar]
        : [];

    const slicedDataForTarget = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: TargetVariable,
    });

    const slicedDataForFeatures = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: FeaturesVariables,
    });

    const slicedDataForFocalCaseIdentifier = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: FocalCaseIdentifierVariable,
    });

    const slicedDataForCaseIdentifier = getSlicedData({
        dataVariables: dataVariables,
        variables: variables,
        selectedVariables: CaseIdentifierVariable,
    });

    const varDefsForTarget = getVarDefs(variables, TargetVariable);
    const varDefsForFeatures = getVarDefs(variables, FeaturesVariables);
    const varDefsForFocalCaseIdentifier = getVarDefs(
        variables,
        FocalCaseIdentifierVariable
    );
    const varDefsForCaseIdentifier = getVarDefs(
        variables,
        CaseIdentifierVariable
    );

    /*
     * 1. Case Processing Summary
     * 2. Feature Space
     * 3. Variable Importance
     * 4. Peers
     * 5. Nearest Neighbors Distances
     * 6. Quadrant Map
     * 7. Feature Selection
     * 8. K Selection
     * 9. Classification Table
     * 10. Error Summary
     */
}
