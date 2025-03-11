// hooks/dataActions.ts
import { useDataStore } from "@/stores/useDataStore";
import { useVariableStore } from "@/stores/useVariableStore";

export type DataActionType =
    | "InsertVariable"
    | "InsertCases"
    | "Clear"
    | "New";

interface DataActionPayload {
    actionType: DataActionType;
}

export const useDataActions = () => {
    const handleAction = async ({ actionType }: DataActionPayload) => {
        switch (actionType) {
            case "New":
                useDataStore.getState().resetData();
                useVariableStore.getState().resetVariables();
                break;
            case "InsertVariable":
            case "InsertCases":
            case "Clear":
                console.warn("Action not yet implemented:", actionType);
                break;
            default:
                console.warn("Unknown data action:", actionType);
        }
    };

    return { handleAction };
};