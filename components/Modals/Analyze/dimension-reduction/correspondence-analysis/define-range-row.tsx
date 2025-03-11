import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    CorrespondenceDefineRangeRowProps,
    CorrespondenceDefineRangeRowType
} from "@/models/dimension-reduction/correspondence-analysis/correspondence-analysis";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

export const CorrespondenceDefineRangeRow = ({ isDefineRangeRowOpen, setIsDefineRangeRowOpen, updateFormData, data }: CorrespondenceDefineRangeRowProps) => {
    const [defineRangeRowState, setDefineRangeRowState] = useState<CorrespondenceDefineRangeRowType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isDefineRangeRowOpen) {
            setDefineRangeRowState({ ...data });
        }
    }, [isDefineRangeRowOpen, data]);

    const handleChange = (field: keyof CorrespondenceDefineRangeRowType, value: number | string | null) => {
        setDefineRangeRowState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleCategoryGrp = (value: string) => {
        setDefineRangeRowState((prevState) => ({
            ...prevState,
            None: value === "None",
            CategoryEqual: value === "CategoryEqual",
            CategorySupplemental: value === "CategorySupplemental",
        }));
    };

    const handleContinue = () => {
        Object.entries(defineRangeRowState).forEach(([key, value]) => {
            updateFormData(key as keyof CorrespondenceDefineRangeRowType, value);
        });
        setIsDefineRangeRowOpen(false);
    };

    return (
        <>
            {/* Define Range Row Dialog */}
            <Dialog open={isDefineRangeRowOpen} onOpenChange={setIsDefineRangeRowOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Correspondence Analysis: Define Range Row</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <ResizablePanelGroup
                        direction="vertical"
                        className="min-h-[250px] max-w-xl rounded-lg border md:min-w-[200px]"
                    >
                        <ResizablePanel defaultSize={55}>
                            <div className="flex flex-col gap-2 p-2">
                                <div className="flex items-center space-x-2">
                                    <Label className="font-bold">Category Range for Row Variable: </Label>
                                    <div>
                                        <span className="text-sm">{defineRangeRowState.DefaultListModel ?? "???"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Label className="w-[150px]">Minimum Value:</Label>
                                    <div className="w-[75px]">
                                        <Input
                                            disabled={true}
                                            id="MinValue"
                                            type="number"
                                            placeholder=""
                                            value={defineRangeRowState.MinValue ?? ""}
                                            onChange={(e) => handleChange("MinValue", Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Label className="w-[150px]">Maximum Value:</Label>
                                    <div className="w-[75px]">
                                        <Input
                                            disabled={true}
                                            id="MaxValue"
                                            type="number"
                                            placeholder=""
                                            value={defineRangeRowState.MaxValue ?? ""}
                                            onChange={(e) => handleChange("MaxValue", Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle/>
                        <ResizablePanel defaultSize={45}>
                            <div className="flex flex-col gap-2 p-2">
                                <ResizablePanelGroup direction="horizontal">
                                    <ResizablePanel defaultSize={50}>
                                        <div className="w-full p-2">
                                            <Label>Assumed Standardized: </Label>
                                            <Input
                                                id="ConstraintsList"
                                                type="text"
                                                className="w-full min-h-[65px]"
                                                placeholder=""
                                                value={defineRangeRowState.ConstraintsList ?? ""}
                                                onChange={(e) => handleChange("ConstraintsList", e.target.value)}
                                            />
                                        </div>
                                    </ResizablePanel>
                                    <ResizableHandle withHandle/>
                                    <ResizablePanel defaultSize={50}>
                                        <RadioGroup
                                            value={defineRangeRowState.None ? "None" : defineRangeRowState.CategoryEqual ? "CategoryEqual" : "CategorySupplemental"}
                                            onValueChange={handleCategoryGrp}
                                        >
                                            <div className="flex flex-col gap-2 p-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="None" id="None"/>
                                                    <Label htmlFor="None">
                                                        None
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="CategoryEqual" id="CategoryEqual"/>
                                                    <Label htmlFor="CategoryEqual">
                                                        Category must be Equal
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="CategorySupplemental" id="CategorySupplemental"/>
                                                    <Label htmlFor="CategorySupplemental">
                                                        Category is Supplemental
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsDefineRangeRowOpen(false)}>
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
