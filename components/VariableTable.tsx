import React, { useRef } from 'react';
import { HotTable, HotTableClass } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';

interface VariableData {
    name: string;
    type: string;
    width: number;
    decimals: number;
    label: string;
    values: string;
    missing: string;
    columns: string;
    align: string;
    measure: string;
    role: string;
}

interface VariableViewProps {
    onCellChange: (value: string) => void;
}

const VariableView: React.FC<VariableViewProps> = ({ onCellChange }) => {
    const hotTableComponent = useRef<HotTableClass>(null);

    const columnHeaders = [
        'Name',
        'Type',
        'Width',
        'Decimals II',
        'Label',
        'Values',
        'Missing',
        'Columns',
        'Align',
        'Measure',
        'Role'
    ];

    const columns = [
        { data: 'name', type: 'text' },
        { data: 'type', type: 'text' },
        { data: 'width', type: 'numeric' },
        { data: 'decimals', type: 'numeric' },
        { data: 'label', type: 'text' },
        { data: 'values', type: 'text' },
        { data: 'missing', type: 'text' },
        { data: 'columns', type: 'text' },
        { data: 'align', type: 'text' },
        { data: 'measure', type: 'text' },
        { data: 'role', type: 'text' },
    ];

    const emptyData: VariableData[] = Array.from({ length: 50 }, () => ({
        name: '',
        type: '',
        width: 0,
        decimals: 0,
        label: '',
        values: '',
        missing: '',
        columns: '',
        align: '',
        measure: '',
        role: '',
    }));

    const settings: Handsontable.GridSettings = {
        data: emptyData,
        colHeaders: columnHeaders,
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
        columns: columns,
        afterChange: (changes, source) => {
            if (changes && source !== 'loadData') {
                changes.forEach(([row, prop, oldValue, newValue]) => {
                    onCellChange(newValue);
                });
            }
        },
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

export default VariableView;
