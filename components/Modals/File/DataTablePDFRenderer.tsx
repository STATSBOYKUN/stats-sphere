"use client";
export function DataTablePDFRenderer({ data }) {
    let parsedData;
    try {
        parsedData = JSON.parse(data);
    } catch {
        return [{ text: "Invalid JSON format", color: "red", fontSize: 10 }];
    }
    if (!parsedData.tables || !Array.isArray(parsedData.tables))
        return [{ text: "Invalid tables format", color: "red", fontSize: 10 }];
    const content = [];
    for (let t = 0; t < parsedData.tables.length; t++) {
        const table = parsedData.tables[t];
        const { title, columnHeaders, rows } = table;
        const leafPaths = getLeafPaths(columnHeaders);
        const maxDepth = Math.max(...leafPaths.map((p) => p.length));
        const headerRows = buildHeaderRows(leafPaths, maxDepth);
        const allLeafCols = getLeafColumnKeys(columnHeaders);
        const flatRows = flattenRows(rows);
        if (flatRows.length === 0) continue;
        const rowHeaderCount = computeMaxRowHeaderDepth(flatRows);
        const dataCols = allLeafCols.slice(rowHeaderCount);
        const totalColumns = allLeafCols.length;
        const numRows = flatRows.length;
        const headerCells = Array(numRows)
            .fill(0)
            .map(() => Array(rowHeaderCount).fill(null));
        for (let j = 0; j < rowHeaderCount; j++) {
            let i = 0;
            while (i < numRows) {
                const value = flatRows[i].rowHeader[j] || "";
                let count = 1;
                for (let k = i + 1; k < numRows; k++) {
                    if (flatRows[k].rowHeader[j] === value) count++;
                    else break;
                }
                headerCells[i][j] = { text: value, style: "rowHeaderCell", alignment: "left" };
                if (count > 1) headerCells[i][j].rowSpan = count;
                for (let k = i + 1; k < i + count; k++) {
                    headerCells[k][j] = "skip";
                }
                i += count;
            }
        }
        const bodyRows = [];
        for (let i = 0; i < numRows; i++) {
            const rowCells = [];
            for (let j = 0; j < rowHeaderCount; j++) {
                rowCells.push(headerCells[i][j] !== "skip" ? headerCells[i][j] : {});
            }
            for (let col of dataCols) {
                rowCells.push({ text: flatRows[i][col] || "", style: "bodyCell", alignment: "center" });
            }
            bodyRows.push(rowCells);
        }
        const tableBody = headerRows.concat(bodyRows);
        content.push({ text: title, style: "tableTitle" });
        content.push({
            table: { headerRows: headerRows.length, widths: Array(totalColumns).fill("*"), body: tableBody },
            layout: "lightHorizontalLines",
        });
    }
    return content;
}
function getLeafPaths(columns, currentPath = []) {
    let paths = [];
    for (let col of columns) {
        const newPath = currentPath.concat(col.header);
        if (col.children && col.children.length > 0) {
            paths = paths.concat(getLeafPaths(col.children, newPath));
        } else {
            paths.push(newPath);
        }
    }
    return paths;
}
function getLeafColumnKeys(columns) {
    let keys = [];
    function traverse(col) {
        if (!col.children || col.children.length === 0) {
            keys.push(col.key ? col.key : col.header);
        } else {
            col.children.forEach(traverse);
        }
    }
    columns.forEach(traverse);
    return keys;
}
function getMaxDepth(columns) {
    let max = 1;
    for (let col of columns) {
        if (col.children && col.children.length > 0) {
            const depth = 1 + getMaxDepth(col.children);
            if (depth > max) max = depth;
        }
    }
    return max;
}
function propagateHeaders(row, accumulated) {
    const combined = [];
    const length = Math.max(accumulated.length, row.rowHeader.length);
    for (let i = 0; i < length; i++) {
        combined[i] = row.rowHeader[i] !== undefined ? row.rowHeader[i] : accumulated[i] !== undefined ? accumulated[i] : null;
    }
    if (row.children && row.children.length > 0) {
        let results = [];
        for (let child of row.children) {
            results = results.concat(propagateHeaders(child, combined));
        }
        return results;
    } else {
        row.rowHeader = combined;
        return [row];
    }
}
function flattenRows(rows) {
    let result = [];
    for (let row of rows) {
        result = result.concat(propagateHeaders(row, []));
    }
    return result;
}
function computeMaxRowHeaderDepth(rows) {
    let max = 0;
    for (let r of rows) {
        if (r.rowHeader.length > max) max = r.rowHeader.length;
    }
    return max;
}
function buildHeaderRows(leafPaths, maxDepth) {
    const headerRows = [];
    for (let r = 0; r < maxDepth; r++) {
        const row = [];
        let i = 0;
        while (i < leafPaths.length) {
            if (leafPaths[i].length <= r) {
                i++;
                continue;
            }
            const text = leafPaths[i][r];
            let count = 1;
            while (i + count < leafPaths.length && leafPaths[i + count].length > r && leafPaths[i + count][r] === text) {
                count++;
            }
            const rowSpan = leafPaths[i].length === r + 1 ? maxDepth - r : 1;
            const cell = { text: text, style: "headerCell", alignment: "center" };
            if (count > 1) cell.colSpan = count;
            if (rowSpan > 1) cell.rowSpan = rowSpan;
            row.push(cell);
            for (let j = 1; j < count; j++) {
                row.push({});
            }
            i += count;
        }
        headerRows.push(row);
    }
    return headerRows;
}
export default DataTablePDFRenderer;
