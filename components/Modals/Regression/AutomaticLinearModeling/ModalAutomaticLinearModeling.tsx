// components/Modals/Regression/AutomaticLinearModeling/ModalAutomaticLinearModeling.tsx

import React from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusIcon, PencilIcon } from "lucide-react";
import Fields from "./Fields";
import BuildOptions from "./BuildOptions";
import ModelOptions from "./ModelOptions";

interface ModalAutomaticLinearModelingProps {
    onClose: () => void;
}

const ModalAutomaticLinearModeling: React.FC<ModalAutomaticLinearModelingProps> = ({ onClose }) => {
    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-full max-w-5xl">
                <DialogHeader>
                    <DialogTitle className="text-center">Automatic Linear Modeling</DialogTitle>
                    <DialogDescription className="text-center">
                        Automatic Linear Modeling.
                    </DialogDescription>
                </DialogHeader>

                {/* Tabs */}
                <Tabs defaultValue="fields" className="w-full">
                    <TabsList className="flex justify-center mb-4">
                        <TabsTrigger value="fields">Fields</TabsTrigger>
                        <TabsTrigger value="build-options">Build Options</TabsTrigger>
                        <TabsTrigger value="model-options">Model Options</TabsTrigger>
                    </TabsList>

                    {/* Konten Tabs */}
                    <TabsContent value="fields">
                        <Fields />
                    </TabsContent>

                    <TabsContent value="build-options">
                        <BuildOptions />
                    </TabsContent>

                    <TabsContent value="model-options">
                        <ModelOptions />
                    </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <DialogFooter>
                    <div className="flex justify-center space-x-4 w-full">
                        <Button variant="default">Run</Button>
                        <Button variant="secondary">Paste</Button>
                        <Button variant="destructive">Reset</Button>
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button variant="outline">Help</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ModalAutomaticLinearModeling;
