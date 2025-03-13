import React, {useEffect, useState} from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Separator} from "@/components/ui/separator";
import {
    OptScaOveralsDialogProps,
    OptScaOveralsMainType
} from "@/models/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink,
    PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export const OptScaOveralsDialog = ({
                                        isMainOpen,
                                        setIsMainOpen,
                                        setIsDefineRangeScaleOpen,
                                        setIsDefineRangeOpen,
                                        setIsOptionsOpen,
                                        updateFormData,
                                        data
                                    }: OptScaOveralsDialogProps) => {
    const [mainState, setMainState] = useState<OptScaOveralsMainType>({...data});

    useEffect(() => {
        if (isMainOpen) {
            setMainState({...data});
        }
    }, [isMainOpen, data]);

    const handleChange = (field: keyof OptScaOveralsMainType, value: number | string | null) => {
        setMainState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaOveralsMainType, value);
        });
        setIsMainOpen(false);
    };

    const openDialog = (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
        setter(true);
    };

    return (
        <>
            {/* Main Dialog */}
            <Dialog open={isMainOpen} onOpenChange={setIsMainOpen}>
                {/*<DialogTrigger asChild>*/}
                {/*    <Button variant="outline">OVERALS</Button>*/}
                {/*</DialogTrigger>*/}
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Nonliniear Canonical Correlation Analysis (OVERALS)</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="flex items-center space-x-2">
                        <ResizablePanelGroup
                            direction="horizontal"
                            className="min-h-[400px] rounded-lg border md:min-w-[200px]"
                        >
                            {/* Variable List */}
                            <ResizablePanel defaultSize={25}>
                                <div className="flex h-full items-center justify-center p-2">
                                    <span className="font-semibold">List Variabel</span>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle/>

                            {/* Defining Variable */}
                            <ResizablePanel defaultSize={55}>
                                <div className="flex flex-col gap-4 p-2">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious href="#"/>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationLink href="#">1</PaginationLink>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationLink href="#" isActive>
                                                    2
                                                </PaginationLink>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationLink href="#">3</PaginationLink>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationEllipsis/>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationNext href="#"/>
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                    <div className="flex flex-col gap-1">
                                        <div className="w-full">
                                            <Label className="font-bold">Variables: </Label>
                                            <Input
                                                id="SetTargetVariable"
                                                type="text"
                                                className="w-full min-h-[65px]"
                                                placeholder=""
                                                value={mainState.SetTargetVariable ?? ""}
                                                onChange={(e) => handleChange("SetTargetVariable", e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={openDialog(setIsDefineRangeScaleOpen)}
                                            >
                                                Define Range and Scale...
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="w-full">
                                            <Label className="font-bold">Label Object Score Plot(s) by: </Label>
                                            <Input
                                                id="PlotsTargetVariable"
                                                type="text"
                                                className="w-full min-h-[65px]"
                                                placeholder=""
                                                value={mainState.PlotsTargetVariable ?? ""}
                                                onChange={(e) => handleChange("PlotsTargetVariable", e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={openDialog(setIsDefineRangeOpen)}
                                            >
                                                Define Range...
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Label className="w-[150px]">Dimension in Solution:</Label>
                                        <div className="w-[75px]">
                                            <Input
                                                id="Dimensions"
                                                type="number"
                                                placeholder=""
                                                value={mainState.Dimensions || ""}
                                                onChange={(e) => handleChange("Dimensions", Number(e.target.value))}
                                            />
                                        </div>
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
                                        onClick={openDialog(setIsOptionsOpen)}
                                    >
                                        Options...
                                    </Button>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            onClick={handleContinue}
                        >
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
