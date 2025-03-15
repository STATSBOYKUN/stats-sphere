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
    CorrespondencePlotsProps,
    CorrespondencePlotsType,
} from "@/models/dimension-reduction/correspondence-analysis/correspondence-analysis";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const CorrespondencePlots = ({
    isPlotsOpen,
    setIsPlotsOpen,
    updateFormData,
    data,
}: CorrespondencePlotsProps) => {
    const [plotsState, setPlotsState] = useState<CorrespondencePlotsType>({
        ...data,
    });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    useEffect(() => {
        if (isPlotsOpen) {
            setPlotsState({ ...data });
        }
    }, [isPlotsOpen, data]);

    const handleChange = (
        field: keyof CorrespondencePlotsType,
        value: CheckedState | number | string | null
    ) => {
        setPlotsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(plotsState).forEach(([key, value]) => {
            updateFormData(key as keyof CorrespondencePlotsType, value);
        });
        setIsPlotsOpen(false);
    };

    return (
        <>
            {/* Plots Dialog */}
            <Dialog open={isPlotsOpen} onOpenChange={setIsPlotsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Correspondence Analysis: Plots
                        </DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[450px] max-w-md rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={33}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">Scatteplots</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="Biplot"
                                        checked={plotsState.Biplot}
                                        onCheckedChange={(checked) =>
                                            handleChange("Biplot", checked)
                                        }
                                    />
                                    <label
                                        htmlFor="Biplot"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Biplot
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="RowPts"
                                        checked={plotsState.RowPts}
                                        onCheckedChange={(checked) =>
                                            handleChange("RowPts", checked)
                                        }
                                    />
                                    <label
                                        htmlFor="RowPts"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Row Points
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="ColPts"
                                        checked={plotsState.ColPts}
                                        onCheckedChange={(checked) =>
                                            handleChange("ColPts", checked)
                                        }
                                    />
                                    <label
                                        htmlFor="ColPts"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Column Points
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2 pl-6">
                                    <Label className="w-[200px]">
                                        ID Label Width for Scatterplots:
                                    </Label>
                                    <div className="w-[75px]">
                                        <Input
                                            id="IdScatter"
                                            type="number"
                                            placeholder=""
                                            value={plotsState.IdScatter ?? 0}
                                            onChange={(e) =>
                                                handleChange(
                                                    "IdScatter",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={29}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">Line Plots</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="TransRow"
                                        checked={plotsState.TransRow}
                                        onCheckedChange={(checked) =>
                                            handleChange("TransRow", checked)
                                        }
                                    />
                                    <label
                                        htmlFor="TransRow"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Transformed Row Categories
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="TransCol"
                                        checked={plotsState.TransCol}
                                        onCheckedChange={(checked) =>
                                            handleChange("TransCol", checked)
                                        }
                                    />
                                    <label
                                        htmlFor="TransCol"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Transformed Column Categories
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2 pl-6">
                                    <Label className="w-[200px]">
                                        ID Label Width for Lineplots:
                                    </Label>
                                    <div className="w-[75px]">
                                        <Input
                                            id="IdLine"
                                            type="number"
                                            placeholder=""
                                            value={plotsState.IdLine ?? 0}
                                            onChange={(e) =>
                                                handleChange(
                                                    "IdLine",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={38}>
                            <RadioGroup>
                                <div className="flex flex-col gap-2 p-2">
                                    <Label className="font-bold">
                                        Plot Dimension
                                    </Label>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="DisplayAll"
                                            id="DisplayAll"
                                        />
                                        <Label htmlFor="DisplayAll">
                                            Display all dimensions in the
                                            solutions
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="RestrictDim"
                                            id="RestrictDim"
                                        />
                                        <Label htmlFor="RestrictDim">
                                            Restrict the number of dimensions
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 pl-6">
                                        <Label className="w-[100px]">
                                            Lowest Dimension:
                                        </Label>
                                        <div className="w-[75px]">
                                            <Input
                                                id="Lowest"
                                                type="number"
                                                placeholder=""
                                                value={plotsState.Lowest ?? 0}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "Lowest",
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 pl-6">
                                        <Label className="w-[100px]">
                                            Highest Dimension:
                                        </Label>
                                        <div className="w-[75px]">
                                            <Input
                                                id="Highest"
                                                type="number"
                                                placeholder=""
                                                value={plotsState.Highest ?? 0}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "Highest",
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
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
