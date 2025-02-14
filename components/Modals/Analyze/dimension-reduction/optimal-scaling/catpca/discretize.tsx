import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    OptScaCatpcaDiscretizeProps,
    OptScaCatpcaDiscretizeType
} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {DISCRETIZEMETHOD} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-sca-method";
import {ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

export const OptScaCatpcaDiscretize = ({
                                           isDiscretizeOpen,
                                           setIsDiscretizeOpen,
                                           updateFormData,
                                           data
                                       }: OptScaCatpcaDiscretizeProps) => {
    const [discretizeState, setDiscretizeState] = useState<OptScaCatpcaDiscretizeType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    useEffect(() => {
        if (isDiscretizeOpen) {
            setDiscretizeState({...data});
        }
    }, [isDiscretizeOpen, data]);

    const handleChange = (field: keyof OptScaCatpcaDiscretizeType, value: number | string | null) => {
        setDiscretizeState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleGroupingGrp = (value: string) => {
        setDiscretizeState((prevState) => ({
            ...prevState,
            NumberOfCategories: value === "NumberOfCategories",
            EqualIntervals: value === "EqualIntervals",
        }));
    };

    const handleDistributionGrp = (value: string) => {
        setDiscretizeState((prevState) => ({
            ...prevState,
            DistributionNormal: value === "DistributionNormal",
            DistributionUniform: value === "DistributionUniform",
        }));
    };

    const handleContinue = () => {
        Object.entries(discretizeState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaCatpcaDiscretizeType, value);
        });
        setIsDiscretizeOpen(false);
    };

    return (
        <>
            {/* Discretize Dialog */}
            <Dialog open={isDiscretizeOpen} onOpenChange={setIsDiscretizeOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Categorical Principal Components: Discretize</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="flex flex-col gap-2">
                        <div className="w-full">
                            <Label className="font-bold">Categorical Variables: </Label>
                            <Input
                                id="VariablesList"
                                type="text"
                                className="w-full min-h-[100px]"
                                placeholder=""
                                value={discretizeState.VariablesList ?? ""}
                                onChange={(e) => handleChange("VariablesList", e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Label className="w-[250px] font-bold">Growing Method: </Label>
                            <Select
                                value={discretizeState.Method ?? ""}
                                onValueChange={(value) => handleChange("Method", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent
                                className="w-[150px]"
                                >
                                    <SelectGroup>
                                        {DISCRETIZEMETHOD.map((method, index) => (
                                            <SelectItem key={index}
                                                        value={method}>{capitalize(method) + "'s Method"}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <ResizablePanelGroup
                            direction="vertical"
                            className="min-h-[150px] max-w-md rounded-lg border md:min-w-[200px]"
                        >
                            <ResizablePanel defaultSize={100}>
                                <RadioGroup
                                    value={discretizeState.NumberOfCategories ? "NumberOfCategories" : "EqualIntervals"}
                                    onValueChange={handleGroupingGrp}
                                >
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Grouping</Label>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="NumberOfCategories" id="NumberOfCategories"/>
                                            <Label className="w-[250px]" htmlFor="NumberOfCategories">
                                                Number of Categories
                                            </Label>
                                            <Input
                                                id="NumberOfCategoriesValue"
                                                type="number"
                                                className="pl-12 w-[75px]"
                                                value={discretizeState.NumberOfCategoriesValue ?? ""}
                                                onChange={(e) => handleChange("NumberOfCategoriesValue", e.target.value)}
                                            />
                                        </div>
                                        <RadioGroup
                                            value={discretizeState.DistributionNormal ? "DistributionNormal" : "DistributionUniform"}
                                            onValueChange={handleDistributionGrp}
                                        >
                                            <div className="flex items-center justify between space-x-2 pl-6">
                                                <Label>Distribution: </Label>
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="DistributionNormal"
                                                                        id="DistributionNormal"/>
                                                        <Label htmlFor="DistributionNormal">
                                                            Normal
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="DistributionUniform"
                                                                        id="DistributionUniform"/>
                                                        <Label htmlFor="DistributionUniform">
                                                            Uniform
                                                        </Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="EqualIntervals" id="EqualIntervals"/>
                                            <Label className="w-[250px]" htmlFor="EqualIntervals">
                                                Equal Intervals
                                            </Label>
                                            <Input
                                                id="EqualIntervalsValue"
                                                type="number"
                                                className="pl-12 w-[75px]"
                                                value={discretizeState.EqualIntervalsValue ?? ""}
                                                onChange={(e) => handleChange("EqualIntervalsValue", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </RadioGroup>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsDiscretizeOpen(false)}>
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
