import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableCaption,
    TableFooter
} from '@/components/ui/table';
import { Separator  } from '@/components/ui/separator'; // pastikan komponen Divider sudah diimport

interface StatisticsData {
    N: number;
    Valid: number;
    Missing: number;
    Mean: number;
    'Std. Error of Mean': number;
    Median: number;
    Mode: number;
    'Std. Deviation': number;
    Variance: number;
    Skewness: number;
    'Std. Error of Skewness': number;
    Kurtosis: number;
    'Std. Error of Kurtosis': number;
    Range: number;
    Minimum: number;
    Maximum: number;
    Sum: number;
    Percentiles: Record<string, number>;
}

const FrequencyStatistics: React.FC<{ data: string }> = ({ data }) => {
    const statistics: StatisticsData = JSON.parse(data).Var1;

    return (
        <Table>
            <TableCaption>Descriptive statistics for the dataset.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Statistic</TableHead>
                    <TableHead>Value</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell>Mean</TableCell>
                    <TableCell>{statistics.Mean}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Median</TableCell>
                    <TableCell>{statistics.Median}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Mode</TableCell>
                    <TableCell>{statistics.Mode}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Std. Deviation</TableCell>
                    <TableCell>{statistics['Std. Deviation']}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Variance</TableCell>
                    <TableCell>{statistics.Variance}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Skewness</TableCell>
                    <TableCell>{statistics.Skewness}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Kurtosis</TableCell>
                    <TableCell>{statistics.Kurtosis}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Range</TableCell>
                    <TableCell>{statistics.Range}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Minimum</TableCell>
                    <TableCell>{statistics.Minimum}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Maximum</TableCell>
                    <TableCell>{statistics.Maximum}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Sum</TableCell>
                    <TableCell>{statistics.Sum}</TableCell>
                </TableRow>
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={2}>
                        <Separator />
                    </TableCell>
                </TableRow>
            </TableFooter>
            <TableBody>
                <TableRow>
                    <TableCell colSpan={2}>
                        <strong>Percentiles:</strong>
                        <ul>
                            {Object.keys(statistics.Percentiles).map(key => (
                                <li key={key}>
                                    {key}%: {statistics.Percentiles[key]}
                                </li>
                            ))}
                        </ul>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
};

export default FrequencyStatistics;
