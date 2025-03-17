import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    KNNFeaturesProps,
    KNNFeaturesType,
} from "@/models/classify/nearest-neighbor/nearest-neighbor";
import { CheckedState } from "@radix-ui/react-checkbox";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverArrow } from "@radix-ui/react-popover";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const KNNFeatures = ({
    isFeaturesOpen,
    setIsFeaturesOpen,
    updateFormData,
    data,
}: KNNFeaturesProps) => {
    const [featuresState, setFeaturesState] = useState<KNNFeaturesType>({
        ...data,
    });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);

    useEffect(() => {
        if (isFeaturesOpen) {
            setFeaturesState({ ...data });
            setAvailableVariables(data.ForwardSelection ?? []);
        }
    }, [isFeaturesOpen, data]);

    useEffect(() => {
        const usedVariables = [...(featuresState.ForcedEntryVar || [])].filter(
            Boolean
        );

        if (!(featuresState.ForwardSelection === null)) {
            const updatedVariables = featuresState.ForwardSelection.filter(
                (variable) => !usedVariables.includes(variable)
            );
            setAvailableVariables(updatedVariables);
        }
    }, [featuresState]);

    const handleChange = (
        field: keyof KNNFeaturesType,
        value: CheckedState | number | boolean | string | null
    ) => {
        setFeaturesState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDrop = (target: string, variable: string) => {
        setFeaturesState((prev) => {
            const updatedState = { ...prev };
            if (target === "ForcedEntryVar") {
                updatedState.ForcedEntryVar = [
                    ...(updatedState.ForcedEntryVar || []),
                    variable,
                ];
            }
            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setFeaturesState((prev) => {
            const updatedState = { ...prev };
            if (target === "ForcedEntryVar") {
                updatedState.ForcedEntryVar = (
                    updatedState.ForcedEntryVar || []
                ).filter((item) => item !== variable);
            }
            return updatedState;
        });
    };

    const handleCriterionGrp = (value: string) => {
        setFeaturesState((prevState) => ({
            ...prevState,
            MaxReached: value === "MaxReached",
            BelowMin: value === "BelowMin",
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
                        <DialogTitle>
                            Nearest Neighbor Analysis: Features
                        </DialogTitle>
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
                                            checked={
                                                featuresState.PerformSelection
                                            }
                                            onCheckedChange={(checked) =>
                                                handleChange(
                                                    "PerformSelection",
                                                    checked
                                                )
                                            }
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
                                                        Forward selection is
                                                        used to evaluate
                                                        features for inclusions.
                                                        To force a feature to be
                                                        included in the model,
                                                        enter the feature name
                                                        in the Forced Entry box.
                                                    </p>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <ResizablePanelGroup direction="horizontal">
                                    <ResizablePanel defaultSize={50}>
                                        <div className="flex flex-col gap-2">
                                            <Label className="font-bold">
                                                Forward Selection:
                                            </Label>
                                            <ScrollArea>
                                                <div className="flex flex-col justify-start items-start h-[150px] p-2 border rounded overflow-hidden">
                                                    {availableVariables.map(
                                                        (
                                                            variable: string,
                                                            index: number
                                                        ) => (
                                                            <Badge
                                                                key={index}
                                                                className="w-full text-start text-sm font-light p-2 cursor-pointer"
                                                                variant="outline"
                                                                draggable
                                                                onDragStart={(
                                                                    e
                                                                ) =>
                                                                    e.dataTransfer.setData(
                                                                        "text",
                                                                        variable
                                                                    )
                                                                }
                                                            >
                                                                {variable}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </ResizablePanel>
                                    <ResizableHandle withHandle />
                                    <ResizablePanel defaultSize={50}>
                                        <div
                                            className="flex flex-col w-full gap-2"
                                            onDragOver={(e) =>
                                                e.preventDefault()
                                            }
                                            onDrop={(e) => {
                                                const variable =
                                                    e.dataTransfer.getData(
                                                        "text"
                                                    );
                                                handleDrop(
                                                    "ForcedEntryVar",
                                                    variable
                                                );
                                            }}
                                        >
                                            <Label className="font-bold">
                                                Forced Entry:
                                            </Label>
                                            <div className="w-full h-[150px] p-2 border rounded overflow-hidden">
                                                <ScrollArea>
                                                    <div className="w-full h-[150px]">
                                                        {featuresState.ForcedEntryVar &&
                                                        featuresState
                                                            .ForcedEntryVar
                                                            .length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {featuresState.ForcedEntryVar.map(
                                                                    (
                                                                        variable,
                                                                        index
                                                                    ) => (
                                                                        <Badge
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="text-start text-sm font-light p-2 cursor-pointer"
                                                                            variant="outline"
                                                                            onClick={() =>
                                                                                handleRemoveVariable(
                                                                                    "ForcedEntryVar",
                                                                                    variable
                                                                                )
                                                                            }
                                                                        >
                                                                            {
                                                                                variable
                                                                            }
                                                                        </Badge>
                                                                    )
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm font-light text-gray-500">
                                                                Drop variables
                                                                here.
                                                            </span>
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                            <input
                                                type="hidden"
                                                value={
                                                    featuresState.ForcedEntryVar ??
                                                    ""
                                                }
                                                name="Independents"
                                            />
                                        </div>
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={40}>
                            <RadioGroup
                                value={
                                    featuresState.MaxReached
                                        ? "MaxReached"
                                        : "BelowMin"
                                }
                                disabled={!featuresState.PerformSelection}
                                onValueChange={handleCriterionGrp}
                            >
                                <div className="flex flex-col gap-2 p-2">
                                    <Label className="font-bold">
                                        Stopping Criterion
                                    </Label>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="MaxReached"
                                                id="MaxReached"
                                            />
                                            <Label htmlFor="MaxReached">
                                                Stop when the specified number
                                                of features is reached
                                            </Label>
                                        </div>
                                        <div className="flex flex-col space-x-2 pl-4">
                                            <div className="flex items-center space-x-2 pl-2">
                                                <Label className="w-[150px]">
                                                    Number to Select:
                                                </Label>
                                                <div className="w-[75px]">
                                                    <Input
                                                        id="MaxToSelect"
                                                        type="number"
                                                        placeholder=""
                                                        value={
                                                            featuresState.MaxToSelect ??
                                                            ""
                                                        }
                                                        disabled={
                                                            !featuresState.MaxReached
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "MaxToSelect",
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="BelowMin"
                                                id="BelowMin"
                                            />
                                            <Label htmlFor="BelowMin">
                                                Stop when the change in the
                                                absolute error ratio is less
                                                than or equal to minimum
                                            </Label>
                                        </div>
                                        <div className="flex flex-col space-x-2 pl-4 gap-1">
                                            <div className="flex items-center space-x-2 pl-2">
                                                <Label className="w-[150px]">
                                                    Minimum Change:
                                                </Label>
                                                <div className="w-[75px]">
                                                    <Input
                                                        id="MinChange"
                                                        type="number"
                                                        placeholder=""
                                                        value={
                                                            featuresState.MinChange ??
                                                            ""
                                                        }
                                                        disabled={
                                                            !featuresState.BelowMin
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "MinChange",
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        }
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
                        <Button
                            disabled={isContinueDisabled}
                            type="button"
                            onClick={handleContinue}
                        >
                            Continue
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsFeaturesOpen(false)}
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
};
