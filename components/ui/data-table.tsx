"use client";

import React from "react";

interface ColumnHeader {
    header: string;
    children?: ColumnHeader[];
}

interface TableRowData {
    rowHeader: (string | null)[];
    [key: string]: any;
    children?: TableRowData[];
}

interface TableData {
    title: string;
    columnHeaders: ColumnHeader[];
    rows: TableRowData[];
}

interface DataTableProps {
    data: string;
}

const DataTableRenderer: React.FC<DataTableProps> = ({ data }) => {
    let parsedData: { tables: TableData[] };
    try {
        parsedData = JSON.parse(data);
    } catch {
        return <div className="text-red-500">Invalid JSON format</div>;
    }

    if (!parsedData.tables || !Array.isArray(parsedData.tables)) {
        return <div className="text-red-500">Invalid tables format</div>;
    }

    const getLeafColumnCount = (col: ColumnHeader): number => {
        if (!col.children || col.children.length === 0) return 1;
        return col.children.reduce((sum, child) => sum + getLeafColumnCount(child), 0);
    };

    const getMaxDepth = (columns: ColumnHeader[]): number => {
        let max = 1;
        columns.forEach(col => {
            if (col.children && col.children.length > 0) {
                const depth = 1 + getMaxDepth(col.children);
                if (depth > max) max = depth;
            }
        });
        return max;
    };

    const buildColumnLevels = (columns: ColumnHeader[]) => {
        const maxLevel = getMaxDepth(columns);
        const levels: ColumnHeader[][] = Array.from({ length: maxLevel }, () => []);

        const traverse = (cols: ColumnHeader[], level: number) => {
            cols.forEach(col => {
                levels[level].push(col);
                if (col.children && col.children.length > 0) {
                    traverse(col.children, level + 1);
                }
            });
        };

        traverse(columns, 0);
        return levels;
    };

    const renderColumnHeaderRow = (
        cols: ColumnHeader[],
        level: number,
        maxLevel: number
    ) => {
        return (
            <tr>
                {cols.map((col, idx) => {
                    const colSpan = getLeafColumnCount(col);
                    const hasChildren = col.children && col.children.length > 0;
                    const rowSpan = hasChildren ? 1 : maxLevel - level;
                    return (
                        <th
                            key={`col-header-${level}-${idx}`}
                            colSpan={colSpan}
                            rowSpan={rowSpan}
                            className="border border-gray-300 bg-gray-100 px-2 py-1 text-center text-sm font-medium"
                        >
                            {col.header}
                        </th>
                    );
                })}
            </tr>
        );
    };

    const isRowEmpty = (row: TableRowData, columns: string[]): boolean => {
        return columns.every(colKey => {
            const val = row[colKey];
            return val === null || val === undefined || val === "";
        });
    };

    const getLeafColumnKeys = (cols: ColumnHeader[]): string[] => {
        const keys: string[] = [];
        const traverse = (col: ColumnHeader) => {
            if (!col.children || col.children.length === 0) {
                keys.push(col.header);
            } else {
                col.children.forEach(ch => traverse(ch));
            }
        };
        cols.forEach(c => traverse(c));
        return keys;
    };

    const renderRow = (
        parentRow: TableRowData,
        leafCols: string[],
        rowIndex: number,
        rowHeaderCount: number
    ): JSX.Element[] => {
        const children = parentRow.children;
        if (children && children.length > 0) {
            const rowSpan = children.length;
            const firstChild = children[0];
            return [
                <tr key={`${rowIndex}-0`}>
                    <th
                        rowSpan={rowSpan}
                        className="border border-gray-300 bg-gray-50 px-2 py-1 text-left text-sm font-normal"
                    >
                        {parentRow.rowHeader[0]}
                    </th>
                    <td className="border border-gray-300 px-2 py-1 text-sm">
                        {firstChild.rowHeader[1]}
                    </td>
                    {leafCols.map((colKey, i) => (
                        <td
                            key={i}
                            className="border border-gray-300 px-2 py-1 text-center text-sm"
                        >
                            {firstChild[colKey] ?? ""}
                        </td>
                    ))}
                </tr>,
                ...children.slice(1).map((c, childIndex) => (
                    <tr key={`${rowIndex}-${childIndex + 1}`}>
                        <td className="border border-gray-300 px-2 py-1 text-sm">
                            {c.rowHeader[1]}
                        </td>
                        {leafCols.map((colKey, i) => (
                            <td
                                key={i}
                                className="border border-gray-300 px-2 py-1 text-center text-sm"
                            >
                                {c[colKey] ?? ""}
                            </td>
                        ))}
                    </tr>
                )),
            ];
        } else {
            return [
                <tr key={rowIndex}>
                    <th
                        colSpan={rowHeaderCount}
                        className="border border-gray-300 bg-gray-50 px-2 py-1 text-left text-sm font-normal"
                    >
                        {parentRow.rowHeader[0]}
                    </th>
                    {leafCols.map((colKey, i) => (
                        <td
                            key={i}
                            className="border border-gray-300 px-2 py-1 text-center text-sm"
                        >
                            {parentRow[colKey] ?? ""}
                        </td>
                    ))}
                </tr>,
            ];
        }
    };

    const computeMaxRowHeaderDepth = (rows: TableRowData[]): number => {
        let max = 0;
        const traverse = (rs: TableRowData[]) => {
            rs.forEach(r => {
                if(r.rowHeader.length > max) max = r.rowHeader.length;
                if(r.children && r.children.length > 0) traverse(r.children);
            });
        };
        traverse(rows);
        return max;
    };

    return (
        <div className="my-4">
            {parsedData.tables.map((table, tableIndex) => {
                const { title, columnHeaders, rows } = table;
                const levels = buildColumnLevels(columnHeaders);
                const maxDepth = getMaxDepth(columnHeaders);
                const filteredRows = rows.filter(parent => {
                    if (parent.children && parent.children.length > 0) {
                        const valid = parent.children.filter(
                            child => !isRowEmpty(child, getLeafColumnKeys(columnHeaders).slice(0))
                        );
                        parent.children = valid;
                        return valid.length > 0;
                    } else {
                        return !isRowEmpty(parent, getLeafColumnKeys(columnHeaders).slice(0));
                    }
                });
                if (filteredRows.length === 0) return null;
                const rowHeaderCount = computeMaxRowHeaderDepth(filteredRows);
                const allLeafCols = getLeafColumnKeys(columnHeaders);
                const leafCols = allLeafCols.slice(rowHeaderCount);
                return (
                    <table
                        key={tableIndex}
                        className="border-collapse border border-gray-300 text-sm mb-6"
                    >
                        <thead>
                        <tr>
                            <th
                                colSpan={rowHeaderCount + leafCols.length}
                                className="border border-gray-300 bg-gray-200 px-2 py-2 text-center font-semibold"
                            >
                                {title}
                            </th>
                        </tr>
                        {levels.map((cols, lvlIndex) =>
                            renderColumnHeaderRow(cols, lvlIndex, maxDepth)
                        )}
                        </thead>
                        <tbody>
                        {filteredRows.flatMap((row, rowIndex) =>
                            renderRow(row, leafCols, rowIndex, rowHeaderCount)
                        )}
                        </tbody>
                    </table>
                );
            })}
        </div>
    );
};

export default DataTableRenderer;
