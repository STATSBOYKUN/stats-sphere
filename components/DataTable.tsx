// components/DataTable.tsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { HotTable, HotTableClass } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';

interface DataRow {
    // Definisikan struktur data baris jika diketahui
    [key: string]: any;
}

interface DataTableProps {
    data: DataRow[];
    onCellChange: (
        changes: Handsontable.CellChange[] | null,
        source: Handsontable.ChangeSource
    ) => void;
}

export default function DataTable({ data, onCellChange }: DataTableProps) {
    const hotTableComponent = useRef<HotTableClass>(null);
    const [isRtl, setIsRtl] = useState<boolean>(false);

    useEffect(() => {
        const dir = document.documentElement.getAttribute('dir');
        setIsRtl(dir === 'rtl');
    }, []);

    const settings: Handsontable.GridSettings = useMemo(() => ({
        data: data,
        colHeaders: true,
        rowHeaders: true,
        filters: true,
        dropdownMenu: true,
        customBorders: true,
        multiColumnSorting: true,
        manualRowMove: true,
        manualColumnMove: true,
        copyPaste: {
            pasteMode: 'overwrite',
        },
        contextMenu: true,
        licenseKey: 'non-commercial-and-evaluation',
        stretchH: 'all',
        autoColumnSize: {
            samplingRatio: 23,
        },
        selectionMode: 'multiple',
        undo: true,
        language: isRtl ? 'he' : 'en-US',
        afterChange: onCellChange,
        height: '100%',
        width: '100%',
    }), [data, isRtl, onCellChange]);

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
