import React, { useState } from 'react';
import Navbar from './Header/Navbar';
import Toolbar from './/Header/Toolbar';

const Header: React.FC = () => {
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

export default Header;
