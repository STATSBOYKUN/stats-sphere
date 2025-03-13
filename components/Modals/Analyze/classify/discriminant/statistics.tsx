import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {CheckedState} from "@radix-ui/react-checkbox";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";
import {DiscriminantStatisticsProps, DiscriminantStatisticsType} from "@/models/classify/discriminant/discriminant";

export const DiscriminantStatistics = ({isStatisticsOpen, setIsStatisticsOpen, updateFormData, data}: DiscriminantStatisticsProps) => {
    const [statisticsState, setStatisticsState] = useState<DiscriminantStatisticsType>({ ...data });

    useEffect(() => {
        if (isStatisticsOpen) {
            setStatisticsState({ ...data });
        }
    }, [isStatisticsOpen, data]);

    const handleChange = (field: keyof DiscriminantStatisticsType) => (checked: CheckedState) => {
        setStatisticsState((prev) => ({ ...prev, [field]: checked === true }));
    };

    const handleContinue = () => {
        Object.entries(statisticsState).forEach(([key, value]) => {
            updateFormData(key as keyof DiscriminantStatisticsType, value);
        });
        setIsStatisticsOpen(false);
    };

    return (
        <>
            {/* Statistics Dialog */}
            <Dialog open={isStatisticsOpen} onOpenChange={setIsStatisticsOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Discriminant Analysis: Statistics</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <ResizablePanelGroup
                        direction="horizontal"
                        className="min-h-[200px] max-w-md rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={50}>
                            <ResizablePanelGroup direction="vertical">
                                <ResizablePanel defaultSize={55}>
                                    <div className="flex flex-col h-full gap-2 p-2">
                                        <Label className="font-bold">Descriptives</Label>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="Means"
                                                    checked={statisticsState.Means}
                                                    onCheckedChange={handleChange("Means")}
                                                />
                                                <label
                                                    htmlFor="Means"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Means
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="ANOVA"
                                                    checked={statisticsState.ANOVA}
                                                    onCheckedChange={handleChange("ANOVA")}
                                                />
                                                <label
                                                    htmlFor="ANOVA"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Univariate ANOVAs
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="BoxM"
                                                    checked={statisticsState.BoxM}
                                                    onCheckedChange={handleChange("BoxM")}
                                                />
                                                <label
                                                    htmlFor="BoxM"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Box&apos;s M
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={45}>
                                    <div className="flex flex-col h-full gap-2 p-2">
                                        <Label className="font-bold">Function Coefficients</Label>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="Fisher"
                                                    checked={statisticsState.Fisher}
                                                    onCheckedChange={handleChange("Fisher")}
                                                />
                                                <label
                                                    htmlFor="Fisher"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Fisher&apos;s
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="Unstandardized"
                                                    checked={statisticsState.Unstandardized}
                                                    onCheckedChange={handleChange("Unstandardized")}
                                                />
                                                <label
                                                    htmlFor="Unstandardized"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Unstandardized
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                        <ResizableHandle/>
                        <ResizablePanel defaultSize={50}>
                            <div className="flex flex-col h-full gap-2 p-2">
                                <Label className="font-bold">Matrices</Label>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="WGCorrelation"
                                            checked={statisticsState.WGCorrelation}
                                            onCheckedChange={handleChange("WGCorrelation")}
                                        />
                                        <label
                                            htmlFor="WGCorrelation"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Within-groups Correlation
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="WGCovariance"
                                            checked={statisticsState.WGCovariance}
                                            onCheckedChange={handleChange("WGCovariance")}
                                        />
                                        <label
                                            htmlFor="WGCovariance"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Within-groups Covariance
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="SGCovariance"
                                            checked={statisticsState.SGCovariance}
                                            onCheckedChange={handleChange("SGCovariance")}
                                        />
                                        <label
                                            htmlFor="SGCovariance"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Separate-groups Covariance
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="TotalCovariance"
                                            checked={statisticsState.TotalCovariance}
                                            onCheckedChange={handleChange("TotalCovariance")}
                                        />
                                        <label
                                            htmlFor="TotalCovariance"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Total Covariance
                                        </label>
                                    </div>
                                </div>
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
                            onClick={() => setIsStatisticsOpen(false)}
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