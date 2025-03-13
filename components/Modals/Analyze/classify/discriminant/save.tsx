import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {DiscriminantSaveProps, DiscriminantSaveType} from "@/models/classify/discriminant/discriminant";
import {CheckedState} from "@radix-ui/react-checkbox";

export const DiscriminantSave = ({isSaveOpen, setIsSaveOpen, updateFormData, data}: DiscriminantSaveProps) => {
    const [saveState, setSaveState] = useState<DiscriminantSaveType>({...data});
    const [xmlPreview, setXmlPreview] = useState<string>("");

    useEffect(() => {
        if (isSaveOpen) {
            setSaveState({...data});
        }
    }, [isSaveOpen, data]);

    const handleChanges = (field: keyof DiscriminantSaveType, value: CheckedState | boolean | string | null) => {
        setSaveState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleXMLFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            setXmlPreview(result);
            setSaveState((prevState) => ({
                ...prevState,
                XmlFile: result,
            }));
        };
        reader.onerror = () => {
            console.error("Failed to read file");
            setXmlPreview("Error loading file content.");
        };
        reader.readAsText(file);
    };

    const handleContinue = () => {
        Object.entries(saveState).forEach(([field, value]) => {
            updateFormData(field as keyof DiscriminantSaveType, value);
        });
        setIsSaveOpen(false);
    };

    return (
        <>
            {/* Save Dialog */}
            <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Discriminant Analysis: Save</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="Predicted"
                            checked={saveState.Predicted}
                            onCheckedChange={(checked) => handleChanges("Predicted", checked)}
                        />
                        <label
                            htmlFor="Predicted"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Predicted Group Membership
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="Discriminant"
                            checked={saveState.Discriminant}
                            onCheckedChange={(checked) => handleChanges("Discriminant", checked)}
                        />
                        <label
                            htmlFor="Discriminant"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Discriminant Scores
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="Probabilities"
                            checked={saveState.Probabilities}
                            onCheckedChange={(checked) => handleChanges("Probabilities", checked)}
                        />
                        <label
                            htmlFor="Probabilities"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Probabilities of Group Membership
                        </label>
                    </div>
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[200px] max-w-xl rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={40}>
                            <div className="flex flex-col h-full gap-2 p-2">
                                <Label className="font-bold">Export Model Information to XML File</Label>
                                <Input
                                    id="XmlFile"
                                    type="file"
                                    accept=".xml"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleXMLFile(file);
                                        }
                                    }}
                                />
                            </div>
                        </ResizablePanel>
                        <ResizableHandle withHandle/>
                        <ResizablePanel defaultSize={60}>
                            <div className="flex flex-col h-full gap-2 p-2">
                                <Label className="font-bold">Preview</Label>
                                <Textarea
                                    placeholder="Preview will appear here..."
                                    value={xmlPreview}
                                    readOnly
                                />
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            onClick={handleContinue}
                        >
                            Continue
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsSaveOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="button" variant="secondary">
                            Help
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}