"use client";

import React from "react";

interface TableRowData {
    rowHeader: (string | null)[];
    [key: string]: any;
    children?: TableRowData[];
}

interface TableData {
    title: string;
    columns: string[];
    rows: TableRowData[];
}

interface DataTableProps {
    data: string;
}

const DataTableRenderer: React.FC<DataTableProps> = ({ data }) => {
    let parsedData: any;
    try {
        parsedData = JSON.parse(data);
    } catch {
        return <div className="text-red-500">Invalid data format</div>;
    }

    if (!parsedData.tables || !Array.isArray(parsedData.tables)) {
        return <div className="text-red-500">Invalid tables format</div>;
    }

    // Fungsi untuk memeriksa apakah sebuah baris harus dihapus
    // Periksa apakah row tidak punya data di salah satu kolom Var1, Var2, Var3
    const isRowEmpty = (row: TableRowData, columns: string[]): boolean => {
        // Jika rowHeader adalah 'Mean', kita tetap ingin menampilkannya
        const isMeanRow = row.rowHeader[0]?.toLowerCase() === 'mean';
        if (isMeanRow) {
            return false; // Jangan hapus baris "Mean"
        }

        // Untuk baris lain, cek apakah semua kolom bernilai kosong
        const isAllEmpty = columns.every(col => {
            // cek null, undefined, atau string kosong
            const val = row[col];
            return val === null || val === undefined || val === '';
        });

        return isAllEmpty;
    };


    return (
        <div className="my-5">
            {parsedData.tables.map((table: TableData, index: number) => {
                // Filter baris berdasarkan kondisi
                const filteredRows = table.rows.filter(row => {
                    if (row.children && row.children.length > 0) {
                        const filteredChildren = row.children.filter(child => !isRowEmpty(child, table.columns));
                        row.children = filteredChildren;
                        // Tampilkan parent row jika anaknya masih ada yang tidak kosong
                        return row.children.length > 0;
                    } else {
                        // Tampilkan baris jika barisnya tidak kosong
                        return !isRowEmpty(row, table.columns);
                    }
                });


                // Jika setelah difilter tidak ada baris, lewati rendering tabel ini
                if (filteredRows.length === 0) {
                    return null;
                }

                // Check if the table requires a detail column
                const hasDetailColumn = filteredRows.some(row => row.children && row.children.length > 0);

                return (
                    <table
                        key={index}
                        className="border-collapse border border-gray-400 mb-6"
                        style={{ width: "auto" }}
                    >
                        <thead>
                        {/* Title Row */}
                        <tr>
                            <th
                                colSpan={(hasDetailColumn ? 2 : 1) + table.columns.length}
                                className="bg-gray-300 px-4 py-2 text-sm font-semibold text-center border border-gray-400"
                            >
                                {table.title}
                            </th>
                        </tr>
                        {/* Header Row */}
                        <tr>
                            {/* Statistic and Detail headers */}
                            {hasDetailColumn && (
                                <>
                                    <th className="bg-gray-200 px-4 py-2 text-xs text-center border border-gray-400">
                                        {""}
                                    </th>
                                    <th className="bg-gray-200 px-4 py-2 text-xs text-center border border-gray-400">
                                        {""}
                                    </th>
                                </>
                            )}
                            {!hasDetailColumn && (
                                <th className="bg-gray-200 px-4 py-2 text-xs text-center border border-gray-400">
                                    {""}
                                </th>
                            )}
                            {/* Data Columns */}
                            {table.columns.map((col, colIndex) => (
                                <th
                                    key={colIndex}
                                    className="bg-gray-200 px-4 py-2 text-xs text-center border border-gray-400 whitespace-nowrap"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {filteredRows.map((row, rowIndex) => {
                            if (row.children && row.children.length > 0) {
                                return (
                                    <React.Fragment key={rowIndex}>
                                        {/* Parent Row */}
                                        <tr>
                                            <th
                                                rowSpan={row.children.length}
                                                className="bg-gray-300 px-4 py-2 text-xs text-left border border-gray-400 whitespace-nowrap"
                                            >
                                                {row.rowHeader[0]}
                                            </th>
                                            <td className="bg-gray-300 px-4 py-2 text-xs text-left border border-gray-400 whitespace-nowrap">
                                                {row.children![0].rowHeader[1]}
                                            </td>
                                            {table.columns.map((col, colIndex) => (
                                                <td
                                                    key={colIndex}
                                                    className="px-4 py-2 text-xs text-center border border-gray-400 whitespace-nowrap"
                                                >
                                                    {row.children![0][col] ?? ""}
                                                </td>
                                            ))}
                                        </tr>
                                        {/* Child Rows */}
                                        {row.children.slice(1).map((child, childIndex) => (
                                            <tr key={`${rowIndex}-${childIndex}`}>
                                                <td className="bg-gray-300 px-4 py-2 text-xs text-left border border-gray-400 whitespace-nowrap">
                                                    {child.rowHeader[1]}
                                                </td>
                                                {table.columns.map((col, colIndex) => (
                                                    <td
                                                        key={colIndex}
                                                        className="px-4 py-2 text-xs text-center border border-gray-400 whitespace-nowrap"
                                                    >
                                                        {child[col] ?? ""}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            } else {
                                // Row without children: Merge Statistic and Detail cells
                                return (
                                    <tr key={rowIndex}>
                                        <th
                                            colSpan={hasDetailColumn ? 2 : 1}
                                            className="bg-gray-300 px-4 py-2 text-xs text-left border border-gray-400 whitespace-nowrap"
                                        >
                                            {row.rowHeader[0]}
                                        </th>
                                        {table.columns.map((col, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className="px-4 py-2 text-xs text-center border border-gray-400 whitespace-nowrap"
                                            >
                                                {row[col] ?? ""}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            }
                        })}
                        </tbody>
                    </table>
                );
            })}
        </div>
    );
};

export default DataTableRenderer;
