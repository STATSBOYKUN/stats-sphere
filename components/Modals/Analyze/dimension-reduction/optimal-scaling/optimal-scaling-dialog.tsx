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
import { Separator } from "@/components/ui/separator";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import React, { useEffect, useState } from "react";
import {
    OptScaDefineMainType,
    OptScaDefineProps,
} from "@/models/dimension-reduction/optimal-scaling-define";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const OptScaInitial = ({
    isDefineOpen,
    setIsDefineOpen,
    setIsOptScaCatpca,
    setIsOptScaMCA,
    setIsOptScaOverals,
    updateFormData,
    data,
    onReset,
}: OptScaDefineProps) => {
    const [mainState, setMainState] = useState<OptScaDefineMainType>({
        ...data,
    });
    const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(
        null
    );

    useEffect(() => {
        if (mainState.AllVarsMultiNominal && mainState.OneSet) {
            setSelectedAnalysis("Multiple Correspondence Analysis");
        } else if (mainState.AllVarsMultiNominal && mainState.MultipleSets) {
            setSelectedAnalysis("Category Principal Components");
        } else if (mainState.SomeVarsNotMultiNominal) {
            setSelectedAnalysis("Nonlinear Canonical Correlation");
        } else {
            setSelectedAnalysis(null);
        }
    }, [mainState]);

    useEffect(() => {
        if (isDefineOpen) {
            setMainState({ ...data });
        }
    }, [isDefineOpen, data]);

    const handleOptLevelGrp = (value: string) => {
        setMainState((prev) => ({
            ...prev,
            AllVarsMultiNominal: value === "AllVarsMultiNominal",
            SomeVarsNotMultiNominal: value === "SomeVarsNotMultiNominal",
        }));
    };

    const handleNumberGrp = (value: string) => {
        setMainState((prev) => ({
            ...prev,
            OneSet: value === "OneSet",
            MultipleSets: value === "MultipleSets",
        }));
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaDefineMainType, value);
        });
        setIsDefineOpen(false);

        if (selectedAnalysis === "Category Principal Components") {
            setIsOptScaCatpca(true);
        }

        if (selectedAnalysis === "Nonlinear Canonical Correlation") {
            setIsOptScaOverals(true);
        }

        if (selectedAnalysis === "Multiple Correspondence Analysis") {
            setIsOptScaMCA(true);
        }
    };

    return (
        <>
            {/* Main Dialog */}
            <Dialog open={isDefineOpen} onOpenChange={setIsDefineOpen}>
                {/* <DialogTrigger asChild>
                    <Button variant="outline">Optimal Scaling</Button>
                </DialogTrigger> */}
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Optimal Scaling</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[300px] max-w-md rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={30}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">
                                    Optimal Scaling Level
                                </Label>
                                <RadioGroup
                                    value={
                                        mainState.AllVarsMultiNominal
                                            ? "AllVarsMultiNominal"
                                            : mainState.SomeVarsNotMultiNominal
                                            ? "SomeVarsNotMultiNominal"
                                            : ""
                                    }
                                    onValueChange={handleOptLevelGrp}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="AllVarsMultiNominal"
                                            id="AllVarsMultiNominal"
                                        />
                                        <Label htmlFor="AllVarsMultiNominal">
                                            All Variables are Multiple Nominal
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="SomeVarsNotMultiNominal"
                                            id="SomeVarsNotMultiNominal"
                                        />
                                        <Label htmlFor="SomeVarsNotMultiNominal">
                                            Some Variable(s) are not Multiple
                                            Nominal
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={30}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">
                                    Number of Sets of Variables
                                </Label>
                                <RadioGroup
                                    value={
                                        mainState.OneSet
                                            ? "OneSet"
                                            : mainState.MultipleSets
                                            ? "MultipleSets"
                                            : ""
                                    }
                                    onValueChange={handleNumberGrp}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="OneSet"
                                            id="OneSet"
                                        />
                                        <Label htmlFor="OneSet">One Set</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="MultipleSets"
                                            id="MultipleSets"
                                        />
                                        <Label htmlFor="MultipleSets">
                                            Multiple Sets
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel defaultSize={40}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">
                                    Selected Analysis
                                </Label>
                                {[
                                    "Multiple Correspondence Analysis",
                                    "Category Principal Components",
                                    "Nonlinear Canonical Correlation",
                                ].map((analysis) => (
                                    <div
                                        key={analysis}
                                        className={`text-sm ${
                                            selectedAnalysis === analysis
                                                ? "text-black"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {analysis}
                                    </div>
                                ))}
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
                            onClick={onReset}
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
        </>
    );
};
