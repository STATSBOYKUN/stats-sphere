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
    TreeCriteriaCHAIDType,
    TreeCriteriaGrowthType,
    TreeCriteriaIntervalsType,
    TreeCriteriaProps,
} from "@/models/classify/tree/tree";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export const TreeCriteria = ({
    isCriteriaOpen,
    setIsCriteriaOpen,
    updateFormData,
    data,
}: TreeCriteriaProps) => {
    const [criteriaState, setCriteriaState] = useState<
        TreeCriteriaGrowthType &
            TreeCriteriaCHAIDType &
            TreeCriteriaIntervalsType
    >({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    useEffect(() => {
        if (isCriteriaOpen) {
            setCriteriaState({ ...data });
        }
    }, [isCriteriaOpen, data]);

    const handleChange = (
        field:
            | keyof TreeCriteriaGrowthType
            | keyof TreeCriteriaCHAIDType
            | keyof TreeCriteriaIntervalsType,
        value: boolean | number | string | null
    ) => {
        setCriteriaState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDepthGrp = (value: string) => {
        setCriteriaState((prevState) => ({
            ...prevState,
            Automatic: value === "Automatic",
            Custom: value === "Custom",
        }));
    };

    const handleCSQGrp = (value: string) => {
        setCriteriaState((prevState) => ({
            ...prevState,
            Pearson: value === "Pearson",
            LikeliHood: value === "LikeliHood",
        }));
    };

    const handleContinue = () => {
        Object.entries(criteriaState).forEach(([key, value]) => {
            updateFormData(
                key as keyof (
                    | TreeCriteriaGrowthType
                    | TreeCriteriaCHAIDType
                    | TreeCriteriaIntervalsType
                ),
                value
            );
        });
        setIsCriteriaOpen(false);
    };

    return (
        <>
            {/* Criteria Dialog */}
            <Dialog open={isCriteriaOpen} onOpenChange={setIsCriteriaOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Decision Tree: Criteria</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <Tabs defaultValue="growth" className="sm:min-w-[350px]">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="growth">
                                Growth Limits
                            </TabsTrigger>
                            <TabsTrigger value="chaid">CHAID</TabsTrigger>
                            <TabsTrigger value="intervals">
                                Intervals
                            </TabsTrigger>
                        </TabsList>

                        {/* Criteria Growth Tabs */}
                        <TabsContent value="growth">
                            <ResizablePanelGroup
                                direction="horizontal"
                                className="min-h-[200px] max-w-2xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={50}>
                                    <RadioGroup
                                        value={
                                            criteriaState.Automatic
                                                ? "Automatic"
                                                : "Custom"
                                        }
                                        onValueChange={handleDepthGrp}
                                    >
                                        <div className="flex flex-col gap-2 p-2">
                                            <Label className="font-bold">
                                                Maximum Tree Depth
                                            </Label>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Automatic"
                                                        id="Automatic"
                                                    />
                                                    <Label htmlFor="Automatic">
                                                        Automatic
                                                    </Label>
                                                </div>
                                                <div className="text-sm text-justify pl-6">
                                                    The maximum number of levels
                                                    is 3 for CHAID; 5 for CRT
                                                    and QUEST.
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Custom"
                                                        id="Custom"
                                                    />
                                                    <Label htmlFor="Custom">
                                                        Custom
                                                    </Label>
                                                </div>
                                                <div className="pl-6">
                                                    <Label>Value:</Label>
                                                    <Input
                                                        id="Value"
                                                        type="number"
                                                        className="w-full"
                                                        placeholder=""
                                                        value={
                                                            criteriaState.Value ??
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "Value",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={50}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Minimum Number of Cases
                                        </Label>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center space-x-2">
                                                <Label className="w-[150px]">
                                                    Parent Node:
                                                </Label>
                                                <Input
                                                    id="ParentNode"
                                                    type="number"
                                                    className="w-full"
                                                    placeholder=""
                                                    value={
                                                        criteriaState.ParentNode ??
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "ParentNode",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Label className="w-[150px]">
                                                    Child Node:
                                                </Label>
                                                <Input
                                                    id="ChildNode"
                                                    type="number"
                                                    className="w-full"
                                                    placeholder=""
                                                    value={
                                                        criteriaState.ChildNode ??
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "ChildNode",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </TabsContent>

                        {/* Criteria CHAID Tabs */}
                        <TabsContent value="chaid">
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[275px] max-w-2xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={50}>
                                    <ResizablePanelGroup direction="horizontal">
                                        <ResizablePanel defaultSize={50}>
                                            <div className="flex flex-col gap-2 p-2">
                                                <Label className="font-bold">
                                                    Significance Level For
                                                </Label>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Label className="w-[225px]">
                                                            Splitting Nodes:
                                                        </Label>
                                                        <Input
                                                            id="Split"
                                                            type="number"
                                                            className="w-full"
                                                            placeholder=""
                                                            value={
                                                                criteriaState.Split ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "Split",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Label className="w-[225px]">
                                                            Merging Categories:
                                                        </Label>
                                                        <Input
                                                            id="MergCate"
                                                            type="number"
                                                            className="w-full"
                                                            placeholder=""
                                                            value={
                                                                criteriaState.MergCate ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "MergCate",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </ResizablePanel>
                                        <ResizableHandle />
                                        <ResizablePanel defaultSize={50}>
                                            <RadioGroup
                                                value={
                                                    criteriaState.Pearson
                                                        ? "Pearson"
                                                        : "LikeliHood"
                                                }
                                                onValueChange={handleCSQGrp}
                                            >
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label className="font-bold">
                                                        Chi-Square Statistics
                                                    </Label>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem
                                                            value="Pearson"
                                                            id="Pearson"
                                                        />
                                                        <Label htmlFor="Pearson">
                                                            Pearson
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem
                                                            value="LikeliHood"
                                                            id="LikeliHood"
                                                        />
                                                        <Label htmlFor="LikeliHood">
                                                            Likelihood Ratio
                                                        </Label>
                                                    </div>
                                                </div>
                                            </RadioGroup>
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={50}>
                                    <ResizablePanelGroup direction="horizontal">
                                        <ResizablePanel defaultSize={50}>
                                            <div className="flex flex-col gap-2 p-2">
                                                <Label className="font-bold">
                                                    Model Estimation
                                                </Label>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Label className="w-[250px]">
                                                            Maximum Number of
                                                            Iterations:
                                                        </Label>
                                                        <Input
                                                            id="MaxNoText"
                                                            type="number"
                                                            className="w-full"
                                                            placeholder=""
                                                            value={
                                                                criteriaState.MaxNoText ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "MaxNoText",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Label className="w-[250px]">
                                                            Minimum Change in
                                                            Expected Cell
                                                            Frequencies:
                                                        </Label>
                                                        <Input
                                                            id="MinChange"
                                                            type="number"
                                                            className="w-full"
                                                            placeholder=""
                                                            value={
                                                                criteriaState.MinChange ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "MinChange",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </ResizablePanel>
                                        <ResizableHandle />
                                        <ResizablePanel defaultSize={50}>
                                            <div className="flex flex-col gap-1 p-4">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="AdjustSign"
                                                        checked={
                                                            criteriaState.AdjustSign
                                                        }
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            handleChange(
                                                                "AdjustSign",
                                                                checked
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="AdjustSign"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Adjust Significance
                                                        Values Using Bonferroni
                                                        Method
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="Allow"
                                                        checked={
                                                            criteriaState.Allow
                                                        }
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            handleChange(
                                                                "Allow",
                                                                checked
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="Allow"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Allow Resplitting of
                                                        Merged Categories within
                                                        a Node
                                                    </label>
                                                </div>
                                            </div>
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </TabsContent>

                        {/* Criteria Intervals Tabs */}
                        <TabsContent value="intervals">
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[200px] max-w-2xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={100}>
                                    <RadioGroup>
                                        <div className="flex flex-col gap-2 p-2">
                                            <Label className="font-bold">
                                                Intervals for Scale Independent
                                                Variables
                                            </Label>
                                            <div className="flex flex-row gap-16">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="FixedNo"
                                                        id="FixedNo"
                                                    />
                                                    <Label htmlFor="FixedNo">
                                                        Fixed Number
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Label className="w-[50px]">
                                                        Value:{" "}
                                                    </Label>
                                                    <Input
                                                        id="ValueFixed"
                                                        type="number"
                                                        className="w-[100px]"
                                                        placeholder=""
                                                        value={
                                                            criteriaState.ValueFixed ??
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "ValueFixed",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="CustomInterval"
                                                        id="CustomInterval"
                                                    />
                                                    <Label htmlFor="CustomInterval">
                                                        Custom Interval
                                                    </Label>
                                                </div>
                                                <div className="flex pl-6">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[100px] text-center">
                                                                    Variable
                                                                </TableHead>
                                                                <TableHead>
                                                                    Intervals
                                                                </TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            <TableRow>
                                                                <TableCell className="text-center">
                                                                    Variable 1
                                                                </TableCell>
                                                                <TableCell>
                                                                    10
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </TabsContent>
                    </Tabs>
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
                            onClick={() => setIsCriteriaOpen(false)}
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
