// components/VariableTable.tsx
import React, { useRef, useEffect, useState } from 'react';
import "@handsontable/pikaday/css/pikaday.css";
import { HotTable, HotColumn, HotTableClass } from "@handsontable/react";
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';

import { registerAllModules } from 'handsontable/registry';
registerAllModules();

interface VariableData {
    name: string;
    type: string;
    width: number | null;
    decimals: number | null;
    label: string;
    values: string;
    missing: string;
    columns: string;
    align: string;
    measure: string;
    role: string;
}

interface VariableTableProps {
    variables: VariableData[];
}

export default function VariableTable({ variables }: VariableTableProps) {
    const hotTableComponent = useRef<HotTableClass>(null);
    const [isRtl, setIsRtl] = useState(false);

    useEffect(() => {
        // Safely access document in useEffect to avoid SSR issues
        const dir = document.documentElement.getAttribute('dir');
        setIsRtl(dir === 'rtl');
    }, []);

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

    const settings: Handsontable.GridSettings = {
        data: variables,
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
                className="h-full w-full"
            >
                <HotColumn data="name" type="text" />
                <HotColumn
                    data="type"
                    type="dropdown"
                    source={[
                        'Numeric',
                        'Comma',
                        'Dot',
                        'Scientific notation',
                        'Date',
                        'Dollar',
                        'Custom currency',
                        'String',
                        'Restricted Numeric (integer with leading zeros)',
                    ]}
                    width={150}
                />
                <HotColumn data="width" type="numeric" allowEmpty={true} />
                <HotColumn data="decimals" type="numeric" allowEmpty={true} />
                <HotColumn data="label" type="text" />
                <HotColumn data="values" type="text" />
                <HotColumn data="missing" type="text" />
                <HotColumn data="columns" type="text" />
                <HotColumn
                    data="align"
                    type="dropdown"
                    source={['left', 'right', 'center']}
                    width={100}
                />
                <HotColumn
                    data="measure"
                    type="dropdown"
                    source={['nominal', 'ordinal', 'scale']}
                    width={100}
                />
                <HotColumn
                    data="role"
                    type="dropdown"
                    source={[
                        'Input',
                        'Target',
                        'Both',
                        'None',
                        'Partition',
                        'Split',
                    ]}
                    width={120}
                />
            </HotTable>
        </div>
    );
}
