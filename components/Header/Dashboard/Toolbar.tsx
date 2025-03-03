// components/Layout/Main/Toolbar.tsx
"use client";

import React from 'react';
import {
    FolderOpen,
    Save,
    Printer,
    History,
    Undo,
    Redo,
    Locate,
    Variable,
    Search,
    TableRowsSplit,
} from 'lucide-react';

import { Input } from "@/components/ui/input";

interface ToolbarProps {
    selectedValue: string;
}

export default function Toolbar({ selectedValue }: ToolbarProps) {
    const tools = [
        { name: 'Open Data', icon: <FolderOpen size={20} /> },
        { name: 'Save Document', icon: <Save size={20} /> },
        { name: 'Print', icon: <Printer size={20} /> },
        { name: 'History', icon: <History size={20} /> },
        { name: 'Undo', icon: <Undo size={20} /> },
        { name: 'Redo', icon: <Redo size={20} /> },
        { name: 'Locate', icon: <Locate size={20} /> },
        { name: 'Variable', icon: <Variable size={20} /> },
        { name: 'Search', icon: <Search size={20} /> },
        { name: 'Split File', icon: <TableRowsSplit size={20} /> },
    ];

    return (
        <div className="bg-white px-4 pb-2 shadow flex justify-between items-center">
            {/* Toolbar Buttons */}
            <div className="flex space-x-2 overflow-x-auto ">
                {tools.map((tool) => (
                    <button
                        key={tool.name}
                        className="flex items-center justify-center text-gray-700 hover:bg-gray-200 px-2 rounded-md transition duration-150"
                        title={tool.name}
                        aria-label={tool.name}
                    >
                        {tool.icon}
                    </button>
                ))}
            </div>

            {/* Input Field */}
            <div className="flex items-center space-x-2">
                <Input
                    type="text"
                    value={selectedValue}
                    readOnly
                    placeholder="A1"
                    className="w-96"
                />
            </div>
        </div>
    );
}
