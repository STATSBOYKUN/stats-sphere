// components/Header.tsx
import React, { useState } from 'react';
import Navbar from './Header/Navbar';
import Toolbar from './Header/Toolbar';

export default function Header() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string>('A1');

    const toggleSidebar = () => {
        setIsSidebarOpen((prevState) => !prevState);
    };

    return (
        <div>
            <Navbar toggleSidebar={toggleSidebar} />
            <Toolbar selectedValue={selectedValue} />
        </div>
    );
}
