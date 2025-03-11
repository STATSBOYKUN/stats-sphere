// Fungsi utama untuk mengonversi data statistik ke format JSON yang ditentukan
export function convertStatisticalData(jsonData) {
    // Fungsi untuk memformat angka sesuai dengan tampilan yang diinginkan
    function formatDisplayNumber(num) {
        if (typeof num === 'undefined' || num === null) return '';

        if (Number.isInteger(num)) {
            return num.toString();
        } else {
            // Format angka desimal
            if (num === 100) {
                return "100.0";
            } else if (num < 1 && num > 0) {
                return num.toFixed(3).replace(/0+$/, '');
            } else {
                // Untuk sebagian besar nomor desimal
                return num.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
            }
        }
    }

    // Buat struktur JSON hasil
    const resultJson = {
        "tables": []
    };

    // 1. Tabel Case Processing Summary
    const caseProcessingSummary = {
        "title": "Analysis Case Processing Summary",
        "columnHeaders": [
            {"header": "Unweighted Cases"},
            {"header": "N"},
            {"header": "Percent"}
        ],
        "rows": [
            {
                "rowHeader": ["Valid"],
                "value": [
                    jsonData.case_processing_summary.valid_count,
                    jsonData.case_processing_summary.valid_percent.toFixed(1)
                ]
            },
            {
                "rowHeader": ["Excluded", "Missing or out-of-range group codes"],
                "value": [
                    jsonData.case_processing_summary.excluded_missing_group,
                    jsonData.case_processing_summary.excluded_missing_group_percent.toFixed(1)
                ]
            },
            {
                "rowHeader": ["", "At least one missing discriminating variable"],
                "value": [
                    jsonData.case_processing_summary.excluded_missing_var,
                    jsonData.case_processing_summary.excluded_missing_var_percent.toFixed(1)
                ]
            },
            {
                "rowHeader": ["", "Both missing or out-of-range group codes and at least one missing discriminating variable"],
                "value": [
                    jsonData.case_processing_summary.excluded_both,
                    jsonData.case_processing_summary.excluded_both_percent.toFixed(1)
                ]
            },
            {
                "rowHeader": ["", "Total"],
                "value": [
                    jsonData.case_processing_summary.excluded_total,
                    jsonData.case_processing_summary.excluded_total_percent.toFixed(1)
                ]
            },
            {
                "rowHeader": ["Total"],
                "value": [
                    jsonData.case_processing_summary.total_count,
                    jsonData.case_processing_summary.total_percent.toFixed(1)
                ]
            }
        ]
    };
    resultJson.tables.push(caseProcessingSummary);

    // 2. Tabel Group Statistics
    const groupStatistics = {
        "title": "Group Statistics",
        "columnHeaders": [
            {"header": "incbef"},
            {"header": ""},
            {"header": "Mean"},
            {"header": "Std. Deviation"},
            {"header": "Valid N (listwise)"},
            {"header": ""}
        ],
        "subColumnHeaders": [
            {"header": ""},
            {"header": ""},
            {"header": ""},
            {"header": ""},
            {"header": "Unweighted"},
            {"header": "Weighted"}
        ],
        "rows": []
    };

    // Mengisi data untuk setiap grup dan variabel
    for (let i = 0; i < jsonData.group_statistics.group_values.length; i++) {
        const groupValue = jsonData.group_statistics.group_values[i];
        const varNames = jsonData.group_statistics.variable_names;

        for (let j = 0; j < varNames.length; j++) {
            groupStatistics.rows.push({
                "rowHeader": [groupValue.toString(), varNames[j]],
                "value": [
                    formatDisplayNumber(jsonData.group_statistics.means[i][j]),
                    formatDisplayNumber(jsonData.group_statistics.std_deviations[i][j]),
                    formatDisplayNumber(jsonData.group_statistics.unweighted_counts[i]),
                    formatDisplayNumber(jsonData.group_statistics.weighted_counts[i])
                ]
            });
        }
    }

    // Tambahkan total untuk setiap variabel
    for (let j = 0; j < jsonData.group_statistics.variable_names.length; j++) {
        groupStatistics.rows.push({
            "rowHeader": ["Total", jsonData.group_statistics.variable_names[j]],
            "value": [
                formatDisplayNumber(jsonData.group_statistics.total_means[j]),
                formatDisplayNumber(jsonData.group_statistics.total_std_deviations[j]),
                formatDisplayNumber(jsonData.group_statistics.total_unweighted_count),
                formatDisplayNumber(jsonData.group_statistics.total_weighted_count)
            ]
        });
    }
    resultJson.tables.push(groupStatistics);

    // 3. Tabel Tests of Equality of Group Means
    const testsOfEquality = {
        "title": "Tests of Equality of Group Means",
        "columnHeaders": [
            {"header": ""},
            {"header": "Wilks' Lambda"},
            {"header": "F"},
            {"header": "df1"},
            {"header": "df2"},
            {"header": "Sig."}
        ],
        "rows": []
    };

    // Menambahkan data untuk setiap variabel
    for (let i = 0; i < jsonData.variable_names.length; i++) {
        testsOfEquality.rows.push({
            "rowHeader": [jsonData.variable_names[i]],
            "value": [
                formatDisplayNumber(jsonData.wilks_lambda[i].lambda),
                formatDisplayNumber(jsonData.wilks_lambda[i].f),
                formatDisplayNumber(jsonData.wilks_lambda[i].df1),
                formatDisplayNumber(jsonData.wilks_lambda[i].df2),
                formatDisplayNumber(jsonData.wilks_lambda[i].sig)
            ]
        });
    }
    resultJson.tables.push(testsOfEquality);

    // 4. Tabel Pooled Within-Groups Matrices
    const pooledMatrices = {
        "title": "Pooled Within-Groups Matrices",
        "columnHeaders": [
            {"header": ""},
            {"header": ""},
            {"header": "age"},
            {"header": "marital"}
        ],
        "rows": [
            {
                "rowHeader": ["Covariance", "age"],
                "value": [
                    formatDisplayNumber(jsonData.pooled_covariance[0][0]),
                    formatDisplayNumber(jsonData.pooled_covariance[0][1])
                ]
            },
            {
                "rowHeader": ["", "marital"],
                "value": [
                    formatDisplayNumber(jsonData.pooled_covariance[1][0]),
                    formatDisplayNumber(jsonData.pooled_covariance[1][1])
                ]
            },
            {
                "rowHeader": ["Correlation", "age"],
                "value": [
                    formatDisplayNumber(jsonData.pooled_correlation[0][0]),
                    formatDisplayNumber(jsonData.pooled_correlation[0][1])
                ]
            },
            {
                "rowHeader": ["", "marital"],
                "value": [
                    formatDisplayNumber(jsonData.pooled_correlation[1][0]),
                    formatDisplayNumber(jsonData.pooled_correlation[1][1])
                ]
            }
        ]
    };
    resultJson.tables.push(pooledMatrices);

    // 5. Tabel Covariance Matrices
    const covarianceMatrices = {
        "title": "Covariance Matrices",
        "columnHeaders": [
            {"header": "incbef"},
            {"header": ""},
            {"header": "age"},
            {"header": "marital"}
        ],
        "rows": []
    };

    // Menambahkan data untuk setiap grup
    for (let i = 0; i < jsonData.group_values.length; i++) {
        const groupValue = jsonData.group_values[i];

        covarianceMatrices.rows.push({
            "rowHeader": [groupValue.toString(), "age"],
            "value": [
                formatDisplayNumber(jsonData.group_covariance[i][0][0]),
                formatDisplayNumber(jsonData.group_covariance[i][0][1])
            ]
        });

        covarianceMatrices.rows.push({
            "rowHeader": ["", "marital"],
            "value": [
                formatDisplayNumber(jsonData.group_covariance[i][1][0]),
                formatDisplayNumber(jsonData.group_covariance[i][1][1])
            ]
        });
    }

    // Menambahkan total
    covarianceMatrices.rows.push({
        "rowHeader": ["Total", "age"],
        "value": [
            formatDisplayNumber(jsonData.total_covariance[0][0]),
            formatDisplayNumber(jsonData.total_covariance[0][1])
        ]
    });

    covarianceMatrices.rows.push({
        "rowHeader": ["", "marital"],
        "value": [
            formatDisplayNumber(jsonData.total_covariance[1][0]),
            formatDisplayNumber(jsonData.total_covariance[1][1])
        ]
    });
    resultJson.tables.push(covarianceMatrices);

    // 6. Tabel Box's Test of Equality of Covariance Matrices - Log Determinants
    const boxTestLogDeterminants = {
        "title": "Box's Test of Equality of Covariance Matrices - Log Determinants",
        "columnHeaders": [
            {"header": "incbef"},
            {"header": "Rank"},
            {"header": "Log Determinant"}
        ],
        "rows": []
    };

    // Menambahkan data log determinants
    for (let i = 0; i < jsonData.box_m.log_determinants.length; i++) {
        boxTestLogDeterminants.rows.push({
            "rowHeader": [jsonData.box_m.log_determinants[i][0].toString()],
            "value": ["1", formatDisplayNumber(jsonData.box_m.log_determinants[i][1])]
        });
    }

    // Menambahkan Pooled within-groups
    boxTestLogDeterminants.rows.push({
        "rowHeader": ["Pooled within-groups"],
        "value": ["1", formatDisplayNumber(jsonData.box_m.pooled_log_determinant)]
    });

    resultJson.tables.push(boxTestLogDeterminants);

    // 7. Tabel Box's Test Results
    const boxTestResults = {
        "title": "Box's Test Results",
        "columnHeaders": [
            {"header": "Statistic"},
            {"header": "Value"}
        ],
        "rows": [
            {
                "rowHeader": ["Box's M"],
                "value": [formatDisplayNumber(jsonData.box_m.m)]
            },
            {
                "rowHeader": ["F", "Approx."],
                "value": [formatDisplayNumber(jsonData.box_m.f)]
            },
            {
                "rowHeader": ["", "df1"],
                "value": [formatDisplayNumber(jsonData.box_m.df1)]
            },
            {
                "rowHeader": ["", "df2"],
                "value": [formatDisplayNumber(jsonData.box_m.df2)]
            },
            {
                "rowHeader": ["", "Sig."],
                "value": [formatDisplayNumber(jsonData.box_m.p_value)]
            }
        ]
    };
    resultJson.tables.push(boxTestResults);

    // 8. Tabel Summary of Canonical Discriminant Functions - Eigenvalues
    if (jsonData.eigen_stats) {
        const eigenvaluesTable = {
            "title": "Summary of Canonical Discriminant Functions - Eigenvalues",
            "columnHeaders": [
                {"header": "Function"},
                {"header": "Eigenvalue"},
                {"header": "% of Variance"},
                {"header": "Cumulative %"},
                {"header": "Canonical Correlation"}
            ],
            "rows": []
        };

        // Menambahkan data eigenvalues
        for (let i = 0; i < jsonData.eigen_stats.length; i++) {
            eigenvaluesTable.rows.push({
                "rowHeader": [(i + 1).toString()],
                "value": [
                    formatDisplayNumber(jsonData.eigen_stats[i].eigenvalue),
                    formatDisplayNumber(jsonData.eigen_stats[i].pct_of_variance),
                    formatDisplayNumber(jsonData.eigen_stats[i].cumulative_pct),
                    formatDisplayNumber(jsonData.eigen_stats[i].canonical_correlation)
                ]
            });
        }
        resultJson.tables.push(eigenvaluesTable);
    }

    // 9. Tabel Wilks' Lambda
    if (jsonData.functions_lambda) {
        const wilksLambdaTable = {
            "title": "Wilks' Lambda",
            "columnHeaders": [
                {"header": "Test of Function(s)"},
                {"header": "Wilks' Lambda"},
                {"header": "Chi-square"},
                {"header": "df"},
                {"header": "Sig."}
            ],
            "rows": []
        };

        // Menambahkan data wilks lambda
        for (let i = 0; i < jsonData.functions_lambda.length; i++) {
            wilksLambdaTable.rows.push({
                "rowHeader": [(i + 1).toString()],
                "value": [
                    formatDisplayNumber(jsonData.wilks_lambda[i].lambda),
                    formatDisplayNumber(jsonData.functions_lambda[i].chi_square),
                    formatDisplayNumber(jsonData.functions_lambda[i].df),
                    formatDisplayNumber(jsonData.functions_lambda[i].p_value)
                ]
            });
        }
        resultJson.tables.push(wilksLambdaTable);
    }

    // 10. Tabel Standardized Canonical Discriminant Function Coefficients
    if (jsonData.std_coefficients) {
        const stdCoefficientsTable = {
            "title": "Standardized Canonical Discriminant Function Coefficients",
            "columnHeaders": [
                {"header": ""},
                {"header": "Function 1"}
            ],
            "rows": []
        };

        // Menambahkan data untuk setiap variabel
        for (let i = 0; i < jsonData.variable_names.length; i++) {
            stdCoefficientsTable.rows.push({
                "rowHeader": [jsonData.variable_names[i]],
                "value": [formatDisplayNumber(jsonData.std_coefficients[0][i])]
            });
        }
        resultJson.tables.push(stdCoefficientsTable);
    }

    // 11. Tabel Structure Matrix
    if (jsonData.structure_matrix) {
        const structureMatrixTable = {
            "title": "Structure Matrix",
            "columnHeaders": [
                {"header": ""},
                {"header": "Function 1"}
            ],
            "rows": []
        };

        // Menambahkan data untuk setiap variabel
        for (let i = 0; i < jsonData.variable_names.length; i++) {
            structureMatrixTable.rows.push({
                "rowHeader": [jsonData.variable_names[i]],
                "value": [formatDisplayNumber(jsonData.structure_matrix[0][i])]
            });
        }
        resultJson.tables.push(structureMatrixTable);
    }

    // 12. Tabel Functions at Group Centroids
    if (jsonData.group_centroids) {
        const groupCentroidsTable = {
            "title": "Functions at Group Centroids",
            "columnHeaders": [
                {"header": "incbef"},
                {"header": "Function 1"}
            ],
            "rows": []
        };

        // Menambahkan data untuk setiap grup
        for (let i = 0; i < jsonData.group_values.length; i++) {
            groupCentroidsTable.rows.push({
                "rowHeader": [jsonData.group_values[i].toString()],
                "value": [formatDisplayNumber(jsonData.group_centroids[i][0])]
            });
        }
        resultJson.tables.push(groupCentroidsTable);
    }

    // 13. Tabel Classification Results
    if (jsonData.classification_results) {
        const classificationResultsTable = {
            "title": "Classification Results",
            "columnHeaders": [
                {"header": ""},
                {"header": ""},
                {"header": "Predicted Group Membership"},
                {"header": ""},
                {"header": "Total"}
            ],
            "subColumnHeaders": [
                {"header": ""},
                {"header": "incbef"},
                {"header": "7"},
                {"header": "8"},
                {"header": "9"}
            ],
            "rows": []
        };

        // Original count rows
        for (let i = 0; i < jsonData.group_values.length; i++) {
            classificationResultsTable.rows.push({
                "rowHeader": [i === 0 ? "Original" : "", "Count", jsonData.group_values[i].toString()],
                "value": [
                    formatDisplayNumber(jsonData.classification_results.original_count[i][0]),
                    formatDisplayNumber(jsonData.classification_results.original_count[i][1]),
                    formatDisplayNumber(jsonData.classification_results.original_count[i][2]),
                    formatDisplayNumber(jsonData.group_statistics.unweighted_counts[i])
                ]
            });
        }

        // Original percentage rows
        for (let i = 0; i < jsonData.group_values.length; i++) {
            classificationResultsTable.rows.push({
                "rowHeader": ["", "%", jsonData.group_values[i].toString()],
                "value": [
                    formatDisplayNumber(jsonData.classification_results.original_percentage[i][0]),
                    formatDisplayNumber(jsonData.classification_results.original_percentage[i][1]),
                    formatDisplayNumber(jsonData.classification_results.original_percentage[i][2]),
                    "100.0"
                ]
            });
        }

        // Cross-validated count rows
        for (let i = 0; i < jsonData.group_values.length; i++) {
            classificationResultsTable.rows.push({
                "rowHeader": [i === 0 ? "Cross-validated" : "", "Count", jsonData.group_values[i].toString()],
                "value": [
                    formatDisplayNumber(jsonData.classification_results.cross_val_count[i][0]),
                    formatDisplayNumber(jsonData.classification_results.cross_val_count[i][1]),
                    formatDisplayNumber(jsonData.classification_results.cross_val_count[i][2]),
                    formatDisplayNumber(jsonData.group_statistics.unweighted_counts[i])
                ]
            });
        }

        // Cross-validated percentage rows
        for (let i = 0; i < jsonData.group_values.length; i++) {
            classificationResultsTable.rows.push({
                "rowHeader": ["", "%", jsonData.group_values[i].toString()],
                "value": [
                    formatDisplayNumber(jsonData.classification_results.cross_val_percentage[i][0]),
                    formatDisplayNumber(jsonData.classification_results.cross_val_percentage[i][1]),
                    formatDisplayNumber(jsonData.classification_results.cross_val_percentage[i][2]),
                    "100.0"
                ]
            });
        }

        resultJson.tables.push(classificationResultsTable);
    }

    return resultJson;
}

// Contoh penggunaan
/*
const jsonData = {
    "case_processing_summary": { ... },
    "group_statistics": { ... },
    ...
};

const result = convertStatisticalData(jsonData);
console.log(JSON.stringify(result, null, 2));
*/

// Fungsi ini menghasilkan 13 tabel utama:
// 1. Analysis Case Processing Summary
// 2. Group Statistics
// 3. Tests of Equality of Group Means
// 4. Pooled Within-Groups Matrices
// 5. Covariance Matrices
// 6. Box's Test of Equality of Covariance Matrices - Log Determinants
// 7. Box's Test Results
// 8. Summary of Canonical Discriminant Functions - Eigenvalues
// 9. Wilks' Lambda
// 10. Standardized Canonical Discriminant Function Coefficients
// 11. Structure Matrix
// 12. Functions at Group Centroids
// 13. Classification Results