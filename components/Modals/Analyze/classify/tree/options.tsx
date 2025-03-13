import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {TreeOptionsMissCostsType, TreeOptionsProfitsType, TreeOptionsProps} from "@/models/classify/tree/tree";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {ToggleGroupItem} from "@radix-ui/react-toggle-group";
import {ToggleGroup} from "@/components/ui/toggle-group";

export const TreeOptions = ({isOptionsOpen, setIsOptionsOpen, updateFormData, data}: TreeOptionsProps) => {
    const [optionsState, setOptionsState] = useState<TreeOptionsMissCostsType & TreeOptionsProfitsType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isOptionsOpen) {
            setOptionsState({...data});
        }
    }, [isOptionsOpen, data]);

    const handleMissGrp = (value: string) => {
        setOptionsState((prevState) => ({
            ...prevState,
            EqualCrossCate: value === "EqualCrossCate",
            Custom: value === "Custom",
        }));
    };

    const handleMatrixGrp = (value: string) => {
        setOptionsState((prevState) => ({
            ...prevState,
            DupLowMatrix: value === "DupLowMatrix",
            DupUppMatrix: value === "DupUppMatrix",
            UseAvg: value === "UseAvg",
        }));
        console.log(value);
    };

    const handleContinue = () => {
        Object.entries(optionsState).forEach(([key, value]) => {
            updateFormData(key as keyof (TreeOptionsMissCostsType | TreeOptionsProfitsType), value);
        });
        setIsOptionsOpen(false);
    };

    return (
        <>
            {/* Options Dialog */}
            <Dialog open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Decision Tree: Options</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <Tabs defaultValue="misscosts" className="sm:min-w-[350px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="misscosts">Missclassification Costs</TabsTrigger>
                            <TabsTrigger value="profits">Profits</TabsTrigger>
                        </TabsList>

                        {/* Missclassification Tabs */}
                        <TabsContent value="misscosts">
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[300px] max-w-xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={100}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <RadioGroup
                                            value={optionsState.EqualCrossCate ? "EqualCrossCate" : optionsState.Custom ? "Custom" : ""}
                                            onValueChange={handleMissGrp}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="EqualCrossCate" id="EqualCrossCate"/>
                                                <Label htmlFor="EqualCrossCate">
                                                    Equal Across Categories
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Custom" id="Custom"/>
                                                <Label htmlFor="Custom">
                                                    Custom
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                        <div className="flex flex-col justify-center items-center gap-2">
                                            <div className="text-sm">
                                                Predicted Category
                                            </div>
                                            <div className="flex flex-row justify-between items-center gap-2">
                                                <div className="w-[50px] text-sm">
                                                    Actual Category
                                                </div>
                                                <div className="flex pl-6">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Variables</TableHead>
                                                                <TableHead className="w-[100px] text-center">Variable
                                                                    1</TableHead>
                                                                <TableHead className="w-[100px] text-center">Variable
                                                                    2</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            <TableRow>
                                                                <TableCell className="text-center">
                                                                    Variable 1
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    0
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    1
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="text-center">
                                                                    Variable 2
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    1
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    0
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label className="font-bold">Fill Matrix</Label>
                                            <ToggleGroup
                                                type="single"
                                                value={optionsState.DupLowMatrix ? "DupLowMatrix" : optionsState.DupUppMatrix ? "DupUppMatrix" : "UseAvg"}
                                                onValueChange={handleMatrixGrp}
                                            >
                                                <ToggleGroupItem value="DupLowMatrix" aria-label="DupLowMatrix">
                                                    <Button variant="ghost" size="sm">
                                                        Duplicate Lower Triangle
                                                    </Button>
                                                </ToggleGroupItem>
                                                <ToggleGroupItem value="DupUppMatrix" aria-label="DupUppMatrix">
                                                    <Button variant="ghost" size="sm">
                                                        Duplicate Upper Triangle
                                                    </Button>
                                                </ToggleGroupItem>
                                                <ToggleGroupItem value="UseAvg" aria-label="UseAvg">
                                                    <Button variant="ghost" size="sm">
                                                        Use Average
                                                    </Button>
                                                </ToggleGroupItem>
                                            </ToggleGroup>
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </TabsContent>

                        {/* Profits Tabs */}
                        <TabsContent value="profits">
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[300px] max-w-xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={100}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <RadioGroup

                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="NoneProfits" id="NoneProfits"/>
                                                <Label htmlFor="NoneProfits">
                                                    None
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="CustomProfits" id="CustomProfits"/>
                                                <Label htmlFor="CustomProfits">
                                                    Custom
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                        <div className="flex flex-col gap-2 pt-2">
                                            <div className="text-sm">
                                                Revenue and Expense Values
                                            </div>
                                            <div className="flex pl-6">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Variables</TableHead>
                                                            <TableHead className="w-[100px] text-center">Revenue</TableHead>
                                                            <TableHead className="w-[100px] text-center">Expense</TableHead>
                                                            <TableHead className="w-[100px] text-center">Profit</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell className="text-center">
                                                                Variable 1
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                0
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                1
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                1
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="text-center">
                                                                Variable 2
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                1
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                0
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                0
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </TabsContent>
                    </Tabs>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsOptionsOpen(false)}>
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
