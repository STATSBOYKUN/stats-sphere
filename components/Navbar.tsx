// components/NavbarToolbar.tsx
import React, { useState } from 'react';
import {
    FaBars,
    FaFolder,
    FaSave,
    FaPrint,
    FaUndo,
    FaRedo,
    FaChartBar,
    FaCogs,
    FaPlug,
    FaSearch,
} from 'react-icons/fa';

const Navbar: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
    const menuItems = ['File', 'Edit', 'View', 'Data', 'Transform', 'Analyze', 'Graphs', 'Utilities', 'Extensions', 'Window', 'Help'];

    return (
        <nav className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 shadow-md">
            <div className="flex items-center justify-between w-full px-1">
                {/* Bagian Kiri: Tombol Sidebar dan Menu Items */}
                <div className="flex items-center">
                    <button
                        onClick={toggleSidebar}
                        className="text-white text-2xl lg:hidden focus:outline-none"
                        aria-label="Toggle Sidebar"
                    >
                        <FaBars />
                    </button>
                    <ul className="hidden lg:flex space-x-4 text-sm font-semibold text-white ml-2">
                        {menuItems.map((item) => (
                            <li
                                key={item}
                                className="cursor-pointer hover:bg-blue-700 px-2 py-1 rounded transition duration-200"
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Bagian Kanan: Logo atau Nama Aplikasi */}
                <div className="text-white text-xl font-bold pr-4">
                    StatSphere
                </div>
            </div>
        </nav>
    );
};

const Toolbar: React.FC<{ selectedValue: string }> = ({ selectedValue }) => {
    const tools = [
        { name: 'File', icon: <FaFolder /> },
        { name: 'Save', icon: <FaSave /> },
        { name: 'Print', icon: <FaPrint /> },
        { name: 'Undo', icon: <FaUndo /> },
        { name: 'Redo', icon: <FaRedo /> },
        { name: 'View Data', icon: <FaChartBar /> },
        { name: 'Graphs', icon: <FaChartBar /> },
        { name: 'Utilities', icon: <FaCogs /> },
        { name: 'Extensions', icon: <FaPlug /> },
        { name: 'Search', icon: <FaSearch /> },
    ];

    return (
        <div className="bg-white p-2 shadow flex justify-between items-center">
            {/* Toolbox */}
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
            {/* Input untuk menampilkan nilai sel */}
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
};

const NavbarToolbar: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string>('A1'); // Contoh nilai awal

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div>
            <Navbar toggleSidebar={toggleSidebar} />
            <Toolbar selectedValue={selectedValue} />
        </div>
    );
};

export default NavbarToolbar;
