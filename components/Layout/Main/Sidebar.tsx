"use client";
import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, List, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useResultStore from "@/stores/useResultStore";

const SidebarMenuItem = ({ item, depth = 0, isOpen }: { item: any; depth?: number; isOpen: boolean }) => {
    const [open, setOpen] = useState(false);
    const hasChildren = item.items && item.items.length > 0;
    const handleToggle = () => {
        if (hasChildren) setOpen(!open);
    };

    return (
        <div className="flex flex-col">
            {item.isLog ? (
                isOpen ? (
                    <a
                        href="#log"
                        className={cn(
                            "flex items-center text-sm font-medium text-gray-700 rounded focus:outline-none transition-colors duration-200",
                            depth > 0 ? "pl-3 py-1" : "py-2 px-3",
                            "w-full text-left hover:bg-gray-100 focus:outline-none"
                        )}
                    >
                        <span>Log</span>
                        <span className="ml-auto w-4"></span>
                    </a>
                ) : (
                    <a
                        href="#log"
                        className={cn(
                            "flex items-center justify-center text-sm font-medium text-gray-700 rounded focus:outline-none transition-colors duration-200",
                            depth > 0 ? "pl-3 py-1" : "py-2 px-3",
                            "w-full hover:bg-gray-100 focus:outline-none"
                        )}
                        title="Log"
                    >
                        <List size={20} />
                    </a>
                )
            ) : hasChildren ? (
                <>
                    {isOpen ? (
                        <button
                            onClick={handleToggle}
                            className={cn(
                                "flex items-center text-sm font-medium text-gray-700 rounded focus:outline-none transition-colors duration-200",
                                depth > 0 ? "pl-3 py-1" : "py-2 px-3",
                                "w-full text-left hover:bg-gray-100"
                            )}
                        >
                            <span>{item.title}</span>
                            <span className="ml-auto">
                {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
                        </button>
                    ) : (
                        <button
                            onClick={handleToggle}
                            className={cn(
                                "flex items-center justify-center text-sm font-medium text-gray-700 rounded focus:outline-none transition-colors duration-200",
                                depth > 0 ? "pl-3 py-1" : "py-2 px-3",
                                "w-full hover:bg-gray-100"
                            )}
                            title={item.title}
                        >
                            <BarChart2 size={20} />
                        </button>
                    )}
                </>
            ) : (
                <a
                    href={item.url}
                    className={cn(
                        "flex items-center text-sm text-gray-700 rounded hover:bg-gray-100",
                        depth > 0 ? "pl-6 py-1" : "pl-3 py-2",
                        "w-full focus:outline-none"
                    )}
                >
                    <span>{item.title}</span>
                    <span className="ml-auto w-4"></span>
                </a>
            )}
            {hasChildren && open && isOpen && (
                <div className="ml-4 border-l border-gray-200">
                    {item.items.map((child: any, idx: number) => (
                        <SidebarMenuItem key={idx} item={child} depth={depth + 1} isOpen={isOpen} />
                    ))}
                </div>
            )}
        </div>
    );
};

function buildSidebarData(logs: any[], analytics: any[], statistics: any[]) {
    const logsData = logs.map(() => ({
        title: "Log",
        items: [],
        isLog: true
    }));

    const analyticsData = analytics.map((analytic) => {
        const statsForAnalytic = statistics.filter((stat) => stat.analytic_id === analytic.id);
        const componentsMap = statsForAnalytic.reduce((acc: Record<string, any[]>, stat) => {
            const component = stat.components;
            if (!acc[component]) acc[component] = [];
            acc[component].push(stat);
            return acc;
        }, {});

        const componentsItems: any[] = [];
        Object.keys(componentsMap).forEach((component) => {
            const stats = componentsMap[component];
            if (stats.length === 1 && stats[0].title === component) {
                componentsItems.push({
                    title: stats[0].title,
                    url: `#output-${analytic.id}-${stats[0].id}`
                });
            } else {
                componentsItems.push({
                    title: component,
                    items: stats.map((stat) => ({
                        title: stat.title,
                        url: `#output-${analytic.id}-${stat.id}`
                    }))
                });
            }
        });

        return {
            title: analytic.title,
            items: componentsItems,
            isLog: false
        };
    });

    return [...logsData, ...analyticsData];
}

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { logs, analytics, statistics, fetchLogs, fetchAnalytics, fetchStatistics } = useResultStore();
    const [sidebarData, setSidebarData] = useState<any[]>([]);

    useEffect(() => {
        fetchLogs();
        fetchAnalytics();
        fetchStatistics();
    }, [fetchLogs, fetchAnalytics, fetchStatistics]);

    useEffect(() => {
        const data = buildSidebarData(logs, analytics, statistics);
        setSidebarData(data);
    }, [logs, analytics, statistics]);

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
