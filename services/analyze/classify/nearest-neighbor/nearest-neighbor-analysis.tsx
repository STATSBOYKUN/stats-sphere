import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { KNNAnalysisType } from "@/models/classify/nearest-neighbor/nearest-neighbor-worker";
import init from "@/src/wasm/pkg/wasm";

export async function analyzeKNN({
    configData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: KNNAnalysisType) {
    await init();

    const TargetVariable = configData.main.DepVar
        ? [configData.main.DepVar]
        : [];
    const FeaturesVariables = configData.main.FeatureVar || [];
    const FocalCaseIdentifierVariable = configData.main.FocalCaseIdenVar
        ? [configData.main.FocalCaseIdenVar]
        : [];
    const CaseIdentifierVariable = configData.main.CaseIdenVar
        ? [configData.main.CaseIdenVar]
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

    console.log("slicedDataForTarget", slicedDataForTarget);
    console.log("slicedDataForFeatures", slicedDataForFeatures);
    console.log(
        "slicedDataForFocalCaseIdentifier",
        slicedDataForFocalCaseIdentifier
    );
    console.log("slicedDataForCaseIdentifier", slicedDataForCaseIdentifier);
    console.log("varDefsForTarget", varDefsForTarget);
    console.log("varDefsForFeatures", varDefsForFeatures);
    console.log("varDefsForFocalCaseIdentifier", varDefsForFocalCaseIdentifier);
    console.log("varDefsForCaseIdentifier", varDefsForCaseIdentifier);
    console.log("configData", configData);

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
