"use client";

import { useEffect } from "react";
import React, { useState } from 'react';
import { handleDisplayTable } from './ts/display';
import { handleSmoothing } from "./ts/smoothing";

export default function Smoothing(){
    const methods = [
        { value: 'sma', label: 'Simple Moving Average' },
        { value: 'dma', label: 'Double Moving Average' },
        { value: 'ses', label: 'Simple Exponential Smoothing' },
        { value: 'des', label: 'Double Exponential Smoothing' },
    ];
    const [selectedMethod, setSelectedMethod] = useState<string>('sma');
    const inputPars = (method: string) => {
        switch (method) {
        case 'sma':
            return (
                <div className="flex flex-row gap-2">
                    <label className="max-w-sm p-2 mt-4 rounded-lg" htmlFor="par1">distance :</label>
                    <input className="max-w-sm p-2 mt-4 rounded-lg" type="number" defaultValue={'2'} max={'11'} min={'2'} step={'1'} id="par1"/>
                </div>
            );
        case 'dma':
            return (
                <div className="flex flex-row gap-2">
                    <label className="max-w-sm p-2 mt-4 rounded-lg" htmlFor="par1">distance :</label>
                    <input className="max-w-sm p-2 mt-4 rounded-lg" type="number" defaultValue={'2'} max={'11'} min={'2'} step={'1'} id="par1"/>
                </div>
            );
        case 'ses':
            return (
                <div className="flex flex-row gap-2">
                    <label className="max-w-sm p-2 mt-4 rounded-lg" htmlFor="par1">alpha :</label>
                    <input className="max-w-sm p-2 mt-4 rounded-lg" type="number" defaultValue={'0.1'} max={'0.9'} min={'0.1'} step={'0.1'} id="par1"/>
                </div>
            );
        case 'des':
            return (
                <div className="flex flex-row gap-2">
                    <label className="max-w-sm p-2 mt-4 rounded-lg" htmlFor="par1">alpha :</label>
                    <input className="max-w-sm p-2 mt-4 rounded-lg" type="number" defaultValue={'0.1'} max={'0.9'} min={'0.1'} step={'0.1'} id="par1"/>
                </div>
            );
        default:
            return (<div></div>);
        }
    };
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMethod(event.target.value as string);
    };
    const selectedMethodRef = React.useRef<string>(selectedMethod);

    useEffect(() => {
        selectedMethodRef.current = selectedMethod;
    }, [selectedMethod]);

    useEffect(() => {
        const pars = Array.from(document.querySelectorAll('input[type="number"]')) as HTMLInputElement[];
        const fileInput = document.getElementById('file') as HTMLInputElement;
        const dataElement = document.getElementById('data') as HTMLElement;
        const resultElement = document.getElementById('result') as HTMLElement;
        const calculateButton = document.getElementById('calculateButton') as HTMLButtonElement;
        if (fileInput && dataElement) {
            handleDisplayTable(fileInput, dataElement).then(data => {
                if (calculateButton && pars && resultElement) {
                    calculateButton.addEventListener('click', () => {
                        const filteredData = data.map(row => row.filter(item => item !== null));
                        handleSmoothing(filteredData, pars, resultElement, selectedMethodRef.current);
                    });
                }
            });
        }
    }, []);

    return (
        <div className="flex flex-col items-center pt-10 h-[1000px]">
            <div className="border-gray-600 rounded-lg border-2 flex flex-col font-bold items-center bg-gray-100 w-1/2">
                <label htmlFor='file' className="p-4 w-full text-center bg-gray-800 rounded-t-md text-white">Smoothing:</label>
                <input type="file" id="file" name="file" className="p-4 w-full bg-red-200"/>
                <div className="flex flex-row gap-2">
                    <select
                        id="options"  value={selectedMethod} onChange={(event) => handleChange(event)}
                        className="max-w-sm p-2 mt-4 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        {methods.map((method) => (
                            <option key={method.value} value={method.value}>
                            {method.label}
                            </option>
                        ))}
                    </select>
                    <button id="calculateButton" className="p-2 bg-orange-400 border-2 rounded-lg hover:pointer mt-4">Calculate Smoothing</button>
                </div>
                <div className="flex flex-col gap-2">
                    {inputPars(selectedMethod)}
                </div>
                <div className="w-full flex flex-row gap-2">
                    <div id="data" className="w-1/2 my-2 max-h-80 overflow-auto bg-white border-2 border-gray-300 rounded-md flex justify-center">Data</div>
                    <div id="result" className="w-1/2 my-2 max-h-80 overflow-auto bg-white border-2 border-gray-300 rounded-md flex justify-center">Hasil</div>
                </div>
            </div>
        </div>
    );
}