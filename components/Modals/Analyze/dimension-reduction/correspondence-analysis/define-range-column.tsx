import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    CorrespondenceDefineRangeColumnProps,
    CorrespondenceDefineRangeColumnType,
} from "@/models/dimension-reduction/correspondence-analysis/correspondence-analysis";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export const CorrespondenceDefineRangeColumn = ({
    isDefineRangeColumnOpen,
    setIsDefineRangeColumnOpen,
    updateFormData,
    data,
}: CorrespondenceDefineRangeColumnProps) => {
    const [defineRangeColumnState, setDefineRangeColumnState] =
        useState<CorrespondenceDefineRangeColumnType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);
    const [selectedConstraintIndex, setSelectedConstraintIndex] = useState<
        number | null
    >(null);

    useEffect(() => {
        if (isDefineRangeColumnOpen) {
            setDefineRangeColumnState({ ...data });
            setSelectedConstraintIndex(null);
        }
    }, [isDefineRangeColumnOpen, data]);

    const handleChange = (
        field: keyof CorrespondenceDefineRangeColumnType,
        value: number | string | string[] | null
    ) => {
        setDefineRangeColumnState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleCategoryGrp = (value: string) => {
        setDefineRangeColumnState((prevState) => ({
            ...prevState,
            None: value === "None",
            CategoryEqual: value === "CategoryEqual",
            CategorySupplemental: value === "CategorySupplemental",
        }));
    };

    const handleUpdateClick = () => {
        const min = defineRangeColumnState.MinValue ?? 0;
        const max = defineRangeColumnState.MaxValue ?? 0;

        if (min <= max) {
            // Create a map of existing values and their qualifiers
            const existingConstraints = new Map<string, string>();

            if (defineRangeColumnState.ConstraintsList) {
                defineRangeColumnState.ConstraintsList.forEach((constraint) => {
                    const parts = constraint.split(" ");
                    const baseValue = parts[0];
                    const qualifier =
                        parts.length > 1 ? parts.slice(1).join(" ") : "";
                    existingConstraints.set(baseValue, qualifier);
                });
            }

            // Generate new constraints list preserving existing qualifiers
            const updatedConstraints: string[] = [];

            for (let i = min; i <= max; i++) {
                const baseValue = i.toString();
                const qualifier = existingConstraints.get(baseValue) || "";
                updatedConstraints.push(
                    qualifier ? `${baseValue} ${qualifier}` : baseValue
                );
            }

            handleChange("ConstraintsList", updatedConstraints);
        }
    };

    const handleChangeListClick = () => {
        if (
            selectedConstraintIndex !== null &&
            defineRangeColumnState.ConstraintsList &&
            selectedConstraintIndex <
                defineRangeColumnState.ConstraintsList.length
        ) {
            const constraints = [
                ...(defineRangeColumnState.ConstraintsList || []),
            ];
            const constraint = constraints[selectedConstraintIndex];

            // Get the base value without any category markup
            const parts = constraint.split(" ");
            const baseValue = parts[0];

            let newValue = baseValue;
            if (defineRangeColumnState.CategoryEqual) {
                newValue = `${baseValue} Equal`;
            } else if (defineRangeColumnState.CategorySupplemental) {
                newValue = `${baseValue} Supplemental`;
            }

            constraints[selectedConstraintIndex] = newValue;
            handleChange("ConstraintsList", constraints);
        }
    };

    const handleConstraintClick = (index: number) => {
        setSelectedConstraintIndex(index);
    };

    const handleContinue = () => {
        Object.entries(defineRangeColumnState).forEach(([key, value]) => {
            updateFormData(
                key as keyof CorrespondenceDefineRangeColumnType,
                value
            );
        });
        setIsDefineRangeColumnOpen(false);
    };

    return (
        <>
            <Dialog
                open={isDefineRangeColumnOpen}
                onOpenChange={setIsDefineRangeColumnOpen}
            >
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            Correspondence Analysis: Define Range Column
                        </DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[400px] max-w-xl rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={45}>
                            <div className="flex flex-col gap-2 p-2">
                                <div className="flex items-center space-x-2">
                                    <Label className="font-bold">
                                        Category Range for Column Variable:{" "}
                                    </Label>
                                    <div>
                                        <span className="text-sm">
                                            {defineRangeColumnState.DefaultListModel ??
                                                "???"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Label className="w-[150px]">
                                        Minimum Value:
                                    </Label>
                                    <div className="w-[75px]">
                                        <Input
                                            id="MinValue"
                                            type="number"
                                            placeholder=""
                                            value={
                                                defineRangeColumnState.MinValue ??
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "MinValue",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Label className="w-[150px]">
                                        Maximum Value:
                                    </Label>
                                    <div className="w-[75px]">
                                        <Input
                                            id="MaxValue"
                                            type="number"
                                            placeholder=""
                                            value={
                                                defineRangeColumnState.MaxValue ??
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "MaxValue",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                    <Button
                                        type="button"
                                        onClick={handleUpdateClick}
                                        disabled={
                                            defineRangeColumnState.MinValue ===
                                                null ||
                                            defineRangeColumnState.MaxValue ===
                                                null
                                        }
                                    >
                                        Update
                                    </Button>
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={55}>
                            <div className="flex flex-col gap-2 p-2">
                                <ResizablePanelGroup direction="horizontal">
                                    <ResizablePanel defaultSize={50}>
                                        <div className="w-full p-2">
                                            <Label>
                                                Category Constraints:{" "}
                                            </Label>
                                            <ScrollArea className="h-[150px] w-full border rounded mt-1">
                                                <div className="flex flex-col gap-1 p-2">
                                                    {(
                                                        defineRangeColumnState.ConstraintsList ||
                                                        []
                                                    ).map(
                                                        (constraint, index) => (
                                                            <Badge
                                                                key={index}
                                                                className="w-full text-start text-sm font-light p-2 cursor-pointer"
                                                                variant={
                                                                    selectedConstraintIndex ===
                                                                    index
                                                                        ? "default"
                                                                        : "outline"
                                                                }
                                                                onClick={() =>
                                                                    handleConstraintClick(
                                                                        index
                                                                    )
                                                                }
                                                            >
                                                                {constraint}
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
                                            <RadioGroup
                                                value={
                                                    defineRangeColumnState.None
                                                        ? "None"
                                                        : defineRangeColumnState.CategoryEqual
                                                        ? "CategoryEqual"
                                                        : "CategorySupplemental"
                                                }
                                                onValueChange={
                                                    handleCategoryGrp
                                                }
                                            >
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem
                                                            value="None"
                                                            id="None"
                                                        />
                                                        <Label htmlFor="None">
                                                            None
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem
                                                            value="CategoryEqual"
                                                            id="CategoryEqual"
                                                        />
                                                        <Label htmlFor="CategoryEqual">
                                                            Category must be
                                                            Equal
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem
                                                            value="CategorySupplemental"
                                                            id="CategorySupplemental"
                                                        />
                                                        <Label htmlFor="CategorySupplemental">
                                                            Category is
                                                            Supplemental
                                                        </Label>
                                                    </div>
                                                </div>
                                            </RadioGroup>
                                            <div className="flex justify-end mt-2">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={
                                                        handleChangeListClick
                                                    }
                                                    disabled={
                                                        selectedConstraintIndex ===
                                                        null
                                                    }
                                                >
                                                    Change List
                                                </Button>
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
