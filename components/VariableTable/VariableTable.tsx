// components/VariableTable.tsx

"use client";

import React, { useMemo, useRef, useEffect } from 'react';
import { HotTable, HotTableClass } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { useVariableStore, VariableRow } from '@/stores/useVariableStore';
import Handsontable from 'handsontable';
import {colHeaders, columns} from "@/components/VariableTable/variableTableConfig";

registerAllModules();

export default function VariableTable() {
    const hotTableRef = useRef<HotTableClass | null>(null);

    const variables = useVariableStore((state: { variables: any; }) => state.variables);
    const updateVariable = useVariableStore((state: { updateVariable: any; }) => state.updateVariable);
    const loadVariables = useVariableStore((state: { loadVariables: any; }) => state.loadVariables);

    const totalColumns = 45;

    useEffect(() => {
        loadVariables(totalColumns);
    }, [loadVariables, totalColumns]);

    const data = useMemo(() => {
        return variables.map((variable: { name: any; type: any; width: any; decimals: any; label: any; values: any; missing: any; columns: any; align: any; measure: any; }) => [
            variable.name,
            variable.type,
            variable.width,
            variable.decimals,
            variable.label,
            variable.values,
            variable.missing,
            variable.columns,
            variable.align,
            variable.measure,
        ]);
    }, [variables]);

    const handleAfterChange = (
        changes: Handsontable.CellChange[] | null,
        source: Handsontable.ChangeSource
    ) => {
        if (source === 'loadData' || !changes) {
            return;
        }

        changes.forEach(([row, prop, oldValue, newValue]) => {
            if (newValue !== oldValue) {
                const fieldIndex = typeof prop === 'number' ? prop : parseInt(prop);
                const fieldName = [
                    'name',
                    'type',
                    'width',
                    'decimals',
                    'label',
                    'values',
                    'missing',
                    'columns',
                    'align',
                    'measure',
                ][fieldIndex] as keyof VariableRow;

                updateVariable(row, fieldName, newValue);
            }
        });
    };


    const settings = useMemo(
        () => ({
            licenseKey: 'non-commercial-and-evaluation',
            data: data,
            colHeaders: colHeaders,
            columns: columns,
            rowHeaders: true,
            width: '100%',
            height: '100%',
            autoWrapRow: true,
            autoWrapCol: true,
            contextMenu: true,
            afterChange: handleAfterChange,
        }),
        [data]
    );

    return (
        <div className="flex-grow z-0 h-full w-full">
            <HotTable
                ref={hotTableRef}
                settings={settings}
                className="h-full w-full"
            />
        </div>
    );
}
