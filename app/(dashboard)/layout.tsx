// app/(dashboard)/layout.tsx
import type { Metadata } from "next";
import "@/app/globals.css";
import Header from "@/components/Header/Dashboard/Header";
import Footer from "@/components/Footer/Dashboard/Footer";
import React from "react";
import ModalContainer from "@/components/Modals/ModalContainer";
import DataLoader from "@/components/DataLoader";
import LoadingOverlay from "@/components/LoadingOverlay";

export const metadata: Metadata = {
  title: "Statify",
  description: "Statistical analysis application",
};

export default function DashboardLayout({
                                          children,
                                        }: {
  children: React.ReactNode;
}) {
  return (
      <>
        <DataLoader />

        <div className="h-screen w-full flex flex-col overflow-hidden">
          <header className="flex-shrink-0 z-50">
            <Header />
          </header>
          <main className="flex-grow overflow-hidden relative">
            <LoadingOverlay>
              {children}
            </LoadingOverlay>
            <ModalContainer />
          </main>
          <footer className="flex-shrink-0 border-t">
            <Footer />
          </footer>
        </div>
      </>
  );
}