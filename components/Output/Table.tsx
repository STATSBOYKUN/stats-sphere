// components/Table/DataTable.tsx

"use client";

import React from "react";

interface DataTableProps {
    data: { [key: string]: any }[];
    columns: string[];
}

const Table: React.FC<DataTableProps> = ({ data, columns }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50">
                <tr>
                    {columns.map((col) => (
                        <th
                            key={col}
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            {col}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, idx) => (
                    <tr key={idx}>
                        {columns.map((col) => (
                            <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {row[col]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
