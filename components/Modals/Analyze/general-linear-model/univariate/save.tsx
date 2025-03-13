import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {UnivariateSaveProps, UnivariateSaveType} from "@/models/general-linear-model/univariate/univariate";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Input} from "@/components/ui/input";
import {CheckedState} from "@radix-ui/react-checkbox";
import {ScrollArea} from "@/components/ui/scroll-area";

export const UnivariateSave = ({ isSaveOpen, setIsSaveOpen, updateFormData, data }: UnivariateSaveProps) => {
    const [saveState, setSaveState] = useState<UnivariateSaveType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isSaveOpen) {
            setSaveState({ ...data });
        }
    }, [isSaveOpen, data]);

    const handleChange = (field: keyof UnivariateSaveType, value: CheckedState | number | string | null) => {
        setSaveState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleTypeGrp = (value: string) => {
        setSaveState((prevState) => ({
            ...prevState,
            StandardStats: value === "StandardStats",
            Heteroscedasticity: value === "Heteroscedasticity",
        }));
    };

    const handleDestGrp = (value: string) => {
        setSaveState((prevState) => ({
            ...prevState,
            NewDataSet: value === "NewDataSet",
            WriteNewDataSet: value === "WriteNewDataSet",
        }));
    };

    const handleContinue = () => {
        Object.entries(saveState).forEach(([key, value]) => {
            updateFormData(key as keyof UnivariateSaveType, value);
        });
        setIsSaveOpen(false);
    };

    return (
        <>
            {/* Save Dialog */}
            <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Univariate: Save</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex h-[450px] flex-col gap-2">
                        <ScrollArea>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[550px] max-w-md rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={40}>
                                    <ResizablePanelGroup direction="horizontal">
                                        <ResizablePanel defaultSize={50}>
                                            <ResizablePanelGroup direction="vertical">
                                                <ResizablePanel defaultSize={60}>
                                                    <div className="flex flex-col gap-2 p-2">
                                                        <Label className="font-bold">Predicted Values</Label>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="ResWeighted"
                                                                checked={saveState.ResWeighted}
                                                                onCheckedChange={(checked) => handleChange("ResWeighted", checked)}
                                                            />
                                                            <label
                                                                htmlFor="ResWeighted"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Unstandardized
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="PreWeighted"
                                                                checked={saveState.PreWeighted}
                                                                onCheckedChange={(checked) => handleChange("PreWeighted", checked)}
                                                            />
                                                            <label
                                                                htmlFor="PreWeighted"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Weighted
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="StdStatistics"
                                                                checked={saveState.StdStatistics}
                                                                onCheckedChange={(checked) => handleChange("StdStatistics", checked)}
                                                            />
                                                            <label
                                                                htmlFor="StdStatistics"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Standard Errors
                                                            </label>
                                                        </div>
                                                    </div>
                                                </ResizablePanel>
                                                <ResizableHandle/>
                                                <ResizablePanel defaultSize={40}>
                                                    <div className="flex flex-col gap-2 p-2">
                                                        <Label className="font-bold">Diagnostics</Label>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="CooksD"
                                                                checked={saveState.CooksD}
                                                                onCheckedChange={(checked) => handleChange("CooksD", checked)}
                                                            />
                                                            <label
                                                                htmlFor="CooksD"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Cook&apos;s Distances
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="Leverage"
                                                                checked={saveState.Leverage}
                                                                onCheckedChange={(checked) => handleChange("Leverage", checked)}
                                                            />
                                                            <label
                                                                htmlFor="Leverage"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Leverage Values
                                                            </label>
                                                        </div>
                                                    </div>
                                                </ResizablePanel>
                                            </ResizablePanelGroup>
                                        </ResizablePanel>
                                        <ResizableHandle/>
                                        <ResizablePanel defaultSize={50}>
                                            <div className="flex flex-col gap-2 p-2">
                                                <Label className="font-bold">Residuals</Label>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="UnstandardizedRes"
                                                        checked={saveState.UnstandardizedRes}
                                                        onCheckedChange={(checked) => handleChange("UnstandardizedRes", checked)}
                                                    />
                                                    <label
                                                        htmlFor="UnstandardizedRes"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Unstandardized
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="WeightedRes"
                                                        checked={saveState.WeightedRes}
                                                        onCheckedChange={(checked) => handleChange("WeightedRes", checked)}
                                                    />
                                                    <label
                                                        htmlFor="WeightedRes"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Weighted
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="StandardizedRes"
                                                        checked={saveState.StandardizedRes}
                                                        onCheckedChange={(checked) => handleChange("StandardizedRes", checked)}
                                                    />
                                                    <label
                                                        htmlFor="StandardizedRes"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Standardized
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="StudentizedRes"
                                                        checked={saveState.StudentizedRes}
                                                        onCheckedChange={(checked) => handleChange("StudentizedRes", checked)}
                                                    />
                                                    <label
                                                        htmlFor="StudentizedRes"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Studentized
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="DeletedRes"
                                                        checked={saveState.DeletedRes}
                                                        onCheckedChange={(checked) => handleChange("DeletedRes", checked)}
                                                    />
                                                    <label
                                                        htmlFor="DeletedRes"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Deleted
                                                    </label>
                                                </div>
                                            </div>
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={60}>
                                    <div className="flex flex-col gap-4 p-2">
                                        <Label className="font-bold">Coefficient Statistics</Label>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="CoeffStats"
                                                checked={saveState.CoeffStats}
                                                onCheckedChange={(checked) => handleChange("CoeffStats", checked)}
                                            />
                                            <label
                                                htmlFor="CoeffStats"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Create Coefficient Statistics
                                            </label>
                                        </div>
                                        <Label className="font-bold">Type</Label>
                                        <RadioGroup
                                            value={saveState.StandardStats ? "StandardStats" : saveState.Heteroscedasticity ? "Heteroscedasticity" : ""}
                                            onValueChange={handleTypeGrp}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="StandardStats" id="StandardStats"/>
                                                    <Label htmlFor="StandardStats">
                                                        Standard Statistics
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Heteroscedasticity"
                                                                    id="Heteroscedasticity"/>
                                                    <Label htmlFor="Heteroscedasticity">
                                                        Heteroscedasticity-consistent Statistics
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                        <Label className="font-bold">Destination</Label>
                                        <RadioGroup
                                            value={saveState.NewDataSet ? "NewDataSet" : saveState.WriteNewDataSet ? "WriteNewDataSet" : ""}
                                            onValueChange={handleDestGrp}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="NewDataSet" id="NewDataSet"/>
                                                    <Label htmlFor="NewDataSet">
                                                        Create a New Dataset
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 pl-6">
                                                    <Label className="w-[150px]">Dataset Name:</Label>
                                                    <div className="w-[150px]">
                                                        <Input
                                                            id="DatasetName"
                                                            type="text"
                                                            placeholder=""
                                                            value={saveState.DatasetName || ""}
                                                            onChange={(e) => handleChange("DatasetName", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="WriteNewDataSet"
                                                                    id="WriteNewDataSet"/>
                                                    <Label htmlFor="WriteNewDataSet">
                                                        Write New Dataset File
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 pl-6">
                                                    <Input
                                                        id="FilePath"
                                                        type="file"
                                                        placeholder=""
                                                        onChange={(e) => handleChange("FilePath", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ScrollArea>
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
