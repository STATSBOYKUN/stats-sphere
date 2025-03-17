"use client";

import React, { useState, useEffect, FC } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDataStore, DataRow } from "@/stores/useDataStore";
import { useVariableStore } from "@/stores/useVariableStore";
import { useResultStore } from "@/stores/useResultStore";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { Variable } from "@/types/Variable";
import { Log } from "@/types/Log";
import { Analytic } from "@/types/Analytic";
import { Statistic } from "@/types/Statistic";

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

const buildColumnLevels = (columns: ColumnHeader[]): ColumnHeader[][] => {
    const maxLevel = getMaxDepth(columns);
    const levels: ColumnHeader[][] = Array.from({ length: maxLevel }, () => []);
    const traverse = (cols: ColumnHeader[], level: number): void => {
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

// Define halign and valign types to match jspdf-autotable's requirements
type HAlignType = 'left' | 'center' | 'right' | 'justify';
type VAlignType = 'top' | 'middle' | 'bottom';

interface TableStyles {
    halign: HAlignType;
    valign: VAlignType;
    fillColor?: [number, number, number];
}

interface HeaderCell {
    content: string;
    colSpan: number;
    rowSpan: number;
    styles: TableStyles;
}

const mergeHeaderRowCells = (headerRow: HeaderCell[]): HeaderCell[] => {
    const merged: HeaderCell[] = [];
    let i = 0;
    while (i < headerRow.length) {
        const cell = headerRow[i];
        let totalColSpan = cell.colSpan;
        let j = i + 1;
        while (j < headerRow.length && headerRow[j].content === cell.content) {
            totalColSpan += headerRow[j].colSpan;
            j++;
        }
        merged.push({
            content: cell.content,
            colSpan: totalColSpan,
            rowSpan: cell.rowSpan,
            styles: { ...cell.styles }
        });
        i = j;
    }
    return merged;
};

// 2. In the generateAutoTableData function, we need to properly type the halign and valign values:
const generateAutoTableData = (data: string): AutoTableResult => {
    let parsedData: { tables: TableData[] };
    try {
        parsedData = JSON.parse(data);
    } catch {
        return { tables: [] };
    }
    if (!parsedData.tables || !Array.isArray(parsedData.tables)) return { tables: [] };
    const resultTables: AutoTableResult['tables'] = [];
    parsedData.tables.forEach((table) => {
        const { title, columnHeaders, rows } = table;
        const levels = buildColumnLevels(columnHeaders);
        const maxLevel = levels.length;
        let headerRows = levels.map((cols, level) =>
            cols.map((col) => {
                const colSpan = getLeafColumnCount(col);
                const hasChildren = col.children && col.children.length > 0;
                const rowSpan = hasChildren ? 1 : maxLevel - level;
                return {
                    content: col.header || "",
                    colSpan,
                    rowSpan,
                    styles: {
                        halign: "center" as HAlignType,
                        valign: "middle" as VAlignType
                    }
                };
            })
        );
        headerRows = headerRows.map(row => mergeHeaderRowCells(row));
        const flatRows = flattenRows(rows);
        if (flatRows.length === 0) return;
        const rowHeaderCount = computeMaxRowHeaderDepth(flatRows);
        const allLeafCols = getLeafColumnKeys(columnHeaders);
        const leafCols = allLeafCols.slice(rowHeaderCount);
        const mergedRowHeaders = generateMergedRowHeaders(flatRows, rowHeaderCount);
        const body: CellDef[][] = [];
        for (let i = 0; i < flatRows.length; i++) {
            const row = flatRows[i];
            const allDataNull = leafCols.every(k => row[k] == null);
            if (allDataNull && row.rowHeader.every(h => h !== "")) continue;
            const rowCells: CellDef[] = [];
            mergedRowHeaders[i].forEach(cell => {
                if (cell) rowCells.push(cell);
            });
            leafCols.forEach(key => {
                rowCells.push({
                    content: row[key] ?? "",
                    styles: {
                        halign: "center" as HAlignType,
                        valign: "middle" as VAlignType
                    }
                });
            });
            body.push(rowCells);
        }
        resultTables.push({ title, head: headerRows as CellDef[][], body });
    });
    return { tables: resultTables };
};

const getLeafColumnKeys = (cols: ColumnHeader[]): string[] => {
    const keys: string[] = [];
    const traverse = (col: ColumnHeader): void => {
        if (!col.children || col.children.length === 0) {
            keys.push(col.key ? col.key : col.header);
        } else {
            col.children.forEach(child => traverse(child));
        }
    };
    cols.forEach(c => traverse(c));
    return keys;
};

const computeMaxRowHeaderDepth = (rows: TableRowData[]): number => {
    let max = 0;
    rows.forEach(r => {
        if (r.rowHeader.length > max) max = r.rowHeader.length;
    });
    return max;
};

const propagateHeaders = (row: TableRowData, accumulated: (string | null)[]): TableRowData[] => {
    const combined: (string | null)[] = [];
    const length = Math.max(accumulated.length, row.rowHeader.length);
    for (let i = 0; i < length; i++) {
        combined[i] = row.rowHeader[i] ?? accumulated[i] ?? null;
    }
    if (row.children && row.children.length > 0) {
        let results: TableRowData[] = [];
        for (const child of row.children) {
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
    for (const row of rows) {
        result.push(...propagateHeaders(row, []));
    }
    return result;
};

interface MergedCell {
    content: string;
    rowSpan: number;
    colSpan: number;
    styles: TableStyles;
}

type MergedRowHeaders = (MergedCell | null)[][];

const generateMergedRowHeaders = (flatRows: TableRowData[], rowHeaderCount: number): (MergedCell | null)[][] => {
    const merged: (MergedCell | null)[][] = [];
    for (let rowIndex = 0; rowIndex < flatRows.length; rowIndex++) {
        const row = flatRows[rowIndex];
        const mergedRow: (MergedCell | null)[] = [];
        if (rowHeaderCount === 2 && row.rowHeader.filter(h => h !== "").length === 1) {
            const colIdx = 0;
            const current = row.rowHeader[colIdx] || "";
            const prev = rowIndex > 0 ? flatRows[rowIndex - 1].rowHeader[colIdx] || "" : null;
            if (rowIndex === 0 || current !== prev) {
                let rowSpan = 1;
                for (let next = rowIndex + 1; next < flatRows.length; next++) {
                    const nextVal = flatRows[next].rowHeader[colIdx] || "";
                    if (nextVal === current) rowSpan++;
                    else break;
                }
                mergedRow.push({
                    content: current,
                    rowSpan,
                    colSpan: 2,
                    styles: { halign: "left" as HAlignType, valign: "middle" as VAlignType }
                });
            } else {
                mergedRow.push(null);
            }
        } else {
            for (let colIdx = 0; colIdx < rowHeaderCount; colIdx++) {
                const current = row.rowHeader[colIdx] || "";
                const prev = rowIndex > 0 ? flatRows[rowIndex - 1].rowHeader[colIdx] || "" : null;
                if (rowIndex === 0 || current !== prev) {
                    let rowSpan = 1;
                    for (let next = rowIndex + 1; next < flatRows.length; next++) {
                        const nextVal = flatRows[next].rowHeader[colIdx] || "";
                        if (nextVal === current) rowSpan++;
                        else break;
                    }
                    mergedRow.push({
                        content: current,
                        rowSpan,
                        colSpan: 1,
                        styles: { halign: "center" as HAlignType, valign: "middle" as VAlignType }
                    });
                } else {
                    mergedRow.push(null);
                }
            }
        }
        merged.push(mergedRow);
    }
    return merged;
};

interface CellDef {
    content: string;
    styles?: TableStyles;
    rowSpan?: number;
    colSpan?: number;
}

interface AutoTableResult {
    tables: {
        title: string;
        head: CellDef[][];
        body: CellDef[][];
    }[];
}


interface PrintModalProps {
    onClose: () => void;
}

interface SelectedOptions {
    data: boolean;
    variable: boolean;
    result: boolean;
}

type PaperSize = "a4" | "a3" | "letter" | "legal";

const PrintModal: FC<PrintModalProps> = ({ onClose }) => {
    const [fileName, setFileName] = useState<string>("");
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
        data: false,
        variable: false,
        result: false
    });
    const [paperSize, setPaperSize] = useState<PaperSize>("a4");
    const [availableData, setAvailableData] = useState<DataRow[]>([]);
    const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);

    const dataStore = useDataStore();
    const variableStore = useVariableStore();
    const resultStore = useResultStore();

    const logs: Log[] = resultStore.logs || [];

    useEffect(() => {
        const loadData = async (): Promise<void> => {
            try {
                // Get data and variables directly from the stores
                const data = dataStore.data || [];
                const variables = variableStore.variables || [];

                setAvailableData(data);
                setAvailableVariables(variables);
            } catch (error) {
                console.error("Error loading data for print:", error);
            }
        };

        loadData();
    }, [dataStore, variableStore]);

    const handleOptionChange = (option: keyof SelectedOptions): void => {
        setSelectedOptions((prev) => ({ ...prev, [option]: !prev[option] }));
    };

    const handlePrint = async (): Promise<void> => {
        // Cast to make TypeScript happy with the missing properties
        const doc = new jsPDF({ format: paperSize }) as any;
        let currentY = 10;

        const namedVariables = (availableVariables || []).filter(
            (v) => String(v.name || "").trim() !== ""
        );

        const activeColumns = namedVariables
            .filter((v) =>
                (availableData || []).some((row) => String(row[v.columnIndex] ?? "").trim() !== "")
            )
            .map((v) => v.columnIndex)
            .sort((a, b) => a - b);

        const filteredData = availableData.filter((row) =>
            activeColumns.some((col) => String(row[col] ?? "").trim() !== "")
        );

        if (selectedOptions.data && activeColumns.length > 0) {
            doc.setFontSize(14);
            doc.text("Data", 14, currentY, { align: "left" });
            currentY += 6;
            doc.setFontSize(8);

            const dataTableColumns = activeColumns.map((col) => {
                const variable = availableVariables.find((v) => v.columnIndex === col);
                return variable?.name || `Kolom ${col + 1}`;
            });

            const dataTableBody = filteredData.map((row) =>
                activeColumns.map((col) => row[col] || "")
            );

            autoTable(doc, {
                head: [dataTableColumns],
                body: dataTableBody,
                startY: currentY,
                theme: "grid",
                styles: { fontSize: 8, cellWidth: "wrap" },
                headStyles: { fillColor: [211, 211, 211], halign: "center" as HAlignType, valign: "middle" as VAlignType },
                margin: { left: 14, right: 14 },
                tableWidth: doc.internal.pageSize.getWidth() - 28
            });

            if (doc.lastAutoTable) {
                currentY = doc.lastAutoTable.finalY + 10;
            }
        }

        if (selectedOptions.variable) {
            doc.setFontSize(14);
            doc.text("Variables", 14, currentY, { align: "left" });
            currentY += 6;
            doc.setFontSize(8);

            const variableData = availableVariables
                .filter((v) => activeColumns.includes(v.columnIndex))
                .map((variable, idx) => [
                    idx + 1,
                    variable.name,
                    variable.type,
                    variable.columnIndex + 1
                ]);

            autoTable(doc, {
                head: [["No", "Nama", "Tipe", "Kolom"]],
                body: variableData,
                startY: currentY,
                styles: { fontSize: 8, cellWidth: "wrap" },
                headStyles: { fillColor: [211, 211, 211], halign: "center" as HAlignType, valign: "middle" as VAlignType },
                margin: { left: 14, right: 14 },
                tableWidth: doc.internal.pageSize.getWidth() - 28
            });

            if (doc.lastAutoTable) {
                currentY = doc.lastAutoTable.finalY + 10;
            }
        }

        if (selectedOptions.result && logs && logs.length > 0) {
            doc.setFontSize(14);
            doc.text("Results", 14, currentY, { align: "left" });
            currentY += 6;
            doc.setFontSize(8);

            logs.forEach((log) => {
                doc.setFontSize(8);
                doc.text(`Log ${log.id}: ${log.log}`, 14, currentY, { align: "left" });
                currentY += 6;

                // Analytics are inside the log object
                if (log.analytics && log.analytics.length > 0) {
                    log.analytics.forEach((analytic) => {
                        doc.setFontSize(12);
                        doc.text(analytic.title, doc.internal.pageSize.getWidth() / 2, currentY, { align: "center" });
                        currentY += 6;

                        // Statistics are inside the analytic object
                        if (analytic.statistics && analytic.statistics.length > 0) {
                            analytic.statistics.forEach((stat) => {
                                const { tables } = generateAutoTableData(stat.output_data);

                                tables.forEach((tbl) => {
                                    doc.setFontSize(8);
                                    doc.text(tbl.title, 14, currentY, { align: "left" });
                                    currentY += 6;

                                    autoTable(doc, {
                                        head: tbl.head,
                                        body: tbl.body,
                                        startY: currentY,
                                        theme: "grid",
                                        styles: { fontSize: 8, cellWidth: "wrap" },
                                        headStyles: { fillColor: [211, 211, 211], halign: "center" as HAlignType, valign: "middle" as VAlignType },
                                        margin: { left: 14, right: 14 },
                                        tableWidth: doc.internal.pageSize.getWidth() - 28
                                    });

                                    if (doc.lastAutoTable) {
                                        currentY = doc.lastAutoTable.finalY + 10;
                                    }
                                });
                            })
                        }
                    })
                }
            });
        }

        try {
            doc.save(`${fileName || "print_output"}.pdf`);
            onClose();
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };

    const isPrintDisabled = !Object.values(selectedOptions).some(Boolean);

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Print Settings</DialogTitle>
                <DialogDescription>
                    Konfigurasi pengaturan untuk mencetak dokumen
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="filename" className="text-right">
                        Nama File
                    </label>
                    <input
                        id="filename"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="col-span-3 border p-2 rounded"
                        placeholder="Masukkan nama file"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-right">Pilih Konten</span>
                    <div className="col-span-3 flex flex-col gap-2">
                        {Object.entries(selectedOptions).map(([option, checked]) => (
                            <label key={option} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                        handleOptionChange(option as keyof SelectedOptions)
                                    }
                                    className="w-4 h-4"
                                />
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="paperSize" className="text-right">
                        Ukuran Kertas
                    </label>
                    <select
                        id="paperSize"
                        value={paperSize}
                        onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                        className="col-span-3 border p-2 rounded"
                    >
                        {["a4", "a3", "letter", "legal"].map((size) => (
                            <option key={size} value={size}>
                                {size.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                    Batal
                </Button>
                <Button onClick={handlePrint} disabled={isPrintDisabled}>
                    Print
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default PrintModal;