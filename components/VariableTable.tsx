// components/VariableTable.tsx

"use client";

import React, { useMemo, useRef, useEffect } from 'react';
import { HotTable, HotTableClass } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { useVariableStore, VariableRow } from '@/stores/useVariableStore';
import Handsontable from 'handsontable';

registerAllModules();

export default function VariableTable() {
    const hotTableRef = useRef<HotTableClass | null>(null);

    const variables = useVariableStore((state) => state.variables);
    const updateVariable = useVariableStore((state) => state.updateVariable);
    const loadVariables = useVariableStore((state) => state.loadVariables);

    useEffect(() => {
        // Memuat data variabel dari Dexie.js saat komponen mount
        loadVariables();
    }, [loadVariables]);

    // Transform variables into data format for Handsontable
    const data = useMemo(() => {
        return variables.map((variable) => [
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

    // Define column headers
    const colHeaders = useMemo(() => [
        'Name',
        'Type',
        'Width',
        'Decimals',
        'Label',
        'Values',
        'Missing',
        'Columns',
        'Align',
        'Measure',
    ], []);

    // Define columns configuration with width
    const columns = useMemo(() => [
        {
            data: 0,
            type: 'text',
            width: 300,
        },
        {
            data: 1,
            type: 'dropdown',
            source: [
                'Numeric',
                'Comma',
                'Dot',
                'Scientific notation',
                'Date',
                'Dollar',
                'Custom currency',
                'String',
                'Restricted Numeric (integer with leading zeros)',
            ],
            strict: true,
            allowInvalid: false,
            width: 300,
        },
        {
            data: 2,
            type: 'numeric',
            numericFormat: {
                pattern: '0',
            },
            width: 150,
        },
        {
            data: 3,
            type: 'numeric',
            numericFormat: {
                pattern: '0',
            },
            width: 150,
        },
        {
            data: 4,
            type: 'text',
            width: 150,
        },
        {
            data: 5,
            type: 'text',
            width: 225,
        },
        {
            data: 6,
            type: 'text',
            width: 150,
        },
        {
            data: 7,
            type: 'text',
            width: 150,
        },
        {
            data: 8,
            type: 'dropdown',
            source: [
                'Left',
                'Right',
                'Center',
            ],
            width: 150,
        },
        {
            data: 9,
            type: 'dropdown',
            source: [
                'Scale',
                'Ordinal',
                'Nominal',
            ],
            strict: true,
            allowInvalid: false,
            width: 150,
        },
    ], []);

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

    const settings = useMemo(() => ({
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
    }), [data, colHeaders, columns]);

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
