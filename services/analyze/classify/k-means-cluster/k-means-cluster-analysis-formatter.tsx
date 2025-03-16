import {
    ClusterAnalysisInput,
    RowData,
    ResultJson,
    Table,
} from "@/models/classify/k-means-cluster/k-means-cluster-output";

/**
 * Memformat angka sesuai kebutuhan tampilan
 * @param {number | undefined | null} num - Angka yang akan diformat
 * @return {string | null} - Angka yang telah diformat sebagai string
 */
function formatDisplayNumber(num: number | undefined | null): string | null {
    if (typeof num === "undefined" || num === null) return null;
    if (isNaN(Number(num))) return "NaN";

    if (Number.isInteger(num)) {
        return num.toString();
    } else {
        // Format angka desimal
        if (num === 100) {
            return "100.0";
        } else if (num < 1 && num > 0) {
            return num.toFixed(3).replace(/0+$/, "");
        } else {
            // Untuk sebagian besar nomor desimal
            return num.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
        }
    }
}

/**
 * Konversi data cluster analysis ke format JSON terstruktur
 * @param {ClusterAnalysisInput} jsonData - Data JSON input dari analisis cluster
 * @return {ResultJson} - Data JSON terstruktur sesuai format yang diinginkan
 */
export function convertClusterAnalysisData(
    jsonData: ClusterAnalysisInput
): ResultJson {
    // Ekstrak data dari input JSON
    const data = jsonData.data;

    // Buat struktur JSON hasil
    const resultJson: ResultJson = {
        tables: [],
    };

    // 1. Tabel Distances between Final Cluster Centers
    if (data.distance_matrix && data.distance_matrix.distances) {
        const distancesTable: Table = {
            title: "Distances between Final Cluster Centers",
            columnHeaders: [{ header: "Cluster" }],
            rows: [],
        };

        const numClusters = data.distance_matrix.num_clusters;

        // Tambahkan header kolom
        for (let i = 1; i <= numClusters; i++) {
            distancesTable.columnHeaders.push({ header: i.toString() });
        }

        // Isi data baris
        for (let i = 0; i < numClusters; i++) {
            const rowValues: (string | null)[] = [];

            for (let j = 0; j < numClusters; j++) {
                if (i === j) {
                    rowValues.push(null);
                } else {
                    const distance = data.distance_matrix.distances[i][j];
                    rowValues.push(formatDisplayNumber(distance));
                }
            }

            distancesTable.rows.push({
                rowHeader: [(i + 1).toString(), null],
                values: rowValues as string[],
            });
        }

        resultJson.tables.push(distancesTable);
    }

    // 4. Quick Cluster - Initial Cluster Centers
    if (data.initial_centers) {
        const initialCentersTable: Table = {
            title: "Initial Cluster Centers",
            sectionTitle: "Quick Cluster",
            columnHeaders: [
                { header: "" },
                { header: "Cluster", colspan: data.initial_centers.length },
            ],
            rows: [],
        };

        // Add sub-header row
        const subHeaderValues: string[] = [];
        for (let i = 0; i < data.initial_centers.length; i++) {
            subHeaderValues.push((i + 1).toString());
        }

        initialCentersTable.rows.push({
            rowHeader: ["", null],
            values: subHeaderValues,
            isSubHeader: true,
        });

        // Get variable names
        const varNames = data.variable_names || [""];

        // Build rows for each variable
        for (let i = 0; i < varNames.length; i++) {
            const row: RowData = {
                rowHeader: [varNames[i], null],
                values: [],
            };

            // Add values for each cluster
            for (let j = 0; j < data.initial_centers.length; j++) {
                const center = data.initial_centers[j];
                row.values!.push(
                    center[i] !== undefined
                        ? formatDisplayNumber(center[i])!
                        : ""
                );
            }

            initialCentersTable.rows.push(row);
        }

        resultJson.tables.push(initialCentersTable);
    }

    // 5. Iteration History
    if (data.iterations) {
        const iterationHistoryTable: Table = {
            title: "Iteration History",
            columnHeaders: [
                { header: "Iteration" },
                {
                    header: "Change in Cluster Centers",
                    colspan: data.iterations[0].length,
                },
            ],
            rows: [],
        };

        // Add sub-header row
        const subHeaderValues: string[] = [];
        for (let i = 0; i < data.iterations[0].length; i++) {
            subHeaderValues.push((i + 1).toString());
        }

        iterationHistoryTable.rows.push({
            rowHeader: ["", null],
            values: subHeaderValues,
            isSubHeader: true,
        });

        // Add rows for each iteration
        for (let i = 0; i < data.iterations.length; i++) {
            const row: RowData = {
                rowHeader: [(i + 1).toString(), null],
                values: [],
            };

            // Use actual data without modification
            for (let j = 0; j < data.iterations[i].length; j++) {
                const value = data.iterations[i][j];
                const formattedValue = formatDisplayNumber(value);
                row.values!.push(formattedValue || "");
            }

            iterationHistoryTable.rows.push(row);
        }

        // Tambahkan footer sebagai row dengan isFooter=true
        iterationHistoryTable.rows.push({
            rowHeader: [
                "a. Convergence achieved due to no or small change in cluster centers. The maximum absolute coordinate change for any center is .000. The current iteration is " +
                    data.iteration_count +
                    ". The minimum distance between initial centers is " +
                    formatDisplayNumber(data.min_distance_initial || NaN) +
                    ".",
                null,
            ],
            isFooter: true,
            values: [],
        });

        resultJson.tables.push(iterationHistoryTable);
    }

    // 6. Final Cluster Centers
    if (data.final_centers) {
        const finalCentersTable: Table = {
            title: "Final Cluster Centers",
            columnHeaders: [
                { header: "" },
                { header: "Cluster", colspan: data.final_centers.length },
            ],
            rows: [],
        };

        // Add sub-header row
        const subHeaderValues: string[] = [];
        for (let i = 0; i < data.final_centers.length; i++) {
            subHeaderValues.push((i + 1).toString());
        }

        finalCentersTable.rows.push({
            rowHeader: ["", null],
            values: subHeaderValues,
            isSubHeader: true,
        });

        // Get variable names
        const varNames = data.variable_names || [""];

        // Add rows for each variable
        for (let i = 0; i < varNames.length; i++) {
            const row: RowData = {
                rowHeader: [varNames[i], null],
                values: [],
            };

            // Add values for each cluster - use actual data without modification
            for (let j = 0; j < data.final_centers.length; j++) {
                const center = data.final_centers[j];
                row.values!.push(
                    center[i] !== undefined
                        ? formatDisplayNumber(center[i])!
                        : ""
                );
            }

            finalCentersTable.rows.push(row);
        }

        resultJson.tables.push(finalCentersTable);
    }

    // 7. Number of Cases in each Cluster
    if (data.case_statistics && data.case_statistics.cluster_counts) {
        const clusterCounts = [...data.case_statistics.cluster_counts];

        const caseCountTable: Table = {
            title: "Number of Cases in each Cluster",
            columnHeaders: [
                { header: "Cluster" },
                { header: "1" },
                { header: formatDisplayNumber(clusterCounts[0])! + ".000" },
            ],
            rows: [],
        };

        // Add rows for each remaining cluster, valid, and missing
        for (let i = 1; i < clusterCounts.length; i++) {
            caseCountTable.rows.push({
                rowHeader: [(i + 1).toString(), null],
                values: [formatDisplayNumber(clusterCounts[i])! + ".000"],
            });
        }

        // Calculate valid count as sum of all cluster counts
        const validCount = clusterCounts.reduce((sum, count) => sum + count, 0);

        // Add Valid and Missing rows
        caseCountTable.rows.push({
            rowHeader: ["Valid", null],
            values: [formatDisplayNumber(validCount)! + ".000"],
        });

        caseCountTable.rows.push({
            rowHeader: ["Missing", null],
            values: [
                formatDisplayNumber(data.case_statistics.missing_count)! +
                    ".000",
            ],
        });

        resultJson.tables.push(caseCountTable);
    }

    // 8. Cluster Membership dengan Detail
    if (data.membership_info) {
        const clusterMembershipDetailTable: Table = {
            title: "Cluster Membership",
            columnHeaders: [
                { header: "Case Number" },
                { header: "gender" },
                { header: "Cluster" },
                { header: "Distance" },
            ],
            rows: [],
        };

        const caseNumbers = data.membership_info.case_numbers;
        const clusters = data.membership_info.clusters;
        const distances = data.membership_info.distances;

        for (let i = 0; i < caseNumbers.length; i++) {
            clusterMembershipDetailTable.rows.push({
                rowHeader: [caseNumbers[i].toString(), null],
                values: [
                    "", // Kosongkan gender karena tidak tersedia
                    (clusters[i] + 1).toString(),
                    formatDisplayNumber(distances[i]) || "",
                ],
            });
        }

        resultJson.tables.push(clusterMembershipDetailTable);
    }

    // 9. ANOVA Table
    if (data.anova_table) {
        const anovaTable: Table = {
            title: "ANOVA",
            columnHeaders: [
                { header: "" },
                { header: "Cluster", colspan: 2 },
                { header: "Error", colspan: 2 },
                { header: "" },
                { header: "" },
            ],
            rows: [],
        };

        // Add sub-headers as a row with isSubHeader=true
        anovaTable.rows.push({
            rowHeader: ["", null],
            values: ["Mean Square", "df", "Mean Square", "df", "F", "Sig."],
            isSubHeader: true,
        });

        const variables = data.anova_table.variables;
        const clusterMeanSquares = data.anova_table.cluster_mean_squares;
        const errorMeanSquares = data.anova_table.error_mean_squares;
        const clusterDf = data.anova_table.cluster_df;
        const errorDf = data.anova_table.error_df;
        const fValues = data.anova_table.f_values;
        const significance = data.anova_table.significance;

        for (let i = 0; i < variables.length; i++) {
            const row: RowData = {
                rowHeader: [variables[i], null],
                values: [
                    formatDisplayNumber(clusterMeanSquares[i]) || "",
                    formatDisplayNumber(clusterDf) || "",
                    formatDisplayNumber(errorMeanSquares[i]) || "",
                    formatDisplayNumber(errorDf) || "",
                    formatDisplayNumber(fValues[i]) || "",
                    formatDisplayNumber(significance[i]) || "",
                ],
            };

            anovaTable.rows.push(row);
        }

        // Add footer as a row with isFooter=true
        anovaTable.rows.push({
            rowHeader: [
                "The F tests should be used only for descriptive purposes because the clusters have been chosen to maximize the differences among cases in different clusters. The observed significance levels are not corrected for this and thus cannot be interpreted as tests of the hypothesis that the cluster means are equal.",
                null,
            ],
            isFooter: true,
            values: [],
        });

        resultJson.tables.push(anovaTable);
    }

    return resultJson;
}
