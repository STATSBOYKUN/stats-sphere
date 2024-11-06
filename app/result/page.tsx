// app/output/page.tsx

"use client";

import React from "react";
import DataTable from "@/components/Output/Table";
import BarChart from "@/components/Output/BarChart";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

const dummyTableData = [
    { Variable: "Age", "Mean": 35.4, "Std Dev": 10.2 },
    { Variable: "Income", "Mean": 55000, "Std Dev": 15000 },
    { Variable: "Score", "Mean": 75.8, "Std Dev": 12.5 },
];

const dummyGraphData = [
    { category: "Jan", value: 30 },
    { category: "Feb", value: 20 },
    { category: "Mar", value: 25 },
    { category: "Apr", value: 35 },
    { category: "May", value: 40 },
    { category: "Jun", value: 45 },
];

const OutputPage = () => {
    return (
        <div className="flex-grow w-full flex flex-col">
            {/* Main Content */}
            <main className="p-4 flex-1 overflow-y-auto">
                {/* Teks Deskripsi */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Descriptive Statistics</h2>
                    <p className="text-gray-700">
                        Berikut adalah ringkasan statistik deskriptif untuk variabel-variabel dalam dataset:
                    </p>
                </section>

                {/* Tabel Data */}
                <section className="mb-8">
                    <h3 className="text-xl font-semibold mb-2">Statistik Deskriptif</h3>
                    <DataTable
                        data={dummyTableData}
                        columns={["Variable", "Mean", "Std Dev"]}
                    />
                </section>

                {/* Grafik */}
                <section>
                    <h3 className="text-xl font-semibold mb-2">Grafik Penjualan Bulanan</h3>
                    <div className="w-full h-80">
                        <BarChart data={dummyGraphData} width={600} height={400} />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default OutputPage;
