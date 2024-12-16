"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, List, BarChart2 } from "lucide-react"; // Import ikon yang diperlukan
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Definisi tipe data (Jika menggunakan TypeScript)
type Log = {
    id: number;
    log: string;
};

type Analytic = {
    id: number;
    log_id: number;
    title: string;
    note: string;
};

type Statistic = {
    id: number;
    analytic_id: number;
    title: string;
    components: string;
};

// Dummy data
const dummyLogs: Log[] = [
    { id: 2, log: "FREQUENCIES VARIABLES=Var1, Var2 /ORDER=ANALYSIS." },
];

const dummyAnalytics: Analytic[] = [
    { id: 2, log_id: 2, title: "Frequencies", note: "" },
];

const dummyStatistics: Statistic[] = [
    { id: 1, analytic_id: 2, title: "Descriptive Statistics", components: "Descriptive Statistics" },
    { id: 2, analytic_id: 2, title: "Frequency Table for Var1", components: "Frequency Table" },
    { id: 3, analytic_id: 2, title: "Frequency Table for Var2", components: "Frequency Table" },
    { id: 4, analytic_id: 2, title: "Descriptive Statistics", components: "Descriptive Statistics" },
];

// Helper function to build sidebar data with separate Log and Analytic sections
const buildSidebarData = () => {
    const logs = dummyLogs.map((log) => ({
        title: "Log", // Menghapus ID dari judul
        items: [], // Log tidak memiliki anak
        isLog: true, // Menandai bahwa ini adalah item Log
    }));

    const analytics = dummyAnalytics.map((analytic) => {
        // Mendapatkan statistik untuk analisis ini
        const statisticsForAnalytic = dummyStatistics.filter(
            (statistic) => statistic.analytic_id === analytic.id
        );

        // Mengelompokkan statistik berdasarkan komponen
        const componentsMap = statisticsForAnalytic.reduce((acc, stat) => {
            const component = stat.components;
            if (!acc[component]) {
                acc[component] = [];
            }
            acc[component].push(stat);
            return acc;
        }, {} as Record<string, Statistic[]>);

        const componentsItems: any[] = [];

        Object.keys(componentsMap).forEach((component) => {
            const stats = componentsMap[component];
            if (stats.length === 1 && stats[0].title === component) {
                // Hanya satu statistik dan judul sama dengan komponen, lewati tingkat komponen
                componentsItems.push({
                    title: stats[0].title,
                    url: `/output/${analytic.id}/${stats[0].id}`, // Struktur URL contoh
                });
            } else {
                // Multiple statistik atau judul berbeda, sertakan tingkat komponen
                componentsItems.push({
                    title: component,
                    items: stats.map((statistic) => ({
                        title: statistic.title,
                        url: `/output/${analytic.id}/${statistic.id}`, // Struktur URL contoh
                    })),
                });
            }
        });

        return {
            title: analytic.title,
            items: componentsItems,
            isLog: false,
        };
    });

    return [...logs, ...analytics];
};

