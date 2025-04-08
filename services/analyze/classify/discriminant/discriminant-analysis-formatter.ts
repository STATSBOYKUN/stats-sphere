// discriminant-analysis-formatter.ts
import {
    ResultJson,
    Table,
} from "@/models/classify/discriminant/discriminant-ouput";

function formatDisplayNumber(num: number | undefined | null): string | null {
    if (typeof num === "undefined" || num === null) return null;

    if (Number.isInteger(num)) {
        return num.toString();
    } else {
        if (num === 100) {
            return "100.0";
        } else if (num < 1 && num > 0) {
            return num.toFixed(3).replace(/0+$/, "");
        } else {
            return num.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
        }
    }
}

// Helper function to ensure columnHeaders are sufficient for all rows
function ensureEnoughHeaders(table: Table): Table {
    if (!table.rows || table.rows.length === 0) return table;

    // Get all unique column keys from all rows
    const allKeys = new Set<string>();
    table.rows.forEach((row) => {
        Object.keys(row).forEach((key) => {
            if (key !== "rowHeader") allKeys.add(key);
        });
    });

    // Check current column headers (excluding rowHeader columns)
    let headerCount = table.columnHeaders.length;
    const rowHeaderCount = table.rows[0].rowHeader
        ? Array.isArray(table.rows[0].rowHeader)
            ? table.rows[0].rowHeader.length
            : 1
        : 0;

    // Calculate how many non-rowHeader columns we have
    const dataColumnCount = allKeys.size;

    // Add empty headers if needed
    while (headerCount < rowHeaderCount + dataColumnCount) {
        table.columnHeaders.push({ header: "" });
        headerCount++;
    }

    return table;
}

