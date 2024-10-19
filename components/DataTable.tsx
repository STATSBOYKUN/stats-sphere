// components/DataTable.tsx
import React, { useRef } from 'react';
import { HotTable, HotTableClass } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';

const DataTable: React.FC = () => {
    const hotTableComponent = useRef<HotTableClass>(null);

    const emptyData = Array.from({ length: 50 }, () =>
        Array.from({ length: 40 }, () => '')
    );

    const settings: Handsontable.GridSettings = {
        data: Handsontable.helper.createSpreadsheetData(50, 40),
        colHeaders: true,
        rowHeaders: true,
        filters: true,
        dropdownMenu: true,
        customBorders: true,
        multiColumnSorting: true,
        manualRowMove: true,
        manualColumnMove: true,
        copyPaste: {
            pasteMode: 'overwrite', // Atur mode paste sesuai kebutuhan
        },
        contextMenu: true, // Aktifkan menu konteks
        licenseKey: 'non-commercial-and-evaluation',
        stretchH: 'all',
        autoColumnSize: {
            samplingRatio: 23,
        },
        selectionMode: 'multiple',
        undo: true,
        height: '100%', // Atur tinggi menjadi 100%
        width: '100%', // Atur lebar menjadi 100%
        // Anda bisa menambahkan pengaturan lain sesuai kebutuhan
    };

    return (
        <div className="flex-grow">
            <HotTable
                ref={hotTableComponent}
                settings={settings}
                licenseKey="non-commercial-and-evaluation"
                className="h-full w-full"
            />
        </div>
    );
};

export default DataTable;
