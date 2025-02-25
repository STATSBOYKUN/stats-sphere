// components/DataTable.tsx
import React, { useRef, useEffect, useMemo } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import { useDataTable } from '@/app/data/hooks/useDataTable';
import { useDataTableEvents } from '@/hooks/useDataTableEvents';
import { generateColumnConfig } from './ColumnConfig';
import { registerAllModules } from 'handsontable/registry';

registerAllModules();

export default function DataTable() {
    const containerRef = useRef<HTMLDivElement>(null);
    const hotInstance = useRef<Handsontable | null>(null);
    const { data, nCases, nVars, updateCell, addVariable, getVariableByColumnIndex } = useDataTable();

    const { handleAfterValidate, handleAfterChange } = useDataTableEvents(
        containerRef,
        updateCell,
        getVariableByColumnIndex,
        addVariable
    );

    const colHeaders = useMemo(() => {
        return data[0]?.map((_: string, index: number) => {
            const variable = getVariableByColumnIndex(index);
            return variable?.name || `Var${index + 1}`;
        });
    }, [data, getVariableByColumnIndex]);

    const columns = useMemo(
        () => generateColumnConfig(data, getVariableByColumnIndex),
        [data, getVariableByColumnIndex]
    );

    const settings = useMemo(
        () => ({
            data,
            colHeaders,
            columns,
            rowHeaders: true,
            width: '100%',
            height: '100%',
            autoWrapRow: true,
            autoWrapCol: true,
            dropdownMenu: true,
            multiColumnSorting: true,
            filters: true,
            manualRowMove: true,
            customBorders: true,
            contextMenu: ['row_above', 'row_below', 'remove_row', 'clear_column', 'alignment'] as any,
            licenseKey: 'non-commercial-and-evaluation',
            minSpareRows: 1,
            minSpareCols: 1,
            afterChange: handleAfterChange,
            afterValidate: handleAfterValidate,
        }),
        [data, colHeaders, columns, handleAfterChange, handleAfterValidate]
    );

    useEffect(() => {
        if (containerRef.current) {
            if (!hotInstance.current) {
                hotInstance.current = new Handsontable(containerRef.current, settings);
            } else if (!hotInstance.current.isDestroyed) {
                hotInstance.current.updateSettings(settings);
            }
        }
    }, [settings]);

    useEffect(() => {
        return () => {
            if (hotInstance.current) {
                hotInstance.current.destroy();
                hotInstance.current = null;
            }
        };
    }, []);

    return (
        <div className="h-full w-full">
            <div ref={containerRef} className="h-full w-full z-0" />
        </div>
    );
}
