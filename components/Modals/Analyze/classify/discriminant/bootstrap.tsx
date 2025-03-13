import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {DiscriminantBootstrapProps, DiscriminantBootstrapType} from "@/models/classify/discriminant/discriminant";
import {CheckedState} from "@radix-ui/react-checkbox";

export const DiscriminantBootstrap = ({isBootstrapOpen, setIsBootstrapOpen, updateFormData, data}: DiscriminantBootstrapProps) => {
    const [bootstrapState, setBootstrapState] = useState<DiscriminantBootstrapType>({...data});

    useEffect(() => {
        if (isBootstrapOpen) {
            setBootstrapState({...data});
        }
    }, [isBootstrapOpen, data]);

    const handleChange = (field: keyof DiscriminantBootstrapType, value: CheckedState | string | number | boolean | null) => {
        setBootstrapState(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    const handleCIGrp = (value: string) => {
        setBootstrapState(prev => ({
            ...prev,
            Percentile: value === "Percentile",
            BCa: value === "BCa"
        }));
    };

    const handleSamplingGrp = (value: string) => {
        setBootstrapState(prev => ({
            ...prev,
            Simple: value === "Simple",
            Stratified: value === "Stratified"
        }));
    }

    const handleContinue = () => {
        Object.entries(bootstrapState).forEach(([field, value]) => {
            updateFormData(field as keyof DiscriminantBootstrapType, value);
        });
    };

    return (
        <>
            {/* Bootstrap Dialog */}
            <Dialog open={isBootstrapOpen} onOpenChange={setIsBootstrapOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Bootstrap</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="PerformBootStrapping"
                                checked={bootstrapState.PerformBootStrapping}
                                onCheckedChange={(checked) => handleChange("PerformBootStrapping", checked)}
                            />
                            <label
                                htmlFor="PerformBootStrapping"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Perform Bootstrapping
                            </label>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center space-x-2 pl-6 gap-2">
                                <Label>Number of Samples:</Label>
                                <div className="w-[100px]">
                                    <Input
                                        type="number"
                                        id="NumOfSamples"
                                        placeholder=""
                                        value={bootstrapState.NumOfSamples ?? ""}
                                        onChange={(e) => handleChange("NumOfSamples", Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 pl-6">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="Seed"
                                        checked={bootstrapState.Seed}
                                        onCheckedChange={(checked) => handleChange("Seed", checked)}
                                    />
                                    <label
                                        htmlFor="Seed"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Set Seed for Mersenne Twister
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2 pl-6 gap-2">
                                    <Label>Seed:</Label>
                                    <div className="w-[200px]">
                                        <Input
                                            id="SeedValue"
                                            type="number"
                                            placeholder=""
                                            value={bootstrapState.SeedValue ?? ""}
                                            onChange={(e) => handleChange("SeedValue", Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[330px] max-w-lg rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={30}>
                            <div className="flex flex-col h-full gap-2 p-2">
                                <Label className="font-bold">Confidence Intervals</Label>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center space-x-2">
                                        <Label className="w-[100px]">Level (%):</Label>
                                        <div className="w-[100px]">
                                            <Input
                                                id="Level"
                                                type="number"
                                                placeholder=""
                                                value={bootstrapState.Level ?? ""}
                                                onChange={(e) => handleChange("Level", Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <RadioGroup
                                        defaultValue="Percentile"
                                        value={bootstrapState.Percentile ? "Percentile" : "BCa"}
                                        onValueChange={handleCIGrp}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Percentile" id="Percentile"/>
                                            <Label htmlFor="Percentile">Percentile</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="BCa" id="BCa"/>
                                            <Label htmlFor="BCa">Bias Corrected Accelerated (BCa)</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle/>
                        <ResizablePanel defaultSize={55}>
                            <div className="flex flex-col h-full gap-2 p-2">
                                <Label className="font-bold">Sampling</Label>
                                <RadioGroup
                                    defaultValue="Simple"
                                    value={bootstrapState.Simple ? "Simple" : "Stratified"}
                                    onValueChange={handleSamplingGrp}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Simple" id="Simple"/>
                                        <Label htmlFor="Simple">Simple</Label>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Stratified" id="Stratified"/>
                                            <Label htmlFor="Stratified">Stratified</Label>
                                        </div>
                                        <ResizablePanelGroup direction="horizontal">
                                            <ResizablePanel defaultSize={50}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label>Variables:</Label>
                                                    <Input
                                                        id="Variables"
                                                        type="text"
                                                        className="w-full min-h-[100px]"
                                                        placeholder=""
                                                        value={bootstrapState.Variables ?? ""}
                                                        onChange={(e) => handleChange("Variables", e.target.value)}
                                                    />
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle withHandle/>
                                            <ResizablePanel defaultSize={50}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label>Strata Variables:</Label>
                                                    <Input
                                                        id="StrataVariables"
                                                        type="text"
                                                        className="w-full min-h-[100px]"
                                                        placeholder=""
                                                        value={bootstrapState.StrataVariables ?? ""}
                                                        onChange={(e) => handleChange("StrataVariables", e.target.value)}
                                                    />
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </div>
                                </RadioGroup>
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
                            onClick={() => setIsBootstrapOpen(false)}
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