// components/VariableView.tsx
import React, { useRef } from 'react';
import "@handsontable/pikaday/css/pikaday.css";
import { HotTable, HotColumn, HotTableClass } from "@handsontable/react";
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';

// Impor dan daftarkan semua modul Handsontable
import { registerAllModules } from 'handsontable/registry';
registerAllModules();

interface VariableData {
    name: string;
    type: string;
    width: number | null;      // Mengizinkan nilai null
    decimals: number | null;   // Mengizinkan nilai null
    label: string;
    values: string;
    missing: string;
    columns: string;
    align: string;
    measure: string;
    role: string;
}

interface VariableViewProps {
    onCellChange: (value: string | number | null) => void;  // Mengizinkan null
}

export default function VariableView({ onCellChange }: VariableViewProps) {
    const hotTableComponent = useRef<HotTableClass>(null);

    const columnHeaders = [
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
        'Role'
    ];

    const emptyData: VariableData[] = Array.from({ length: 50 }, () => ({
        name: '',
        type: '',
        width: null,        // Atur ke null
        decimals: null,     // Atur ke null
        label: '',
        values: '',
        missing: '',
        columns: '',
        align: '',
        measure: '',
        role: '',
    }));

    const isRtl = document.documentElement.getAttribute('dir') === 'rtl';

    const settings: Handsontable.GridSettings = {
        data: emptyData,
        colHeaders: columnHeaders,
        rowHeaders: true,
        manualRowMove: true,
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
        afterChange: (changes, source) => {
            if (changes && source !== 'loadData') {
                changes.forEach(([row, prop, oldValue, newValue]) => {
                    onCellChange(newValue);
                });
            }
        },
    };

    return (
        <div className="flex-grow z-0">
            <HotTable
                ref={hotTableComponent}
                data={settings.data}
                height={settings.height}
                colHeaders={settings.colHeaders}
                rowHeaders={settings.rowHeaders}
                manualRowMove={settings.manualRowMove}
                copyPaste={settings.copyPaste}
                contextMenu={settings.contextMenu}
                licenseKey={settings.licenseKey}
                stretchH={settings.stretchH}
                autoColumnSize={settings.autoColumnSize}
                selectionMode={settings.selectionMode}
                undo={settings.undo}
                width={settings.width}
                language={settings.language}
                afterChange={settings.afterChange}
                className="h-full w-full"
            >
                <HotColumn data="name" type="text" />
                <HotColumn data="type" type="text" />
                <HotColumn data="width" type="numeric" allowEmpty={true} />
                <HotColumn data="decimals" type="numeric" allowEmpty={true} />
                <HotColumn data="label" type="text" />
                <HotColumn data="values" type="text" />
                <HotColumn data="missing" type="text" />
                <HotColumn data="columns" type="text" />
                <HotColumn data="align" type="text" />
                <HotColumn data="measure" type="text" />
                <HotColumn data="role" type="text" />
            </HotTable>
        </div>
    );
}
