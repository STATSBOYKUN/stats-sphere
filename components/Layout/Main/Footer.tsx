// components/Layout/Main/Footer.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

export default function Footer() {
    const pathname = usePathname();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<string>('data');

    useEffect(() => {
        if (pathname.startsWith('/data')) {
            setActiveTab('data');
        } else if (pathname.startsWith('/variable')) {
            setActiveTab('variable');
        } else if (pathname.startsWith('/result')) {
            setActiveTab('result');
        } else {
            setActiveTab('data'); // Default tab
        }
    }, [pathname]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.push(`/${value}`);
    };

    return (
        <footer>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="py-2">
                <TabsList className="space-x-2">
                    <TabsTrigger value="data">Data View</TabsTrigger>
                    <TabsTrigger value="variable">Variable View</TabsTrigger>
                    <TabsTrigger value="result">Result View</TabsTrigger>
                </TabsList>
            </Tabs>
        </footer>
    );
}
