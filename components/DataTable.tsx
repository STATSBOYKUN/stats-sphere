"use client";

import React, { useMemo, useRef } from 'react';
import {HotTable, HotTableClass} from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import { useDataContext } from '@/contexts/DataContext';
import Handsontable from 'handsontable';

export default function DataTable() {
    const hotTableRef = useRef<HotTable | null>(null) as React.MutableRefObject<HotTableClass | null>;
    const { data, setData } = useDataContext();

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

        const newData = data.map((row) => [...row]);

        changes.forEach(([row, col, oldValue, newValue]) => {
            let colIndex: number | null = null;

            if (typeof col === 'number') {
                colIndex = col;
            } else if (typeof col === 'string') {
                colIndex = colHeaders.indexOf(col);
            } else {
                console.warn(`Unexpected column type in afterChange: ${typeof col}`);
            }

            if (colIndex !== null && colIndex >= 0) {
                newData[row][colIndex] = newValue;
            } else {
                console.warn(`Column not found for col: ${col}`);
            }
        });

        setData(newData);
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
