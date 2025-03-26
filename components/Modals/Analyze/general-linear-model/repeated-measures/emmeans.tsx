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
    RepeatedMeasuresEMMeansProps,
    RepeatedMeasuresEMMeansType,
} from "@/models/general-linear-model/repeated-measures/repeated-measures";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BUILDTERMMETHOD,
    CIADJUSTMENTMETHOD,
} from "@/constants/general-linear-model/multivariate/multivariate-method";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const RepeatedMeasuresEMMeans = ({
    isEMMeansOpen,
    setIsEMMeansOpen,
    updateFormData,
    data,
}: RepeatedMeasuresEMMeansProps) => {
    const [EMMeansState, setEMMeansState] =
        useState<RepeatedMeasuresEMMeansType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);
    const [hasInteractionTerms, setHasInteractionTerms] = useState(false);

    useEffect(() => {
        if (isEMMeansOpen) {
            setEMMeansState({ ...data });

            // Remove duplicates from SrcList before setting availableVariables
            const uniqueVariables = Array.from(new Set(data.SrcList ?? []));

            // Generate permutations of variables
            const generatePermutations = (variables: string[]) => {
                const result = [...variables];

                // Generate 2-variable combinations
                for (let i = 0; i < variables.length; i++) {
                    for (let j = i + 1; j < variables.length; j++) {
                        result.push(`${variables[i]}*${variables[j]}`);
                    }
                }

                // Generate 3-variable combinations (if applicable)
                if (variables.length >= 3) {
                    for (let i = 0; i < variables.length; i++) {
                        for (let j = i + 1; j < variables.length; j++) {
                            for (let k = j + 1; k < variables.length; k++) {
                                result.push(
                                    `${variables[i]}*${variables[j]}*${variables[k]}`
                                );
                            }
                        }
                    }
                }

                return result;
            };

            // Add (OVERALL) as the first item if it's not already present
            if (!uniqueVariables.includes("(OVERALL)")) {
                setAvailableVariables([
                    "(OVERALL)",
                    ...generatePermutations(uniqueVariables),
                ]);
            } else {
                // Make sure (OVERALL) is at the beginning
                const filteredVars = uniqueVariables.filter(
                    (v) => v !== "(OVERALL)"
                );
                setAvailableVariables([
                    "(OVERALL)",
                    ...generatePermutations(filteredVars),
                ]);
            }
        }
    }, [isEMMeansOpen, data]);

    // Check for interaction terms (containing *) in TargetList
    useEffect(() => {
        const checkForInteractions = () => {
            if (
                !Array.isArray(EMMeansState.TargetList) ||
                EMMeansState.TargetList.length === 0
            ) {
                return false;
            }

            // Check if there's at least one non-OVERALL, non-interaction variable
            const hasNormalVariable = EMMeansState.TargetList.some(
                (variable) =>
                    variable !== "(OVERALL)" && !variable.includes("*")
            );

            // Enable if there's at least one normal variable, otherwise disable
            return !hasNormalVariable;
        };

        setHasInteractionTerms(checkForInteractions());
    }, [EMMeansState.TargetList]);

    const handleChange = (
        field: keyof RepeatedMeasuresEMMeansType,
        value: CheckedState | number | string | null
    ) => {
        setEMMeansState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDrop = (target: string, variable: string) => {
        setEMMeansState((prev) => {
            const updatedState = { ...prev };

            // Add to target array if it doesn't already exist in that array
            if (target === "TargetList") {
                const currentArray = Array.isArray(updatedState.TargetList)
                    ? updatedState.TargetList
                    : updatedState.TargetList
                    ? [updatedState.TargetList]
                    : [];

                if (!currentArray.includes(variable)) {
                    updatedState.TargetList = [...currentArray, variable];
                }
            }

            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setEMMeansState((prev) => {
            const updatedState = { ...prev };

            if (
                target === "TargetList" &&
                Array.isArray(updatedState.TargetList)
            ) {
                updatedState.TargetList = updatedState.TargetList.filter(
                    (item) => item !== variable
                );
            }

            return updatedState;
        });
    };

    const handleContinue = () => {
        Object.entries(EMMeansState).forEach(([key, value]) => {
            updateFormData(key as keyof RepeatedMeasuresEMMeansType, value);
        });
        setIsEMMeansOpen(false);
    };

    return (
        <>
            {/* EM Means Dialog */}
            <Dialog open={isEMMeansOpen} onOpenChange={setIsEMMeansOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Repeated Measures: EM Means</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[250px] max-w-xl rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={100}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">
                                    Estimated Marginal Means
                                </Label>
                                <ResizablePanelGroup direction="horizontal">
                                    <ResizablePanel defaultSize={50}>
                                        <div className="flex flex-col gap-2 p-2">
                                            <Label>
                                                Factor(s) and Factor
                                                Interactions:{" "}
                                            </Label>
                                            <ScrollArea className="h-[175px] w-full p-2 border rounded overflow-hidden">
                                                <div className="flex flex-col gap-1 justify-start items-start">
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
                                        <div className="flex flex-col gap-2 p-2">
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
                                                        "TargetList",
                                                        variable
                                                    );
                                                }}
                                            >
                                                <Label>
                                                    Display Means for:{" "}
                                                </Label>
                                                <div className="w-full h-[75px] p-2 border rounded overflow-hidden">
                                                    <ScrollArea>
                                                        <div className="w-full h-[55px]">
                                                            {Array.isArray(
                                                                EMMeansState.TargetList
                                                            ) &&
                                                            EMMeansState
                                                                .TargetList
                                                                .length > 0 ? (
                                                                <div className="flex flex-col gap-1">
                                                                    {EMMeansState.TargetList.map(
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
                                                                                        "TargetList",
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
                                                                    Drop
                                                                    variables
                                                                    here.
                                                                </span>
                                                            )}
                                                        </div>
                                                    </ScrollArea>
                                                </div>
                                                <input
                                                    type="hidden"
                                                    value={
                                                        EMMeansState.TargetList ??
                                                        ""
                                                    }
                                                    name="TargetList"
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="CompMainEffect"
                                                    checked={
                                                        EMMeansState.CompMainEffect
                                                    }
                                                    disabled={
                                                        hasInteractionTerms
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "CompMainEffect",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="CompMainEffect"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Compare Main Effects
                                                </label>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label>
                                                    Confidence Interval
                                                    Adjustment:
                                                </Label>
                                                <Select
                                                    value={
                                                        EMMeansState.ConfiIntervalMethod ??
                                                        ""
                                                    }
                                                    disabled={
                                                        !EMMeansState.CompMainEffect
                                                    }
                                                    onValueChange={(value) =>
                                                        handleChange(
                                                            "ConfiIntervalMethod",
                                                            value
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {CIADJUSTMENTMETHOD.map(
                                                                (
                                                                    method,
                                                                    index
                                                                ) => (
                                                                    <SelectItem
                                                                        key={
                                                                            index
                                                                        }
                                                                        value={
                                                                            method.value
                                                                        }
                                                                    >
                                                                        {
                                                                            method.name
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            </div>
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
                            onClick={() => setIsEMMeansOpen(false)}
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
