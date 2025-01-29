// components/DataTable.tsx
import React, { useRef, useMemo } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import { useDataTable } from '@/hooks/useDataTable';
import { useDataTableEvents } from '@/hooks/useDataTableEvents';
import { generateColumnConfig } from './ColumnConfig';
import { registerAllModules } from 'handsontable/registry';

registerAllModules();

export default function DataTable() {
    const hotTableRef = useRef(null);
    const { data, variables, updateCell, addVariable, getVariableByColumnIndex } = useDataTable();
    const { handleAfterValidate, handleAfterChange } = useDataTableEvents(
        hotTableRef, updateCell, getVariableByColumnIndex, addVariable
    );

    const colHeaders = useMemo(() => {
        return data[0]?.map((_, index) => {
            const variable = getVariableByColumnIndex(index);
            return variable?.name || `Var${index + 1}`;
        });
    }, [data, getVariableByColumnIndex]);

    const columns = useMemo(() => generateColumnConfig(data, getVariableByColumnIndex), [data, getVariableByColumnIndex]);

    return (
        <div className="h-full w-full">
            <HotTable
                ref={hotTableRef}
                data={data}
                colHeaders={colHeaders}
                columns={columns}
                rowHeaders={true}
                width="100%"
                height="100%"
                autoWrapRow={true}
                autoWrapCol={true}
                dropdownMenu={true}
                multiColumnSorting={true}
                filters={true}
                manualRowMove={true}
                customBorders={true}
                contextMenu= {['row_above', 'row_below', 'remove_row', 'clear_column', 'alignment']}
                licenseKey="non-commercial-and-evaluation"
                afterChange={handleAfterChange}
                afterValidate={handleAfterValidate}
                className="h-full w-full z-0"
            />
        </div>
    );
}
