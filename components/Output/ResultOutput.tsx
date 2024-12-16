// components/Output/ResultOutput.tsx

"use client";

import React from 'react';
import DataTableRenderer from '@/components/ui/data-table';
import { Card } from '@/components/ui/card'; // Pastikan path ini sesuai dengan lokasi komponen Card Anda
import { Typography } from '@/components/ui/typography'; // Jika menggunakan komponen Typography dari shadcn UI

interface Log {
    id?: number;
    log: string;
}

interface Analytic {
    id?: number;
    log_id?: number;
    title: string;
    note?: string;
}

interface Statistic {
    id?: number;
    analytic_id: number;
    title: string;
    output_data: string;
    components: string;
}

interface ResultProps {
    logs?: Log[];
    analytics?: Analytic[];
    statistics?: Statistic[];
}

// Data Dummy
const dummyLogs: Log[] = [
    {
        id: 2,
        log: "FREQUENCIES VARIABLES=Var1, Var2 /ORDER=ANALYSIS."
    }
];

const dummyAnalytics: Analytic[] = [
    {
        id: 2,
        log_id: 2,
        title: "Frequencies",
        note: ""
    }
];

const dummyStatistics: Statistic[] = [
    {
        id: 1,
        analytic_id: 2,
        title: "Descriptive Statistics",
        output_data: JSON.stringify({
            "tables": [
                {
                    "title": "Descriptive Statistics",
                    "columns": ["Var1", "Var2"],
                    "rows": [
                        {
                            "rowHeader": ["N"],
                            "children": [
                                {
                                    "rowHeader": [null, "Valid"],
                                    "Var1": 5,
                                    "Var2": 10
                                },
                                {
                                    "rowHeader": [null, "Missing"],
                                    "Var1": 95,
                                    "Var2": 90
                                }
                            ]
                        },
                        {
                            "rowHeader": ["Mean"],
                            "Var1": 4,
                            "Var2": 3.5
                        },
                        {
                            "rowHeader": ["Std. Error of Mean"],
                            "Var1": 0.632,
                            "Var2": 0.8
                        },
                        {
                            "rowHeader": ["Median"],
                            "Var1": 4,
                            "Var2": 3
                        },
                        {
                            "rowHeader": ["Mode"],
                            "Var1": 2,
                            "Var2": 3
                        },
                        {
                            "rowHeader": ["Std. Deviation"],
                            "Var1": 1.414,
                            "Var2": 2.0
                        },
                        {
                            "rowHeader": ["Variance"],
                            "Var1": 2,
                            "Var2": 4
                        },
                        {
                            "rowHeader": ["Skewness"],
                            "Var1": 0,
                            "Var2": 0.2
                        },
                        {
                            "rowHeader": ["Std. Error of Skewness"],
                            "Var1": 0.447,
                            "Var2": 0.5
                        },
                        {
                            "rowHeader": ["Kurtosis"],
                            "Var1": 2.625,
                            "Var2": 1.8
                        },
                        {
                            "rowHeader": ["Std. Error of Kurtosis"],
                            "Var1": 0.894,
                            "Var2": 0.9
                        },
                        {
                            "rowHeader": ["Range"],
                            "Var1": 4,
                            "Var2": 5
                        },
                        {
                            "rowHeader": ["Minimum"],
                            "Var1": 2,
                            "Var2": 1
                        },
                        {
                            "rowHeader": ["Maximum"],
                            "Var1": 6,
                            "Var2": 6
                        },
                        {
                            "rowHeader": ["Sum"],
                            "Var1": 20,
                            "Var2": 35
                        },
                        {
                            "rowHeader": ["Percentiles"],
                            "children": [
                                {
                                    "rowHeader": [null, "10"],
                                    "Var1": 2.4,
                                    "Var2": 1.5
                                },
                                {
                                    "rowHeader": [null, "20"],
                                    "Var1": 2.8,
                                    "Var2": 2.0
                                },
                                {
                                    "rowHeader": [null, "25"],
                                    "Var1": 3,
                                    "Var2": 2.5
                                },
                                {
                                    "rowHeader": [null, "30"],
                                    "Var1": 3.2,
                                    "Var2": 2.8
                                },
                                {
                                    "rowHeader": [null, "40"],
                                    "Var1": 3.6,
                                    "Var2": 3.0
                                },
                                {
                                    "rowHeader": [null, "50"],
                                    "Var1": 4,
                                    "Var2": 3.5
                                },
                                {
                                    "rowHeader": [null, "60"],
                                    "Var1": 4.4,
                                    "Var2": 4.0
                                },
                                {
                                    "rowHeader": [null, "70"],
                                    "Var1": 4.8,
                                    "Var2": 4.5
                                },
                                {
                                    "rowHeader": [null, "75"],
                                    "Var1": 5,
                                    "Var2": 4.8
                                },
                                {
                                    "rowHeader": [null, "80"],
                                    "Var1": 5.2,
                                    "Var2": 5.0
                                },
                                {
                                    "rowHeader": [null, "90"],
                                    "Var1": 5.6,
                                    "Var2": 5.5
                                }
                            ]
                        }
                    ]
                }
            ]
        }),
        components: "Descriptive Statistics"
    },
    {
        id: 2,
        analytic_id: 2,
        title: "Frequency Table for Var1",
        output_data: JSON.stringify({
            "tables": [
                {
                    "title": "Frequency Table for Var1",
                    "columns": ["Frequency", "Percent", "ValidPercent", "CumulativePercent"],
                    "rows": [
                        {
                            "rowHeader": ["Valid"],
                            "children": [
                                {
                                    "rowHeader": [null, "2"],
                                    "Frequency": 1,
                                    "Percent": 1,
                                    "ValidPercent": 1,
                                    "CumulativePercent": 1
                                },
                                {
                                    "rowHeader": [null, "4"],
                                    "Frequency": 1,
                                    "Percent": 1,
                                    "ValidPercent": 1,
                                    "CumulativePercent": 2
                                },
                                {
                                    "rowHeader": [null, "6"],
                                    "Frequency": 1,
                                    "Percent": 1,
                                    "ValidPercent": 1,
                                    "CumulativePercent": 3
                                },
                                {
                                    "rowHeader": [null, "Total"],
                                    "Frequency": 3,
                                    "Percent": 3,
                                    "ValidPercent": 3,
                                    "CumulativePercent": ""
                                }
                            ]
                        },
                        {
                            "rowHeader": ["Missing"],
                            "children": [
                                {
                                    "rowHeader": [null, "System"],
                                    "Frequency": 95,
                                    "Percent": 95,
                                    "ValidPercent": null,
                                    "CumulativePercent": null
                                }
                            ]
                        },
                        {
                            "rowHeader": ["Total"],
                            "Frequency": 98,
                            "Percent": 98,
                            "ValidPercent": 98,
                            "CumulativePercent": ""
                        }
                    ]
                }
            ]
        }),
        components: "Frequency Table"
    },
    {
        id: 3,
        analytic_id: 2,
        title: "Frequency Table for Var2",
        output_data: JSON.stringify({
            "tables": [
                {
                    "title": "Frequency Table for Var2",
                    "columns": ["Frequency", "Percent", "ValidPercent", "CumulativePercent"],
                    "rows": [
                        {
                            "rowHeader": ["Valid"],
                            "children": [
                                {
                                    "rowHeader": [null, "A"],
                                    "Frequency": 1,
                                    "Percent": 1,
                                    "ValidPercent": 1,
                                    "CumulativePercent": 1
                                },
                                {
                                    "rowHeader": [null, "B"],
                                    "Frequency": 1,
                                    "Percent": 1,
                                    "ValidPercent": 1,
                                    "CumulativePercent": 2
                                },
                                {
                                    "rowHeader": [null, "C"],
                                    "Frequency": 1,
                                    "Percent": 1,
                                    "ValidPercent": 1,
                                    "CumulativePercent": 3
                                },
                                {
                                    "rowHeader": [null, "D"],
                                    "Frequency": 1,
                                    "Percent": 1,
                                    "ValidPercent": 1,
                                    "CumulativePercent": 4
                                },
                                {
                                    "rowHeader": [null, "E"],
                                    "Frequency": 1,
                                    "Percent": 1,
                                    "ValidPercent": 1,
                                    "CumulativePercent": 5
                                },
                                {
                                    "rowHeader": [null, "F"],
                                    "Frequency": 1,
                                    "Percent": 1,
                                    "ValidPercent": 1,
                                    "CumulativePercent": 6
                                },
                                {
                                    "rowHeader": [null, "Total"],
                                    "Frequency": 6,
                                    "Percent": 6,
                                    "ValidPercent": 6,
                                    "CumulativePercent": ""
                                }
                            ]
                        },
                        {
                            "rowHeader": ["Missing"],
                            "children": [
                                {
                                    "rowHeader": [null, "System"],
                                    "Frequency": 94,
                                    "Percent": 94,
                                    "ValidPercent": null,
                                    "CumulativePercent": null
                                }
                            ]
                        },
                        {
                            "rowHeader": ["Total"],
                            "Frequency": 100,
                            "Percent": 100,
                            "ValidPercent": 100,
                            "CumulativePercent": ""
                        }
                    ]
                }
            ]
        }),
        components: "Frequency Table"
    }
];

const ResultOutput: React.FC<ResultProps> = ({
                                                 logs = dummyLogs,
                                                 analytics = dummyAnalytics,
                                                 statistics = dummyStatistics
                                             }) => {
    return (
        <div className="p-6 space-y-8">
            {logs.map((log) => (
                <div key={log.id} className="space-y-6">
                    <div className="text-sm text-gray-600">Log {log.id}: {log.log}</div>
                    {analytics
                        .filter((analytic) => analytic.log_id === log.id)
                        .map((analytic) => (
                            <Card key={analytic.id} className="p-6 shadow-md">
                                <div className="text-xl font-bold text-left mb-4">{analytic.title}</div>
                                {analytic.note && (
                                    <div className="text-sm italic text-gray-500 text-center mb-6">
                                        {analytic.note}
                                    </div>
                                )}
                                {/* Render statistics */}
                                {(() => {
                                    const renderedComponents = new Set<string>();
                                    return statistics
                                        .filter((stat) => stat.analytic_id === analytic.id)
                                        .map((stat, index) => {
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
                                                    <div className="mb-4">
                                                        <DataTableRenderer data={stat.output_data} />
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