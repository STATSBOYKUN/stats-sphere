// components/Modals/Print/PrintModal.tsx
"use client";

import React, { useState, FC } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ModalType, useModal } from "@/hooks/useModal";
import {useDataStore} from "@/stores/useDataStore";
import {useVariableStore} from "@/stores/useVariableStore";
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import useResultStore from "@/stores/useResultStore";

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
    },
    title: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 14,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    tableHeaderCell: {
        flex: 1,
        padding: 5,
        fontWeight: 'bold',
        backgroundColor: '#f0f0f0',
        borderRightWidth: 1,
        borderRightColor: '#000',
        textAlign: 'center',
    },
    tableCell: {
        flex: 1,
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: '#000',
        textAlign: 'center',
    },

    resultLog: {
        marginBottom: 15,
    },
    logTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    analyticCard: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 10,
        marginBottom: 10,
    },
    analyticTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    analyticNote: {
        fontSize: 9,
        fontStyle: 'italic',
        color: '#666',
        marginBottom: 5,
    },
    statisticSection: {
        marginTop: 8,
    },
    componentTitle: {
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 5,
    },
    dataTable: {
        marginVertical: 8,
    },
    tableTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    tableHeader: {
        borderWidth: 1,
        borderColor: '#000',
    },
    headerRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#000',
    },
    headerCell: {
        padding: 4,
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: '#f0f0f0',
    },
    tableBody: {
        borderWidth: 1,
        borderColor: '#000',
        borderTopWidth: 0,
    },
    rowHeaderCell: {
        padding: 4,
        fontSize: 8,
        textAlign: 'left',
        backgroundColor: '#f8f8f8',
        width: 60,
    },
    bodyCell: {
        padding: 4,
        fontSize: 8,
        textAlign: 'center',
        flex: 1,
    },
    errorText: {
        color: '#ff0000',
        fontSize: 8,
    },
});

interface PrintModalProps {
    onClose: () => void;
}

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

