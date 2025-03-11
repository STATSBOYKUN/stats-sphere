import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    VarianceCompsSaveProps,
    VarianceCompsSaveType
} from "@/models/general-linear-model/variance-components/variance-components";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {CheckedState} from "@radix-ui/react-checkbox";

export const VarianceCompsSave = ({ isSaveOpen, setIsSaveOpen, updateFormData, data }: VarianceCompsSaveProps) => {
    const [saveState, setSaveState] = useState<VarianceCompsSaveType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isSaveOpen) {
            setSaveState({ ...data });
        }
    }, [isSaveOpen, data]);

    const handleChange = (field: keyof VarianceCompsSaveType, value: CheckedState | number | string | null) => {
        setSaveState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleMatrixGrp = (value: string) => {
        setSaveState((prevState) => ({
            ...prevState,
            CovMatrix: value === "CovMatrix",
            CorMatrix: value === "CorMatrix",
        }))
    };

    const handleDestGrp = (value: string) => {
        setSaveState((prevState) => ({
            ...prevState,
            CreateNewDataset: value === "CreateNewDataset",
            WriteNewDataFile: value === "WriteNewDataFile",
        }))
    };

    const handleContinue = () => {
        Object.entries(saveState).forEach(([key, value]) => {
            updateFormData(key as keyof VarianceCompsSaveType, value);
        });
        setIsSaveOpen(false);
    };

    return (
        <>
            {/* Save Dialog */}
            <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Variance Components: Save</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="VarCompEst"
                                checked={saveState.VarCompEst}
                                onCheckedChange={(checked) => handleChange("VarCompEst", checked)}
                            />
                            <label
                                htmlFor="VarCompEst"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Variance Component Estimates
                            </label>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="CompCovar"
                                    checked={saveState.CompCovar}
                                    onCheckedChange={(checked) => handleChange("CompCovar", checked)}
                                />
                                <label
                                    htmlFor="CompCovar"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Component Covariation
                                </label>
                            </div>
                            <RadioGroup
                                value={
                                    saveState.CovMatrix ? "CovMatrix"
                                        : saveState.CorMatrix ? "CorMatrix" : ""
                                }
                                onValueChange={handleMatrixGrp}
                            >
                                <div className="flex items-center space-x-2 pl-6">
                                    <RadioGroupItem value="CovMatrix" id="CovMatrix"/>
                                    <Label htmlFor="CovMatrix">
                                        Covariance Matrix
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 pl-6">
                                    <RadioGroupItem value="CorMatrix" id="CorMatrix"/>
                                    <Label htmlFor="CorMatrix">
                                        Correlation Matrix
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="font-bold">Destination</Label>
                            <RadioGroup
                                value={saveState.CreateNewDataset ? "CreateNewDataset" : saveState.WriteNewDataFile ? "WriteNewDataFile" : ""}
                                onValueChange={handleDestGrp}
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="NewDataSet" id="NewDataSet"/>
                                        <Label htmlFor="NewDataSet">
                                            Create a New Dataset
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 pl-6">
                                        <Label className="w-[150px]">Dataset Name:</Label>
                                        <div className="w-[150px]">
                                            <Input
                                                id="DatasetName"
                                                type="text"
                                                placeholder=""
                                                value={saveState.DatasetName ?? ""}
                                                onChange={(e) => handleChange("DatasetName", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="WriteNewDataSet"
                                                        id="WriteNewDataSet"/>
                                        <Label htmlFor="WriteNewDataSet">
                                            Write New Dataset File
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 pl-6">
                                        <Input
                                            id="FilePath"
                                            type="file"
                                            placeholder=""
                                            onChange={(e) => handleChange("FilePath", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsSaveOpen(false)}>
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