// Sidebar Menu Item
const SidebarMenuItem = ({
                             item,
                             depth = 0,
                             isOpen,
                         }: {
    item: any;
    depth?: number;
    isOpen: boolean;
}) => {
    const [open, setOpen] = useState(false);
    const hasChildren = item.items && item.items.length > 0;

    const handleToggle = () => {
        if (hasChildren) {
            setOpen(!open);
        }
    };

    return (
        <div className="flex flex-col">
            {item.isLog ? (
                isOpen ? (
                    // Sidebar terbuka, tampilkan teks "Log" tanpa ikon
                    <a
                        href="#log" // Ganti dengan URL yang sesuai jika perlu
                        className={cn(
                            "flex items-center text-sm font-medium text-gray-700 rounded focus:outline-none transition-colors duration-200",
                            depth > 0 ? "pl-3 py-1" : "py-2 px-3", // Padding yang lebih ringkas
                            "w-full text-left", // Membuat link mengambil lebar penuh
                            "hover:bg-gray-100",
                            "focus:outline-none"
                        )}
                    >
                        <span>Log</span>
                        {/* Spacer untuk menyamakan posisi teks */}
                        <span className="ml-auto w-4"></span>
                    </a>
                ) : (
                    // Sidebar diminimalkan, tampilkan ikon saja
                    <a
                        href="#log" // Ganti dengan URL yang sesuai jika perlu
                        className={cn(
                            "flex items-center justify-center text-sm font-medium text-gray-700 rounded focus:outline-none transition-colors duration-200",
                            depth > 0 ? "pl-3 py-1" : "py-2 px-3", // Padding yang lebih ringkas
                            "w-full",
                            "hover:bg-gray-100",
                            "focus:outline-none"
                        )}
                        title="Log" // Tooltip untuk aksesibilitas
                    >
                        <List size={20} />
                    </a>
                )
            ) : hasChildren ? (
                // Item Analytic dengan anak
                <>
                    {isOpen ? (
                        // Sidebar terbuka, tampilkan teks dengan ikon ChartBar dan Chevron
                        <button
                            onClick={handleToggle}
                            className={cn(
                                "flex items-center text-sm font-medium text-gray-700 rounded focus:outline-none transition-colors duration-200",
                                depth > 0 ? "pl-3 py-1" : "py-2 px-3", // Padding yang lebih ringkas
                                "w-full text-left", // Membuat tombol mengambil lebar penuh
                                "hover:bg-gray-100"
                            )}
                        >
                            <span>{item.title}</span>
                            <span className="ml-auto">
                                {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </span>
                        </button>
                    ) : (
                        // Sidebar diminimalkan, tampilkan ikon ChartBar saja
                        <button
                            onClick={handleToggle}
                            className={cn(
                                "flex items-center justify-center text-sm font-medium text-gray-700 rounded focus:outline-none transition-colors duration-200",
                                depth > 0 ? "pl-3 py-1" : "py-2 px-3", // Padding yang lebih ringkas
                                "w-full",
                                "hover:bg-gray-100"
                            )}
                            title={item.title} // Tooltip untuk aksesibilitas
                        >
                            <BarChart2 size={20} />
                        </button>
                    )}
                </>
            ) : (
                // Jika item tidak memiliki anak, render sebagai link
                <a
                    href={item.url}
                    className={cn(
                        "flex items-center text-sm text-gray-700 rounded hover:bg-gray-100",
                        depth > 0 ? "pl-6 py-1" : "pl-3 py-2",
                        "w-full",
                        "focus:outline-none" // Menghapus outline fokus
                    )}
                >
                    <span>{item.title}</span>
                    {/* Spacer untuk menyamakan posisi teks */}
                    <span className="ml-auto w-4"></span>
                </a>
            )}
            {hasChildren && open && isOpen && (
                <div className="ml-4 border-l border-gray-200">
                    {item.items.map((child: any, index: number) => (
                        <SidebarMenuItem key={index} item={child} depth={depth + 1} isOpen={isOpen} />
                    ))}
                </div>
            )}
        </div>
    ); // <-- Pastikan ada kurung tutup ')' di sini

}; // <-- Pastikan ada kurung kurawal penutup '}' di sini

// Sidebar Component
const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const sidebarData = buildSidebarData();

    return (
        <div
            className={cn(
                "bg-white border-r transition-all duration-300 flex flex-col h-full",
                isOpen ? "w-64" : "w-20"
            )}
        >
            {/* Header Sidebar */}
            <div className="flex items-center justify-between p-3 border-b">
                {isOpen && <h1 className="text-md font-semibold">Result</h1>}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ChevronRight
                        className={cn(
                            "w-4 h-4 transform transition-transform",
                            isOpen ? "rotate-180" : "rotate-0"
                        )}
                    />
                </Button>
            </div>
            {/* Konten Sidebar */}
            <div className="p-2 flex-grow overflow-y-auto">
                {/* Search Input */}
                {isOpen && (
                    <div className="mb-3">
                        <Input placeholder="Search..." size="sm" />
                    </div>
                )}
                {/* Sidebar Menu */}
                <nav>
                    {sidebarData.map((item, index) => (
                        <SidebarMenuItem key={index} item={item} isOpen={isOpen} />
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;
