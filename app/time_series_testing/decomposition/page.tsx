"use client";

import { useEffect } from "react";
import React, { useState } from 'react';
import { handleDisplayTable } from '../smoothing/ts/display';
import { handleSmoothing } from "../smoothing/ts/smoothing";

export default function Smoothing(){
    const [selectedTesting, setSelectedTesting] = useState<string>('deseasonalize');
    const [selectedMethod, setSelectedMethod] = useState<string>('linear');
    const testings = [
        { value: 'deseasonalize', label: 'Deseasonalize' },
        { value: 'detrend', label: 'Detrend' },
        { value: 'decompose', label: 'Decompose' },
    ];
    const methods = [
        { value: 'linear', label: 'Linear' },
        { value: 'quadratic', label: 'Quadratic' },
        { value: 'exponential', label: 'Exponential' },
    ];
    const handleChangeTesting = (event: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedTesting(event.target.value as string);
    };
    const [selectedPeriodic, setSelectedPeriodic] = useState<number>(7);
    const periodics = [
        { value: 7, label: 'Daily in Week' },
        { value: 30, label: 'Daily in Month' },
        { value: 4, label: 'Weekly' },
        { value: 12, label: 'Monthly' },
        { value: 4, label: 'Quarterly' },
        { value: 3, label: 'Trimester' },
        { value: 2, label: 'Semi-Annual' },
    ];
    const handleChangePeriodic = (event: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedPeriodic(parseInt(event.target.value));
    };
    const handleChangeMethod = (event: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedMethod(event.target.value as string);
    };
    const [selectedCheckbox, setSelectedCheckbox] = useState<boolean>(false);
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedCheckbox(event.target.checked);
    };
    const inputTesting = (method: string) => {
        switch (method) {
            case 'deseasonalize':
                return (
                    <div className="flex flex-row gap-2">
                        <label className="max-w-sm p-2 mt-4 rounded-lg" htmlFor="periodic">Periodic :</label>
                        <select
                            id="periodic"  value={selectedPeriodic} onChange={(event) => handleChangePeriodic(event)}
                            className="max-w-sm p-2 mt-4 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            {periodics.map((periodic) => (
                                <option key={periodic.value} value={periodic.value}>
                                {periodic.label}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            case 'detrend':
                return (
                    <div className="flex flex-row gap-2">
                        <label className="max-w-sm p-2 mt-4 rounded-lg" htmlFor="detrended_method">Detrended Method :</label>
                        <select
                            id="detrended_method"  value={selectedMethod} onChange={(event) => handleChangeMethod(event)}
                            className="max-w-sm p-2 mt-4 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            {methods.map((method) => (
                                <option key={method.value} value={method.value}>
                                {method.label}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            case 'decompose':
                return (
                    <div className="flex flex-col gap-2 items-center mt-4">
                        <div>
                            <input
                                type="checkbox"
                                id="contains_seasonal"
                                onChange={(event) => handleCheckboxChange(event)}
                            />
                            <label className="p-2 rounded-lg" htmlFor="contains_seasonal">Contains Seasonal</label>
                        </div>
                        {
                            selectedCheckbox ? (
                                <div className="flex flex-row gap-2">
                                    <label className="max-w-sm p-2 mt-4 rounded-lg" htmlFor="periodic">Periodic :</label>
                                    <select
                                        id="periodic"  value={selectedPeriodic} onChange={(event) => handleChangePeriodic(event)}
                                        className="max-w-sm p-2 mt-4 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        {periodics.map((periodic) => (
                                            <option key={periodic.value} value={periodic.value}>
                                            {periodic.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : null
                        }
                        <div className="flex flex-row gap-2">
                            <label className="max-w-sm p-2 mt-4 rounded-lg" htmlFor="detrended_method">Detrended Method :</label>
                            <select
                                id="detrended_method"  value={selectedMethod} onChange={(event) => handleChangeMethod(event)}
                                className="max-w-sm p-2 mt-4 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                {methods.map((method) => (
                                    <option key={method.value} value={method.value}>
                                    {method.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    useEffect(() => {
        const fileInput = document.getElementById('file') as HTMLInputElement;
        const dataElement = document.getElementById('data') as HTMLElement;
        if (fileInput && dataElement) {
            handleDisplayTable(fileInput, dataElement);
        }
    }, []);

    return (
        <div className="flex flex-col items-center pt-10 h-[1000px]">
            <div className="border-gray-600 rounded-lg border-2 flex flex-col font-bold items-center bg-gray-100 w-3/4">
                <label htmlFor='file' className="p-4 w-full text-center bg-gray-800 rounded-t-md text-white">Decomposition:</label>
                <input type="file" id="file" name="file" className="p-4 w-full bg-red-200"/>
                <div className="flex flex-row gap-2">
                    <select
                        id="options"  value={selectedTesting} onChange={(event) => handleChangeTesting(event)}
                        className="max-w-sm p-2 mt-4 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        {testings.map((testing) => (
                            <option key={testing.value} value={testing.value}>
                            {testing.label}
                            </option>
                        ))}
                    </select>
                    <button id="calculateButton" className="p-2 bg-orange-400 border-2 rounded-lg hover:pointer mt-4">Calculate Smoothing</button>
                </div>
                <div className="flex flex-col gap-2">
                    {inputTesting(selectedTesting)}
                </div>
                <div className="w-full flex flex-row gap-2">
                    <div id="data" className="w-1/2 my-2 max-h-80 overflow-auto bg-white border-2 border-gray-300 rounded-md flex justify-center">Data</div>
                    <div id="result" className="w-1/2 my-2 max-h-80 overflow-auto bg-white border-2 border-gray-300 rounded-md flex justify-center">Hasil</div>
                </div>
                <div id="eval" className="w-full overflow-auto bg-white border-2 border-gray-300 rounded-md flex justify-center">
                    Evaluasi
                </div>
            </div>
        </div>
    );
}