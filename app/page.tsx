"use client";

import 'handsontable/dist/handsontable.full.min.css';
import Navbar from "@/components/Navbar";
import DataTable from "@/components/DataTable";
import Footer from "@/components/Footer";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-10">
                <Navbar/>
            </header>

            <main className="flex-grow h-full">
                <div className="h-full">
                    <DataTable/>
                </div>
            </main>

            <footer className="bottom-0">
                <Footer/>
            </footer>
        </div>
    );
}

