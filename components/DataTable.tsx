import React, { useRef, useEffect, useState } from 'react';
import Handsontable from 'handsontable';
import { HotTable, HotTableClass } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';

const DataTable: React.FC = () => {
    const hotTableComponent = useRef<HotTableClass>(null);
    const [tableHeight, setTableHeight] = useState<number>(0);

    useEffect(() => {
        const calculateHeight = () => {
            const windowHeight = window.innerHeight;
            const navbarHeight = document.querySelector('header')?.clientHeight || 0;
            const footerHeight = document.querySelector('footer')?.clientHeight || 0;
            const availableHeight = windowHeight - navbarHeight - footerHeight;
            setTableHeight(availableHeight);
        };

        // Hitung tinggi saat komponen pertama kali dirender
        calculateHeight();
        // Tambahkan event listener untuk resize
        window.addEventListener('resize', calculateHeight);

        return () => {
            window.removeEventListener('resize', calculateHeight);
        };
    }, []);

    const settings: Handsontable.GridSettings = {
        colHeaders: true,
        rowHeaders: true,
        filters: true,
        dropdownMenu: true,
        customBorders: true,
        multiColumnSorting: true,
        manualRowMove: true,
        manualColumnMove: true,
        copyPaste: true,  // Aktifkan fitur copy-paste
        startRows: 50,
        startCols: 40,
        width: '100%',
        height: tableHeight,
        licenseKey: 'non-commercial-and-evaluation',
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <HotTable ref={hotTableComponent} settings={settings} />
        </div>
    );
};

export default DataTable;
