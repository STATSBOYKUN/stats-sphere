// pages/page.tsx
"use client";

import 'handsontable/dist/handsontable.full.min.css';
import NavbarToolbar from "@/components/Navbar";
import DataTable from "@/components/DataTable";
import VariableView from "@/components/VariableTable";
import Footer from "@/components/Footer";
import React, { useState } from 'react';

export default function Home() {
    const [activeView, setActiveView] = useState<'data' | 'variable'>('data');

    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50">
                <NavbarToolbar />
            </header>

            <main className="flex-grow flex">
                <div className="w-full flex flex-col">
                    {activeView === 'data' ? <DataTable /> : <VariableView />}
                </div>
            </main>

            <Footer activeView={activeView} setActiveView={setActiveView} />
        </div>
    );
}
