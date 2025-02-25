// components/VariableTable.tsx
"use client";

import React, { useRef, useEffect, useMemo } from 'react';
import Handsontable from 'handsontable';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { colHeaders, columns } from './tableConfig';
import { useVariableTableData } from '../hooks/useVariableTableData';

registerAllModules();

export default function VariableTable() {
    const containerRef = useRef<HTMLDivElement>(null);
    const hotInstance = useRef<Handsontable | null>(null);

    const { tableData, handleAfterChange } = useVariableTableData();

    const settings = useMemo(
        () => ({
            data: tableData,
            colHeaders,
            columns,
            rowHeaders: true,
            width: '100%',
            height: '100%',
            autoWrapRow: true,
            autoWrapCol: true,
            contextMenu: true,
            licenseKey: 'non-commercial-and-evaluation',
            afterChange: handleAfterChange,
            minSpareRows: 1,
        }),
        [tableData, handleAfterChange]
    );

    useEffect(() => {
        if (containerRef.current) {
            if (!hotInstance.current) {
                hotInstance.current = new Handsontable(containerRef.current, settings);
            } else if (!hotInstance.current.isDestroyed) {
                hotInstance.current.updateSettings(settings);
            }
        }
    }, [settings]);

    useEffect(() => {
        return () => {
            if (hotInstance.current) {
                hotInstance.current.destroy();
                hotInstance.current = null;
            }
        };
    }, []);

    return (
        <div className="h-full w-full">
            <div ref={containerRef} className="h-full w-full z-0" />
        </div>
    );
}
