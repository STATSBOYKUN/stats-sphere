import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {KNNFeaturesProps, KNNFeaturesType} from "@/models/classify/nearest-neighbor/nearest-neighbor";
import {CheckedState} from "@radix-ui/react-checkbox";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {PopoverArrow} from "@radix-ui/react-popover";
import {Info} from "lucide-react";

export const KNNFeatures = ({ isFeaturesOpen, setIsFeaturesOpen, updateFormData, data }: KNNFeaturesProps) => {
    const [featuresState, setFeaturesState] = useState<KNNFeaturesType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isFeaturesOpen) {
            setFeaturesState({ ...data });
        }
    }, [isFeaturesOpen, data]);

    const handleChange = (field: keyof KNNFeaturesType, value: CheckedState | number | boolean | string | null) => {
        setFeaturesState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(featuresState).forEach(([key, value]) => {
            updateFormData(key as keyof KNNFeaturesType, value);
        });
        setIsFeaturesOpen(false);
    };

    return (
        <>
            {/* Features Dialog */}
            <Dialog open={isFeaturesOpen} onOpenChange={setIsFeaturesOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Nearest Neighbor Analysis: Features</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[400px] max-w-2xl rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={60}>
                            <div className="flex flex-col gap-2 p-2 w-full">
                                <div className="flex flex-row items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="PerformSelection"
                                            checked={featuresState.PerformSelection}
                                            onCheckedChange={(checked) => handleChange("PerformSelection", checked)}
                                        />
                                        <label
                                            htmlFor="PerformSelection"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Perform Feature Selection
                                        </label>
                                    </div>
                                    <div>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost">
                                                    <Info />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <PopoverArrow />
                                                <div className="p-2">
                                                    <p className="text-sm">
                                                        Forward selection is used to evaluate features for inclusions.
                                                        To force a feature to be included in the model, enter the feature name in the Forced Entry box.
                                                    </p>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <ResizablePanelGroup direction="horizontal">
                                    <ResizablePanel defaultSize={50}>
                                        <div>
                                            <Label className="font-bold">Forward Selection:</Label>
                                            <Input
                                                id="FeaturesToEvaluate"
                                                type="text"
                                                className="min-w-2xl w-full min-h-[150px]"
                                                placeholder=""
                                                value={featuresState.FeaturesToEvaluate ?? ""}
                                                onChange={(e) => handleChange("FeaturesToEvaluate", e.target.value)}
                                            />
                                        </div>
                                    </ResizablePanel>
                                    <ResizableHandle withHandle/>
                                    <ResizablePanel defaultSize={50}>
                                        <div>
                                            <Label className="font-bold">Forced Entry:</Label>
                                            <Input
                                                id="ForcedEntryVar"
                                                type="text"
                                                className="min-w-2xl w-full min-h-[150px]"
                                                placeholder=""
                                                value={featuresState.ForcedEntryVar ?? ""}
                                                onChange={(e) => handleChange("ForcedEntryVar", e.target.value)}
                                            />
                                        </div>
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle withHandle/>
                        <ResizablePanel defaultSize={40}>
                            <RadioGroup

                            >
                                <div className="flex flex-col gap-2 p-2">
                                    <Label className="font-bold">Stopping Criterion</Label>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="MaxReached" id="MaxReached"/>
                                            <Label htmlFor="MaxReached">
                                                Stop when the specified number of features is reached
                                            </Label>
                                        </div>
                                        <div
                                            className="flex flex-col space-x-2 pl-4">
                                        <div className="flex items-center space-x-2 pl-2">
                                                <Label className="w-[150px]">Number to Select:</Label>
                                                <div className="w-[75px]">
                                                    <Input
                                                        id="MaxToSelect"
                                                        type="number"
                                                        placeholder=""
                                                        value={featuresState.MaxToSelect ?? ""}
                                                        onChange={(e) => handleChange("MaxToSelect", Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="BelowMin" id="BelowMin"/>
                                            <Label htmlFor="BelowMin">
                                                Stop when the change in the absolute error ratio is less than or equal to minimum
                                            </Label>
                                        </div>
                                        <div className="flex flex-col space-x-2 pl-4 gap-1">
                                            <div className="flex items-center space-x-2 pl-2">
                                                <Label className="w-[150px]">Minimum Change:</Label>
                                                <div className="w-[75px]">
                                                    <Input
                                                        id="MinChange"
                                                        type="number"
                                                        placeholder=""
                                                        value={featuresState.MinChange ?? ""}
                                                        onChange={(e) => handleChange("MinChange", Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </RadioGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsFeaturesOpen(false)}>
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
