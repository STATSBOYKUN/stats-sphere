// components/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { FaBars } from 'react-icons/fa';

interface NavbarProps {
    toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
    const menuItems = ['File', 'Edit', 'View', 'Data', 'Transform', 'Analyze', 'Graphs', 'Utilities', 'Extensions', 'Window', 'Help'];

    // State to manage dropdown visibility for "File"
    const [isFileDropdownOpen, setIsFileDropdownOpen] = useState(false);

    // Reference to the File menu to handle clicks outside
    const fileMenuRef = useRef<HTMLLIElement>(null);

    // List of sub-items for "File" without ellipses
    const fileSubItems = [
        'New',
        'Open',
        'Import Data',
        'Close',
        'Save',
        'Save As',
        'Save All Data',
        'Export',
        'Mark File Read Only',
        'Revert to Saved File',
        'Rename Dataset',
        'Display Data File Information',
        'Cache Data',
        'Collect Variable Information',
        'Stop Processor',
        'Switch Server',
        'Repository',
        'Print Preview',
        'Print',
        'Welcome Dialog',
        'Recently Used Data',
        'Recently Used Files'
    ];

    // Handle clicks outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                fileMenuRef.current &&
                !fileMenuRef.current.contains(event.target as Node)
            ) {
                setIsFileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 shadow-md">
            <div className="flex items-center justify-between w-full px-1">
                {/* Left Section: Sidebar Toggle Button and Menu Items */}
                <div className="flex items-center">
                    <button
                        onClick={toggleSidebar}
                        className="text-white text-2xl lg:hidden focus:outline-none"
                        aria-label="Toggle Sidebar"
                    >
                        <FaBars />
                    </button>
                    <ul className="hidden lg:flex space-x-4 text-sm font-semibold text-white ml-2">
                        {menuItems.map((item) => {
                            if (item === 'File') {
                                return (
                                    <li
                                        key={item}
                                        className="relative cursor-pointer hover:bg-blue-700 px-2 py-1 rounded transition duration-200"
                                        ref={fileMenuRef}
                                        onClick={() => setIsFileDropdownOpen(!isFileDropdownOpen)}
                                    >
                                        <div className="flex items-center">
                                            {item}
                                            {/* Dropdown Icon */}
                                            <svg
                                                className="inline ml-1 w-3 h-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                        {isFileDropdownOpen && (
                                            <ul className="absolute left-0 mt-1 w-56 bg-white text-gray-800 rounded-md shadow-lg z-20">
                                                {fileSubItems.map((subItem) => (
                                                    <li
                                                        key={subItem}
                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm transition-colors duration-150"
                                                        onClick={() => {
                                                            // Handle sub-item click if needed
                                                            setIsFileDropdownOpen(false);
                                                        }}
                                                    >
                                                        {subItem}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                );
                            } else {
                                return (
                                    <li
                                        key={item}
                                        className="cursor-pointer hover:bg-blue-700 px-2 py-1 rounded transition duration-200"
                                    >
                                        {item}
                                    </li>
                                );
                            }
                        })}
                    </ul>
                </div>
                {/* Right Section: Logo or Application Name */}
                <div className="text-white text-xl font-bold pr-4">
                    StatSphere
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
