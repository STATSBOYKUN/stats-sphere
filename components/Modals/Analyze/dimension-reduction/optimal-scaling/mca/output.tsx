import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    OptScaMCAOutputProps,
    OptScaMCAOutputType
} from "@/models/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {CheckedState} from "@radix-ui/react-checkbox";

export const OptScaMCAOutput = ({ isOutputOpen, setIsOutputOpen, updateFormData, data }: OptScaMCAOutputProps) => {
    const [outputState, setOutputState] = useState<OptScaMCAOutputType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isOutputOpen) {
            setOutputState({ ...data });
        }
    }, [isOutputOpen, data]);

    const handleChange = (field: keyof OptScaMCAOutputType, value: CheckedState | number | string | null) => {
        setOutputState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(outputState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaMCAOutputType, value);
        });
        setIsOutputOpen(false);
    };

    return (
        <>
            {/* Output Dialog */}
            <Dialog open={isOutputOpen} onOpenChange={setIsOutputOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Multiple Correspondence Analysis: Output</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[425px] max-w-md rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={25}>
                            <div className="flex flex-col gap-2 p-2">
                                <Label className="font-bold">Tables</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="ObjectScores"
                                                checked={outputState.ObjectScores}
                                                onCheckedChange={(checked) => handleChange("ObjectScores", checked)}
                                            />
                                            <label
                                                htmlFor="ObjectScores"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Object Scores
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="DiscMeasures"
                                                checked={outputState.DiscMeasures}
                                                onCheckedChange={(checked) => handleChange("DiscMeasures", checked)}
                                            />
                                            <label
                                                htmlFor="DiscMeasures"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Discrimination Measures
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="IterationHistory"
                                                checked={outputState.IterationHistory}
                                                onCheckedChange={(checked) => handleChange("IterationHistory", checked)}
                                            />
                                            <label
                                                htmlFor="IterationHistory"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Iteration History
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="CorreOriginalVars"
                                                checked={outputState.CorreOriginalVars}
                                                onCheckedChange={(checked) => handleChange("CorreOriginalVars", checked)}
                                            />
                                            <label
                                                htmlFor="CorreOriginalVars"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                            Correlation of Original Variables
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="CorreTransVars"
                                                checked={outputState.CorreTransVars}
                                                onCheckedChange={(checked) => handleChange("CorreTransVars", checked)}
                                            />
                                            <label
                                                htmlFor="CorreTransVars"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Correlation of Transformed Variables
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle/>
                        <ResizablePanel defaultSize={75}>
                            <ResizablePanelGroup direction="horizontal">
                                <ResizablePanel defaultSize={50}>
                                    <div className="flex flex-col gap-8 p-2">
                                        <div className="w-full">
                                            <Label>Quantified Variables: </Label>
                                            <Input
                                                id="QuantifiedVars"
                                                type="text"
                                                className="w-full min-h-[100px]"
                                                placeholder=""
                                                value={outputState.QuantifiedVars ?? ""}
                                                onChange={(e) => handleChange("QuantifiedVars", e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full">
                                            <Label>Labeling Variables: </Label>
                                            <Input
                                                id="LabelingVars"
                                                type="text"
                                                className="w-full min-h-[100px]"
                                                placeholder=""
                                                value={outputState.LabelingVars ?? ""}
                                                onChange={(e) => handleChange("LabelingVars", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={50}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <div className="w-full">
                                            <Label>Category Quantifications: </Label>
                                            <Input
                                                id="CatQuantifications"
                                                type="text"
                                                className="w-full min-h-[35px]"
                                                placeholder=""
                                                value={outputState.CatQuantifications ?? ""}
                                                onChange={(e) => handleChange("CatQuantifications", e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full">
                                            <Label>Descriptive Statistics: </Label>
                                            <Input
                                                id="DescStats"
                                                type="text"
                                                className="w-full min-h-[35px]"
                                                placeholder=""
                                                value={outputState.DescStats ?? ""}
                                                onChange={(e) => handleChange("DescStats", e.target.value)}
                                            />
                                        </div>
                                        <Label className="font-bold">Object Scores Options</Label>
                                        <div className="w-full">
                                            <Label>Include Categories of: </Label>
                                            <Input
                                                id="ObjScoresIncludeCat"
                                                type="text"
                                                className="w-full min-h-[35px]"
                                                placeholder=""
                                                value={outputState.ObjScoresIncludeCat ?? ""}
                                                onChange={(e) => handleChange("ObjScoresIncludeCat", e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full">
                                            <Label>Label Object Scores By: </Label>
                                            <Input
                                                id="ObjScoresLabelBy"
                                                type="text"
                                                className="w-full min-h-[25px]"
                                                placeholder=""
                                                value={outputState.ObjScoresLabelBy ?? ""}
                                                onChange={(e) => handleChange("ObjScoresLabelBy", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsOutputOpen(false)}>
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
