// components/VariableTable.tsx

"use client";

import React, { useMemo, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';

// Register all Handsontable modules
registerAllModules();

export default function VariableTable() {
    const hotTableComponent = useRef(null);

    // Initialize data: 45 rows with default empty values
    const data = useMemo(() => {
        const defaultRow = [
            '', // Name
            '', // Type
            '', // Width
            '', // Decimals
            '', // Label
            '', // Values
            '', // Missing
            '', // Columns
            '', // Align
            ''  // Measure
        ];
        return Array.from({ length: 45 }, () => [...defaultRow]);
    }, []);

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
        'Measure'
    ], []);

    // Define columns configuration with width
    const columns = useMemo(() => [
        {
            data: 0,
            type: 'text',
            width: 300, // Lebar kolom Name
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
                'Restricted Numeric (integer with leading zeros)'
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
            width: 150, // Lebar kolom Missing
        },
        {
            data: 7,
            type: 'numeric',
            numericFormat: {
                pattern: '0',
            },
            width: 150, // Lebar kolom Columns
        },
        {
            data: 8,
            type: 'dropdown',
            source: [
                'Left',
                'Right',
                'Center'
            ],
            width: 150,
        },
        {
            data: 9,
            type: 'dropdown',
            source: [
                'Scale',
                'Ordinal',
                'Nominal'
            ],
            strict: true,
            allowInvalid: false,
            width: 150,
        },
    ], []);

    // Define table settings
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
        dropdownMenu: true,
        filters: true,
        manualRowMove: true,
        manualColumnMove: true,
        contextMenu: true,
    }), [data, colHeaders, columns]);

    return (
        <div className="flex-grow z-0 h-full w-full">
            <HotTable
                ref={hotTableComponent}
                settings={settings}
                className="h-full w-full"
            />
        </div>
    );
}
