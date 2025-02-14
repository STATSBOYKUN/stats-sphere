import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    OptScaCatpcaMissingProps,
    OptScaCatpcaMissingType
} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

export const OptScaCatpcaMissing = ({ isMissingOpen, setIsMissingOpen, updateFormData, data }: OptScaCatpcaMissingProps) => {
    const [missingState, setMissingState] = useState<OptScaCatpcaMissingType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isMissingOpen) {
            setMissingState({ ...data });
        }
    }, [isMissingOpen, data]);

    const handleChange = (field: keyof OptScaCatpcaMissingType, value: number | string | null) => {
        setMissingState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleExcludeGrp = (value: string) => {
        setMissingState((prevState) => ({
            ...prevState,
            MissingValuesExclude: value === "MissingValuesExclude",
            MissingValuesImpute: value === "MissingValuesImpute",
            ExcludeObjects: value === "ExcludeObjects",
        }));
    };

    const handleExcludeMethodGrp = (value: string) => {
        setMissingState((prevState) => ({
            ...prevState,
            ExcludeMode: value === "ExcludeMode",
            ExcludeExtraCat: value === "ExcludeExtraCat",
            ExcludeRandomCat: value === "ExcludeRandomCat",
        }));
    };

    const handleImputeMethodGrp = (value: string) => {
        setMissingState((prevState) => ({
            ...prevState,
            ImputeMode: value === "ImputeMode",
            ImputeExtraCat: value === "ImputeExtraCat",
            ImputeRandomCat: value === "ImputeRandomCat",
        }));
    };

    const handleContinue = () => {
        Object.entries(missingState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaCatpcaMissingType, value);
        });
        setIsMissingOpen(false);
    };

    return (
        <>
            {/* Missing Values Dialog */}
            <Dialog open={isMissingOpen} onOpenChange={setIsMissingOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Categorical Principal Components: Missing Values</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[450px] max-w-xl rounded-lg border md:min-w-[250px]"
                    >
                        <ResizablePanel defaultSize={70}>
                            <ResizablePanelGroup direction="vertical">
                                <ResizablePanel defaultSize={60}>
                                    <div className="flex flex-col p-2">
                                        <Label className="font-bold">Missing Value Strategy </Label>
                                        <div className="w-full">
                                            <Label>Analysis Variables: </Label>
                                            <Input
                                                id="AnalysisVariables"
                                                type="text"
                                                className="w-full min-h-[125px]"
                                                placeholder=""
                                                value={missingState.AnalysisVariables ?? ""}
                                                onChange={(e) => handleChange("AnalysisVariables", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle withHandle/>
                                <ResizablePanel defaultSize={40}>
                                    <div className="flex flex-col p-2">
                                        <div className="w-full">
                                            <Label>Supplementary Variables: </Label>
                                            <Input
                                                id="SupplementaryVariables"
                                                type="text"
                                                className="w-full min-h-[75px]"
                                                placeholder=""
                                                value={missingState.SupplementaryVariables ?? ""}
                                                onChange={(e) => handleChange("SupplementaryVariables", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                        <ResizableHandle/>
                        <ResizablePanel defaultSize={30}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">Strategy</Label>
                                <RadioGroup
                                    value={
                                        missingState.MissingValuesExclude
                                            ? "MissingValuesExclude"
                                            : missingState.MissingValuesImpute
                                            ? "MissingValuesImpute"
                                            : "ExcludeObjects"
                                    }
                                    onValueChange={handleExcludeGrp}
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="MissingValuesExclude" id="MissingValuesExclude"/>
                                            <Label htmlFor="MissingValuesExclude">
                                                Exclude Missing Values
                                            </Label>
                                        </div>
                                        <RadioGroup
                                            value={
                                                missingState.ExcludeMode
                                                    ? "ExcludeMode"
                                                    : missingState.ExcludeExtraCat
                                                    ? "ExcludeExtraCat"
                                                    : "ExcludeRandomCat"
                                            }
                                            onValueChange={handleExcludeMethodGrp}
                                        >
                                            <div className="grid grid-cols-3 gap-1 pl-6">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="ExcludeMode" id="ExcludeMode"/>
                                                    <Label htmlFor="ExcludeMode">
                                                        Mode
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="ExcludeExtraCat" id="ExcludeExtraCat"/>
                                                    <Label htmlFor="ExcludeExtraCat">
                                                        Extra
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="ExcludeRandomCat" id="ExcludeRandomCat"/>
                                                    <Label htmlFor="ExcludeRandomCat">
                                                        Random
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="MissingValuesImpute" id="MissingValuesImpute"/>
                                            <Label htmlFor="MissingValuesImpute">
                                                Impute Missing Values
                                            </Label>
                                        </div>
                                        <RadioGroup
                                            value={
                                                missingState.ImputeMode
                                                    ? "ImputeMode"
                                                    : missingState.ImputeExtraCat
                                                    ? "ImputeExtraCat"
                                                    : "ImputeRandomCat"
                                            }
                                            onValueChange={handleImputeMethodGrp}
                                        >
                                            <div className="grid grid-cols-3 gap-1 pl-6">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="ImputeMode" id="ImputeMode"/>
                                                    <Label htmlFor="ImputeMode">
                                                        Mode
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="ImputeExtraCat" id="ImputeExtraCat"/>
                                                    <Label htmlFor="ImputeExtraCat">
                                                        Extra
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="ImputeRandomCat" id="ImputeRandomCat"/>
                                                    <Label htmlFor="ImputeRandomCat">
                                                        Random
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="ExcludeObjects" id="ExcludeObjects"/>
                                            <Label htmlFor="ExcludeObjects">
                                                Exclude Objects with Missing Values
                                            </Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsMissingOpen(false)}>
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
