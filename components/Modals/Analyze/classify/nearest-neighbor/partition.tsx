import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {KNNPartitionProps, KNNPartitionType} from "@/models/classify/nearest-neighbor/nearest-neighbor";
import {CheckedState} from "@radix-ui/react-checkbox";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";

export const KNNPartition = ({isPartitionOpen, setIsPartitionOpen, updateFormData, data}: KNNPartitionProps) => {
    const [partitionState, setPartitionState] = useState<KNNPartitionType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isPartitionOpen) {
            setPartitionState({...data});
        }
    }, [isPartitionOpen, data]);

    const handleChange = (field: keyof KNNPartitionType, value: CheckedState | number | boolean | string | null) => {
        setPartitionState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handlePartitionGrp = (value: string) => {
        setPartitionState((prevState) => ({
            ...prevState,
            UseRandomly: value === "UseRandomly",
            UseVariable: value === "UseVariable",
        }));
    };

    const handleFoldGrp = (value: string) => {
        setPartitionState((prevState) => ({
            ...prevState,
            VFoldUseRandomly: value === "VFoldUseRandomly",
            VFoldUsePartitioningVar: value === "VFoldUsePartitioningVar",
        }));
    };

    const handleContinue = () => {
        Object.entries(partitionState).forEach(([key, value]) => {
            updateFormData(key as keyof KNNPartitionType, value);
        });
        setIsPartitionOpen(false);
    };

    return (
        <>
            {/* Partition Dialog */}
            <Dialog open={isPartitionOpen} onOpenChange={setIsPartitionOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Nearest Neighbor Analysis: Partition</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <ResizablePanelGroup
                        direction="horizontal"
                        className="min-h-[495px] max-w-xl rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={40}>
                            <div className="flex h-full items-center justify-center p-2">
                                <span className="font-semibold">List Variabel</span>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle withHandle/>
                        <ResizablePanel defaultSize={60}>
                            <ResizablePanelGroup direction="vertical">
                                <ResizablePanel defaultSize={42}>
                                    <RadioGroup
                                        value={partitionState.UseRandomly ? "UseRandomly" : "UseVariable"}
                                        onValueChange={handlePartitionGrp}
                                    >
                                        <div className="flex flex-col gap-2 p-2">
                                            <Label className="font-bold">
                                                Training and Holdout Partition
                                            </Label>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="UseRandomly" id="UseRandomly"/>
                                                <Label htmlFor="UseRandomly">
                                                    Randomly assign cases to partition
                                                </Label>
                                            </div>
                                            <div className="flex flex-row gap-1 pl-6">
                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor="TrainingNumber">
                                                        Training %:
                                                    </Label>
                                                    <Input
                                                        id="TrainingNumber"
                                                        type="text"
                                                        className="min-w-2xl w-full"
                                                        placeholder=""
                                                        value={partitionState.TrainingNumber ?? ""}
                                                        onChange={(e) => handleChange("TrainingNumber", e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor="TrainingNumber">
                                                        Holdout %:
                                                    </Label>
                                                    <Input
                                                        id="HoldoutNumber"
                                                        type="text"
                                                        className="min-w-2xl w-full"
                                                        placeholder=""
                                                        value={partitionState.TrainingNumber ?? 0}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor="TotalNumber">
                                                        Total %:
                                                    </Label>
                                                    <Input
                                                        id="TotalNumber"
                                                        type="text"
                                                        className="min-w-2xl w-full"
                                                        placeholder=""
                                                        value={partitionState.TrainingNumber ?? 0}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="UseVariable" id="UseVariable"/>
                                                <Label htmlFor="UseVariable">
                                                    Use variable to assign cases
                                                </Label>
                                            </div>
                                            <div className="flex flex-row gap-1 pl-6">
                                                <div className="flex flex-col gap-2 w-full">
                                                    <Label htmlFor="PartitioningVariable">
                                                        Partition Variable:
                                                    </Label>
                                                    <Input
                                                        id="PartitioningVariable"
                                                        type="text"
                                                        className="min-w-2xl w-full"
                                                        placeholder=""
                                                        value={partitionState.PartitioningVariable ?? ""}
                                                        onChange={(e) => handleChange("PartitioningVariable", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={38}>
                                    <RadioGroup
                                        value={partitionState.VFoldUseRandomly ? "VFoldUseRandomly" : "VFoldUsePartitioningVar"}
                                        onValueChange={handleFoldGrp}
                                    >
                                        <div className="flex flex-col gap-2 p-2">
                                            <Label className="font-bold">
                                                Cross Validation Folds
                                            </Label>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="VFoldUseRandomly" id="VFoldUseRandomly"/>
                                                <Label htmlFor="VFoldUseRandomly">
                                                    Randomly assign cases to folds
                                                </Label>
                                            </div>
                                            <div className="flex flex-row pl-6 gap-2">
                                                <Label htmlFor="TrainingNumber">
                                                    Number of Folds:
                                                </Label>
                                                <Input
                                                    id="NumPartition"
                                                    type="text"
                                                    className="min-w-2xl w-full"
                                                    placeholder=""
                                                    value={partitionState.NumPartition ?? ""}
                                                    onChange={(e) => handleChange("NumPartition", e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="VFoldUsePartitioningVar" id="VFoldUsePartitioningVar"/>
                                                <Label htmlFor="VFoldUsePartitioningVar">
                                                    Use variable to assign cases
                                                </Label>
                                            </div>
                                            <div className="flex flex-col gap-2 pl-6 w-full">
                                                <Label htmlFor="VFoldPartitioningVariable">
                                                    Fold Variable:
                                                </Label>
                                                <Input
                                                    id="VFoldPartitioningVariable"
                                                    type="text"
                                                    className="min-w-2xl w-full"
                                                    placeholder=""
                                                    value={partitionState.VFoldPartitioningVariable ?? ""}
                                                    onChange={(e) => handleChange("VFoldPartitioningVariable", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={20}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Random Number Seed
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="SetSeed"
                                                checked={partitionState.SetSeed}
                                                onCheckedChange={(checked) => handleChange("SetSeed", checked)}
                                            />
                                            <label
                                                htmlFor="SetSeed"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Set Seed for Mersenne Twister
                                            </label>
                                        </div>
                                        <div className="flex flex-row items-center gap-2 pl-6 w-full">
                                            <Label htmlFor="Seed">
                                                Seed:
                                            </Label>
                                            <Input
                                                id="Seed"
                                                type="number"
                                                className="min-w-2xl w-full"
                                                placeholder=""
                                                value={partitionState.Seed ?? ""}
                                                onChange={(e) => handleChange("Seed", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsPartitionOpen(false)}>
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