export function transformDiscriminantResult(data: any): ResultJson {
    const resultJson: ResultJson = {
        tables: [],
    };

    // 1. Analysis Case Processing Summary
    if (data.processing_summary) {
        const ps = data.processing_summary;
        const table: Table = {
            key: "case_processing_summary",
            title: "Analysis Case Processing Summary",
            columnHeaders: [
                { header: "" },
                { header: "" },
                { header: "N" },
                { header: "Percent" },
            ],
            rows: [],
        };

        table.rows.push({
            rowHeader: ["Valid", null],
            N: ps.valid_cases,
            Percent: formatDisplayNumber(ps.valid_percent),
        });

        if (ps.missing_group_codes !== undefined) {
            table.rows.push({
                rowHeader: ["Excluded", "Missing or out-of-range group codes"],
                N: ps.missing_group_codes,
                Percent: formatDisplayNumber(ps.missing_group_percent),
            });
        }

        if (ps.missing_disc_vars !== undefined) {
            table.rows.push({
                rowHeader: ["", "At least one missing discriminating variable"],
                N: ps.missing_disc_vars,
                Percent: formatDisplayNumber(ps.missing_disc_percent),
            });
        }

        if (ps.both_missing !== undefined) {
            table.rows.push({
                rowHeader: [
                    "",
                    "Both missing or out-of-range group codes and at least one missing discriminating variable",
                ],
                N: ps.both_missing,
                Percent: formatDisplayNumber(ps.both_missing_percent),
            });
        }

        table.rows.push({
            rowHeader: ["", "Total"],
            N: ps.excluded_cases,
            Percent: formatDisplayNumber(ps.total_excluded_percent),
        });

        table.rows.push({
            rowHeader: ["Total", null],
            N: ps.total_cases,
            Percent: formatDisplayNumber(100),
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 2. Classification Processing Summary
    if (data.processing_summary) {
        const ps = data.processing_summary;
        const table: Table = {
            key: "classification_processing_summary",
            title: "Classification Processing Summary",
            columnHeaders: [{ header: "" }, { header: "" }, { header: "" }],
            rows: [],
        };

        table.rows.push({
            rowHeader: ["Processed", ""],
            "": formatDisplayNumber(ps.total_cases),
        });

        if (ps.missing_group_codes !== undefined) {
            table.rows.push({
                rowHeader: ["Excluded", "Missing or out-of-range group codes"],
                "": formatDisplayNumber(ps.missing_group_codes),
            });
        }

        if (ps.missing_disc_vars !== undefined) {
            table.rows.push({
                rowHeader: ["", "At least one missing discriminating variable"],
                "": formatDisplayNumber(ps.missing_disc_vars),
            });
        }

        table.rows.push({
            rowHeader: ["Used in Output", ""],
            "": formatDisplayNumber(ps.valid_cases),
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 3. Prior Probabilities for Groups
    if (data.prior_probabilities) {
        const pp = data.prior_probabilities;
        const table: Table = {
            key: "prior_probabilities",
            title: "Prior Probabilities for Groups",
            columnHeaders: [
                { header: "category" },
                { header: "Prior" },
                { header: "Unweighted" },
                { header: "Weighted" },
            ],
            rows: [],
        };

        for (let i = 0; i < pp.groups.length; i++) {
            const group = pp.groups[i];
            const unweighted = pp.cases_used?.Unweighted?.[i];
            const weighted = pp.cases_used?.Weighted?.[i];

            table.rows.push({
                rowHeader: [group.toString()],
                Prior: formatDisplayNumber(pp.prior_probabilities[i]),
                Unweighted: formatDisplayNumber(unweighted),
                Weighted: formatDisplayNumber(weighted),
            });
        }

        const totalUnweighted = pp.cases_used?.Unweighted
            ? pp.cases_used.Unweighted.reduce((a, b) => a + b, 0)
            : null;
        const totalWeighted = pp.cases_used?.Weighted
            ? pp.cases_used.Weighted.reduce((a, b) => a + b, 0)
            : null;

        table.rows.push({
            rowHeader: ["Total"],
            Prior: formatDisplayNumber(pp.total),
            Unweighted: formatDisplayNumber(totalUnweighted),
            Weighted: formatDisplayNumber(totalWeighted),
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 4. Group Statistics
    if (data.group_statistics) {
        const gs = data.group_statistics;
        const table: Table = {
            key: "group_statistics",
            title: "Group Statistics",
            columnHeaders: [
                { header: "category" },
                { header: "" },
                { header: "Mean" },
                { header: "Std. Deviation" },
                { header: "Valid N (listwise)" },
                { header: "Unweighted" },
                { header: "Weighted" },
            ],
            rows: [],
        };

        gs.groups.forEach((group: string, groupIndex: number) => {
            gs.variables.forEach((variable: string) => {
                const mean = gs.means[variable]?.[groupIndex];
                const stdDev = gs.std_deviations[variable]?.[groupIndex];

                table.rows.push({
                    rowHeader: [group, variable],
                    Mean: formatDisplayNumber(mean),
                    "Std. Deviation": formatDisplayNumber(stdDev),
                    Unweighted: null, // Data not available in the result structure
                    Weighted: null, // Data not available in the result structure
                });
            });
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 5. Tests of Equality of Group Means
    if (data.equality_tests) {
        const et = data.equality_tests;
        const table: Table = {
            key: "equality_tests",
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

        et.variables.forEach((variable: string, index: number) => {
            table.rows.push({
                rowHeader: [variable],
                "Wilks' Lambda": formatDisplayNumber(et.wilks_lambda[index]),
                F: formatDisplayNumber(et.f_values[index]),
                df1: formatDisplayNumber(et.df1[index]),
                df2: formatDisplayNumber(et.df2[index]),
                "Sig.": formatDisplayNumber(et.significance[index]),
            });
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 6. Pooled Within-Groups Matrices
    if (data.pooled_matrices) {
        const pm = data.pooled_matrices;
        const table: Table = {
            key: "pooled_within_groups_matrices",
            title: "Pooled Within-Groups Matrices",
            columnHeaders: [
                { header: "" },
                { header: "" },
                ...pm.variables.map((v: string) => ({ header: v })),
            ],
            rows: [],
        };

        pm.variables.forEach((rowVar: string) => {
            const covRow: any = {
                rowHeader: ["Covariance", rowVar],
            };

            pm.variables.forEach((colVar: string) => {
                covRow[colVar] = formatDisplayNumber(
                    pm.covariance[rowVar]?.[colVar]
                );
            });

            table.rows.push(covRow);
        });

        pm.variables.forEach((rowVar: string) => {
            const corrRow: any = {
                rowHeader: ["Correlation", rowVar],
            };

            pm.variables.forEach((colVar: string) => {
                corrRow[colVar] = formatDisplayNumber(
                    pm.correlation[rowVar]?.[colVar]
                );
            });

            table.rows.push(corrRow);
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 7. Covariance Matrices
    if (data.covariance_matrices) {
        const cm = data.covariance_matrices;
        const table: Table = {
            key: "covariance_matrices",
            title: "Covariance Matrices",
            columnHeaders: [
                { header: "category" },
                { header: "" },
                ...cm.variables.map((v: string) => ({ header: v })),
            ],
            rows: [],
        };

        cm.groups.forEach((group: string) => {
            cm.variables.forEach((rowVar: string) => {
                const rowData: any = {
                    rowHeader: [group, rowVar],
                };

                cm.variables.forEach((colVar: string) => {
                    rowData[colVar] = formatDisplayNumber(
                        cm.matrices[group]?.[rowVar]?.[colVar]
                    );
                });

                table.rows.push(rowData);
            });
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 8. Log Determinants
    if (data.log_determinants) {
        const ld = data.log_determinants;
        const table: Table = {
            key: "log_determinants",
            title: "Log Determinants",
            columnHeaders: [
                { header: "category" },
                { header: "Rank" },
                { header: "Log Determinant" },
            ],
            rows: [],
        };

        ld.groups.forEach((group: string, index: number) => {
            table.rows.push({
                rowHeader: [group],
                Rank: formatDisplayNumber(ld.ranks[index]),
                "Log Determinant": formatDisplayNumber(
                    ld.log_determinants[index]
                ),
            });
        });

        table.rows.push({
            rowHeader: ["Pooled within-groups"],
            Rank: formatDisplayNumber(ld.rank_pooled),
            "Log Determinant": formatDisplayNumber(ld.pooled_log_determinant),
        });

        table.rows.push({
            rowHeader: [
                "The ranks and natural logarithms of determinants printed are those of the group covariance matrices.",
            ],
            Rank: null,
            "Log Determinant": null,
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 9. Box's M Test
    if (data.box_m_test) {
        const bm = data.box_m_test;
        const table: Table = {
            key: "box_m_test",
            title: "Test Results",
            columnHeaders: [{ header: "" }, { header: "" }],
            rows: [
                { rowHeader: ["Box's M"], "": formatDisplayNumber(bm.box_m) },
                {
                    rowHeader: ["F Approx."],
                    "": formatDisplayNumber(bm.f_approx),
                },
                { rowHeader: ["df1"], "": formatDisplayNumber(bm.df1) },
                { rowHeader: ["df2"], "": formatDisplayNumber(bm.df2) },
                { rowHeader: ["Sig."], "": formatDisplayNumber(bm.p_value) },
                {
                    rowHeader: [
                        "Tests null hypothesis of equal population covariance matrices.",
                    ],
                    "": null,
                },
            ],
        };

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 10. Classification Function Coefficients
    if (data.classification_function_coefficients) {
        const cfc = data.classification_function_coefficients;
        const table: Table = {
            key: "classification_function_coefficients",
            title: "Classification Function Coefficients",
            columnHeaders: [
                { header: "" },
                ...cfc.groups.map((g: number) => ({ header: g.toString() })),
            ],
            rows: [],
        };

        cfc.variables.forEach((variable: string) => {
            const rowData: any = {
                rowHeader: [variable],
            };

            cfc.groups.forEach((group: number, index: number) => {
                rowData[group.toString()] = formatDisplayNumber(
                    cfc.coefficients[variable]?.[index]
                );
            });

            table.rows.push(rowData);
        });

        const constantRow: any = {
            rowHeader: ["(Constant)"],
        };

        cfc.groups.forEach((group: number, index: number) => {
            constantRow[group.toString()] = formatDisplayNumber(
                cfc.constant_terms[index]
            );
        });

        table.rows.push(constantRow);
        table.rows.push({
            rowHeader: ["Fisher's linear discriminant functions"],
            ...Object.fromEntries(cfc.groups.map((g) => [g.toString(), null])),
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 11. Casewise Statistics
    if (data.casewise_statistics) {
        const cs = data.casewise_statistics;
        const table: Table = {
            key: "casewise_statistics",
            title: "Casewise Statistics",
            columnHeaders: [
                { header: "" },
                { header: "Case Number" },
                { header: "Actual Group" },
                { header: "Predicted Group" },
                { header: "P(D>d | G=g)" },
                { header: "df" },
                { header: "P(G=g | D=d)" },
                { header: "Squared Mahalanobis Distance" },
                { header: "Group" },
                { header: "Second Highest P(G=g | D=d)" },
                { header: "Second Highest Squared Mahalanobis Distance" },
                { header: "Second Highest Group" },
                ...Object.keys(cs.discriminant_scores).map((func) => ({
                    header: func,
                })),
            ],
            rows: [],
        };

        const n = cs.case_number.length;

        for (let i = 0; i < n; i++) {
            const rowData: any = {
                rowHeader: ["Original"],
                "Case Number": formatDisplayNumber(cs.case_number[i]),
                "Actual Group": cs.actual_group[i],
                "Predicted Group": cs.predicted_group[i],
                "P(D>d | G=g)": formatDisplayNumber(
                    cs.highest_group.p_value[i]
                ),
                df: formatDisplayNumber(cs.highest_group.df[i]),
                "P(G=g | D=d)": formatDisplayNumber(
                    cs.highest_group.p_g_equals_d[i]
                ),
                "Squared Mahalanobis Distance": formatDisplayNumber(
                    cs.highest_group.squared_mahalanobis_distance[i]
                ),
                "Second Highest P(G=g | D=d)": formatDisplayNumber(
                    cs.second_highest_group.p_g_equals_d[i]
                ),
                "Second Highest Squared Mahalanobis Distance":
                    formatDisplayNumber(
                        cs.second_highest_group.squared_mahalanobis_distance[i]
                    ),
                "Second Highest Group": cs.second_highest_group.group[i],
            };

            // Add discriminant scores
            Object.keys(cs.discriminant_scores).forEach((func) => {
                rowData[func] = formatDisplayNumber(
                    cs.discriminant_scores[func][i]
                );
            });

            table.rows.push(rowData);
        }

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 12. Stepwise Statistics
    if (data.stepwise_statistics) {
        const ss = data.stepwise_statistics;
        const table: Table = {
            key: "stepwise_statistics",
            title: "Stepwise Statistics",
            columnHeaders: [
                { header: "Step" },
                { header: "Entered" },
                { header: "Removed" },
                { header: "Wilks' Lambda" },
                { header: "df1" },
                { header: "df2" },
                { header: "df3" },
                { header: "Exact F Statistic" },
                { header: "Exact F df1" },
                { header: "Exact F df2" },
                { header: "Sig." },
            ],
            rows: [],
        };

        for (let i = 0; i < ss.variables_entered.length; i++) {
            table.rows.push({
                rowHeader: [],
                Step: formatDisplayNumber(i + 1),
                Entered: ss.variables_entered[i] || null,
                Removed: ss.variables_removed[i] || null,
                "Wilks' Lambda": formatDisplayNumber(ss.wilks_lambda[i]),
                df1: formatDisplayNumber(ss.df1[i]),
                df2: formatDisplayNumber(ss.df2[i]),
                df3: formatDisplayNumber(ss.df3[i]),
                "Exact F Statistic": formatDisplayNumber(ss.exact_f[i]),
                "Exact F df1": formatDisplayNumber(ss.exact_df1[i]),
                "Exact F df2": formatDisplayNumber(ss.exact_df2[i]),
                "Sig.": formatDisplayNumber(ss.significance[i]),
            });
        }

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 13. Variables in the Analysis
    if (data.stepwise_statistics?.variables_in_analysis) {
        const via = data.stepwise_statistics.variables_in_analysis;
        const table: Table = {
            key: "variables_in_analysis",
            title: "Variables in the Analysis",
            columnHeaders: [
                { header: "Step" },
                { header: "Variable" },
                { header: "Tolerance" },
                { header: "F to Remove" },
                { header: "Wilks' Lambda" },
            ],
            rows: [],
        };

        Object.entries(via).forEach(([step, variables]) => {
            variables.forEach((varData: any) => {
                table.rows.push({
                    rowHeader: [],
                    Step: step,
                    Variable: varData.variable,
                    Tolerance: formatDisplayNumber(varData.tolerance),
                    "F to Remove": formatDisplayNumber(varData.f_to_remove),
                    "Wilks' Lambda": formatDisplayNumber(varData.wilks_lambda),
                });
            });
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 14. Variables Not in the Analysis
    if (data.stepwise_statistics?.variables_not_in_analysis) {
        const vnia = data.stepwise_statistics.variables_not_in_analysis;
        const table: Table = {
            key: "variables_not_in_analysis",
            title: "Variables Not in the Analysis",
            columnHeaders: [
                { header: "Step" },
                { header: "Variable" },
                { header: "Tolerance" },
                { header: "Min. Tolerance" },
                { header: "F to Enter" },
                { header: "Wilks' Lambda" },
            ],
            rows: [],
        };

        Object.entries(vnia).forEach(([step, variables]) => {
            variables.forEach((varData: any) => {
                table.rows.push({
                    rowHeader: [],
                    Step: step,
                    Variable: varData.variable,
                    Tolerance: formatDisplayNumber(varData.tolerance),
                    "Min. Tolerance": formatDisplayNumber(
                        varData.min_tolerance
                    ),
                    "F to Enter": formatDisplayNumber(varData.f_to_enter),
                    "Wilks' Lambda": formatDisplayNumber(varData.wilks_lambda),
                });
            });
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 15. Wilks' Lambda (Steps)
    if (data.stepwise_statistics) {
        const ss = data.stepwise_statistics;
        const table: Table = {
            key: "wilks_lambda_steps",
            title: "Wilks' Lambda",
            columnHeaders: [
                { header: "Step" },
                { header: "Number of Variables" },
                { header: "Lambda" },
                { header: "df1" },
                { header: "df2" },
                { header: "df3" },
                { header: "Exact F Statistic" },
                { header: "Exact F df1" },
                { header: "Exact F df2" },
                { header: "Sig." },
            ],
            rows: [],
        };

        for (let i = 0; i < ss.variables_entered.length; i++) {
            table.rows.push({
                rowHeader: [],
                Step: formatDisplayNumber(i + 1),
                "Number of Variables": formatDisplayNumber(i + 1),
                Lambda: formatDisplayNumber(ss.wilks_lambda[i]),
                df1: formatDisplayNumber(ss.df1[i]),
                df2: formatDisplayNumber(ss.df2[i]),
                df3: formatDisplayNumber(ss.df3[i]),
                "Exact F Statistic": formatDisplayNumber(ss.exact_f[i]),
                "Exact F df1": formatDisplayNumber(ss.exact_df1[i]),
                "Exact F df2": formatDisplayNumber(ss.exact_df2[i]),
                "Sig.": formatDisplayNumber(ss.significance[i]),
            });
        }

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 16. Pairwise Group Comparisons
    if (data.stepwise_statistics?.pairwise_comparisons) {
        const pc = data.stepwise_statistics.pairwise_comparisons;
        const table: Table = {
            key: "pairwise_group_comparisons",
            title: "Pairwise Group Comparisons",
            columnHeaders: [
                { header: "Step" },
                { header: "Group" },
                { header: "Comparison Group" },
                { header: "F Value" },
                { header: "Significance" },
            ],
            rows: [],
        };

        Object.entries(pc).forEach(([step, groups]) => {
            Object.entries(groups).forEach(([group, comparisons]) => {
                comparisons.forEach((comparison: any) => {
                    table.rows.push({
                        rowHeader: [],
                        Step: step,
                        Group: group,
                        "Comparison Group": comparison.group_name,
                        "F Value": formatDisplayNumber(comparison.f_value),
                        Significance: formatDisplayNumber(
                            comparison.significance
                        ),
                    });
                });
            });
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 17. Classification Results
    if (data.classification_results) {
        const cr = data.classification_results;
        const groups = Object.keys(cr.original_classification);
        const table: Table = {
            key: "classification_results",
            title: "Classification Results",
            columnHeaders: [
                { header: "" },
                { header: "" },
                { header: "category" },
                ...groups.map((g) => ({ header: g })),
                { header: "Total" },
            ],
            rows: [],
        };

        // Original classification count
        groups.forEach((group) => {
            const rowData: any = {
                rowHeader: ["Original", "Count"],
                category: group,
                Total: formatDisplayNumber(
                    cr.original_classification[group].reduce((a, b) => a + b, 0)
                ),
            };

            groups.forEach((g, i) => {
                rowData[g] = formatDisplayNumber(
                    cr.original_classification[group][i]
                );
            });

            table.rows.push(rowData);
        });

        // Original classification percentage
        groups.forEach((group) => {
            const rowData: any = {
                rowHeader: ["", "%"],
                category: group,
                Total: formatDisplayNumber(100),
            };

            groups.forEach((g, i) => {
                rowData[g] = formatDisplayNumber(
                    cr.original_percentage[group][i]
                );
            });

            table.rows.push(rowData);
        });

        // Cross-validated classification if available
        if (cr.cross_validated_classification) {
            groups.forEach((group) => {
                const rowData: any = {
                    rowHeader: ["Cross-validated", "Count"],
                    category: group,
                    Total: formatDisplayNumber(
                        cr.cross_validated_classification[group].reduce(
                            (a, b) => a + b,
                            0
                        )
                    ),
                };

                groups.forEach((g, i) => {
                    rowData[g] = formatDisplayNumber(
                        cr.cross_validated_classification[group][i]
                    );
                });

                table.rows.push(rowData);
            });

            // Cross-validated classification percentage
            groups.forEach((group) => {
                const rowData: any = {
                    rowHeader: ["", "%"],
                    category: group,
                    Total: formatDisplayNumber(100),
                };

                groups.forEach((g, i) => {
                    rowData[g] = formatDisplayNumber(
                        cr.cross_validated_percentage[group][i]
                    );
                });

                table.rows.push(rowData);
            });
        }

        // Calculate and add original correct classification percentage
        const originalCorrectCount = Object.entries(
            cr.original_classification
        ).reduce((sum, [group, values], idx) => sum + values[idx], 0);
        const totalCases = Object.values(cr.original_classification).reduce(
            (sum, values) => sum + values.reduce((a, b) => a + b, 0),
            0
        );
        const originalCorrectPercent =
            (originalCorrectCount / totalCases) * 100;

        table.rows.push({
            rowHeader: [
                `${formatDisplayNumber(
                    originalCorrectPercent
                )}% of original grouped cases correctly classified.`,
            ],
            category: null,
        });

        // Add cross-validation footnote if applicable
        if (cr.cross_validated_classification) {
            table.rows.push({
                rowHeader: [
                    "Cross validation is done only for those cases in the analysis. In cross validation, each case is classified by the functions derived from all cases other than that case.",
                ],
                category: null,
            });

            const crossCorrectCount = Object.entries(
                cr.cross_validated_classification
            ).reduce((sum, [group, values], idx) => sum + values[idx], 0);
            const crossCorrectPercent = (crossCorrectCount / totalCases) * 100;

            table.rows.push({
                rowHeader: [
                    `${formatDisplayNumber(
                        crossCorrectPercent
                    )}% of cross-validated grouped cases correctly classified.`,
                ],
                category: null,
            });
        }

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 18. Eigenvalues
    if (data.eigen_description) {
        const ed = data.eigen_description;
        const table: Table = {
            key: "eigenvalues",
            title: "Eigenvalues",
            columnHeaders: [
                { header: "Function" },
                { header: "Eigenvalue" },
                { header: "% of Variance" },
                { header: "Cumulative %" },
                { header: "Canonical Correlation" },
            ],
            rows: [],
        };

        for (let i = 0; i < ed.functions.length; i++) {
            table.rows.push({
                rowHeader: [],
                Function: ed.functions[i],
                Eigenvalue: formatDisplayNumber(ed.eigenvalue[i]),
                "% of Variance": formatDisplayNumber(ed.variance_percentage[i]),
                "Cumulative %": formatDisplayNumber(
                    ed.cumulative_percentage[i]
                ),
                "Canonical Correlation": formatDisplayNumber(
                    ed.canonical_correlation[i]
                ),
            });
        }

        const usedFunctions = Math.min(ed.functions.length, 1);
        table.rows.push({
            rowHeader: [
                `First ${usedFunctions} canonical discriminant functions were used in the analysis.`,
            ],
            Function: null,
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 19. Wilks' Lambda Test
    if (data.wilks_lambda_test) {
        const wlt = data.wilks_lambda_test;
        const table: Table = {
            key: "wilks_lambda_test",
            title: "Wilks' Lambda",
            columnHeaders: [
                { header: "Test of Function(s)" },
                { header: "Wilks' Lambda" },
                { header: "Chi-square" },
                { header: "df" },
                { header: "Sig." },
            ],
            rows: [],
        };

        for (let i = 0; i < wlt.test_of_functions.length; i++) {
            table.rows.push({
                rowHeader: [],
                "Test of Function(s)": wlt.test_of_functions[i],
                "Wilks' Lambda": formatDisplayNumber(wlt.wilks_lambda[i]),
                "Chi-square": formatDisplayNumber(wlt.chi_square[i]),
                df: formatDisplayNumber(wlt.df[i]),
                "Sig.": formatDisplayNumber(wlt.significance[i]),
            });
        }

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 20. Standardized Canonical Discriminant Function Coefficients
    if (data.canonical_functions?.standardized_coefficients) {
        const sc = data.canonical_functions.standardized_coefficients;
        const functionCount = Object.values(sc)[0]?.length || 0;

        const table: Table = {
            key: "standardized_canonical_coefficients",
            title: "Standardized Canonical Discriminant Function Coefficients",
            columnHeaders: [
                { header: "" },
                ...Array.from({ length: functionCount }, (_, i) => ({
                    header: `Function ${i + 1}`,
                })),
            ],
            rows: [],
        };

        Object.entries(sc).forEach(([variable, values]) => {
            const rowData: any = {
                rowHeader: [variable],
            };

            values.forEach((value, i) => {
                rowData[`Function ${i + 1}`] = formatDisplayNumber(value);
            });

            table.rows.push(rowData);
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 21. Structure Matrix
    if (data.structure_matrix) {
        const sm = data.structure_matrix;
        const functionCount =
            sm.variables.length && sm.correlations[sm.variables[0]]
                ? sm.correlations[sm.variables[0]].length
                : 0;

        const table: Table = {
            key: "structure_matrix",
            title: "Structure Matrix",
            columnHeaders: [
                { header: "" },
                ...Array.from({ length: functionCount }, (_, i) => ({
                    header: `Function ${i + 1}`,
                })),
            ],
            rows: [],
        };

        sm.variables.forEach((variable: string) => {
            const rowData: any = {
                rowHeader: [variable],
            };

            if (sm.correlations[variable]) {
                sm.correlations[variable].forEach((value, i) => {
                    rowData[`Function ${i + 1}`] = formatDisplayNumber(value);
                });
            }

            table.rows.push(rowData);
        });

        table.rows.push({
            rowHeader: [
                "Pooled within-groups correlations between discriminating variables and standardized canonical discriminant functions",
            ],
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 22. Canonical Discriminant Function Coefficients
    if (data.canonical_functions?.coefficients) {
        const cc = data.canonical_functions.coefficients;
        const functionCount = Object.values(cc)[0]?.length || 0;

        const table: Table = {
            key: "canonical_discriminant_coefficients",
            title: "Canonical Discriminant Function Coefficients",
            columnHeaders: [
                { header: "" },
                ...Array.from({ length: functionCount }, (_, i) => ({
                    header: `Function ${i + 1}`,
                })),
            ],
            rows: [],
        };

        Object.entries(cc).forEach(([variable, values]) => {
            const rowData: any = {
                rowHeader: [variable],
            };

            values.forEach((value, i) => {
                rowData[`Function ${i + 1}`] = formatDisplayNumber(value);
            });

            table.rows.push(rowData);
        });

        table.rows.push({
            rowHeader: ["Unstandardized coefficients"],
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    // 23. Functions at Group Centroids
    if (data.canonical_functions?.function_at_centroids) {
        const fc = data.canonical_functions.function_at_centroids;
        const functionCount = Object.values(fc)[0]?.length || 0;

        const table: Table = {
            key: "functions_at_group_centroids",
            title: "Functions at Group Centroids",
            columnHeaders: [
                { header: "category" },
                ...Array.from({ length: functionCount }, (_, i) => ({
                    header: `Function ${i + 1}`,
                })),
            ],
            rows: [],
        };

        Object.entries(fc).forEach(([group, values]) => {
            const rowData: any = {
                rowHeader: [group],
            };

            values.forEach((value, i) => {
                rowData[`Function ${i + 1}`] = formatDisplayNumber(value);
            });

            table.rows.push(rowData);
        });

        table.rows.push({
            rowHeader: [
                "Unstandardized canonical discriminant functions evaluated at group means",
            ],
        });

        resultJson.tables.push(ensureEnoughHeaders(table));
    }

    return resultJson;
}
