import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import {
    KNNDialogProps,
    KNNMainType,
} from "@/models/classify/nearest-neighbor/nearest-neighbor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";

export const KNNDialog = ({
    isMainOpen,
    setIsMainOpen,
    setIsNeighborsOpen,
    setIsFeaturesOpen,
    setIsPartitionOpen,
    setIsSaveOpen,
    setIsOutputOpen,
    setIsOptionsOpen,
    updateFormData,
    data,
    globalVariables,
    onContinue,
    onReset,
}: KNNDialogProps) => {
    const [mainState, setMainState] = useState<KNNMainType>({ ...data });

    useEffect(() => {
        if (isMainOpen) {
            setMainState({ ...data });
        }
    }, [isMainOpen, data]);

    const handleChange = (
        field: keyof KNNMainType,
        value: CheckedState | number | boolean | string | null
    ) => {
        setMainState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof KNNMainType, value);
        });
        setIsMainOpen(false);
    };

    const openDialog =
        (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
            setter(true);
        };

    return (
        <>
            {/* Main Dialog */}
            <Dialog open={isMainOpen} onOpenChange={setIsMainOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">Nearest Neighbor</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Nearest Neighbor Analysis</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex items-center space-x-2">
                        <ResizablePanelGroup
                            direction="horizontal"
                            className="min-h-[400px] rounded-lg border md:min-w-[200px]"
                        >
                            {/* Variable List */}
                            <ResizablePanel defaultSize={25}>
                                <div className="flex h-full items-center justify-center p-2">
                                    <span className="font-semibold">
                                        List Variabel
                                    </span>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />

                            {/* Defining Variable */}
                            <ResizablePanel defaultSize={55}>
                                <div className="flex flex-col h-full w-full items-start justify-start gap-3 p-2">
                                    <div className="flex flex-col w-full gap-1">
                                        <Label className="font-bold">
                                            Target (Optional):
                                        </Label>
                                        <Input
                                            id="DepVar"
                                            type="text"
                                            className="min-w-2xl w-full"
                                            placeholder=""
                                        />
                                    </div>
                                    <div className="flex flex-col w-full gap-1">
                                        <Label className="font-bold">
                                            Features:
                                        </Label>
                                        <Input
                                            id="FeatureVar"
                                            type="text"
                                            className="min-w-2xl w-full min-h-[150px]"
                                            placeholder=""
                                        />
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="NormCovar"
                                                checked={mainState.NormCovar}
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "NormCovar",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="NormCovar"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Normalize Scale Features
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-full gap-1">
                                        <Label className="font-bold">
                                            Focal Case Identifier (Optional):
                                        </Label>
                                        <Input
                                            id="FocalCaseIdenVar"
                                            type="text"
                                            className="min-w-2xl w-full"
                                            placeholder=""
                                        />
                                    </div>
                                    <div className="flex flex-col w-full gap-1">
                                        <Label className="font-bold">
                                            Case Label (Optional):
                                        </Label>
                                        <Input
                                            id="CaseIdenVar"
                                            type="text"
                                            className="min-w-2xl w-full"
                                            placeholder=""
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>

                            {/* Tools Area */}
                            <ResizablePanel defaultSize={20}>
                                <div className="flex flex-col h-full items-start justify-start gap-1 p-2">
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsNeighborsOpen)}
                                    >
                                        Neighbors...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsFeaturesOpen)}
                                    >
                                        Features...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsPartitionOpen)}
                                    >
                                        Partitions...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsSaveOpen)}
                                    >
                                        Save...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsOutputOpen)}
                                    >
                                        Output...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsOptionsOpen)}
                                    >
                                        Options...
                                    </Button>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button type="button" onClick={handleContinue}>
                            OK
                        </Button>
                        <Button type="button" variant="secondary">
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
        </>
    );
};