const PrintModal: FC<PrintModalProps> = ({ onClose }) => {
    const [fileName, setFileName] = useState("");
    const [selectedOptions, setSelectedOptions] = useState({
        data: false,
        variable: false,
        result: false,
    });
    const [paperSize, setPaperSize] = useState("A4");

    const handleOptionChange = (option: keyof typeof selectedOptions) => {
        setSelectedOptions(prev => ({
            ...prev,
            [option]: !prev[option]
        }));
    };

    const handlePrint = async () => {
        const data = useDataStore.getState().data;
        const variables = useVariableStore.getState().variables;
        const logs = useResultStore.getState().logs;
        const analytics = useResultStore.getState().analytics;
        const statistics = useResultStore.getState().statistics

        // 1. Filter variabel yang memiliki nama dan data
        const namedVariables = variables.filter(v => v.name.trim() !== '');

        // 2. Cari kolom yang memiliki data
        const activeColumns = namedVariables
            .filter(v => data.some(row => (row[v.columnIndex]?.trim() ?? '') !== ''))
            .map(v => v.columnIndex)
            .sort((a, b) => a - b);

        // 3. Cari rentang baris yang memiliki data di kolom aktif
        const filteredData = data
            .map((row, index) => ({ index, row }))
            .filter(({ row }) =>
                activeColumns.some(col => (row[col]?.trim() ?? '') !== '')
            )
            .map(({ row }) => row);

        const PDFDocument = () => (
            <Document>
                <Page size={paperSize} style={styles.page}>
                    {/* Tabel Data */}
                    {selectedOptions.data && activeColumns.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionHeader}>Data</Text>
                            <View style={styles.table}>
                                {/* Header Kolom */}
                                <View style={styles.tableRow}>
                                    {activeColumns.map(col => {
                                        const variable = variables.find(v => v.columnIndex === col);
                                        return (
                                            <Text key={col} style={styles.tableHeaderCell}>
                                                {variable?.name || `Kolom ${col + 1}`}
                                            </Text>
                                        );
                                    })}
                                </View>

                                {/* Isi Data */}
                                {filteredData.map((row, rowIndex) => (
                                    <View key={rowIndex} style={styles.tableRow}>
                                        {activeColumns.map(col => (
                                            <Text key={col} style={styles.tableCell}>
                                                {row[col] || ''}
                                            </Text>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Tabel Variabel */}
                    {selectedOptions.variable && (
                        <View style={styles.section}>
                            <Text style={styles.sectionHeader}>Variables</Text>
                            <View style={styles.table}>
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableHeaderCell}>No</Text>
                                    <Text style={styles.tableHeaderCell}>Nama</Text>
                                    <Text style={styles.tableHeaderCell}>Tipe</Text>
                                    <Text style={styles.tableHeaderCell}>Kolom</Text>
                                </View>
                                {variables
                                    .filter(v => activeColumns.includes(v.columnIndex))
                                    .map((variable, idx) => (
                                        <View key={variable.columnIndex} style={styles.tableRow}>
                                            <Text style={styles.tableCell}>{idx + 1}</Text>
                                            <Text style={styles.tableCell}>{variable.name}</Text>
                                            <Text style={styles.tableCell}>{variable.type}</Text>
                                            <Text style={styles.tableCell}>{variable.columnIndex + 1}</Text>
                                        </View>
                                    ))}
                            </View>
                        </View>
                    )}

                    {/* Tabel Hasil */}
                    {selectedOptions.result && (
                        <View style={styles.section}>
                            <Text style={styles.sectionHeader}>Results</Text>
                            {logs.map((log) => (
                                <View key={log.id} style={styles.resultLog}>
                                    <Text style={styles.logTitle}>Log {log.id}: {log.log}</Text>

                                    {analytics
                                        .filter((analytic) => analytic.log_id === log.id)
                                        .map((analytic) => (
                                            <View key={analytic.id} style={styles.analyticCard}>
                                                <Text style={styles.analyticTitle}>{analytic.title}</Text>

                                                {analytic.note && (
                                                    <Text style={styles.analyticNote}>{analytic.note}</Text>
                                                )}

                                                {statistics
                                                    .filter((stat) => stat.analytic_id === analytic.id)
                                                    .map((stat) => (
                                                        <View key={stat.id} style={styles.statisticSection}>
                                                            <Text style={styles.componentTitle}>{stat.components}</Text>
                                                            <ResultTable data={stat.output_data} />
                                                        </View>
                                                    ))}
                                            </View>
                                        ))}
                                </View>
                            ))}
                        </View>
                    )}
                </Page>
            </Document>
        );

        // Tambahkan komponen ResultTable
        const ResultTable = ({ data }: { data: string }) => {
            try {
                const parsedData: { tables: TableData[] } = JSON.parse(data);

                return (
                    <>
                        {parsedData.tables.map((table, tableIndex) => {
                            const leafCols = getLeafColumnKeys(table.columnHeaders);
                            const flatRows = flattenRows(table.rows);
                            const rowHeaderCount = computeMaxRowHeaderDepth(flatRows);

                            return (
                                <View key={tableIndex} style={styles.dataTable}>
                                    <Text style={styles.tableTitle}>{table.title}</Text>

                                    {/* Table Header */}
                                    <TableHeader headers={table.columnHeaders} />

                                    {/* Table Body */}
                                    <View style={styles.tableBody}>
                                        {flatRows.map((row, rowIndex) => {
                                            // Filter row kosong
                                            const isEmptyRow = leafCols.every(k => row[k] == null) &&
                                                row.rowHeader.every(h => h !== "");
                                            if (isEmptyRow) return null;

                                            return (
                                                <View key={rowIndex} style={styles.tableRow}>
                                                    {/* Row Headers */}
                                                    {row.rowHeader.map((header, idx) => (
                                                        <Text key={idx} style={styles.rowHeaderCell}>
                                                            {header}
                                                        </Text>
                                                    ))}

                                                    {/* Data Cells */}
                                                    {leafCols.map((colKey, i) => (
                                                        <Text key={i} style={styles.bodyCell}>
                                                            {row[colKey] ?? ''}
                                                        </Text>
                                                    ))}
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            );
                        })}
                    </>
                );
            } catch (error) {
                return <Text style={styles.errorText}>Invalid table data format</Text>;
            }
        };

        const TableHeader = ({ headers }: { headers: ColumnHeader[] }) => {
            const levels = buildColumnLevels(headers);
            const maxDepth = getMaxDepth(headers);

            return (
                <View style={styles.tableHeader}>
                    {levels.map((cols, level) => (
                        <View key={level} style={styles.headerRow}>
                            {cols.map((col, idx) => {
                                const colSpan = getLeafColumnCount(col);
                                return (
                                    <View key={idx} style={{ flex: colSpan }}>
                                        <Text style={styles.headerCell}>{col.header}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </View>
            );
        };

        const TableBody = ({ rows, columnHeaders }: { rows: TableRowData[]; columnHeaders: ColumnHeader[] }) => {
            const flatRows = flattenRows(rows);
            const rowHeaderCount = computeMaxRowHeaderDepth(flatRows);
            const leafCols = getLeafColumnKeys(columnHeaders);

            return (
                <View style={styles.tableBody}>
                    {flatRows.map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.tableRow}>
                            {/* Row Headers */}
                            {row.rowHeader.map((header, idx) => (
                                <Text key={idx} style={styles.rowHeaderCell}>
                                    {header}
                                </Text>
                            ))}

                            {/* Data Cells */}
                            {leafCols.map((colKey, i) => (
                                <Text key={i} style={styles.bodyCell}>
                                    {row[colKey] ?? ''}
                                </Text>
                            ))}
                        </View>
                    ))}
                </View>
            );
        };

        // Tambahkan fungsi helper yang sama dengan DataTableRenderer
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

        const getLeafColumnCount = (col: ColumnHeader): number => {
            if (!col.children || col.children.length === 0) return 1;
            return col.children.reduce((sum, child) => sum + getLeafColumnCount(child), 0);
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

        const computeMaxRowHeaderDepth = (rows: TableRowData[]): number => {
            let max = 0;
            rows.forEach(r => {
                if (r.rowHeader.length > max) max = r.rowHeader.length;
            });
            return max;
        };

        const getLeafColumnKeys = (cols: ColumnHeader[]): string[] => {
            const keys: string[] = [];
            const traverse = (col: ColumnHeader) => {
                if (!col.children || col.children.length === 0) {
                    keys.push(col.key ? col.key : col.header);
                } else {
                    col.children.forEach(ch => traverse(ch));
                }
            };
            cols.forEach(c => traverse(c));
            return keys;
        };

        try {
            // Generate PDF blob
            const blob = await pdf(<PDFDocument />).toBlob();

            // Download file
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName || 'print_output'}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            onClose();
        } catch (error) {
            console.error('Error generating PDF:', error);
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
                                    onChange={() => handleOptionChange(option as keyof typeof selectedOptions)}
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
                        onChange={(e) => setPaperSize(e.target.value)}
                        className="col-span-3 border p-2 rounded"
                    >
                        {["A4", "A3", "Letter", "Legal"].map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                    Batal
                </Button>
                <Button
                    onClick={handlePrint}
                    disabled={isPrintDisabled}
                >
                    Print
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default PrintModal;