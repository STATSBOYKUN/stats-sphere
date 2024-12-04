// components/Layout/Main/Sidebar.tsx

"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, Logs, FileText, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

// Data dummy
const sidebarData = [
    {
        title: "Output",
        icon: Logs,
        items: [
            {
                title: "Log",
                icon: Logs,
                url: "/output/log",
            },
            {
                title: "Result",
                icon: FileText,
                items: [
                    {
                        title: "Title",
                        url: "/output/result/title",
                    },
                    {
                        title: "Notes",
                        url: "/output/result/notes",
                    },
                    {
                        title: "Active Dataset",
                        icon: Database,
                        url: "/output/result/active-dataset",
                    },
                ],
            },
        ],
    },
];

// Komponen SidebarMenuItem yang mendukung kolaps
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

    // Saat sidebar dikompresi, tutup semua submenu
    useEffect(() => {
        if (!isOpen) {
            setOpen(false);
        }
    }, [isOpen]);

    const handleToggle = () => {
        if (hasChildren) {
            setOpen(!open);
        }
    };

    return (
        <div className="flex flex-col">
            <button
                onClick={handleToggle}
                className={cn(
                    "flex items-center p-2 text-sm font-medium text-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-gray-500",
                    depth > 0 && "pl-4",
                    !isOpen && "justify-center"
                )}
            >
                {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                {isOpen && <span>{item.title}</span>}
                {hasChildren && isOpen && (
                    <ChevronRight
                        className={cn(
                            "ml-auto h-4 w-4 transition-transform duration-200",
                            open ? "rotate-90" : "rotate-0"
                        )}
                    />
                )}
            </button>
            {hasChildren && isOpen && open && (
                <div className="pl-4">
                    {item.items.map((child: any, index: number) => (
                        <SidebarMenuItem key={index} item={child} depth={depth + 1} isOpen={isOpen} />
                    ))}
                </div>
            )}
            {!hasChildren && isOpen && (
                <a
                    href={item.url}
                    className={cn(
                        "flex items-center p-2 text-sm font-medium text-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-gray-500",
                        depth > 0 && "pl-4",
                        !isOpen && "justify-center"
                    )}
                >
                    {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                    {isOpen && <span>{item.title}</span>}
                </a>
            )}
        </div>
    );
};

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div
            className={cn(
                "bg-white border-r transition-all duration-300 overflow-hidden flex flex-col h-full",
                isOpen ? "w-64" : "w-20"
            )}
        >
            <div className="flex items-center justify-between p-4 border-b">
                {isOpen && <h1 className="text-lg font-semibold">Result</h1>}
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
            <div className="p-4 flex-grow overflow-y-auto">
                {/* Search Input */}
                {isOpen && (
                    <div className="mb-4">
                        <Input placeholder="Search..." />
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
