"use client";
import React from "react";

interface ColumnHeader {
    header: string;
    key?: string;
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
        return col.children.reduce(
            (sum, child) => sum + getLeafColumnCount(child),
            0
        );
    };

    const getMaxDepth = (columns: ColumnHeader[]): number => {
        let max = 1;
        columns.forEach((col) => {
            if (col.children && col.children.length > 0) {
                const depth = 1 + getMaxDepth(col.children);
                if (depth > max) max = depth;
            }
        });
        return max;
    };

    const buildColumnLevels = (columns: ColumnHeader[]) => {
        const maxLevel = getMaxDepth(columns);
        const levels: ColumnHeader[][] = Array.from(
            { length: maxLevel },
            () => []
        );
        const traverse = (cols: ColumnHeader[], level: number) => {
            cols.forEach((col) => {
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
            <tr key={`col-header-${level}`}>
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

    const getLeafColumnKeys = (cols: ColumnHeader[]): string[] => {
        const keys: string[] = [];
        const traverse = (col: ColumnHeader) => {
            if (!col.children || col.children.length === 0) {
                keys.push(col.key ? col.key : col.header);
            } else {
                col.children.forEach((ch) => traverse(ch));
            }
        };
        cols.forEach((c) => traverse(c));
        return keys;
    };

    const computeMaxRowHeaderDepth = (rows: TableRowData[]): number => {
        let max = 0;
        rows.forEach((r) => {
            if (r.rowHeader.length > max) max = r.rowHeader.length;
        });
        return max;
    };

    const propagateHeaders = (
        row: TableRowData,
        accumulated: (string | null)[]
    ): TableRowData[] => {
        const combined: (string | null)[] = [];
        const length = Math.max(accumulated.length, row.rowHeader.length);
        for (let i = 0; i < length; i++) {
            combined[i] = row.rowHeader[i] ?? accumulated[i] ?? null;
        }
        if (row.children && row.children.length > 0) {
            let results: TableRowData[] = [];
            for (let child of row.children) {
                results.push(...propagateHeaders(child, combined));
            }
            return results;
        } else {
            row.rowHeader = combined;
            return [row];
        }
    };

    const flattenRows = (rows: TableRowData[]): TableRowData[] => {
        let result: TableRowData[] = [];
        for (let row of rows) {
            result.push(...propagateHeaders(row, []));
        }
        return result;
    };

    const renderRowHeaderCells = (
        row: TableRowData,
        rowIndex: number,
        flatRows: TableRowData[],
        rowHeaderCount: number
    ) => {
        const nonEmptyHeaders = row.rowHeader.filter((h) => h !== null);
        if (rowHeaderCount === 2 && nonEmptyHeaders.length === 1) {
            const colIdx = 0;
            const current = row.rowHeader[colIdx] ?? "";
            const prev =
                rowIndex > 0
                    ? flatRows[rowIndex - 1].rowHeader[colIdx] ?? ""
                    : null;
            const renderCell = rowIndex === 0 || current !== prev;
            if (!renderCell) {
                return null;
            }
            let rowSpan = 1;
            for (let next = rowIndex + 1; next < flatRows.length; next++) {
                let nextVal = flatRows[next].rowHeader[colIdx] ?? "";
                if (nextVal === current) rowSpan++;
                else break;
            }
            return (
                <th
                    key={`rowheader-${rowIndex}-${colIdx}`}
                    rowSpan={rowSpan}
                    colSpan={2}
                    className="border border-gray-300 bg-gray-50 px-2 py-1 text-left text-sm font-normal"
                >
                    {current}
                </th>
            );
        }
        return Array.from({ length: rowHeaderCount }, (_, colIdx) => {
            const current = row.rowHeader[colIdx] ?? "";
            const prev =
                rowIndex > 0
                    ? flatRows[rowIndex - 1].rowHeader[colIdx] ?? ""
                    : null;
            const renderCell = rowIndex === 0 || current !== prev;
            if (!renderCell) {
                return null;
            }
            let rowSpan = 1;
            for (let next = rowIndex + 1; next < flatRows.length; next++) {
                let nextVal = flatRows[next].rowHeader[colIdx] ?? "";
                if (nextVal === current) rowSpan++;
                else break;
            }
            return (
                <th
                    key={`rowheader-${rowIndex}-${colIdx}`}
                    rowSpan={rowSpan}
                    className="border border-gray-300 bg-gray-50 px-2 py-1 text-left text-sm font-normal"
                >
                    {current}
                </th>
            );
        });
    };

    return (
        <div className="my-4">
            {parsedData.tables.map((table, tableIndex) => {
                const { title, columnHeaders, rows } = table;
                const levels = buildColumnLevels(columnHeaders);
                const maxDepth = getMaxDepth(columnHeaders);
                const flatRows = flattenRows(rows);
                if (flatRows.length === 0) return null;
                const rowHeaderCount = computeMaxRowHeaderDepth(flatRows);
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
                            {flatRows.map((row, rowIndex) => {
                                const allDataNull = leafCols.every(
                                    (k) => row[k] == null
                                );
                                if (
                                    allDataNull &&
                                    row.rowHeader.every((h) => h !== "")
                                )
                                    return null;
                                return (
                                    <tr key={rowIndex}>
                                        {renderRowHeaderCells(
                                            row,
                                            rowIndex,
                                            flatRows,
                                            rowHeaderCount
                                        )}
                                        {leafCols.map((colKey, i) => (
                                            <td
                                                key={i}
                                                className="border border-gray-300 px-2 py-1 text-center text-sm"
                                            >
                                                {row[colKey] ?? ""}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                );
            })}
        </div>
    );
};

export default DataTableRenderer;
