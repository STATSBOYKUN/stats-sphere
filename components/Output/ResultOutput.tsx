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
      "title": "Coefficient Correlationsa",
      "columnHeaders": [
        { "header": "Model" },
        { "header": "" },
        { "header": "" },
        { "header": "VAR00003" },
        { "header": "VAR00002" }
      ],
      "rows": [
        {
          "rowHeader": ["1"],
          "children": [
            {
              "rowHeader": [null, "Correlations", "VAR00003"],
              "VAR00003": 1.000,
              "VAR00002": 0.000
            },
            {
              "rowHeader": [null, "Correlations", "VAR00002"],
              "VAR00003": 0.000,
              "VAR00002": 1.000
            },
            {
              "rowHeader": [null, "Covariances", "VAR00003"],
              "VAR00003": 0.420,
              "VAR00002": 0.000
            },
            {
              "rowHeader": [null, "Covariances", "VAR00002"],
              "VAR00003": 0.000,
              "VAR00002": 0.420
            }
          ]
        }
      ],
      "footnote": "a. Dependent Variable: VAR00001"
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
