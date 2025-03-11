import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {DiscriminantMethodProps, DiscriminantMethodType} from "@/models/classify/discriminant/discriminant";
import {CheckedState} from "@radix-ui/react-checkbox";

export const DiscriminantMethod = ({isMethodOpen, setIsMethodOpen, updateFormData, data}: DiscriminantMethodProps) => {
    const [methodState, setMethodState] = useState<DiscriminantMethodType>({...data});

    useEffect(() => {
        if (isMethodOpen) {
            setMethodState({...data});
        }
    }, [isMethodOpen, data]);

    const handleChange = (field: keyof DiscriminantMethodType, value: CheckedState | number | boolean | null) => {
        setMethodState((prev) => ({...prev, [field]: value}));
    };

    const handleGrpMethod = (value: string) => {
        setMethodState((prev) => ({
            ...prev,
            Wilks: value === "Wilks",
            Unexplained: value === "Unexplained",
            Mahalonobis: value === "Mahalanobis",
            FRatio: value === "FRatio",
            Raos: value === "Raos",
        }));
    };

    const handleCriteria = (value: string) => {
        setMethodState((prev) => ({
            ...prev,
            FValue: value === "FValue",
            FProbability: value === "FProbability",
        }));
    };

    const handleContinue = () => {
        Object.entries(methodState).forEach(([key, value]) => {
            updateFormData(key as keyof DiscriminantMethodType, value);
        });
        setIsMethodOpen(false);
    };

    return (
        <>
            {/* Method Dialog */}
            <Dialog open={isMethodOpen} onOpenChange={setIsMethodOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Discriminant Analysis: Stepwise Method</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[280px] max-w-xl rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={80}>
                            <ResizablePanelGroup direction="horizontal">
                                <ResizablePanel defaultSize={55}>
                                    <div className="flex flex-col h-full gap-2 p-2">
                                        <Label className="font-bold">Method</Label>
                                        <div className="flex flex-col gap-1">
                                            <RadioGroup
                                                defaultValue="Wilks"
                                                value={methodState.Wilks ? "Wilks" : methodState.Unexplained ? "Unexplained" : methodState.Mahalonobis ? "Mahalanobis" : methodState.FRatio ? "FRatio" : methodState.Raos ? "Raos" : "Wilks"}
                                                onValueChange={handleGrpMethod}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Wilks" id="Wilks"/>
                                                    <Label htmlFor="Wilks">Wilks&apos; Lambda</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Unexplained" id="Unexplained"/>
                                                    <Label htmlFor="Unexplained">Unexplained Variance</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Mahalanobis" id="Mahalanobis"/>
                                                    <Label htmlFor="Mahalanobis">Mahalanobis Distance</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="FRatio" id="FRatio"/>
                                                    <Label htmlFor="FRatio">Smallest F Ratio</Label>
                                                </div>
                                                <div className="flex flex-col items-start space-x-2">
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="Raos" id="Raos"/>
                                                        <Label htmlFor="Raos">Rao&apos;s V</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2 pl-4 gap-2">
                                                        <Label>V-to-enter:</Label>
                                                        <div className="w-[100px]">
                                                            <Input
                                                                id="VEnter"
                                                                type="number"
                                                                placeholder=""
                                                                value={methodState.VEnter ?? ""}
                                                                disabled={!methodState.Raos}
                                                                onChange={(e) => handleChange("VEnter", Number(e.target.value))}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={45}>
                                    <div className="flex flex-col h-full gap-2 p-2">
                                        <Label className="font-bold">Criteria</Label>
                                        <div className="flex flex-col gap-1">
                                            <RadioGroup
                                                defaultValue="FValue"
                                                value={methodState.FValue ? "FValue" : methodState.FProbability ? "FProbability" : ""}
                                                onValueChange={handleCriteria}
                                            >
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="FValue" id="FValue"/>
                                                            <Label htmlFor="FValue">Use F Value</Label>
                                                        </div>
                                                        <div
                                                            className="flex flex-row items-center space-x-2 pl-4 gap-4">
                                                            <div className="pl-2">
                                                                <Label>Entry:</Label>
                                                                <div className="w-[75px]">
                                                                    <Input
                                                                        id="FEntry"
                                                                        type="number"
                                                                        placeholder=""
                                                                        value={methodState.FEntry ?? ""}
                                                                        onChange={(e) => handleChange("FEntry", Number(e.target.value))}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Label>Removal:</Label>
                                                                <div className="w-[75px]">
                                                                    <Input
                                                                        type="number"
                                                                        placeholder=""
                                                                        value={methodState.FRemoval ?? ""}
                                                                        onChange={(e) => handleChange("FRemoval", Number(e.target.value))}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="FProbability" id="FProbability"/>
                                                            <Label htmlFor="FProbability">Use Probability of F</Label>
                                                        </div>
                                                        <div
                                                            className="flex flex-row items-center space-x-2 pl-4 gap-4">
                                                            <div className="pl-2">
                                                                <Label>Entry:</Label>
                                                                <div className="w-[75px]">
                                                                    <Input
                                                                        id="PEntry"
                                                                        type="number"
                                                                        placeholder=""
                                                                        value={methodState.PEntry ?? ""}
                                                                        onChange={(e) => handleChange("PEntry", Number(e.target.value))}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Label>Removal:</Label>
                                                                <div className="w-[75px]">
                                                                    <Input
                                                                        type="number"
                                                                        placeholder=""
                                                                        value={methodState.PRemoval ?? ""}
                                                                        onChange={(e) => handleChange("PRemoval", Number(e.target.value))}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                        <ResizableHandle/>
                        <ResizablePanel defaultSize={20}>
                            <div className="flex flex-col h-full gap-2 p-2">
                                <Label className="font-bold">Display</Label>
                                <div className="flex flex-row gap-10">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="Summary"
                                            checked={methodState.Summary}
                                            onCheckedChange={(checked) => handleChange("Summary", checked)}
                                        />
                                        <label
                                            htmlFor="Summary"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Summary of Steps
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="Pairwise"
                                            checked={methodState.Pairwise}
                                            onCheckedChange={(checked) => handleChange("Pairwise", checked)}
                                        />
                                        <label
                                            htmlFor="Pairwise"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            F for Pairwise Distances
                                        </label>
                                    </div>
                                </div>
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
                            onClick={() => setIsMethodOpen(false)}
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