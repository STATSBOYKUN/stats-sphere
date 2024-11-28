// hooks/useDataTableEvents.ts
import Handsontable from 'handsontable';

export const useDataTableEvents = (
    hotTableRef,
    updateCell,
    getVariableByColumnIndex,
    addVariable
) => {
    const handleAfterValidate = (
        isValid: boolean,
        value: any,
        row: number,
        prop: string | number,
        source: Handsontable.ChangeSource
    ) => {
        if (!isValid) {
            const hot = hotTableRef.current?.hotInstance;
            if (hot) {
                const oldValue = hot.getDataAtCell(row, prop);
                setTimeout(() => {
                    hot.setDataAtCell(row, prop, oldValue, 'invalid');
                }, 0);
            }
        }
    };

    const handleAfterChange = (
        changes: Handsontable.CellChange[] | null,
        source: Handsontable.ChangeSource
    ) => {
        if (source === 'loadData' || !changes || source === 'invalid') return;

        changes.forEach(([row, col, oldValue, newValue]) => {
            if (newValue !== oldValue) {
                const colIndex = col;
                const variable = getVariableByColumnIndex(colIndex);

                if (!variable) {
                    const isNumeric = !isNaN(Number(newValue));
                    const defaultVariable = {
                        columnIndex: colIndex,
                        name: `Var${colIndex + 1}`,
                        type: isNumeric ? 'Numeric' : 'String',
                        width: 8,
                        decimals: isNumeric ? 2 : 0,
                        label: '',
                        values: '',
                        missing: '',
                        columns: 200,
                        align: isNumeric ? 'right' : 'left',
                        measure: isNumeric ? 'Scale' : 'unknown',
                    };
                    addVariable(defaultVariable);
                }

                updateCell(row, colIndex, newValue);
            }
        });
    };

    return { handleAfterValidate, handleAfterChange };
};
