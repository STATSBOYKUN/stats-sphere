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
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={toggleSidebar} className="text-white text-xl lg:hidden focus:outline-none">
                        <FaBars />
                    </button>
                    <ul className="hidden lg:flex space-x-3 text-sm font-semibold text-white">
                        {menuItems.map((item) => (
                            <li key={item} className="cursor-pointer hover:bg-blue-700 px-3 py-1 rounded transition duration-200">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="hidden lg:flex space-x-3">
                    {/* Placeholder untuk item tambahan seperti profil pengguna atau pencarian */}
                </div>
            </div>
        </nav>
    );
};

const Toolbar: React.FC = () => {
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
        <div className="bg-white p-2 shadow flex space-x-2 overflow-x-auto">
            {tools.map((tool) => (
                <button
                    key={tool.name}
                    className="flex items-center justify-center text-gray-700 hover:bg-gray-200 p-2 rounded-md transition duration-150"
                    title={tool.name}
                >
                    {tool.icon}
                </button>
            ))}
        </div>
    );
};

const NavbarToolbar: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div>
            <Navbar toggleSidebar={toggleSidebar} />
            <Toolbar />
        </div>
    );
};

export default NavbarToolbar;
