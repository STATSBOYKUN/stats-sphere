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
    MultivariatePlotsProps,
    MultivariatePlotsType,
} from "@/models/general-linear-model/multivariate/multivariate";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Input } from "@/components/ui/input";

export const MultivariatePlots = ({
    isPlotsOpen,
    setIsPlotsOpen,
    updateFormData,
    data,
}: MultivariatePlotsProps) => {
    const [plotsState, setPlotsState] = useState<MultivariatePlotsType>({
        ...data,
    });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);

    // Add state for selected variables and plots
    const [selectedVariable, setSelectedVariable] = useState<string | null>(
        null
    );
    const [selectedPlot, setSelectedPlot] = useState<string | null>(null);
    const [plotsList, setPlotsList] = useState<string[]>([]);

    useEffect(() => {
        if (isPlotsOpen) {
            setPlotsState({ ...data });

            setAvailableVariables(data.SrcList ?? []);
            setPlotsList(data.FixFactorVars ?? []);
        }
    }, [isPlotsOpen, data]);

    const handleChange = (
        field: keyof MultivariatePlotsType,
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

    // Handle variable selection in Factors list
    const handleVariableClick = (variable: string) => {
        setSelectedVariable(variable);
    };

    // Handle plot selection in Plots list
    const handlePlotClick = (plot: string) => {
        setSelectedPlot(plot);

        // Parse the selected plot to update fields
        const parts = plot.split("*");
        if (parts.length >= 3) {
            setPlotsState((prev) => ({
                ...prev,
                AxisList: parts[0],
                LineList: parts[1],
                PlotList: parts[2],
            }));
        }
    };

    // Handle dropping variable to target fields
    const handleDrop = (target: string, variable: string) => {
        setPlotsState((prev) => ({
            ...prev,
            [target]: variable,
        }));
    };

    const handleRemoveVariable = (target: keyof MultivariatePlotsType) => {
        setPlotsState((prev) => ({
            ...prev,
            [target]: null,
        }));
    };

    // Check if the Add button should be disabled based on requirements
    const isAddButtonDisabled = () => {
        const { AxisList, LineList, PlotList } = plotsState;

        // Case 1: If only Horizontal Axis is filled - can add
        if (AxisList && !LineList && !PlotList) {
            return false;
        }

        // Case 2: If only Separate Lines or only Separate Plots - cannot add
        if ((!AxisList && LineList) || (!AxisList && PlotList)) {
            return true;
        }

        // Case 3: If only Horizontal Axis and Separate Plots - cannot add
        if (AxisList && !LineList && PlotList) {
            return true;
        }

        // Case 4: If Horizontal Axis and Separate Lines - can add
        if (AxisList && LineList) {
            return false;
        }

        // Default: Cannot add if Horizontal Axis is not filled
        return true;
    };

    // Add button handler
    const handleAddPlot = () => {
        const { AxisList, LineList, PlotList } = plotsState;

        if (!AxisList) return; // Horizontal Axis is required

        let newPlot;

        // Case 1: Only Horizontal Axis
        if (AxisList && !LineList && !PlotList) {
            newPlot = AxisList;
        }
        // Case 4: Horizontal Axis and Separate Lines
        else if (AxisList && LineList && !PlotList) {
            newPlot = `${AxisList}*${LineList}`;
        }
        // Full case: All three are filled
        else if (AxisList && LineList && PlotList) {
            newPlot = `${AxisList}*${LineList}*${PlotList}`;
        } else {
            // Other combinations are not valid
            return;
        }

        if (!plotsList.includes(newPlot)) {
            const updatedPlots = [...plotsList, newPlot];
            setPlotsList(updatedPlots);

            // Update form data
            setPlotsState((prev) => ({
                ...prev,
                FixFactorVars: updatedPlots,
            }));
        }
    };

    // Change button handler
    const handleChangePlot = () => {
        if (!selectedPlot) return;

        const { AxisList, LineList, PlotList } = plotsState;

        if (!AxisList || !LineList || !PlotList) return;

        const newPlot = `${AxisList}*${LineList}*${PlotList}`;

        const updatedPlots = plotsList.map((plot) =>
            plot === selectedPlot ? newPlot : plot
        );

        setPlotsList(updatedPlots);
        setSelectedPlot(newPlot);

        // Update form data
        setPlotsState((prev) => ({
            ...prev,
            FixFactorVars: updatedPlots,
        }));
    };

    // Remove button handler
    const handleRemovePlot = () => {
        if (!selectedPlot) return;

        const updatedPlots = plotsList.filter((plot) => plot !== selectedPlot);
        setPlotsList(updatedPlots);
        setSelectedPlot(null);

        // Update form data
        setPlotsState((prev) => ({
            ...prev,
            FixFactorVars: updatedPlots,
        }));
    };

    const handleContinue = () => {
        // Update FixFactorVars with plotsList
        const updatedState = {
            ...plotsState,
            FixFactorVars: plotsList,
        };

        Object.entries(updatedState).forEach(([key, value]) => {
            updateFormData(key as keyof MultivariatePlotsType, value);
        });
        setIsPlotsOpen(false);
    };

    return (
        <>
            {/* Plots Dialog */}
            <Dialog open={isPlotsOpen} onOpenChange={setIsPlotsOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Multivariate: Profile Plots</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="h-[450px] flex flex-col gap-2">
                        <ScrollArea>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[725px] max-w-lg rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={40}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <ResizablePanelGroup direction="horizontal">
                                            <ResizablePanel defaultSize={50}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label>Factors: </Label>
                                                    <ScrollArea className="h-[200px] border rounded">
                                                        <div className="flex flex-col gap-1 p-2">
                                                            {availableVariables.map(
                                                                (
                                                                    variable,
                                                                    index
                                                                ) => (
                                                                    <Badge
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="w-full text-start text-sm font-light p-2 cursor-pointer"
                                                                        variant={
                                                                            selectedVariable ===
                                                                            variable
                                                                                ? "default"
                                                                                : "outline"
                                                                        }
                                                                        onClick={() =>
                                                                            handleVariableClick(
                                                                                variable
                                                                            )
                                                                        }
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
                                                                        {
                                                                            variable
                                                                        }
                                                                    </Badge>
                                                                )
                                                            )}
                                                        </div>
                                                    </ScrollArea>
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle withHandle />
                                            <ResizablePanel defaultSize={50}>
                                                <div className="flex flex-col gap-4 p-2">
                                                    <div
                                                        className="flex flex-col gap-2"
                                                        onDragOver={(e) =>
                                                            e.preventDefault()
                                                        }
                                                        onDrop={(e) => {
                                                            const variable =
                                                                e.dataTransfer.getData(
                                                                    "text"
                                                                );
                                                            handleDrop(
                                                                "AxisList",
                                                                variable
                                                            );
                                                        }}
                                                    >
                                                        <Label>
                                                            Horizontal Axis:{" "}
                                                        </Label>
                                                        <div className="w-full border rounded p-2 min-h-10">
                                                            {plotsState.AxisList ? (
                                                                <Badge
                                                                    className="text-start text-sm font-light p-2 cursor-pointer"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        handleRemoveVariable(
                                                                            "AxisList"
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        plotsState.AxisList
                                                                    }
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-sm font-light text-gray-500">
                                                                    Drop
                                                                    variable
                                                                    here.
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="flex flex-col gap-2"
                                                        onDragOver={(e) =>
                                                            e.preventDefault()
                                                        }
                                                        onDrop={(e) => {
                                                            const variable =
                                                                e.dataTransfer.getData(
                                                                    "text"
                                                                );
                                                            handleDrop(
                                                                "LineList",
                                                                variable
                                                            );
                                                        }}
                                                    >
                                                        <Label>
                                                            Separate Lines:{" "}
                                                        </Label>
                                                        <div className="w-full border rounded p-2 min-h-10">
                                                            {plotsState.LineList ? (
                                                                <Badge
                                                                    className="text-start text-sm font-light p-2 cursor-pointer"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        handleRemoveVariable(
                                                                            "LineList"
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        plotsState.LineList
                                                                    }
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-sm font-light text-gray-500">
                                                                    Drop
                                                                    variable
                                                                    here.
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="flex flex-col gap-2"
                                                        onDragOver={(e) =>
                                                            e.preventDefault()
                                                        }
                                                        onDrop={(e) => {
                                                            const variable =
                                                                e.dataTransfer.getData(
                                                                    "text"
                                                                );
                                                            handleDrop(
                                                                "PlotList",
                                                                variable
                                                            );
                                                        }}
                                                    >
                                                        <Label>
                                                            Separate Plots:{" "}
                                                        </Label>
                                                        <div className="w-full border rounded p-2 min-h-10">
                                                            {plotsState.PlotList ? (
                                                                <Badge
                                                                    className="text-start text-sm font-light p-2 cursor-pointer"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        handleRemoveVariable(
                                                                            "PlotList"
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        plotsState.PlotList
                                                                    }
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-sm font-light text-gray-500">
                                                                    Drop
                                                                    variable
                                                                    here.
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={25}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <div className="flex justify-between items-center">
                                            <Label>Plots: </Label>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={handleAddPlot}
                                                    disabled={isAddButtonDisabled()}
                                                >
                                                    Add
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={handleChangePlot}
                                                    disabled={!selectedPlot}
                                                >
                                                    Change
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={handleRemovePlot}
                                                    disabled={!selectedPlot}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                        <ScrollArea className="h-[100px] border rounded">
                                            <div className="flex flex-col gap-1 p-2">
                                                {plotsList.map(
                                                    (plot, index) => (
                                                        <Badge
                                                            key={index}
                                                            className="w-full text-start text-sm font-light p-2 cursor-pointer"
                                                            variant={
                                                                selectedPlot ===
                                                                plot
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                            onClick={() =>
                                                                handlePlotClick(
                                                                    plot
                                                                )
                                                            }
                                                        >
                                                            {plot}
                                                        </Badge>
                                                    )
                                                )}
                                            </div>
                                        </ScrollArea>
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
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="IncludeErrorBars"
                                                checked={
                                                    plotsState.IncludeErrorBars
                                                }
                                                onCheckedChange={(checked) =>
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
                                        <RadioGroup
                                            value={
                                                plotsState.ConfidenceInterval
                                                    ? "ConfidenceInterval"
                                                    : "StandardError"
                                            }
                                            disabled={
                                                !plotsState.IncludeErrorBars
                                            }
                                            onValueChange={handleErrorBarsGrp}
                                        >
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
                                            </div>
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
                                                        disabled={
                                                            !plotsState.StandardError
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
