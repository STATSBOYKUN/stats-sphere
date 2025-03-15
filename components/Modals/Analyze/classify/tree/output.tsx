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
    TreeOutputProps,
    TreeOutputRulesType,
    TreeOutputStatsType,
    TreeOutputTreeType,
} from "@/models/classify/tree/tree";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ROWSNODE, SORTINGMETHOD } from "@/constants/classify/tree/tree-method";

export const TreeOutput = ({
    isOutputOpen,
    setIsOutputOpen,
    updateFormData,
    data,
}: TreeOutputProps) => {
    const [outputState, setOutputState] = useState<
        TreeOutputTreeType & TreeOutputStatsType & TreeOutputRulesType
    >({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    useEffect(() => {
        if (isOutputOpen) {
            setOutputState({ ...data });
        }
    }, [isOutputOpen, data]);

    const handleChange = (
        field:
            | keyof TreeOutputTreeType
            | keyof TreeOutputStatsType
            | keyof TreeOutputRulesType,
        value: CheckedState | boolean | number | string | null
    ) => {
        setOutputState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleOrienGrp = (value: string) => {
        setOutputState((prevState) => ({
            ...prevState,
            TopDown: value === "TopDown",
            L2R: value === "L2R",
            R2L: value === "R2L",
        }));
    };

    const handleNodeGrp = (value: string) => {
        setOutputState((prevState) => ({
            ...prevState,
            Table: value === "Table",
            Chart: value === "Chart",
            TableAndChart: value === "TableAndChart",
        }));
    };

    const handleScaleGrp = (value: string) => {
        setOutputState((prevState) => ({
            ...prevState,
            Automatic: value === "Automatic",
            Custom: value === "Custom",
        }));
    };

    const handleSyntaxGrp = (value: string) => {
        setOutputState((prevState) => ({
            ...prevState,
            Spss: value === "Spss",
            Sql: value === "Sql",
            SimpleText: value === "SimpleText",
        }));
    };

    const handleTypeGrp = (value: string) => {
        setOutputState((prevState) => ({
            ...prevState,
            ValToCases: value === "ValToCases",
            SelectCases: value === "SelectCases",
        }));
    };

    const handleNodesGrp = (value: string) => {
        setOutputState((prevState) => ({
            ...prevState,
            TerminalNodes: value === "TerminalNodes",
            BestTerminal: value === "BestTerminal",
            BestTerminalPercent: value === "BestTerminalPercent",
            BestTerminalMinIndex: value === "BestTerminalMinIndex",
            AllNodes: value === "AllNodes",
        }));
    };

    const handleContinue = () => {
        Object.entries(outputState).forEach(([key, value]) => {
            updateFormData(
                key as keyof (
                    | TreeOutputTreeType
                    | TreeOutputStatsType
                    | TreeOutputRulesType
                ),
                value
            );
        });
        setIsOutputOpen(false);
    };

    return (
        <>
            {/* Output Dialog */}
            <Dialog open={isOutputOpen} onOpenChange={setIsOutputOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Decision Tree: Output</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <Tabs defaultValue="tree" className="sm:min-w-[350px]">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="tree">Tree</TabsTrigger>
                            <TabsTrigger value="statistics">
                                Statistics
                            </TabsTrigger>
                            <TabsTrigger value="rules">Rules</TabsTrigger>
                        </TabsList>

                        {/* Output Tree Tabs */}
                        <TabsContent value="tree">
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="TreeOutput"
                                            checked={outputState.TreeOutput}
                                            onCheckedChange={(checked) =>
                                                handleChange(
                                                    "TreeOutput",
                                                    checked
                                                )
                                            }
                                        />
                                        <label
                                            htmlFor="TreeOutput"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Tree
                                        </label>
                                    </div>
                                    <div className="flex pl-4">
                                        <ResizablePanelGroup
                                            direction="vertical"
                                            className="min-h-[315px] rounded-lg border md:min-w-[150px]"
                                        >
                                            <ResizablePanel defaultSize={100}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label className="font-bold">
                                                        Display
                                                    </Label>
                                                    <RadioGroup
                                                        value={
                                                            outputState.TopDown
                                                                ? "TopDown"
                                                                : outputState.L2R
                                                                ? "L2R"
                                                                : "R2L"
                                                        }
                                                        onValueChange={
                                                            handleOrienGrp
                                                        }
                                                    >
                                                        <div className="grid w-full items-start grid-cols-2">
                                                            <Label>
                                                                Orientation:{" "}
                                                            </Label>
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem
                                                                        value="TopDown"
                                                                        id="TopDown"
                                                                    />
                                                                    <Label htmlFor="TopDown">
                                                                        Top Down
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem
                                                                        value="L2R"
                                                                        id="L2R"
                                                                    />
                                                                    <Label htmlFor="L2R">
                                                                        Left To
                                                                        Right
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem
                                                                        value="R2L"
                                                                        id="R2L"
                                                                    />
                                                                    <Label htmlFor="R2L">
                                                                        Right to
                                                                        Left
                                                                    </Label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </RadioGroup>
                                                    <RadioGroup
                                                        value={
                                                            outputState.Table
                                                                ? "Table"
                                                                : outputState.Chart
                                                                ? "Chart"
                                                                : "TableAndChart"
                                                        }
                                                        onValueChange={
                                                            handleNodeGrp
                                                        }
                                                    >
                                                        <div className="grid w-full items-start grid-cols-2">
                                                            <Label>
                                                                Node Contents:{" "}
                                                            </Label>
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem
                                                                        value="Table"
                                                                        id="Table"
                                                                    />
                                                                    <Label htmlFor="Table">
                                                                        Table
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem
                                                                        value="Chart"
                                                                        id="Chart"
                                                                    />
                                                                    <Label htmlFor="Chart">
                                                                        Chart
                                                                    </Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem
                                                                        value="TableAndChart"
                                                                        id="TableAndChart"
                                                                    />
                                                                    <Label htmlFor="TableAndChart">
                                                                        Table
                                                                        and
                                                                        Chart
                                                                    </Label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </RadioGroup>
                                                    <RadioGroup
                                                        value={
                                                            outputState.Automatic
                                                                ? "Automatic"
                                                                : "Custom"
                                                        }
                                                        onValueChange={
                                                            handleScaleGrp
                                                        }
                                                    >
                                                        <div className="grid w-full items-start grid-cols-2">
                                                            <Label>
                                                                Scale:{" "}
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
                                                                    <div className="flex items-center space-x-2 pl-6">
                                                                        <Label className="w-[75px]">
                                                                            Percent:
                                                                        </Label>
                                                                        <div className="w-[75px]">
                                                                            <Input
                                                                                id="Percent"
                                                                                type="number"
                                                                                placeholder=""
                                                                                value={
                                                                                    outputState.Percent ??
                                                                                    0
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    handleChange(
                                                                                        "Percent",
                                                                                        Number(
                                                                                            e
                                                                                                .target
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
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="IndVarStats"
                                                            checked={
                                                                outputState.IndVarStats
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                handleChange(
                                                                    "IndVarStats",
                                                                    checked
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor="IndVarStats"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Independent Variable
                                                            Statistics
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="NodeDef"
                                                            checked={
                                                                outputState.NodeDef
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                handleChange(
                                                                    "NodeDef",
                                                                    checked
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor="NodeDef"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Node Definitions
                                                        </label>
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="TreeInTableFormat"
                                            checked={
                                                outputState.TreeInTableFormat
                                            }
                                            onCheckedChange={(checked) =>
                                                handleChange(
                                                    "TreeInTableFormat",
                                                    checked
                                                )
                                            }
                                        />
                                        <label
                                            htmlFor="TreeInTableFormat"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Tree in Table Format
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Output Statistics Tab */}
                        <TabsContent value="statistics">
                            <ResizablePanelGroup
                                direction="horizontal"
                                className="min-h-[250px] max-w-2xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={50}>
                                    <ResizablePanelGroup direction="vertical">
                                        <ResizablePanel defaultSize={65}>
                                            <div className="flex flex-col gap-1 p-2">
                                                <Label className="font-bold">
                                                    Model
                                                </Label>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="Summary"
                                                        checked={
                                                            outputState.Summary
                                                        }
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            handleChange(
                                                                "Summary",
                                                                checked
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="Summary"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Summary
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="Risk"
                                                        checked={
                                                            outputState.Risk
                                                        }
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            handleChange(
                                                                "Risk",
                                                                checked
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="Risk"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Risk
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="ClassTable"
                                                        checked={
                                                            outputState.ClassTable
                                                        }
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            handleChange(
                                                                "ClassTable",
                                                                checked
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="ClassTable"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Classification Table
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="CPSP"
                                                        checked={
                                                            outputState.CPSP
                                                        }
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            handleChange(
                                                                "CPSP",
                                                                checked
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="CPSP"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Cost, Prior Probability,
                                                        Score, and Profit Values
                                                    </label>
                                                </div>
                                            </div>
                                        </ResizablePanel>
                                        <ResizableHandle />
                                        <ResizablePanel defaultSize={35}>
                                            <div className="flex flex-col gap-1 p-2">
                                                <Label className="font-bold">
                                                    Independent Variables
                                                </Label>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="ImpToModel"
                                                        checked={
                                                            outputState.ImpToModel
                                                        }
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            handleChange(
                                                                "ImpToModel",
                                                                checked
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="ImpToModel"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Importance to Model
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="Surrogates"
                                                        checked={
                                                            outputState.Surrogates
                                                        }
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            handleChange(
                                                                "Surrogates",
                                                                checked
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="Surrogates"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Surrogates by Splitting
                                                    </label>
                                                </div>
                                            </div>
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={50}>
                                    <ResizablePanelGroup direction="vertical">
                                        <ResizablePanel defaultSize={35}>
                                            <div className="flex flex-col gap-1 p-2">
                                                <Label className="font-bold">
                                                    Node Performance
                                                </Label>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="SummaryNP"
                                                        checked={
                                                            outputState.SummaryNP
                                                        }
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            handleChange(
                                                                "SummaryNP",
                                                                checked
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="SummaryNP"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Summary of Node
                                                        Predictions
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="TargetCategory"
                                                        checked={
                                                            outputState.TargetCategory
                                                        }
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            handleChange(
                                                                "TargetCategory",
                                                                checked
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="TargetCategory"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        By Target Category
                                                    </label>
                                                </div>
                                            </div>
                                        </ResizablePanel>
                                        <ResizableHandle />
                                        <ResizablePanel defaultSize={65}>
                                            <div className="flex flex-col gap-1 p-2">
                                                <div className="flex items-center space-x-2">
                                                    <Label className="w-[200px]">
                                                        Rows:
                                                    </Label>
                                                    <Select
                                                        value={
                                                            outputState.RowsMethod ??
                                                            ""
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            handleChange(
                                                                "RowsMethod",
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {ROWSNODE.map(
                                                                    (
                                                                        method,
                                                                        index
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                index
                                                                            }
                                                                            value={
                                                                                method
                                                                            }
                                                                        >
                                                                            {capitalize(
                                                                                method
                                                                            ) +
                                                                                "'s Method"}
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Label className="w-[200px]">
                                                        Sort Order:
                                                    </Label>
                                                    <Select
                                                        value={
                                                            outputState.SortOrderMethod ??
                                                            ""
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            handleChange(
                                                                "SortOrderMethod",
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {SORTINGMETHOD.map(
                                                                    (
                                                                        method,
                                                                        index
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                index
                                                                            }
                                                                            value={
                                                                                method
                                                                            }
                                                                        >
                                                                            {capitalize(
                                                                                method
                                                                            )}
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Label className="w-[200px]">
                                                        Percentile Increment:
                                                    </Label>
                                                    <div className="w-[75px]">
                                                        <Input
                                                            id="PercentIncMethod"
                                                            type="number"
                                                            placeholder=""
                                                            value={
                                                                outputState.PercentIncMethod ??
                                                                0
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "PercentIncMethod",
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="Display"
                                                        checked={
                                                            outputState.Display
                                                        }
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            handleChange(
                                                                "Display",
                                                                checked
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="Display"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Display Cumulative
                                                        Statistics
                                                    </label>
                                                </div>
                                            </div>
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </TabsContent>

                        {/* Output Rules Tab */}
                        <TabsContent value="rules">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="GenRules"
                                        checked={outputState.GenRules}
                                        onCheckedChange={(checked) =>
                                            handleChange("GenRules", checked)
                                        }
                                    />
                                    <label
                                        htmlFor="GenRules"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Generate Classification Rules
                                    </label>
                                </div>
                                <ResizablePanelGroup
                                    direction="horizontal"
                                    className="min-h-[300px] max-w-2xl rounded-lg border md:min-w-[200px]"
                                >
                                    <ResizablePanel defaultSize={50}>
                                        <ResizablePanelGroup direction="vertical">
                                            <ResizablePanel defaultSize={50}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label className="font-bold">
                                                        Syntax
                                                    </Label>
                                                    <RadioGroup
                                                        value={
                                                            outputState.Spss
                                                                ? "Spss"
                                                                : outputState.Sql
                                                                ? "Sql"
                                                                : "SimpleText"
                                                        }
                                                        onValueChange={
                                                            handleSyntaxGrp
                                                        }
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem
                                                                value="Spss"
                                                                id="Spss"
                                                            />
                                                            <Label htmlFor="Spss">
                                                                SPSS Statistics
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem
                                                                value="Sql"
                                                                id="Sql"
                                                            />
                                                            <Label htmlFor="Sql">
                                                                SQL
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem
                                                                value="SimpleText"
                                                                id="SimpleText"
                                                            />
                                                            <Label htmlFor="SimpleText">
                                                                Simple Text
                                                            </Label>
                                                        </div>
                                                    </RadioGroup>
                                                    <div className="flex items-center space-x-2 pl-6">
                                                        <Checkbox
                                                            id="ValLbl"
                                                            checked={
                                                                outputState.ValLbl
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                handleChange(
                                                                    "ValLbl",
                                                                    checked
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor="ValLbl"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Use Variable and
                                                            Value Labels
                                                        </label>
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle />
                                            <ResizablePanel defaultSize={50}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label className="font-bold">
                                                        Type
                                                    </Label>
                                                    <RadioGroup
                                                        value={
                                                            outputState.ValToCases
                                                                ? "ValToCases"
                                                                : "SelectCases"
                                                        }
                                                        onValueChange={
                                                            handleTypeGrp
                                                        }
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem
                                                                value="ValToCases"
                                                                id="ValToCases"
                                                            />
                                                            <Label htmlFor="ValToCases">
                                                                Assign Values to
                                                                Cases
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem
                                                                value="SelectCases"
                                                                id="SelectCases"
                                                            />
                                                            <Label htmlFor="SelectCases">
                                                                Select Cases
                                                            </Label>
                                                        </div>
                                                    </RadioGroup>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="IncSurrogates"
                                                            checked={
                                                                outputState.IncSurrogates
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                handleChange(
                                                                    "IncSurrogates",
                                                                    checked
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor="IncSurrogates"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Include Surrogates
                                                            in Rules
                                                        </label>
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </ResizablePanel>
                                    <ResizableHandle />
                                    <ResizablePanel defaultSize={50}>
                                        <div className="flex flex-col gap-2 p-2">
                                            <Label className="font-bold">
                                                Nodes
                                            </Label>
                                            <RadioGroup
                                                value={
                                                    outputState.TerminalNodes
                                                        ? "TerminalNodes"
                                                        : outputState.BestTerminal
                                                        ? "BestTerminal"
                                                        : outputState.BestTerminalPercent
                                                        ? "BestTerminalPercent"
                                                        : outputState.BestTerminalMinIndex
                                                        ? "BestTerminalMinIndex"
                                                        : "AllNodes"
                                                }
                                                onValueChange={handleNodesGrp}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="TerminalNodes"
                                                        id="TerminalNodes"
                                                    />
                                                    <Label htmlFor="TerminalNodes">
                                                        All Terminal Nodes
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="BestTerminal"
                                                        id="BestTerminal"
                                                    />
                                                    <Label htmlFor="BestTerminal">
                                                        Best Terminal Node
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 pl-6">
                                                    <Label className="w-[150px]">
                                                        Number of Nodes:
                                                    </Label>
                                                    <div className="w-[75px]">
                                                        <Input
                                                            id="NumberOfNodes"
                                                            type="number"
                                                            placeholder=""
                                                            value={
                                                                outputState.NumberOfNodes ??
                                                                0
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "NumberOfNodes",
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="BestTerminalPercent"
                                                        id="BestTerminalPercent"
                                                    />
                                                    <Label htmlFor="BestTerminalPercent">
                                                        Best Teriminal Node by
                                                        Specific Percentage of
                                                        Cases
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 pl-6">
                                                    <Label className="w-[150px]">
                                                        Percentage:
                                                    </Label>
                                                    <div className="w-[75px]">
                                                        <Input
                                                            id="TermPercent"
                                                            type="number"
                                                            placeholder=""
                                                            value={
                                                                outputState.TermPercent ??
                                                                0
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "TermPercent",
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="BestTerminalMinIndex"
                                                        id="BestTerminalMinIndex"
                                                    />
                                                    <Label htmlFor="BestTerminalMinIndex">
                                                        Terminal Nodes whose
                                                        Index Value Meets or
                                                        Exceeds a Cut-off Value
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 pl-6">
                                                    <Label className="w-[150px]">
                                                        Maximum Index Value:
                                                    </Label>
                                                    <div className="w-[75px]">
                                                        <Input
                                                            id="MinIndex"
                                                            type="number"
                                                            placeholder=""
                                                            value={
                                                                outputState.MinIndex ??
                                                                0
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "MinIndex",
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="AllNodes"
                                                        id="AllNodes"
                                                    />
                                                    <Label htmlFor="AllNodes">
                                                        All Nodes
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="ExportRules"
                                        checked={outputState.ExportRules}
                                        onCheckedChange={(checked) =>
                                            handleChange("ExportRules", checked)
                                        }
                                    />
                                    <label
                                        htmlFor="ExportRules"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Export Rules to File
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2 pl-6">
                                    <Label className="w-[75px]">File:</Label>
                                    <div>
                                        <Input
                                            id="FileEdit"
                                            type="file"
                                            placeholder=""
                                            onChange={(e) =>
                                                handleChange(
                                                    "FileEdit",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                    <DialogFooter className="sm:justify-start">
                        <Button type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsOutputOpen(false)}
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
