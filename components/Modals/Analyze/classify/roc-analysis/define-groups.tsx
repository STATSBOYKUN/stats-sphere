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
    RocAnalysisDefineGroupsProps,
    RocAnalysisDefineGroupsType,
} from "@/models/classify/roc-analysis/roc-analysis";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const RocAnalysisDefineGroups = ({
    isDefineGroupsOpen,
    setIsDefineGroupsOpen,
    updateFormData,
    data,
}: RocAnalysisDefineGroupsProps) => {
    const [defineGroupsState, setDefineGroupsState] =
        useState<RocAnalysisDefineGroupsType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    useEffect(() => {
        if (isDefineGroupsOpen) {
            setDefineGroupsState({ ...data });
        }
    }, [isDefineGroupsOpen, data]);

    const handleChange = (
        field: keyof RocAnalysisDefineGroupsType,
        value: number | string | null
    ) => {
        setDefineGroupsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDefineGrp = (value: string) => {
        setDefineGroupsState((prevState) => ({
            ...prevState,
            SpecifiedValues: value === "SpecifiedValues",
            UseMidValue: value === "UseMidValue",
            CutPoint: value === "CutPoint",
        }));
    };

    const handleContinue = () => {
        Object.entries(defineGroupsState).forEach(([key, value]) => {
            updateFormData(key as keyof RocAnalysisDefineGroupsType, value);
        });
        setIsDefineGroupsOpen(false);
    };

    return (
        <>
            {/* Define Groups Dialog */}
            <Dialog
                open={isDefineGroupsOpen}
                onOpenChange={setIsDefineGroupsOpen}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Define Groups</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[250px] max-w-sm rounded-lg border md:min-w-[150px]"
                    >
                        <ResizablePanel defaultSize={100}>
                            <RadioGroup
                                value={
                                    defineGroupsState.SpecifiedValues
                                        ? "SpecifiedValues"
                                        : defineGroupsState.UseMidValue
                                        ? "UseMidValue"
                                        : "CutPoint"
                                }
                                onValueChange={handleDefineGrp}
                            >
                                <div className="flex flex-col gap-2 p-2">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="SpecifiedValues"
                                                id="SpecifiedValues"
                                            />
                                            <Label htmlFor="SpecifiedValues">
                                                Use Specified Values
                                            </Label>
                                        </div>
                                        <div className="flex flex-col pl-4 gap-2">
                                            <div className="flex items-center space-x-2 pl-2">
                                                <Label className="w-[75px]">
                                                    Group 1:
                                                </Label>
                                                <div className="w-[75px]">
                                                    <Input
                                                        id="Group1"
                                                        type="text"
                                                        placeholder=""
                                                        value={
                                                            defineGroupsState.Group1 ??
                                                            ""
                                                        }
                                                        disabled={
                                                            !defineGroupsState.SpecifiedValues
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "Group1",
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 pl-2">
                                                <Label className="w-[75px]">
                                                    Group 2:
                                                </Label>
                                                <div className="w-[75px]">
                                                    <Input
                                                        id="Group2"
                                                        type="text"
                                                        placeholder=""
                                                        value={
                                                            defineGroupsState.Group2 ??
                                                            ""
                                                        }
                                                        disabled={
                                                            !defineGroupsState.SpecifiedValues
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "Group2",
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
                                                value="UseMidValue"
                                                id="UseMidValue"
                                            />
                                            <Label htmlFor="UseMidValue">
                                                Use Midpoint Value
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="CutPoint"
                                                id="CutPoint"
                                            />
                                            <Label htmlFor="CutPoint">
                                                Use Cut Point
                                            </Label>
                                        </div>
                                        <div className="flex flex-col space-x-2 pl-4 gap-1">
                                            <div className="flex items-center space-x-2 pl-2">
                                                <Label className="w-[75px]">
                                                    Cut Point:
                                                </Label>
                                                <div className="w-[75px]">
                                                    <Input
                                                        id="CutPointValue"
                                                        type="number"
                                                        placeholder=""
                                                        value={
                                                            defineGroupsState.CutPointValue ??
                                                            ""
                                                        }
                                                        disabled={
                                                            !defineGroupsState.CutPoint
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "CutPointValue",
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
                            onClick={() => setIsDefineGroupsOpen(false)}
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
