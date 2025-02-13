"use client";
import React, { useEffect } from "react";
import DataTableRenderer from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import useResultStore from "@/stores/useResultStore";

const ResultOutput: React.FC = () => {
    const {
        logs,
        analytics,
        statistics,
        fetchLogs,
        fetchAnalytics,
        fetchStatistics
    } = useResultStore();

    useEffect(() => {
        fetchLogs();
        fetchAnalytics();
        fetchStatistics();
    }, [fetchLogs, fetchAnalytics, fetchStatistics]);

    return (
        <div className="p-6 space-y-8">
            {logs.map((log) => (
                <div key={log.id} className="space-y-6">
                    <div id="log" className="text-sm text-gray-600">
                        Log {log.id}: {log.log}
                    </div>
                    {analytics
                        .filter((analytic) => analytic.log_id === log.id)
                        .map((analytic) => (
                            <Card key={analytic.id} className="p-6 shadow-md">
                                <div className="text-xl font-bold text-left mb-4">
                                    {analytic.title}
                                </div>
                                {analytic.note && (
                                    <div className="text-sm italic text-gray-500 text-center mb-6">
                                        {analytic.note}
                                    </div>
                                )}
                                {(() => {
                                    const renderedComponents = new Set<string>();
                                    return statistics
                                        .filter((stat) => stat.analytic_id === analytic.id)
                                        .map((stat) => {
                                            const isFirstAppearance = !renderedComponents.has(stat.components);
                                            if (isFirstAppearance) {
                                                renderedComponents.add(stat.components);
                                            }
                                            return (
                                                <div key={stat.id} className="space-y-4">
                                                    {isFirstAppearance && (
                                                        <div className="text-base font-semibold mt-6 mb-2">
                                                            {stat.components}
                                                        </div>
                                                    )}
                                                    <div
                                                        id={`output-${analytic.id}-${stat.id}`}
                                                        className="mb-4"
                                                    >
                                                        <DataTableRenderer data={stat.output_data} />
                                                        {/* <DataTableRenderer data='
                                                        {
  "tables": [
    {
      "title": "Model Summary and Parameter Estimates",
      "columnHeaders": [
        {
          "header": "Equation"
        },
        {
          "header": "Model Summary",
          "children": [
            {
              "header": "R Square"
            },
            {
              "header": "F"
            },
            {
              "header": "df1"
            },
            {
              "header": "df2"
            },
            {
              "header": "Sig."
            }
          ]
        },
        {
          "header": "Parameter Estimates",
          "children": [
            {
              "header": "Constant"
            },
            {
              "header": "b1"
            },
            {
              "header": "b2"
            },
            {
              "header": "b3"
            }
          ]
        }
      ],
      "rows": [
        {
          "rowHeader": [
            "Linear"
          ],
          "R Square": 0.931,
          "F": 174.946,
          "df1": 1,
          "df2": 13,
          "Sig.": "<0.001",
          "Constant": -2.883,
          "b1": 1.34,
          "b2": "",
          "b3": ""
        },
        {
          "rowHeader": [
            "Logarithmic"
          ],
          "R Square": 0.928,
          "F": 166.347,
          "df1": 1,
          "df2": 13,
          "Sig.": "<0.001",
          "Constant": -13.547,
          "b1": 10.327,
          "b2": "",
          "b3": ""
        },
        {
          "rowHeader": [
            "Inverse"
          ],
          "R Square": 0.916,
          "F": 141.845,
          "df1": 1,
          "df2": 13,
          "Sig.": "<0.001",
          "Constant": 17.747,
          "b1": -77.903,
          "b2": "",
          "b3": ""
        },
        {
          "rowHeader": [
            "Quadratic"
          ],
          "R Square": 0.931,
          "F": 80.778,
          "df1": 2,
          "df2": 12,
          "Sig.": "<0.001",
          "Constant": -3.315,
          "b1": 1.453,
          "b2": -0.007,
          "b3": ""
        },
        {
          "rowHeader": [
            "Cubic"
          ],
          "R Square": 0.931,
          "F": 49.369,
          "df1": 3,
          "df2": 11,
          "Sig.": "<0.001",
          "Constant": -4.914,
          "b1": 2.084,
          "b2": -0.089,
          "b3": 0.004
        },
        {
          "rowHeader": [
            "Compound"
          ],
          "R Square": 0.931,
          "F": 80.847,
          "df1": 2,
          "df2": 12,
          "Sig.": "<0.001",
          "Constant": -3.067,
          "b1": 1.368,
          "b2": 0,
          "b3": ""
        },
        {
          "rowHeader": [
            "Power"
          ],
          "R Square": 0.931,
          "F": 80.789,
          "df1": 2,
          "df2": 12,
          "Sig.": "<0.001",
          "Constant": -3.889,
          "b1": 1.215,
          "b2": 0.97,
          "b3": ""
        },
        {
          "rowHeader": [
            "S"
          ],
          "R Square": 0.931,
          "F": 80.895,
          "df1": 2,
          "df2": 12,
          "Sig.": "<0.001",
          "Constant": -56.828,
          "b1": 1.31,
          "b2": 54.219,
          "b3": ""
        },
        {
          "rowHeader": [
            "Growth"
          ],
          "R Square": 0.931,
          "F": 80.847,
          "df1": 2,
          "df2": 12,
          "Sig.": "<0.001",
          "Constant": -3.067,
          "b1": 1.368,
          "b2": 0,
          "b3": ""
        },
        {
          "rowHeader": [
            "Exponential"
          ],
          "R Square": 0.764,
          "F": 42.186,
          "df1": 1,
          "df2": 13,
          "Sig.": "<0.001",
          "Constant": 6.334,
          "b1": 0,
          "b2": "",
          "b3": ""
        }
      ]
    }
  ]
}
                                                        '/> */}

                                                    </div>
                                                </div>
                                            );
                                        });
                                })()}
                            </Card>
                        ))}
                </div>
            ))}
        </div>
    );
};

export default ResultOutput;
