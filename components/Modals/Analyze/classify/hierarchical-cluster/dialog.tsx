import React, {useEffect, useState} from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Separator} from "@/components/ui/separator";
import {HierClusDialogProps, HierClusMainType} from "@/models/classify/hierarchical-cluster/hierarchical-cluster";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {CheckedState} from "@radix-ui/react-checkbox";
import {Checkbox} from "@/components/ui/checkbox";

export const HierClusDialog = ({
                                       isMainOpen,
                                       setIsMainOpen,
                                       setIsStatisticsOpen,
                                       setIsPlotsOpen,
                                       setIsSaveOpen,
                                       setIsMethodOpen,
                                       updateFormData,
                                       data
                                   }: HierClusDialogProps) => {
    const [mainState, setMainState] = useState<HierClusMainType>({...data});

    useEffect(() => {
        if (isMainOpen) {
            setMainState({...data});
        }
    }, [isMainOpen, data]);

    const handleChange = (field: keyof HierClusMainType, value: CheckedState | boolean | string | null) => {
        setMainState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleClusterGrp = (value: string) => {
        setMainState((prev) => ({
            ...prev,
            ClusterCases: value === "ClusterCases",
            ClusterVar: value === "ClusterVar"
        }));
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof HierClusMainType, value);
        });
        setIsMainOpen(false);
    };

    const openDialog = (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
        setter(true);
    };

    return (
        <>
            {/* Main Dialog */}
            <Dialog open={isMainOpen} onOpenChange={setIsMainOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">Hierarchical Cluster</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Hierarchical Cluster Analysis</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex items-center space-x-2">
                        <ResizablePanelGroup
                            direction="horizontal"
                            className="min-h-[400px] rounded-lg border md:min-w-[200px]"
                        >
                            {/* Variable List */}
                            <ResizablePanel defaultSize={25}>
                                <div className="flex h-full items-center justify-center p-2">
                                    <span className="font-semibold">List Variabel</span>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />

                            {/* Defining Variable */}
                            <ResizablePanel defaultSize={55}>
                                <div className="flex flex-col h-full w-full items-start justify-start gap-6 p-2">
                                    <div>
                                        <Label className="font-bold">Variable(s):</Label>
                                        <Input
                                            id="Variables"
                                            type="text"
                                            className="min-w-2xl w-full min-h-[150px]"
                                            placeholder=""
                                            value={mainState.Variables ?? ""}
                                            onChange={(e) => handleChange("Variables", e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col w-full gap-2">
                                        <div>
                                            <Label className="font-bold">Label Cases by:</Label>
                                            <Textarea placeholder=""/>
                                        </div>
                                        <div>
                                            <Label className="font-bold">Cluster</Label>
                                            <RadioGroup
                                                defaultValue="ClusterCases"
                                                value={mainState.ClusterCases ? "ClusterCases" : mainState.ClusterVar ? "ClusterVar" : "ClusterCases"}
                                                onValueChange={handleClusterGrp}
                                            >
                                                <div className="flex flex-row gap-2">
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="ClusterCases" id="ClusterCases"/>
                                                        <Label htmlFor="ClusterCases">
                                                            Cases
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="ClusterVar" id="ClusterVar"/>
                                                        <Label htmlFor="ClusterVar">Variables</Label>
                                                    </div>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Label className="font-bold">Display</Label>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="DispStats"
                                                    checked={mainState.DispStats}
                                                    onCheckedChange={(checked) => handleChange("DispStats", checked)}
                                                />
                                                <label
                                                    htmlFor="DispStats"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Statistics
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="DispPlots"
                                                    checked={mainState.DispPlots}
                                                    onCheckedChange={(checked) => handleChange("DispPlots", checked)}
                                                />
                                                <label
                                                    htmlFor="DispPlots"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Plots
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ResizablePanel>

                            {/* Tools Area */}
                            <ResizablePanel defaultSize={20}>
                                <div className="flex flex-col h-full items-start justify-start gap-1 p-2">
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsStatisticsOpen)}
                                    >
                                        Statistics...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsPlotsOpen)}
                                    >
                                        Plots...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsMethodOpen)}
                                    >
                                        Method...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsSaveOpen)}
                                    >
                                        Save...
                                    </Button>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            onClick={handleContinue}
                        >
                            OK
                        </Button>
                        <Button type="button" variant="secondary">
                            Reset
                        </Button>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="button" variant="secondary">
                            Help
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
