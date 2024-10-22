// pages/page.tsx
"use client";

import 'handsontable/dist/handsontable.full.min.css';
import Header from "@/components/Header";
import DataTable from "@/components/DataTable";
import VariableView from "@/components/VariableTable";
import Footer from "@/components/Footer";
import React, { useState } from 'react';

import Handsontable from 'handsontable';

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

export default function Home() {
    const [activeView, setActiveView] = useState<'data' | 'variable'>('data');

    const [data, setData] = useState(() => {
        const initialData = Array.from({ length: 100 }, () =>
            Array.from({ length: 20 }, () => '')
        );
        return initialData;
    });

    const [variables, setVariables] = useState<VariableData[]>([]);

    const handleDataCellChange = (
        changes: Handsontable.CellChange[] | null,
        source: Handsontable.ChangeSource
    ) => {
        if (changes && source !== 'loadData') {
            const newData = [...data];
            let newVariables = [...variables];

            changes.forEach(([row, col, oldValue, newValue]) => {
                const rowIndex = row as number;
                const colIndex = col as number;

                // Update data
                newData[rowIndex][colIndex] = newValue;

                // Nama kolom
                const columnName = `VAR${colIndex + 1}`;

                // Cek apakah variable sudah ada
                const variableIndex = newVariables.findIndex(
                    (v) => v.name === columnName
                );

                if (variableIndex === -1) {
                    // Variable belum ada, tambahkan
                    const isNumeric =
                        !isNaN(parseFloat(newValue as string)) &&
                        isFinite(Number(newValue));

                    let variable: VariableData = {
                        name: columnName,
                        type: isNumeric ? 'Numeric' : 'String',
                        width: isNumeric ? 8 : (newValue as string).length,
                        decimals: isNumeric ? 2 : 0,
                        label: '',
                        values: '',
                        missing: '',
                        columns: isNumeric ? '8' : (newValue as string).length.toString(),
                        align: isNumeric ? 'right' : 'left',
                        measure: isNumeric ? 'unknown' : 'nominal',
                        role: 'input',
                    };

                    newVariables.push(variable);
                } else {
                    // Variable sudah ada, perbarui jika perlu
                    const variable = { ...newVariables[variableIndex] }; // Buat salinan

                    if (variable.type === 'String') {
                        const newWidth = Math.max(
                            variable.width || 0,
                            (newValue as string).length
                        );
                        variable.width = newWidth;
                        variable.columns = newWidth.toString();
                        newVariables[variableIndex] = variable; // Gantikan variable dalam array
                    }
                }
            });

            setData(newData);
            setVariables(newVariables);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50">
                <Header />
            </header>

            <main className="flex-grow flex">
                <div className="w-full flex flex-col">
                    {activeView === 'data' ? (
                        <DataTable data={data} onCellChange={handleDataCellChange} />
                    ) : (
                        <VariableView variables={variables} />
                    )}
                </div>
            </main>

            <Footer activeView={activeView} setActiveView={setActiveView} />
        </div>
    );
}
