"use client";

import React from 'react';
import {
    FaFolderOpen,
    FaSave,
    FaPrint,
    FaHistory,
    FaUndo,
    FaRedo,
    FaUserTie,
    FaProjectDiagram,
    FaSlidersH,
    FaChartBar,
    FaSearch,
    FaColumns,
    FaCheckSquare,
    FaTags,
    FaLayerGroup,
    FaTools,
} from 'react-icons/fa';

interface ToolbarProps {
    selectedValue: string;
}

export default function Toolbar({ selectedValue }: ToolbarProps) {
    const tools = [
        { name: 'Open data', icon: <FaFolderOpen /> },
        { name: 'Save Document', icon: <FaSave /> },
        { name: 'Print', icon: <FaPrint /> },
        { name: 'Recall', icon: <FaHistory /> },
        { name: 'Undo', icon: <FaUndo /> },
        { name: 'Redo', icon: <FaRedo /> },
        { name: 'Go to Case', icon: <FaUserTie /> },
        { name: 'Go to Variable', icon: <FaProjectDiagram /> },
        { name: 'Variable', icon: <FaSlidersH /> },
        { name: 'Run Descriptive Statistic', icon: <FaChartBar /> },
        { name: 'Find', icon: <FaSearch /> },
        { name: 'Split File', icon: <FaColumns /> },
        { name: 'Select Cases', icon: <FaCheckSquare /> },
        { name: 'Value Labels', icon: <FaTags /> },
        { name: 'Use Variable sets', icon: <FaLayerGroup /> },
        { name: 'Customized toolbar', icon: <FaTools /> },
    ];

    return (
        <div className="bg-white p-2 shadow flex justify-between items-center">
            <div className="flex space-x-2 overflow-x-auto px-3">
                {tools.map((tool) => (
                    <button
                        key={tool.name}
                        className="flex items-center justify-center text-gray-700 hover:bg-gray-200 p-2 rounded-md transition duration-150"
                        title={tool.name}
                        aria-label={tool.name}
                    >
                        {tool.icon}
                    </button>
                ))}
            </div>

            <div className="flex items-center space-x-2 pr-5">
                <span className="text-gray-700 font-medium">Selected Cell:</span>
                <input
                    type="text"
                    value={selectedValue}
                    readOnly
                    className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="A1"
                />
            </div>
        </div>
    );
}