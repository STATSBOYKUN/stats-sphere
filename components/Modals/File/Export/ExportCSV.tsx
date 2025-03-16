// components/Modals/File/ExportCSV.tsx
"use client";

import React, { FC } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";

interface ExportCSVProps {
    onClose: () => void;
    // Tambahkan properti lain jika diperlukan dari currentModal.props
}

const ExportCSV: FC<ExportCSVProps> = ({ onClose }) => {
    const { closeModal } = useModal();

    const handleExport = () => {
        // Implementasikan logika ekspor CSV di sini.
        // Contoh: panggil API untuk membuat file CSV, lalu lakukan proses download.
        closeModal();
    };

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Export CSV</DialogTitle>
                <DialogDescription>
                    Klik tombol Export untuk mendownload data dalam format CSV.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                    Batal
                </Button>
                <Button onClick={handleExport}>
                    Export
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default ExportCSV;
