// components/DataTable.tsx

"use client";

import React, { useMemo } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.min.css';

export default function DataTable() {
    // Inisialisasi data kosong: 100 baris x 45 kolom
    const data = useMemo(() => {
        return Array.from({ length: 100 }, () => Array(45).fill(''));
    }, []);

    // Menghasilkan header kolom: A, B, C, ..., AD
    const colHeaders = useMemo(() => {
        const headers = [];
        for (let i = 0; i < 30; i++) {
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

    // Definisikan objek settings
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
        <div className="flex-grow w-full h-full z-0">
            <HotTable
                settings={settings}
            />
        </div>
    );
}
