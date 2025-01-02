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
        { value: 'holt', label: 'Holt\'s Method Exponential Smoothing' },
        { value: 'winter', label: 'Winter\'s Method Exponential Smoothing' },
    ];
    const [selectedMethod, setSelectedMethod] = useState<string>('sma');
    const [pars, setPars] = useState<number[]>([]);
    const handleInputChange = (index: number, value: number) => {
        let newPars = [...pars];  // Salin array pars yang lama
        newPars[index] = value;   // Ubah nilai pada indeks yang sesuai
        setPars(newPars);         // Perbarui state pars
    };    

    useEffect(() => {
        switch (selectedMethod) {
            case 'sma': case 'dma':
                setPars([2]);
                break;
            case 'ses': case 'des':
                setPars([0.1]);
                break;
            case 'holt':
                setPars([0.1, 0.1]);
                break;
            case 'winter':
                setPars([0.1, 0.1, 0.1, 2]);
                break;
            default:
                setPars([]);
                break;
        }
    }, [selectedMethod]);

    const inputPars = (method: string) => {
        switch (method) {
        case 'sma': case 'dma':
            return (
                <div className="flex flex-row gap-2">
                    <label className="max-w-sm p-2 mt-4 rounded-lg" htmlFor="par1">distance :</label>
                    <input className="max-w-sm p-2 mt-4 rounded-lg" 
                    type="number" value={pars[0]} max={'11'} min={'2'} 
                    step={'1'} id="par1" onChange={(e) => handleInputChange(0, parseFloat(e.target.value))}/>
                </div>
            );
        case 'ses': case 'des':
            return (
                <div className="flex flex-row gap-2">
                    <label className="max-w-sm p-2 mt-4 rounded-lg" htmlFor="par1">alpha :</label>
                    <input className="max-w-sm p-2 mt-4 rounded-lg" 
                    type="number" value={pars[0]} max={'0.9'} min={'0.1'} 
                    step={'0.1'} id="par1" onChange={(e) => handleInputChange(0, parseFloat(e.target.value))}/>
                </div>
            );
        case 'holt':
            return (
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2">
                        <label className="max-w-sm p-2 mt-4 rounded-lg" htmlFor="par1">alpha :</label>
                        <input className="max-w-sm p-2 mt-4 rounded-lg" 
                        type="number" value={pars[0]} max={'0.9'} min={'0.1'} 
                        step={'0.1'} id="par1" onChange={(e) => handleInputChange(0, parseFloat(e.target.value))}/>
                    </div>
                    <div className="flex flex-row gap-2">
                        <label className="max-w-sm p-2 mt-4 rounded-lg" htmlFor="par2">beta :</label>
                        <input className="max-w-sm p-2 mt-4 rounded-lg" 
                        type="number" value={pars[1]} max={'0.9'} min={'0.1'} 
                        step={'0.1'} id="par2" onChange={(e) => handleInputChange(1, parseFloat(e.target.value))}/>
                    </div>
                </div>
            );
        case 'winter':
            return (
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2">
                        <label className="max-w-sm p-2 mt-4 rounded-lg" htmlFor="par1">alpha :</label>
                        <input className="max-w-sm p-2 mt-4 rounded-lg" 
                        type="number" value={pars[0]} max={'0.9'} min={'0.1'} 
                        step={'0.1'} id="par1" onChange={(e) => handleInputChange(0, parseFloat(e.target.value))}/>
                    </div>
                    <div className="flex flex-row gap-2">
                        <label className="max-w-sm p-2 mt-4 rounded-lg" htmlFor="par2">beta :</label>
                        <input className="max-w-sm p-2 mt-4 rounded-lg" 
                        type="number" value={pars[1]} max={'0.9'} min={'0.1'} 
                        step={'0.1'} id="par2" onChange={(e) => handleInputChange(1, parseFloat(e.target.value))}/>
                    </div>
                    <div className="flex flex-row gap-2">
                        <label className="max-w-sm p-2 mt-4 rounded-lg" htmlFor="par3">gamma :</label>
                        <input className="max-w-sm p-2 mt-4 rounded-lg" 
                        type="number" value={pars[2]} max={'0.9'} min={'0.1'} 
                        step={'0.1'} id="par3" onChange={(e) => handleInputChange(2, parseFloat(e.target.value))}/>
                    </div>
                    <div className="flex flex-row gap-2">
                        <label className="max-w-sm p-2 mt-4 rounded-lg" htmlFor="par4">period :</label>
                        <input className="max-w-sm p-2 mt-4 rounded-lg" 
                        type="number" value={pars[3]} max={'12'} min={'2'} 
                        step={'1'} id="par4" onChange={(e) => handleInputChange(3, parseInt(e.target.value))}/>
                    </div>
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
    const parsRef = React.useRef<number[]>(pars);

    useEffect(() => {
        selectedMethodRef.current = selectedMethod;
        parsRef.current = pars;
    }, [selectedMethod, pars]);

    useEffect(() => {
        // const pars = Array.from(document.querySelectorAll('input[type="number"]')) as HTMLInputElement[];
        const fileInput = document.getElementById('file') as HTMLInputElement;
        const dataElement = document.getElementById('data') as HTMLElement;
        const resultElement = document.getElementById('result') as HTMLElement;
        const calculateButton = document.getElementById('calculateButton') as HTMLButtonElement;
        if (fileInput && dataElement) {
            handleDisplayTable(fileInput, dataElement).then(data => {
                if (calculateButton && pars && resultElement) {
                    calculateButton.addEventListener('click', () => {
                        const filteredData = data.map(row => row.filter(item => item !== null));
                        handleSmoothing(filteredData, parsRef.current, resultElement, selectedMethodRef.current);
                    });
                }
            });
        }
    }, []);

    return (
        <div className="flex flex-col items-center pt-10 h-[1000px]">
            <div className="border-gray-600 rounded-lg border-2 flex flex-col font-bold items-center bg-gray-100 w-3/4">
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