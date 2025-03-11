// hooks/editActions.ts

export type EditActionType =
    | "Undo"
    | "Redo"
    | "Cut"
    | "Copy"
    | "CopyWithVariableNames"
    | "CopyWithVariableLabels"
    | "Paste"
    | "PasteVariables"
    | "PasteWithVariableNames";

interface EditActionPayload {
    actionType: EditActionType;
}

export const useEditActions = () => {
    const handleAction = async ({ actionType }: EditActionPayload) => {
        switch (actionType) {
            case "Undo":
            case "Redo":
            case "Cut":
            case "Copy":
            case "CopyWithVariableNames":
            case "CopyWithVariableLabels":
            case "Paste":
            case "PasteVariables":
            case "PasteWithVariableNames":
                console.warn("Action not yet implemented:", actionType);
                break;
            default:
                console.warn("Unknown edit action:", actionType);
        }
    };

    return { handleAction };
};