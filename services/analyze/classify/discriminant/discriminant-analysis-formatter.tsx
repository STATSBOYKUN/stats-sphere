import {
    JsonData,
    ResultJson,
    TableRow,
    Table,
} from "@/models/classify/discriminant/discriminant-ouput";

// Fungsi utama untuk mengonversi data statistik ke format JSON yang ditentukan
export function convertStatisticalData(jsonData: JsonData): ResultJson {
    // Fungsi untuk memformat angka sesuai dengan tampilan yang diinginkan
    function formatDisplayNumber(
        num: number | undefined | null
    ): string | null {
        if (typeof num === "undefined" || num === null) return null;

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

    // Buat struktur JSON hasil
    const resultJson: ResultJson = {
        tables: [],
    };

    // 1. Tabel Case Processing Summary
    const caseProcessingSummary: Table = {
        title: "Analysis Case Processing Summary",
        columnHeaders: [
            { header: "" },
            { header: "Unweighted Cases" },
            { header: "N" },
            { header: "Percent" },
        ],
        rows: [
            {
                rowHeader: ["Valid", null],
                N: jsonData.case_processing_summary.valid_count,
                Percent:
                    jsonData.case_processing_summary.valid_percent.toFixed(1),
            },
            {
                rowHeader: ["Excluded", "Missing or out-of-range group codes"],
                N: jsonData.case_processing_summary.excluded_missing_group,
                Percent:
                    jsonData.case_processing_summary.excluded_missing_group_percent.toFixed(
                        1
                    ),
            },
            {
                rowHeader: ["", "At least one missing discriminating variable"],
                N: jsonData.case_processing_summary.excluded_missing_var,
                Percent:
                    jsonData.case_processing_summary.excluded_missing_var_percent.toFixed(
                        1
                    ),
            },
            {
                rowHeader: [
                    "",
                    "Both missing or out-of-range group codes and at least one missing discriminating variable",
                ],
                N: jsonData.case_processing_summary.excluded_both,
                Percent:
                    jsonData.case_processing_summary.excluded_both_percent.toFixed(
                        1
                    ),
            },
            {
                rowHeader: ["", "Total"],
                N: jsonData.case_processing_summary.excluded_total,
                Percent:
                    jsonData.case_processing_summary.excluded_total_percent.toFixed(
                        1
                    ),
            },
            {
                rowHeader: ["Total", null],
                N: jsonData.case_processing_summary.total_count,
                Percent:
                    jsonData.case_processing_summary.total_percent.toFixed(1),
            },
        ],
    };
    resultJson.tables.push(caseProcessingSummary);

    // 2. Tabel Group Statistics
    const groupStatistics: Table = {
        title: "Group Statistics",
        columnHeaders: [
            { header: jsonData.group_name },
            { header: "" },
            { header: "Mean" },
            { header: "Std. Deviation" },
            { header: "Unweighted" },
            { header: "Weighted" },
        ],
        rows: [],
    };

    // Mengisi data untuk setiap grup dan variabel
    for (let i = 0; i < jsonData.group_statistics.group_values.length; i++) {
        const groupValue = jsonData.group_statistics.group_values[i];
        const varNames = jsonData.group_statistics.variable_names;

        for (let j = 0; j < varNames.length; j++) {
            const row: TableRow = {
                rowHeader: [groupValue.toString(), varNames[j]],
            };

            // Hanya tambahkan nilai yang tidak kosong
            const mean = formatDisplayNumber(
                jsonData.group_statistics.means[i][j]
            );
            const stdDev = formatDisplayNumber(
                jsonData.group_statistics.std_deviations[i][j]
            );
            const unweighted = formatDisplayNumber(
                jsonData.group_statistics.unweighted_counts[i]
            );
            const weighted = formatDisplayNumber(
                jsonData.group_statistics.weighted_counts[i]
            );

            if (mean) row["Mean"] = mean;
            if (stdDev) row["Std. Deviation"] = stdDev;
            if (unweighted) row["Unweighted"] = unweighted;
            if (weighted) row["Weighted"] = weighted;

            groupStatistics.rows.push(row);
        }
    }

    // Tambahkan total untuk setiap variabel
    for (let j = 0; j < jsonData.group_statistics.variable_names.length; j++) {
        const row: TableRow = {
            rowHeader: ["Total", jsonData.group_statistics.variable_names[j]],
        };

        // Hanya tambahkan nilai yang tidak kosong
        const mean = formatDisplayNumber(
            jsonData.group_statistics.total_means[j]
        );
        const stdDev = formatDisplayNumber(
            jsonData.group_statistics.total_std_deviations[j]
        );
        const unweighted = formatDisplayNumber(
            jsonData.group_statistics.total_unweighted_count
        );
        const weighted = formatDisplayNumber(
            jsonData.group_statistics.total_weighted_count
        );

        if (mean) row["Mean"] = mean;
        if (stdDev) row["Std. Deviation"] = stdDev;
        if (unweighted) row["Unweighted"] = unweighted;
        if (weighted) row["Weighted"] = weighted;

        groupStatistics.rows.push(row);
    }
    resultJson.tables.push(groupStatistics);

    // 3. Tabel Tests of Equality of Group Means
    const testsOfEquality: Table = {
        title: "Tests of Equality of Group Means",
        columnHeaders: [
            { header: "" },
            { header: "Wilks' Lambda" },
            { header: "F" },
            { header: "df1" },
            { header: "df2" },
            { header: "Sig." },
        ],
        rows: [],
    };

    // Menambahkan data untuk setiap variabel
    for (let i = 0; i < jsonData.variable_names.length; i++) {
        const row: TableRow = {
            rowHeader: [jsonData.variable_names[i]],
        };

        // Hanya tambahkan nilai yang tidak kosong
        const lambda = formatDisplayNumber(jsonData.wilks_lambda[i].lambda);
        const f = formatDisplayNumber(jsonData.wilks_lambda[i].f);
        const df1 = formatDisplayNumber(jsonData.wilks_lambda[i].df1);
        const df2 = formatDisplayNumber(jsonData.wilks_lambda[i].df2);
        const sig = formatDisplayNumber(jsonData.wilks_lambda[i].sig);

        if (lambda) row["Wilks' Lambda"] = lambda;
        if (f) row["F"] = f;
        if (df1) row["df1"] = df1;
        if (df2) row["df2"] = df2;
        if (sig) row["Sig."] = sig;

        testsOfEquality.rows.push(row);
    }
    resultJson.tables.push(testsOfEquality);

    // 4. Tabel Pooled Within-Groups Matrices
    const pooledMatrices: Table = {
        title: "Pooled Within-Groups Matrices",
        columnHeaders: [{ header: "" }, { header: "" }],
        rows: [],
    };

    // Menambahkan header kolom untuk setiap variabel
    jsonData.variable_names.forEach((varName) => {
        pooledMatrices.columnHeaders.push({ header: varName });
    });

    // Menambahkan baris untuk matriks kovarians
    for (let i = 0; i < jsonData.variable_names.length; i++) {
        const rowData: TableRow = {
            rowHeader:
                i === 0
                    ? ["Covariance", jsonData.variable_names[i]]
                    : ["", jsonData.variable_names[i]],
        };

        // Tambahkan nilai kovarians untuk setiap variabel
        for (let j = 0; j < jsonData.variable_names.length; j++) {
            rowData[jsonData.variable_names[j]] = formatDisplayNumber(
                jsonData.pooled_covariance[i][j]
            );
        }

        pooledMatrices.rows.push(rowData);
    }

    // Menambahkan baris untuk matriks korelasi
    for (let i = 0; i < jsonData.variable_names.length; i++) {
        const rowData: TableRow = {
            rowHeader:
                i === 0
                    ? ["Correlation", jsonData.variable_names[i]]
                    : ["", jsonData.variable_names[i]],
        };

        // Tambahkan nilai korelasi untuk setiap variabel
        for (let j = 0; j < jsonData.variable_names.length; j++) {
            rowData[jsonData.variable_names[j]] = formatDisplayNumber(
                jsonData.pooled_correlation[i][j]
            );
        }

        pooledMatrices.rows.push(rowData);
    }
    resultJson.tables.push(pooledMatrices);

    // 5. Tabel Covariance Matrices
    const covarianceMatrices: Table = {
        title: "Covariance Matrices",
        columnHeaders: [{ header: jsonData.group_name }, { header: "" }],
        rows: [],
    };

    // Menambahkan header kolom untuk setiap variabel
    jsonData.variable_names.forEach((varName) => {
        covarianceMatrices.columnHeaders.push({ header: varName });
    });

    // Menambahkan data untuk setiap grup
    for (let i = 0; i < jsonData.group_values.length; i++) {
        const groupValue = jsonData.group_values[i];

        // Untuk setiap variabel dalam grup
        for (let j = 0; j < jsonData.variable_names.length; j++) {
            const rowData: TableRow = {
                rowHeader:
                    j === 0
                        ? [groupValue.toString(), jsonData.variable_names[j]]
                        : ["", jsonData.variable_names[j]],
            };

            // Tambahkan nilai kovarians untuk setiap variabel
            for (let k = 0; k < jsonData.variable_names.length; k++) {
                rowData[jsonData.variable_names[k]] = formatDisplayNumber(
                    jsonData.group_covariance[i][j][k]
                );
            }

            covarianceMatrices.rows.push(rowData);
        }
    }

    // Menambahkan total
    for (let j = 0; j < jsonData.variable_names.length; j++) {
        const rowData: TableRow = {
            rowHeader:
                j === 0
                    ? ["Total", jsonData.variable_names[j]]
                    : ["", jsonData.variable_names[j]],
        };

        // Tambahkan nilai kovarians total untuk setiap variabel
        for (let k = 0; k < jsonData.variable_names.length; k++) {
            rowData[jsonData.variable_names[k]] = formatDisplayNumber(
                jsonData.total_covariance[j][k]
            );
        }

        covarianceMatrices.rows.push(rowData);
    }
    resultJson.tables.push(covarianceMatrices);

    // 6. Tabel Box's Test of Equality of Covariance Matrices - Log Determinants
    const boxTestLogDeterminants: Table = {
        title: "Box's Test of Equality of Covariance Matrices - Log Determinants",
        columnHeaders: [
            { header: "" },
            { header: jsonData.group_name },
            { header: "Rank" },
            { header: "Log Determinant" },
        ],
        rows: [],
    };

    // Menambahkan data log determinants
    for (let i = 0; i < jsonData.box_m.log_determinants.length; i++) {
        boxTestLogDeterminants.rows.push({
            rowHeader: [null],
            [jsonData.group_name]:
                jsonData.box_m.log_determinants[i][0].toString(),
            Rank: "1",
            "Log Determinant": formatDisplayNumber(
                jsonData.box_m.log_determinants[i][1]
            ),
        });
    }

    // Menambahkan Pooled within-groups
    boxTestLogDeterminants.rows.push({
        rowHeader: [null],
        [jsonData.group_name]: "Pooled within-groups",
        Rank: "1",
        "Log Determinant": formatDisplayNumber(
            jsonData.box_m.pooled_log_determinant
        ),
    });

    resultJson.tables.push(boxTestLogDeterminants);

    // 7. Tabel Box's Test Results
    const boxTestResults: Table = {
        title: "Box's Test Results",
        columnHeaders: [
            { header: "" },
            { header: "Statistic" },
            { header: "Value" },
        ],
        rows: [
            {
                rowHeader: [null],
                Statistic: "Box's M",
                Value: formatDisplayNumber(jsonData.box_m.m),
            },
            {
                rowHeader: [null],
                Statistic: "F Approx.",
                Value: formatDisplayNumber(jsonData.box_m.f),
            },
            {
                rowHeader: [null],
                Statistic: "df1",
                Value: formatDisplayNumber(jsonData.box_m.df1),
            },
            {
                rowHeader: [null],
                Statistic: "df2",
                Value: formatDisplayNumber(jsonData.box_m.df2),
            },
            {
                rowHeader: [null],
                Statistic: "Sig.",
                Value: formatDisplayNumber(jsonData.box_m.p_value),
            },
        ],
    };
    resultJson.tables.push(boxTestResults);

    // 8. Tabel Summary of Canonical Discriminant Functions - Eigenvalues
    if (jsonData.eigen_stats) {
        const eigenvaluesTable: Table = {
            title: "Summary of Canonical Discriminant Functions - Eigenvalues",
            columnHeaders: [
                { header: "" },
                { header: "Function" },
                { header: "Eigenvalue" },
                { header: "% of Variance" },
                { header: "Cumulative %" },
                { header: "Canonical Correlation" },
            ],
            rows: [],
        };

        // Menambahkan data eigenvalues
        for (let i = 0; i < jsonData.eigen_stats.length; i++) {
            eigenvaluesTable.rows.push({
                rowHeader: [null],
                Function: (i + 1).toString(),
                Eigenvalue: formatDisplayNumber(
                    jsonData.eigen_stats[i].eigenvalue
                ),
                "% of Variance": formatDisplayNumber(
                    jsonData.eigen_stats[i].pct_of_variance
                ),
                "Cumulative %": formatDisplayNumber(
                    jsonData.eigen_stats[i].cumulative_pct
                ),
                "Canonical Correlation": formatDisplayNumber(
                    jsonData.eigen_stats[i].canonical_correlation
                ),
            });
        }
        resultJson.tables.push(eigenvaluesTable);
    }

    // 9. Tabel Wilks' Lambda
    if (jsonData.functions_lambda) {
        const wilksLambdaTable: Table = {
            title: "Wilks' Lambda",
            columnHeaders: [
                { header: "" },
                { header: "Test of Function(s)" },
                { header: "Wilks' Lambda" },
                { header: "Chi-square" },
                { header: "df" },
                { header: "Sig." },
            ],
            rows: [],
        };

        // Menambahkan data wilks lambda
        for (let i = 0; i < jsonData.functions_lambda.length; i++) {
            wilksLambdaTable.rows.push({
                rowHeader: [null],
                "Test of Function(s)": (i + 1).toString(),
                "Wilks' Lambda": formatDisplayNumber(
                    jsonData.wilks_lambda[i].lambda
                ),
                "Chi-square": formatDisplayNumber(
                    jsonData.functions_lambda[i].chi_square
                ),
                df: formatDisplayNumber(jsonData.functions_lambda[i].df),
                "Sig.": formatDisplayNumber(
                    jsonData.functions_lambda[i].p_value
                ),
            });
        }
        resultJson.tables.push(wilksLambdaTable);
    }

    // 10. Tabel Standardized Canonical Discriminant Function Coefficients
    if (jsonData.std_coefficients) {
        const stdCoefficientsTable: Table = {
            title: "Standardized Canonical Discriminant Function Coefficients",
            columnHeaders: [{ header: "" }],
            rows: [],
        };

        // Menambahkan kolom untuk setiap fungsi
        for (let i = 0; i < jsonData.std_coefficients.length; i++) {
            stdCoefficientsTable.columnHeaders.push({
                header: `Function ${i + 1}`,
            });
        }

        // Menambahkan data untuk setiap variabel
        for (let i = 0; i < jsonData.variable_names.length; i++) {
            const rowData: TableRow = {
                rowHeader: [jsonData.variable_names[i]],
            };

            // Nilai untuk setiap fungsi
            for (let j = 0; j < jsonData.std_coefficients.length; j++) {
                rowData[`Function ${j + 1}`] = formatDisplayNumber(
                    jsonData.std_coefficients[j][i]
                );
            }

            stdCoefficientsTable.rows.push(rowData);
        }
        resultJson.tables.push(stdCoefficientsTable);
    }

    // 11. Tabel Structure Matrix
    if (jsonData.structure_matrix) {
        const structureMatrixTable: Table = {
            title: "Structure Matrix",
            columnHeaders: [{ header: "" }],
            rows: [],
        };

        // Menambahkan kolom untuk setiap fungsi
        for (let i = 0; i < jsonData.structure_matrix.length; i++) {
            structureMatrixTable.columnHeaders.push({
                header: `Function ${i + 1}`,
            });
        }

        // Menambahkan data untuk setiap variabel
        for (let i = 0; i < jsonData.variable_names.length; i++) {
            const rowData: TableRow = {
                rowHeader: [jsonData.variable_names[i]],
            };

            // Nilai untuk setiap fungsi
            for (let j = 0; j < jsonData.structure_matrix.length; j++) {
                rowData[`Function ${j + 1}`] = formatDisplayNumber(
                    jsonData.structure_matrix[j][i]
                );
            }

            structureMatrixTable.rows.push(rowData);
        }
        resultJson.tables.push(structureMatrixTable);
    }

    // 12. Tabel Functions at Group Centroids
    if (jsonData.group_centroids) {
        const groupCentroidsTable: Table = {
            title: "Functions at Group Centroids",
            columnHeaders: [{ header: "" }, { header: jsonData.group_name }],
            rows: [],
        };

        // Menambahkan kolom untuk setiap fungsi
        for (let i = 0; i < (jsonData.group_centroids[0]?.length || 0); i++) {
            groupCentroidsTable.columnHeaders.push({
                header: `Function ${i + 1}`,
            });
        }

        // Menambahkan data untuk setiap grup
        for (let i = 0; i < jsonData.group_values.length; i++) {
            const rowData: TableRow = {
                rowHeader: [null],
                [jsonData.group_name]: jsonData.group_values[i].toString(),
            };

            // Nilai untuk setiap fungsi
            for (
                let j = 0;
                j < (jsonData.group_centroids[i]?.length || 0);
                j++
            ) {
                rowData[`Function ${j + 1}`] = formatDisplayNumber(
                    jsonData.group_centroids[i][j]
                );
            }

            groupCentroidsTable.rows.push(rowData);
        }
        resultJson.tables.push(groupCentroidsTable);
    }

    // 13. Tabel Classification Results
    if (jsonData.classification_results) {
        const classificationResultsTable: Table = {
            title: "Classification Results",
            columnHeaders: [
                { header: "" },
                { header: "" },
                { header: jsonData.group_name },
            ],
            rows: [
                {
                    rowHeader: [null, null, "Predicted Group Membership"],
                },
            ],
        };

        // Tambahkan kolom header untuk setiap nilai grup dan Total
        for (let i = 0; i < jsonData.group_values.length; i++) {
            classificationResultsTable.columnHeaders.push({
                header: jsonData.group_values[i].toString(),
            });
        }
        classificationResultsTable.columnHeaders.push({ header: "Total" });

        // Tambahkan baris untuk nilai-nilai di tabel prediksi
        const addPredictionRows = (
            sectionName: string,
            countType: string,
            data: number[][],
            percentData: number[][]
        ) => {
            for (let i = 0; i < jsonData.group_values.length; i++) {
                // Baris untuk Count
                const countRow: TableRow = {
                    rowHeader: [
                        i === 0 ? sectionName : "",
                        countType,
                        jsonData.group_values[i].toString(),
                    ],
                    Total: formatDisplayNumber(
                        jsonData.group_statistics.unweighted_counts[i]
                    ),
                };

                // Tambahkan nilai untuk setiap grup prediksi
                for (let j = 0; j < jsonData.group_values.length; j++) {
                    const value = formatDisplayNumber(data[i][j]);
                    if (value !== null) {
                        countRow[jsonData.group_values[j].toString()] = value;
                    }
                }

                classificationResultsTable.rows.push(countRow);

                // Baris untuk Percentage
                const percentRow: TableRow = {
                    rowHeader: ["", "%", jsonData.group_values[i].toString()],
                    Total: "100.0",
                };

                // Tambahkan persentase untuk setiap grup prediksi
                for (let j = 0; j < jsonData.group_values.length; j++) {
                    const value = formatDisplayNumber(percentData[i][j]);
                    if (value !== null) {
                        percentRow[jsonData.group_values[j].toString()] = value;
                    }
                }

                classificationResultsTable.rows.push(percentRow);
            }
        };

        // Tambahkan baris untuk Original dan Cross-validated
        addPredictionRows(
            "Original",
            "Count",
            jsonData.classification_results.original_count,
            jsonData.classification_results.original_percentage
        );
        addPredictionRows(
            "Cross-validated",
            "Count",
            jsonData.classification_results.cross_val_count,
            jsonData.classification_results.cross_val_percentage
        );

        resultJson.tables.push(classificationResultsTable);
    }

    // 14. Tabel Classification Processing Summary
    const classificationProcessingSummary: Table = {
        title: "Classification Processing Summary",
        columnHeaders: [{ header: "" }, { header: "" }, { header: "N" }],
        rows: [
            {
                rowHeader: ["Processed", null],
                N: jsonData.case_processing_summary.valid_count,
            },
            {
                rowHeader: ["Excluded", "Missing or out-of-range group codes"],
                N: jsonData.case_processing_summary.excluded_missing_group,
            },
            {
                rowHeader: ["", "At least one missing discriminating variable"],
                N: jsonData.case_processing_summary.excluded_missing_var,
            },
            {
                rowHeader: ["Used in Output", null],
                N: jsonData.case_processing_summary.valid_count,
            },
        ],
    };
    resultJson.tables.push(classificationProcessingSummary);

    // 15. Tabel Prior Probabilities for Groups
    const priorProbabilitiesTable: Table = {
        title: "Prior Probabilities for Groups",
        columnHeaders: [
            { header: jsonData.group_name },
            { header: "Prior" },
            { header: "Unweighted" },
            { header: "Weighted" },
        ],
        rows: [
            {
                rowHeader: [],
            },
        ],
    };

    // Menghitung total kasus
    const totalUnweighted = jsonData.group_statistics.unweighted_counts.reduce(
        (a, b) => a + b,
        0
    );
    const totalWeighted = jsonData.group_statistics.weighted_counts.reduce(
        (a, b) => a + b,
        0
    );

    // Tambahkan baris untuk setiap grup
    for (let i = 0; i < jsonData.group_values.length; i++) {
        // Hitung prior (defaultnya sama untuk semua grup)
        const prior = 1 / jsonData.group_values.length;

        priorProbabilitiesTable.rows.push({
            rowHeader: [jsonData.group_values[i].toString()],
            Prior: formatDisplayNumber(prior),
            Unweighted: formatDisplayNumber(
                jsonData.group_statistics.unweighted_counts[i]
            ),
            Weighted: formatDisplayNumber(
                jsonData.group_statistics.weighted_counts[i]
            ),
        });
    }

    // Tambahkan baris Total
    priorProbabilitiesTable.rows.push({
        rowHeader: ["Total"],
        Prior: "1.000",
        Unweighted: formatDisplayNumber(totalUnweighted),
        Weighted: formatDisplayNumber(totalWeighted),
    });

    resultJson.tables.push(priorProbabilitiesTable);

    // 16. Tabel Classification Function Coefficients
    if (jsonData.classification_functions) {
        const classificationFunctionCoefficientsTable: Table = {
            title: "Classification Function Coefficients",
            columnHeaders: [{ header: "" }],
            rows: [],
        };

        // Tambahkan header kolom untuk setiap nilai grup
        for (let i = 0; i < jsonData.group_values.length; i++) {
            classificationFunctionCoefficientsTable.columnHeaders.push({
                header: jsonData.group_values[i].toString(),
            });
        }

        // Tambahkan baris untuk setiap variabel
        for (let i = 0; i < jsonData.variable_names.length; i++) {
            const rowData: TableRow = {
                rowHeader: [jsonData.variable_names[i]],
            };

            // Tambahkan nilai untuk setiap grup
            for (let j = 0; j < jsonData.group_values.length; j++) {
                const value = formatDisplayNumber(
                    jsonData.classification_functions[i][j]
                );
                if (value !== null) {
                    rowData[jsonData.group_values[j].toString()] = value;
                }
            }

            classificationFunctionCoefficientsTable.rows.push(rowData);
        }

        // Tambahkan baris untuk konstanta (nilai terakhir dalam array)
        const constantRowData: TableRow = {
            rowHeader: ["(Constant)"],
        };

        const lastIndex = jsonData.classification_functions.length - 1;
        for (let j = 0; j < jsonData.group_values.length; j++) {
            const value = formatDisplayNumber(
                jsonData.classification_functions[lastIndex][j]
            );
            if (value !== null) {
                constantRowData[jsonData.group_values[j].toString()] = value;
            }
        }

        classificationFunctionCoefficientsTable.rows.push(constantRowData);

        // Tambahkan label Fisher's linear discriminant functions
        classificationFunctionCoefficientsTable.rows.push({
            rowHeader: ["Fisher's linear discriminant functions"],
        });

        resultJson.tables.push(classificationFunctionCoefficientsTable);
    }

    return resultJson;
}
