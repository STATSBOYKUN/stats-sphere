// components/Layout/Main/Footer.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaDatabase, FaChartBar } from 'react-icons/fa';

export default function Footer() {
    const pathname = usePathname();

    const activeView = pathname.startsWith('/data') ? 'data' :
        pathname.startsWith('/variables') ? 'variable' : '';

    return (
        <footer className="bg-gray-800 p-3 shadow-inner">
            <div className="container mx-auto flex justify-center items-center space-x-4">
                <Link href="/data" className={`flex items-center space-x-2 px-4 py-2 rounded-full transition duration-200 ${
                    activeView === 'data'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}>
                    <FaDatabase />
                    <span className="text-sm">Data View</span>
                </Link>
                <Link href="/variables" className={`flex items-center space-x-2 px-4 py-2 rounded-full transition duration-200 ${
                    activeView === 'variable'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}>
                    <FaChartBar />
                    <span className="text-sm">Variable View</span>
                </Link>
            </div>
        </footer>
    );
}
