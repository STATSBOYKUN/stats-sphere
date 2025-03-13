"use client";
import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useResultStore } from "@/stores/useResultStore";
import { Log } from "@/types/Log";
import { Analytic } from "@/types/Analytic";
import { Statistic } from "@/types/Statistic";

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
    const paddingLeft = depth * 4;

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

function buildSidebarData(logs: Log[]): SidebarItem[] {
    const sidebarItems: SidebarItem[] = [];

    logs.forEach(log => {
        if (!log.analytics || log.analytics.length === 0) return;

        log.analytics.forEach(analytic => {
            if (!analytic.statistics || analytic.statistics.length === 0) return;

            const componentsMap = analytic.statistics.reduce((acc: Record<string, Statistic[]>, stat) => {
                const component = stat.components || "General"; // Default component name if not provided
                if (!acc[component]) acc[component] = [];
                acc[component].push(stat);
                return acc;
            }, {});

            const analyticItems: SidebarItem[] = [];

            Object.keys(componentsMap).forEach((component) => {
                const stats = componentsMap[component];
                if (stats.length > 1) {
                    // Component with more than one statistic
                    analyticItems.push({
                        title: component,
                        items: stats.map((stat) => ({
                            title: stat.title,
                            url: `#output-${analytic.id}-${stat.id}`
                        }))
                    });
                } else if (stats.length === 1) {
                    // Component with only one statistic, add directly without component name
                    analyticItems.push({
                        title: stats[0].title,
                        url: `#output-${analytic.id}-${stats[0].id}`
                    });
                }
            });

            if (analyticItems.length > 0) {
                sidebarItems.push({
                    title: analytic.title,
                    items: analyticItems
                });
            }
        });
    });

    return sidebarItems;
}

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { logs } = useResultStore();
    const [sidebarData, setSidebarData] = useState<SidebarItem[]>([]);

    useEffect(() => {
        const data = buildSidebarData(logs);
        setSidebarData(data);
    }, [logs]);

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