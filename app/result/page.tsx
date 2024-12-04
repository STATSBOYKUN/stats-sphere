// app/output/page.tsx
'use client';

import React, { useEffect } from 'react';
import useResultStore from '@/stores/useResultStore';
import FrequenciesTable from '@/components/Output/Table/FrequenciesTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const OutputPage: React.FC = () => {
    const { logs, analytics, statistics, fetchLogs, fetchAnalytics, fetchStatistics, deleteLog, deleteAnalytic, deleteStatistic } = useResultStore();

    useEffect(() => {
        fetchLogs();
        fetchAnalytics();
        fetchStatistics();
    }, [fetchLogs, fetchAnalytics, fetchStatistics]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-8">
                {/* Logs Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Log</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.log_id}>
                                        <TableCell>{log.log_id}</TableCell>
                                        <TableCell>{log.log}</TableCell>
                                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button variant="destructive" size="sm" onClick={() => deleteLog(log.log_id)}>
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Analytics Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Dataset</TableHead>
                                    <TableHead>Log ID</TableHead>
                                    <TableHead>Note</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analytics.map((analytic) => (
                                    <TableRow key={analytic.analytic_id}>
                                        <TableCell>{analytic.analytic_id}</TableCell>
                                        <TableCell>{analytic.title}</TableCell>
                                        <TableCell>{analytic.dataset}</TableCell>
                                        <TableCell>{analytic.log_id}</TableCell>
                                        <TableCell>{analytic.note || '-'}</TableCell>
                                        <TableCell>
                                            <Button variant="destructive" size="sm" onClick={() => deleteAnalytic(analytic.analytic_id)}>
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Statistics Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {statistics.map((stat) => (
                            <div key={stat.stat_id} className="mb-6">
                                {stat.components === 'FrequencyStatisticsTable' ? (
                                    <FrequenciesTable statistic={stat} />
                                ) : (
                                    <p>Unsupported component: {stat.components}</p>
                                )}
                                <Button variant="destructive" size="sm" onClick={() => deleteStatistic(stat.stat_id)}>
                                    Delete
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OutputPage;
