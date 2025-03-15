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
    RepeatedMeasuresPlotsProps,
    RepeatedMeasuresPlotsType,
} from "@/models/general-linear-model/repeated-measures/repeated-measures";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";

export const RepeatedMeasuresPlots = ({
    isPlotsOpen,
    setIsPlotsOpen,
    updateFormData,
    data,
}: RepeatedMeasuresPlotsProps) => {
    const [plotsState, setPlotsState] = useState<RepeatedMeasuresPlotsType>({
        ...data,
    });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    useEffect(() => {
        if (isPlotsOpen) {
            setPlotsState({ ...data });
        }
    }, [isPlotsOpen, data]);

    const handleChange = (
        field: keyof RepeatedMeasuresPlotsType,
        value: CheckedState | number | string | null
    ) => {
        setPlotsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleChartGrp = (value: string) => {
        setPlotsState((prevState) => ({
            ...prevState,
            LineChartType: value === "LineChartType",
            BarChartType: value === "BarChartType",
        }));
    };

    const handleErrorBarsGrp = (value: string) => {
        setPlotsState((prevState) => ({
            ...prevState,
            ConfidenceInterval: value === "ConfidenceInterval",
            StandardError: value === "StandardError",
        }));
    };

    const handleContinue = () => {
        Object.entries(plotsState).forEach(([key, value]) => {
            updateFormData(key as keyof RepeatedMeasuresPlotsType, value);
        });
        setIsPlotsOpen(false);
    };

    return (
        <>
            {/* Plots Dialog */}
            <Dialog open={isPlotsOpen} onOpenChange={setIsPlotsOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Repeated Measures: Plots</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="h-[450px] flex flex-col gap-2">
                        <ScrollArea>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[600px] max-w-lg rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={40}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <ResizablePanelGroup direction="horizontal">
                                            <ResizablePanel defaultSize={50}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label>Factors: </Label>
                                                    <Input
                                                        id="SrcList"
                                                        type="text"
                                                        className="w-full min-h-[175px]"
                                                        placeholder=""
                                                        value={
                                                            plotsState.SrcList ??
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "SrcList",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle withHandle />
                                            <ResizablePanel defaultSize={50}>
                                                <div className="flex flex-col gap-4 p-2">
                                                    <div className="flex flex-col gap-2">
                                                        <Label>
                                                            Horizontal Axis:{" "}
                                                        </Label>
                                                        <Input
                                                            id="AxisList"
                                                            type="text"
                                                            className="w-full"
                                                            placeholder=""
                                                            value={
                                                                plotsState.AxisList ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "AxisList",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label>
                                                            Separated Lines:{" "}
                                                        </Label>
                                                        <Input
                                                            id="LineList"
                                                            type="text"
                                                            className="w-full"
                                                            placeholder=""
                                                            value={
                                                                plotsState.LineList ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "LineList",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label>
                                                            Separate Plots:{" "}
                                                        </Label>
                                                        <Input
                                                            id="PlotList"
                                                            type="text"
                                                            className="w-full"
                                                            placeholder=""
                                                            value={
                                                                plotsState.PlotList ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "PlotList",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={25}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label>Plots: </Label>
                                        <Input
                                            id="FixFactorVars"
                                            type="text"
                                            className="w-full min-h-[100px]"
                                            placeholder=""
                                            value={
                                                plotsState.FixFactorVars ?? ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "FixFactorVars",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={15}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Chart Type
                                        </Label>
                                        <RadioGroup
                                            value={
                                                plotsState.LineChartType
                                                    ? "LineChartType"
                                                    : "BarChartType"
                                            }
                                            onValueChange={handleChartGrp}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="LineChartType"
                                                    id="LineChartType"
                                                />
                                                <Label htmlFor="LineChartType">
                                                    Line Chart
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem
                                                    value="BarChartType"
                                                    id="BarChartType"
                                                />
                                                <Label htmlFor="BarChartType">
                                                    Bar Chart
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={20}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Error Bars
                                        </Label>
                                        <RadioGroup
                                            value={
                                                plotsState.ConfidenceInterval
                                                    ? "ConfidenceInterval"
                                                    : "StandardError"
                                            }
                                            onValueChange={handleErrorBarsGrp}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="IncludeErrorBars"
                                                    checked={
                                                        plotsState.IncludeErrorBars
                                                    }
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "IncludeErrorBars",
                                                            checked
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor="IncludeErrorBars"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Include Error Bars
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2 pl-6">
                                                <RadioGroupItem
                                                    value="ConfidenceInterval"
                                                    id="ConfidenceInterval"
                                                />
                                                <Label htmlFor="ConfidenceInterval">
                                                    Confidence Interval (95.0%)
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2 pl-6">
                                                <RadioGroupItem
                                                    value="StandardError"
                                                    id="StandardError"
                                                />
                                                <Label htmlFor="StandardError">
                                                    Standard Error
                                                </Label>
                                                <div className="flex items-center space-x-2 pl-6">
                                                    <Label className="w-[75px]">
                                                        Multiplier:
                                                    </Label>
                                                    <div className="w-[75px]">
                                                        <Input
                                                            id="Multiplier"
                                                            type="number"
                                                            placeholder=""
                                                            value={
                                                                plotsState.Multiplier ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "Multiplier",
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
                                        </RadioGroup>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ScrollArea>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="IncludeRefLineForGrandMean"
                                checked={plotsState.IncludeRefLineForGrandMean}
                                onCheckedChange={(checked) =>
                                    handleChange(
                                        "IncludeRefLineForGrandMean",
                                        checked
                                    )
                                }
                            />
                            <label
                                htmlFor="IncludeRefLineForGrandMean"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Include Reference Line for Grand Mean
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="YAxisStart0"
                                checked={plotsState.YAxisStart0}
                                onCheckedChange={(checked) =>
                                    handleChange("YAxisStart0", checked)
                                }
                            />
                            <label
                                htmlFor="YAxisStart0"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Y Axis Start at 0
                            </label>
                        </div>
                    </div>
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
                            onClick={() => setIsPlotsOpen(false)}
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
