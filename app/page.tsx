// pages/page.tsx
"use client";

import 'handsontable/dist/handsontable.full.min.css';
import NavbarToolbar from "@/components/Navbar";
import DataTable from "@/components/DataTable";
import Footer from "@/components/Footer";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50">
                <NavbarToolbar />
            </header>

            <main className="flex-grow flex">
                <div className="w-full flex flex-col">
                    <DataTable />
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}
