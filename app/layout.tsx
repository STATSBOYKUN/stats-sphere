import type { Metadata } from "next";
import '@/app/globals.css'
import Header from "@/components/Header/Dashboard/Header";
import Footer from "@/components/Footer/Dashboard/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import React from "react";
import ModalContainer from "@/components/Modals/ModalContainer";

export const metadata: Metadata = {
    title: "My App",
    description: "Default layout for the app",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <head />
        <body className={"h-full w-full m-0 p-0 grid grid-rows-[auto_1fr_auto] overflow-hidden"}>
            <div className="min-h-screen flex flex-col">
                <main className="flex-grow">
                    {children}
                    <ModalContainer />
                </main>
            </div>
        </body>
        </html>
    );
}
