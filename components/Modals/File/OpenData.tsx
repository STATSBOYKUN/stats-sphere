
// components/Modals/File/NewFile.tsx

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SavFileReader } from "sav-reader";
import * as SavReader from 'sav-reader';
const SavReader = require('sav-reader');


interface NewFileModalProps {
    onClose: () => void;
    isOpen: boolean;
}

SavReader.isOpen('file.sav').then((isOpen) => {

const OpenData: React.FC<NewFileModalProps> = ({ onClose, isOpen }) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New File</DialogTitle>
                    <DialogDescription>Create a new file in the project.</DialogDescription>
                </DialogHeader>
                <div>
                    {/* Add your form or content here */}
                </div>
                <DialogFooter>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit">Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OpenData;