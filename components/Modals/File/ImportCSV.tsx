// components/Modals/File/ImportCSV.tsx
"use client";

import React, { useState, FC } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {ModalType, useModal} from "@/hooks/useModal";

interface ImportCSVProps {
    onClose: () => void;
    // Tambahkan properti lain jika diperlukan dari currentModal.props
}

const ImportCSV: FC<ImportCSVProps> = ({ onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const { closeModal, openModal } = useModal();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] || null;
        setFile(selected);
    };

    const handleSubmit = () => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const content = reader.result as string;
                // closeModal();
                openModal(ModalType.ReadCSVFile, { fileName: file.name, fileContent: content });
            };
            reader.readAsText(file);
        }
    };


    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Import CSV</DialogTitle>
                <DialogDescription>
                    Pilih file CSV untuk diimpor.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="mt-2 w-full border border-gray-300 p-2 rounded"
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                    Batal
                </Button>
                <Button onClick={handleSubmit}>
                    Import
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default ImportCSV;
