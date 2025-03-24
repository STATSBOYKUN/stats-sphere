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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    RepeatedMeasureDefineDialogProps,
    RepeatedMeasureDefineData,
} from "@/models/general-linear-model/repeated-measures/repeated-measure-define";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useModal, ModalType } from "@/hooks/useModal";
import { Badge } from "@/components/ui/badge";

export const RepeatedMeasureDefineDialog = ({
    isDefineOpen,
    setIsDefineOpen,
    data,
    updateFormData,
    onReset,
}: RepeatedMeasureDefineDialogProps) => {
    // State for the form
    const [dialogState, setDialogState] = useState<RepeatedMeasureDefineData>({
        ...data,
    });
    const { closeModal, openModal } = useModal();

    useEffect(() => {
        if (isDefineOpen) {
            setDialogState({ ...data });
        }
    }, [isDefineOpen, data]);

    const handleChange = (
        field: keyof RepeatedMeasureDefineData,
        value: any
    ) => {
        setDialogState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    // Handler for adding a factor
    const handleAddFactor = () => {
        if (dialogState.factorName && dialogState.factorLevels) {
            const newFactor = {
                name: dialogState.factorName,
                levels: dialogState.factorLevels,
            };
            const updatedFactors = [...dialogState.factors, newFactor];

            handleChange("factors", updatedFactors);
            handleChange("factorName", "");
            handleChange("factorLevels", "");
        }
    };

    // Handler for changing a factor
    const handleChangeFactor = () => {
        if (
            dialogState.selectedFactor &&
            dialogState.factorName &&
            dialogState.factorLevels
        ) {
            const updatedFactors = dialogState.factors.map((factor) => {
                if (
                    `${factor.name}(${factor.levels})` ===
                    dialogState.selectedFactor
                ) {
                    return {
                        name: dialogState.factorName,
                        levels: dialogState.factorLevels,
                    };
                }
                return factor;
            });

            handleChange("factors", updatedFactors);
            handleChange("factorName", "");
            handleChange("factorLevels", "");
            handleChange("selectedFactor", null);
        }
    };

    // Handler for removing a factor
    const handleRemoveFactor = () => {
        if (dialogState.selectedFactor) {
            const updatedFactors = dialogState.factors.filter(
                (factor) =>
                    `${factor.name}(${factor.levels})` !==
                    dialogState.selectedFactor
            );

            handleChange("factors", updatedFactors);
            handleChange("selectedFactor", null);
        }
    };

    // Handler for selecting a factor
    const handleFactorSelect = (factorString: string) => {
        handleChange("selectedFactor", factorString);
        const [name, levelsStr] = factorString.split("(");
        const levels = parseInt(levelsStr.replace(")", ""), 10);
        handleChange("factorName", name);
        handleChange("factorLevels", levels);
    };

    // Handler for adding a measure
    const handleAddMeasure = () => {
        if (dialogState.measureName) {
            const newMeasure = {
                name: dialogState.measureName,
            };
            const updatedMeasures = [...dialogState.measures, newMeasure];

            handleChange("measures", updatedMeasures);
            handleChange("measureName", "");
        }
    };

    // Handler for changing a measure
    const handleChangeMeasure = () => {
        if (dialogState.selectedMeasure && dialogState.measureName) {
            const updatedMeasures = dialogState.measures.map((measure) => {
                if (measure.name === dialogState.selectedMeasure) {
                    return {
                        name: dialogState.measureName,
                    };
                }
                return measure;
            });

            handleChange("measures", updatedMeasures);
            handleChange("measureName", "");
            handleChange("selectedMeasure", null);
        }
    };

    // Handler for removing a measure
    const handleRemoveMeasure = () => {
        if (dialogState.selectedMeasure) {
            const updatedMeasures = dialogState.measures.filter(
                (measure) => measure.name !== dialogState.selectedMeasure
            );

            handleChange("measures", updatedMeasures);
            handleChange("selectedMeasure", null);
        }
    };

    // Handler for selecting a measure
    const handleMeasureSelect = (measureName: string) => {
        handleChange("selectedMeasure", measureName);
        handleChange("measureName", measureName);
    };

    // Handler for continuing with the defined data
    const handleContinue = () => {
        Object.entries(dialogState).forEach(([key, value]) => {
            updateFormData(key as keyof RepeatedMeasureDefineData, value);
        });
        setIsDefineOpen(false);
    };

    const handleReset = () => {
        onReset();
        setDialogState({ ...data });
    };

    const handleDialog = () => {
        setIsDefineOpen(false);
        closeModal();
    };

    return (
        <Dialog open={isDefineOpen} onOpenChange={handleDialog}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Repeated Measures: Define Factor(s)
                    </DialogTitle>
                </DialogHeader>
                <Separator />
                <ResizablePanelGroup
                    direction="vertical"
                    className="min-h-[450px] max-w-md rounded-lg border md:min-w-[200px]"
                >
                    <ResizablePanel defaultSize={55}>
                        <div className="flex flex-col gap-2 p-2">
                            <div className="flex items-center">
                                <Label
                                    htmlFor="factorName"
                                    className="w-[200px]"
                                >
                                    Within-Subject Factor Name:
                                </Label>
                                <Input
                                    id="factorName"
                                    value={dialogState.factorName || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "factorName",
                                            e.target.value
                                        )
                                    }
                                    className="w-full border"
                                />
                            </div>
                            <div className="flex items-center">
                                <Label
                                    htmlFor="factorLevels"
                                    className="w-[200px]"
                                >
                                    Number of Levels:
                                </Label>
                                <Input
                                    id="factorLevels"
                                    className="w-full"
                                    value={dialogState.factorLevels || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "factorLevels",
                                            parseInt(e.target.value, 10) || ""
                                        )
                                    }
                                    type="number"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleAddFactor}
                                    >
                                        Add
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleChangeFactor}
                                        disabled={!dialogState.selectedFactor}
                                    >
                                        Change
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleRemoveFactor}
                                        disabled={!dialogState.selectedFactor}
                                    >
                                        Remove
                                    </Button>
                                </div>
                                <div className="h-[125px] border w-full">
                                    <ScrollArea className="h-full w-full">
                                        <div className="flex flex-col gap-1 p-2">
                                            {dialogState.factors &&
                                                dialogState.factors.map(
                                                    (factor, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant={`${
                                                                dialogState.selectedFactor ===
                                                                `${factor.name}(${factor.levels})`
                                                                    ? "default"
                                                                    : "outline"
                                                            }`}
                                                            className="text-start text-sm font-light p-2 cursor-pointer"
                                                            onClick={() =>
                                                                handleFactorSelect(
                                                                    `${factor.name}(${factor.levels})`
                                                                )
                                                            }
                                                        >
                                                            {`${factor.name}(${factor.levels})`}
                                                        </Badge>
                                                    )
                                                )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={45}>
                        <div className="flex flex-col gap-2 p-2">
                            <div className="flex items-center">
                                <Label
                                    htmlFor="measureName"
                                    className="w-[200px]"
                                >
                                    Measure Name:
                                </Label>
                                <Input
                                    id="measureName"
                                    value={dialogState.measureName || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            "measureName",
                                            e.target.value
                                        )
                                    }
                                    className="w-full"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleAddMeasure}
                                    >
                                        Add
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleChangeMeasure}
                                        disabled={!dialogState.selectedMeasure}
                                    >
                                        Change
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleRemoveMeasure}
                                        disabled={!dialogState.selectedMeasure}
                                    >
                                        Remove
                                    </Button>
                                </div>
                                <div className="border h-[125px] w-full">
                                    <ScrollArea className="h-full w-full">
                                        <div className="flex flex-col gap-1 p-2">
                                            {dialogState.measures &&
                                                dialogState.measures.map(
                                                    (measure, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant={`${
                                                                dialogState.selectedMeasure ===
                                                                measure.name
                                                                    ? "default"
                                                                    : "outline"
                                                            }`}
                                                            className="text-start text-sm font-light p-2 cursor-pointer"
                                                            onClick={() =>
                                                                handleMeasureSelect(
                                                                    measure.name ||
                                                                        ""
                                                                )
                                                            }
                                                        >
                                                            {measure.name}
                                                        </Badge>
                                                    )
                                                )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
                <DialogFooter className="sm:justify-start">
                    <Button type="button" onClick={handleContinue}>
                        OK
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleReset}
                    >
                        Reset
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
    );
};
