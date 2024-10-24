// components/DataTable.tsx

"use client";

import React, { useMemo, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.min.css';

export default function DataTable() {
    const hotTableComponent = useRef(null);

    // Initialize empty data: 100 rows x 45 columns
    const data = useMemo(() => {
        return Array.from({ length: 100 }, () => Array(45).fill(''));
    }, []);

    // Generate column headers: A, B, C, ..., AD
    const colHeaders = useMemo(() => {
        const headers = [];
        for (let i = 0; i < 45; i++) { // Adjusted to 45 to match columns
            let column = '';
            let temp = i;
            do {
                column = String.fromCharCode(65 + (temp % 26)) + column;
                temp = Math.floor(temp / 26) - 1;
            } while (temp >= 0);
            headers.push(column);
        }
        return headers;
    }, []);

    // Define settings object
    const settings = useMemo(() => ({
        licenseKey: 'non-commercial-and-evaluation',
        data: data,
        colHeaders: colHeaders,
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
    }), [data, colHeaders]);

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
