// components/DataTable.tsx
import React, { useRef } from 'react';
import { HotTable, HotTableClass } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';

import { registerAllModules } from 'handsontable/registry';
registerAllModules();

interface DataTableProps {
    data: any[][];
    onCellChange: (
        changes: Handsontable.CellChange[] | null,
        source: Handsontable.ChangeSource
    ) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, onCellChange }) => {
    const hotTableComponent = useRef<HotTableClass>(null);

    const isRtl = document.documentElement.getAttribute('dir') === 'rtl';

    const settings: Handsontable.GridSettings = {
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
        height: '100%',
        width: '100%',
        language: isRtl ? 'he' : 'en-US',
        afterChange: onCellChange,
    };

    return (
        <div className="flex-grow z-0">
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
