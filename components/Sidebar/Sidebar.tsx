"use client";
import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {useResultStore} from "@/stores/useResultStore";

interface SidebarItem {
    title: string;
    url?: string;
    items?: SidebarItem[];
}

const SidebarMenuItem: React.FC<{ item: SidebarItem; depth?: number; isOpen: boolean }> = ({ item, depth = 0, isOpen }) => {
    const [open, setOpen] = useState(false);
    const hasChildren = item.items && item.items.length > 0;

    const handleToggle = () => {
        if (hasChildren) setOpen(!open);
    };

    // Define padding based on depth
    const paddingLeft = depth * 4; // Adjust as needed

    return (
        <div className="flex flex-col">
            {hasChildren ? (
                <>
                    <button
                        onClick={handleToggle}
                        className={cn(
                            "flex items-center text-sm text-gray-700 rounded focus:outline-none transition-colors duration-200",
                            "w-full text-left hover:bg-gray-100",
                            { "pl-3 py-1": depth > 0, "py-2 px-3": depth === 0 }
                        )}
                        style={{ paddingLeft: `${paddingLeft}px` }}
                    >
                        <span>{item.title}</span>
                        <span className="ml-auto">
                            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                    </button>
                    {open && isOpen && (
                        <div className="ml-2">
                            {item.items!.map((child, idx) => (
                                <SidebarMenuItem key={idx} item={child} depth={depth + 1} isOpen={isOpen} />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <a
                    href={item.url}
                    className={cn(
                        "flex items-center text-sm text-gray-700 rounded hover:bg-gray-100",
                        "w-full",
                        { "pl-6 py-1": depth > 0, "py-2 px-3": depth === 0 }
                    )}
                    style={{ paddingLeft: `${paddingLeft}px` }}
                >
                    <span>{item.title}</span>
                </a>
            )}
        </div>
    );
};

function buildSidebarData(analytics: any[], statistics: any[]): SidebarItem[] {
    return analytics.map((analytic) => {
        const statsForAnalytic = statistics.filter((stat) => stat.analytic_id === analytic.id);
        const componentsMap = statsForAnalytic.reduce((acc: Record<string, any[]>, stat) => {
            const component = stat.components || "General"; // Default component name if not provided
            if (!acc[component]) acc[component] = [];
            acc[component].push(stat);
            return acc;
        }, {});

        const items: SidebarItem[] = [];

        Object.keys(componentsMap).forEach((component) => {
            const stats = componentsMap[component];
            if (stats.length > 1) {
                // Komponen dengan lebih dari satu statistik
                items.push({
                    title: component,
                    items: stats.map((stat) => ({
                        title: stat.title,
                        url: `#output-${analytic.id}-${stat.id}`
                    }))
                });
            } else if (stats.length === 1) {
                // Komponen dengan satu statistik, tambahkan langsung tanpa nama komponen
                items.push({
                    title: stats[0].title,
                    url: `#output-${analytic.id}-${stats[0].id}`
                });
            }
        });

        return {
            title: analytic.title,
            items: items
        };
    });
}

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { analytics, statistics, fetchAnalytics, fetchStatistics } = useResultStore();
    const [sidebarData, setSidebarData] = useState<SidebarItem[]>([]);

    useEffect(() => {
        fetchAnalytics();
        fetchStatistics();
    }, [fetchAnalytics, fetchStatistics]);

    useEffect(() => {
        const data = buildSidebarData(analytics, statistics);
        setSidebarData(data);
    }, [analytics, statistics]);

    return (
        <div
            className={cn(
                "bg-white border-r transition-all duration-300 flex flex-col h-full",
                isOpen ? "w-64" : "w-20"
            )}
        >
            <div className="flex items-center justify-between p-3 border-b">
                {isOpen && <h1 className="text-md font-semibold">Result</h1>}
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                    <ChevronRight
                        className={cn(
                            "w-4 h-4 transform transition-transform",
                            isOpen ? "rotate-180" : "rotate-0"
                        )}
                    />
                </Button>
            </div>
            <div className="p-2 flex-grow overflow-y-auto">
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
