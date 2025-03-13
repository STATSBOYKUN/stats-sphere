import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {HierClusSaveProps, HierClusSaveType} from "@/models/classify/hierarchical-cluster/hierarchical-cluster";
import {CheckedState} from "@radix-ui/react-checkbox";
import {ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Input} from "@/components/ui/input";

export const HierClusSave = ({isSaveOpen, setIsSaveOpen, updateFormData, data}: HierClusSaveProps) => {
    const [saveState, setSaveState] = useState<HierClusSaveType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isSaveOpen) {
            setSaveState({...data});
        }
    }, [isSaveOpen, data]);

    const handleChange = (field: keyof HierClusSaveType, value: CheckedState | boolean | number | string | null) => {
        setSaveState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleMembersGrp = (value: string) => {
        setSaveState((prevState) => ({
            ...prevState,
            NoneSol: value === "NoneSol",
            SingleSol: value === "SingleSol",
            RangeSol: value === "RangeSol",
        }));
    };

    const handleContinue = () => {
        Object.entries(saveState).forEach(([key, value]) => {
            updateFormData(key as keyof HierClusSaveType, value);
        });
        setIsSaveOpen(false);
    };

    return (
        <>
            {/* Save Dialog */}
            <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Hierarchical Cluster Analysis: Save</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[250px] max-w-md rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={100}>
                            <div className="flex flex-col gap-2 w-full p-2">
                                <Label className="font-bold">Cluster Membership</Label>
                                <RadioGroup
                                    value={saveState.NoneSol ? "NoneSol" : saveState.SingleSol ? "SingleSol" : saveState.RangeSol ? "RangeSol" : "NoneSol"}
                                    onValueChange={handleMembersGrp}
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="NoneSol" id="NoneSol"/>
                                            <Label htmlFor="NoneSol">
                                                None
                                            </Label>
                                        </div>
                                        <div className="flex flex-col gap-2 space-x-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="SingleSol" id="SingleSol"/>
                                                <Label htmlFor="SingleSol">
                                                    Single Solution
                                                </Label>
                                            </div>
                                            <div className="flex items-center pl-4 space-x-2">
                                                <label
                                                    htmlFor="NoOfCluster"
                                                    className="w-[200px] text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Number of Cluster:
                                                </label>
                                                <div className="w-[100px]">
                                                    <Input
                                                        id="NoOfCluster"
                                                        type="number"
                                                        placeholder=""
                                                        value={saveState.NoOfCluster ?? ""}
                                                        onChange={(e) => handleChange("NoOfCluster", Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 space-x-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="RangeSol" id="RangeSol"/>
                                                <Label htmlFor="RangeSol">
                                                    Range of Solutions
                                                </Label>
                                            </div>
                                            <div className="flex items-center pl-4 space-x-2">
                                                <label
                                                    htmlFor="MinCluster"
                                                    className="w-[200px] text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Minimum number of Clusters:
                                                </label>
                                                <div className="w-[100px]">
                                                    <Input
                                                        id="MinCluster"
                                                        type="number"
                                                        placeholder=""
                                                        value={saveState.MinCluster ?? ""}
                                                        onChange={(e) => handleChange("MinCluster", Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center pl-4 space-x-2">
                                                <label
                                                    htmlFor="MaxCluster"
                                                    className="w-[200px] text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Maximum number of Clusters:
                                                </label>
                                                <div className="w-[100px]">
                                                    <Input
                                                        id="MaxCluster"
                                                        type="number"
                                                        placeholder=""
                                                        value={saveState.MaxCluster ?? ""}
                                                        onChange={(e) => handleChange("MaxCluster", Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
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
    )
        ;
};
