// components/Layout/Main/Header.tsx
"use client";

import React, { useState } from 'react';
import Navbar from './Navbar';
import Toolbar from './Toolbar';

export default function Header() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string>('A1');

    const toggleSidebar = () => {
        setIsSidebarOpen((prevState) => !prevState);
    };

    return (
        <div>
            <Navbar />
            <Toolbar selectedValue={selectedValue} />
        </div>
    );
}