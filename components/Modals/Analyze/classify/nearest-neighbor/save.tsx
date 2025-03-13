import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {KNNSaveProps, KNNSaveType} from "@/models/classify/nearest-neighbor/nearest-neighbor";
import {CheckedState} from "@radix-ui/react-checkbox";
import {ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";

export const KNNSave = ({isSaveOpen, setIsSaveOpen, updateFormData, data}: KNNSaveProps) => {
    const [saveState, setSaveState] = useState<KNNSaveType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isSaveOpen) {
            setSaveState({...data});
        }
    }, [isSaveOpen, data]);

    const handleChange = (field: keyof KNNSaveType, value: CheckedState | number | boolean | string | null) => {
        setSaveState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(saveState).forEach(([key, value]) => {
            updateFormData(key as keyof KNNSaveType, value);
        });
        setIsSaveOpen(false);
    };

    return (
        <>
            {/* Nearest Neighbor Analysis: Save Dialog */}
            <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Nearest Neighbor Analysis: Save</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[200px] rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={100}>
                            <RadioGroup

                            >
                                <div className="flex flex-col gap-2 p-2">
                                    <Label className="font-bold">Names of Saved Variables</Label>
                                    <div className="flex flex-row gap-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="AutoName" id="AutoName"/>
                                            <Label htmlFor="AutoName">
                                                Automatically generate unique names
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="pl-6">
                                        <p className="text-sm text-justify">
                                            Select this option if you want to add a new set of saved variables to your
                                            dataset each time you run a model.
                                        </p>
                                    </div>
                                    <div className="flex flex-row gap-1">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="CustomName" id="CustomName"/>
                                            <Label htmlFor="CustomName">
                                                Use custom names
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="pl-6">
                                        <p className="text-sm text-justify">
                                            Specify names for the variables. If you select this option, any existing
                                            variables with the same name or root name are replaced each time you run a
                                            model.
                                        </p>
                                    </div>
                                </div>
                            </RadioGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                    <div className="flex flex-col gap-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px] text-center">Save</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Variable Name</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="text-center">
                                        <Checkbox
                                            id="HasTargetVar"
                                            checked={saveState.HasTargetVar}
                                            onCheckedChange={(checked) => handleChange("HasTargetVar", checked)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <label
                                            htmlFor="HasTargetVar"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Predicted Value or Category
                                        </label>
                                    </TableCell>
                                    <TableCell>KNN_PredictedValue</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-center">
                                        <Checkbox
                                            id="IsCateTargetVar"
                                            checked={saveState.IsCateTargetVar}
                                            onCheckedChange={(checked) => handleChange("IsCateTargetVar", checked)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <label
                                            htmlFor="IsCateTargetVar"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Predicted Probability (Category Target)
                                        </label>
                                    </TableCell>
                                    <TableCell>KNN_Probablity</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-center">
                                        <Checkbox
                                            id="RandomAssignToPartition"
                                            checked={saveState.RandomAssignToPartition}
                                            onCheckedChange={(checked) => handleChange("RandomAssignToPartition", checked)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <label
                                            htmlFor="RandomAssignToPartition"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Training/Holdout Partition Variable
                                        </label>
                                    </TableCell>
                                    <TableCell>KNN_Partition</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-center">
                                        <Checkbox
                                            id="RandomAssignToFold"
                                            checked={saveState.RandomAssignToFold}
                                            onCheckedChange={(checked) => handleChange("RandomAssignToFold", checked)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <label
                                            htmlFor="RandomAssignToFold"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Cross-Validation Fold Variable
                                        </label>
                                    </TableCell>
                                    <TableCell>KNN_Fold</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <div className="flex flex-row items-center gap-2">
                            <Label className="w-[275px]"
                                   htmlFor="MaxCatsToSave">
                                Maximum Number of Categories to Save:
                            </Label>
                            <Input
                                id="MaxCatsToSave"
                                type="text"
                                className="w-[75px]"
                                placeholder=""
                                value={saveState.MaxCatsToSave ?? ""}
                                onChange={(e) => handleChange("MaxCatsToSave", e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsSaveOpen(false)}>
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
};
