import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableCaption,
} from '@/components/ui/table';

interface FrequencyData {
    Frequency: string;
    Percent: number;
    'Valid Percent': number;
    'Cumulative Percent': number | string;
}

const FrequencyTable: React.FC<{ data: string }> = ({ data }) => {
    const { Frequency } = JSON.parse(data);

    return (
        <Table>
            <TableCaption>A list of frequency distribution data.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Percent</TableHead>
                    <TableHead>Valid Percent</TableHead>
                    <TableHead>Cumulative Percent</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Frequency.map((item: FrequencyData, index: number) => (
                    <TableRow key={index}>
                        <TableCell>{item.Frequency}</TableCell>
                        <TableCell>{item.Percent}%</TableCell>
                        <TableCell>{item['Valid Percent']}%</TableCell>
                        <TableCell>{item['Cumulative Percent']}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default FrequencyTable;
