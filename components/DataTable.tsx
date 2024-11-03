// components/DataTable.tsx

"use client";

import React, { useMemo, useRef, useEffect } from 'react';
import { HotTable, HotTableClass } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import { useDataStore } from '@/stores/useDataStore';
import Handsontable from 'handsontable';

export default function DataTable() {
    const hotTableRef = useRef<HotTableClass | null>(null);

    const data = useDataStore((state) => state.data);
    const updateCell = useDataStore((state) => state.updateCell);
    const loadData = useDataStore((state) => state.loadData);

    useEffect(() => {
        // Memuat data dari Dexie.js saat komponen mount
        loadData();
    }, [loadData]);

    const colHeaders = useMemo(() => {
        const headers = [];
        for (let i = 0; i < 45; i++) {
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

    const handleAfterChange = (
        changes: Handsontable.CellChange[] | null,
        source: Handsontable.ChangeSource
    ) => {
        if (source === 'loadData' || !changes) {
            return;
        }

        changes.forEach(([row, col, oldValue, newValue]) => {
            if (newValue !== oldValue) {
                updateCell(row, col, newValue as string);
            }
        });
    };

    return (
        <div className="flex-grow z-0 h-full w-full">
            <HotTable
                ref={hotTableRef}
                data={data}
                colHeaders={colHeaders}
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
                contextMenu={true}
                licenseKey="non-commercial-and-evaluation"
                afterChange={handleAfterChange}
                className="h-full w-full"
            />
        </div>
    );
}
