// hooks/actions/index.ts
import { useDataActions, DataActionType } from './dataActions';
import { useEditActions, EditActionType } from './editActions';
import { useFileActions, FileActionType } from './fileActions';

// Combine all action types
export type ActionType =
    | DataActionType
    | EditActionType
    | FileActionType;

// Interface for the action payload
export interface ActionPayload {
    actionType: ActionType;
}

// Main actions hook that combines all action handlers
export const useActions = () => {
    const { handleAction: handleDataAction } = useDataActions();
    const { handleAction: handleEditAction } = useEditActions();
    const { handleAction: handleFileAction } = useFileActions();

    // Combined action handler that routes to the appropriate specific handler
    const handleAction = ({ actionType }: ActionPayload) => {
        // Data actions
        if (
            actionType === "New" ||
            actionType === "Clear" ||
            actionType === "InsertVariable" ||
            actionType === "InsertCases"
        ) {
            return handleDataAction({ actionType: actionType as DataActionType });
        }

        // File actions
        if (actionType === "Save") {
            return handleFileAction({ actionType: actionType as FileActionType });
        }

        // Edit actions - if it's not a data or file action, assume it's an edit action
        return handleEditAction({ actionType: actionType as EditActionType });
    };

    return { handleAction };
};

// Re-export individual action hooks for direct use if needed
export { useDataActions, useEditActions, useFileActions };
export type { DataActionType, EditActionType, FileActionType };