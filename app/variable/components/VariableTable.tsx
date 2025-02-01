// components/VariableTable.tsx
"use client";

import React, { useRef, useMemo } from 'react';
import { HotTable, HotTableClass } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { useVariableTable } from '../hooks/useVariableTable';
import { useVariableStore } from '@/stores/useVariableStore';
import { colHeaders, columns } from "@/app/variable/components/variableTableConfig";

registerAllModules();

export default function VariableTable() {
    const hotTableRef = useRef<HotTableClass | null>(null);

    const totalColumns = useVariableStore(state => state.totalColumns);

    const { data, handleAfterChange } = useVariableTable(totalColumns);

    const settings = useMemo(
        () => ({
            licenseKey: 'non-commercial-and-evaluation',
            data: data,
            colHeaders: colHeaders,
            columns: columns,
            rowHeaders: true,
            width: '100%',
            height: '100%',
            autoWrapRow: true,
            autoWrapCol: true,
            contextMenu: true,
            afterChange: handleAfterChange,
        }),
        [data, colHeaders, columns, handleAfterChange]
    );

    return (
        <div className="h-full w-full">
            <HotTable
                ref={hotTableRef}
                settings={settings}
                className="h-full w-full z-0"
            />
        </div>
    );
}
