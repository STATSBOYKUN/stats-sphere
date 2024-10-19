// components/Footer.tsx
import React from 'react';
import { FaDatabase, FaChartBar } from 'react-icons/fa';

interface FooterProps {
    activeView: 'data' | 'variable';
    setActiveView: (view: 'data' | 'variable') => void;
}

export default function Footer({ activeView, setActiveView }: FooterProps) {
    const handleViewChange = (view: 'data' | 'variable') => {
        setActiveView(view);
        console.log(`Switched to ${view} view`);
    };

    return (
        <footer className="bg-gray-800 p-3 shadow-inner">
            <div className="container mx-auto flex justify-center items-center space-x-4">
                <button
                    onClick={() => handleViewChange('data')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition duration-200 ${
                        activeView === 'data'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    <FaDatabase />
                    <span className="text-sm">Data View</span>
                </button>
                <button
                    onClick={() => handleViewChange('variable')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition duration-200 ${
                        activeView === 'variable'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    <FaChartBar />
                    <span className="text-sm">Variable View</span>
                </button>
            </div>
        </footer>
    );
}
