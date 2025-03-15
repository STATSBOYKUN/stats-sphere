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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BUILDTERMMETHOD } from "@/constants/general-linear-model/multivariate/multivariate-method";
import { CheckedState } from "@radix-ui/react-checkbox";

export const RepeatedMeasuresEMMeans = ({
    isEMMeansOpen,
    setIsEMMeansOpen,
    updateFormData,
    data,
}: RepeatedMeasuresEMMeansProps) => {
    const [EMMeansState, setEMMeansState] =
        useState<RepeatedMeasuresEMMeansType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    useEffect(() => {
        if (isEMMeansOpen) {
            setEMMeansState({ ...data });
        }
    }, [isEMMeansOpen, data]);

    const handleChange = (
        field: keyof RepeatedMeasuresEMMeansType,
        value: CheckedState | number | string | null
    ) => {
        setEMMeansState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
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
                                            <Input
                                                id="SrcList"
                                                type="text"
                                                className="w-full min-h-[175px]"
                                                placeholder=""
                                                value={
                                                    EMMeansState.SrcList ?? ""
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
                                        <div className="flex flex-col gap-2 p-2">
                                            <div className="flex flex-col gap-2">
                                                <Label>
                                                    Display Means for:{" "}
                                                </Label>
                                                <Input
                                                    id="TargetList"
                                                    type="text"
                                                    className="w-full min-h-[75px]"
                                                    placeholder=""
                                                    value={
                                                        EMMeansState.TargetList ??
                                                        ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "TargetList",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="CompMainEffect"
                                                    checked={
                                                        EMMeansState.CompMainEffect
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
                                                            {BUILDTERMMETHOD.map(
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
