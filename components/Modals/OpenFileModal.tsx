// components/Modals/OpenFileModal.tsx

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface OpenFileModalProps {
    onClose: () => void;
}

const OpenFileModal: React.FC<OpenFileModalProps> = ({ onClose }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setSelectedFile(file);
            console.log('Selected file:', file.name);
        }
    };

    const handleOpen = () => {
        if (selectedFile) {
            console.log('Opening file:', selectedFile.name);
        }
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Open File</DialogTitle>
                <DialogDescription>
                    Select a <code>.sav</code> or <code>.spss</code> file to open.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid items-center gap-4">
                    <Label htmlFor="file">File</Label>
                    <Input
                        id="file"
                        type="file"
                        accept=".sav,.spss"
                        onChange={handleFileChange}
                    />
                    {selectedFile && (
                        <p className="mt-2 text-sm text-gray-600">
                            Selected file: {selectedFile.name}
                        </p>
                    )}
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleOpen} disabled={!selectedFile}>
                    Open
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default OpenFileModal;
