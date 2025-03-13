import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {FactorScoresProps, FactorScoresType} from "@/models/dimension-reduction/factor/factor";
import {Checkbox} from "@/components/ui/checkbox";
import {ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {CheckedState} from "@radix-ui/react-checkbox";

export const FactorScores = ({isScoresOpen, setIsScoresOpen, updateFormData, data}: FactorScoresProps) => {
    const [scoresState, setScoresState] = useState<FactorScoresType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isScoresOpen) {
            setScoresState({...data});
        }
    }, [isScoresOpen, data]);

    const handleChange = (field: keyof FactorScoresType, value: CheckedState | null) => {
        setScoresState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleMethodGrp = (value: string) => {
        setScoresState((prevState) => ({
            ...prevState,
            Regression: value === "Regression",
            Bartlett: value === "Bartlett",
            Anderson: value === "Anderson",
        }));
    };

    const handleContinue = () => {
        Object.entries(scoresState).forEach(([key, value]) => {
            updateFormData(key as keyof FactorScoresType, value);
        });
        setIsScoresOpen(false);
    };

    return (
        <>
            {/* Scores Dialog */}
            <Dialog open={isScoresOpen} onOpenChange={setIsScoresOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Factor Analysis: Scores</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="SaveVar"
                                checked={scoresState.SaveVar}
                                onCheckedChange={(checked) => handleChange("SaveVar", checked)}
                            />
                            <label
                                htmlFor="SaveVar"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Save as Variables
                            </label>
                        </div>
                        <div className="pl-6">
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[100px] max-w-md rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={100}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Method</Label>
                                        <RadioGroup
                                            value={scoresState.Regression ? "Regression" : scoresState.Bartlett ? "Bartlett" : "Anderson"}
                                            onValueChange={handleMethodGrp}
                                        >
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Regression" id="Regression"/>
                                                    <Label htmlFor="Regression">
                                                        Regression
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Bartlett" id="Bartlett"/>
                                                    <Label htmlFor="Bartlett">
                                                        Bartlett
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Anderson" id="Anderson"/>
                                                    <Label htmlFor="Anderson">
                                                        Anderson
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="DisplayFactor"
                                checked={scoresState.DisplayFactor}
                                onCheckedChange={(checked) => handleChange("DisplayFactor", checked)}
                            />
                            <label
                                htmlFor="DisplayFactor"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Save as Variables
                            </label>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsScoresOpen(false)}>
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
