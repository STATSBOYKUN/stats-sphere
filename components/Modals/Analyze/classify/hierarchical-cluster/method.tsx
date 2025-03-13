import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {HierClusMethodProps, HierClusMethodType} from "@/models/classify/hierarchical-cluster/hierarchical-cluster";
import {CheckedState} from "@radix-ui/react-checkbox";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {
    BINARYMETHODS,
    CLUSTERMETHODS,
    COUNTSMETHODS,
    INTERVALMETHODS,
    POWER,
    ROOT
} from "@/constants/classify/hierarchical-cluster/hierarchical-cluster-method";

export const HierClusMethod = ({isMethodOpen, setIsMethodOpen, updateFormData, data}: HierClusMethodProps) => {
    const [methodState, setMethodState] = useState<HierClusMethodType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    useEffect(() => {
        if (isMethodOpen) {
            setMethodState({...data});
        }
    }, [isMethodOpen, data]);

    const handleChange = (field: keyof HierClusMethodType, value: CheckedState | boolean | string | null) => {
        setMethodState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleTransformGrp = (value: string) => {
        setMethodState((prevState) => ({
            ...prevState,
            ByVariable: value === "ByVariable",
            ByCase: value === "ByCase",
        }));
    };

    const handleMeasureGrp = (value: string) => {
        setMethodState((prevState) => ({
            ...prevState,
            Interval: value === "Interval",
            Counts: value === "Counts",
            Binary: value === "Binary",
        }));
    };

    const handleContinue = () => {
        Object.entries(methodState).forEach(([key, value]) => {
            updateFormData(key as keyof HierClusMethodType, value);
        });
        setIsMethodOpen(false);
    };

    return (
        <>
            {/* Method Dialog */}
            <Dialog open={isMethodOpen} onOpenChange={setIsMethodOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Hierarchical Cluster Analysis: Method</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="flex flex-row w-full items-center gap-2">
                        <Label className="w-[150px]">Cluster Method: </Label>
                        <Select
                            value={methodState.ClusMethod ?? "WARD"}
                            defaultValue={methodState.ClusMethod ?? "WARD"}
                            onValueChange={(value) => handleChange("ClusMethod", value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a method"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {CLUSTERMETHODS.map((method, index) => (
                                        <SelectItem key={index}
                                                    value={method}>{capitalize(method) + "'s Method"}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col items-start gap-2">
                        <ResizablePanelGroup
                            direction="vertical"
                            className="min-h-[375px] max-w-xl rounded-lg border md:min-w-[200px]"
                        >
                            <ResizablePanel defaultSize={67}>
                                <div className="flex flex-col h-full gap-2 p-2">
                                    <Label className="font-bold">Measure</Label>
                                    <RadioGroup
                                        defaultValue="Interval"
                                        value={methodState.Interval ? "Interval" : methodState.ByCase ? "ByCase" : "Interval"}
                                        onValueChange={handleMeasureGrp}
                                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-start space-x-2">
                                                    <div className="flex items-start space-x-2 pt-2">
                                                        <RadioGroupItem value="Interval" id="Interval"/>
                                                        <Label className="w-[80px]" htmlFor="Interval">
                                                            Interval:
                                                        </Label>
                                                    </div>
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <Select
                                                            value={methodState.IntervalMethod ?? "POWER"}
                                                            defaultValue={methodState.IntervalMethod ?? "POWER"}
                                                            onValueChange={(value) => handleChange("IntervalMethod", value)}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select a method"/>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    {INTERVALMETHODS.map((method, index) => (
                                                                        <SelectItem key={index}
                                                                                    value={method}>{capitalize(method) + "'s Method"}</SelectItem>
                                                                    ))}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                        <div className="flex flex-row gap-2">
                                                            <div className="flex flex-row w-full items-center gap-2">
                                                                <Label>Power: </Label>
                                                                <Select
                                                                    value={methodState.Power ?? "1"}
                                                                    defaultValue={methodState.Power ?? "1"}
                                                                    onValueChange={(value) => handleChange("Power", value)}
                                                                >
                                                                    <SelectTrigger className="w-[75px]">
                                                                        <SelectValue placeholder=""/>
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectGroup>
                                                                            {POWER.map((method, index) => (
                                                                                <SelectItem key={index}
                                                                                            value={method}>{capitalize(method)}</SelectItem>
                                                                            ))}
                                                                        </SelectGroup>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="flex flex-row w-full items-center gap-2">
                                                                <Label>Root: </Label>
                                                                <Select
                                                                    value={methodState.Root ?? "1"}
                                                                    defaultValue={methodState.Root ?? "1"}
                                                                    onValueChange={(value) => handleChange("Root", value)}
                                                                >
                                                                    <SelectTrigger className="w-[75px]">
                                                                        <SelectValue placeholder=""/>
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectGroup>
                                                                            <SelectGroup>
                                                                                {ROOT.map((method, index) => (
                                                                                    <SelectItem key={index}
                                                                                                value={method}>{capitalize(method)}</SelectItem>
                                                                                ))}
                                                                            </SelectGroup>
                                                                        </SelectGroup>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-2">
                                                    <div className="flex items-start space-x-2 pt-2">
                                                        <RadioGroupItem value="Counts" id="Counts"/>
                                                        <Label className="w-[80px]" htmlFor="Counts">
                                                            Counts:
                                                        </Label>
                                                    </div>
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <Select
                                                            value={methodState.CountsMethod ?? "CHISQ"}
                                                            defaultValue={methodState.CountsMethod ?? "CHISQ"}
                                                            onValueChange={(value) => handleChange("CountsMethod", value)}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select a method"/>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    {COUNTSMETHODS.map((method, index) => (
                                                                        <SelectItem key={index}
                                                                                    value={method}>{capitalize(method) + "'s Method"}</SelectItem>
                                                                    ))}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-2">
                                                    <div className="flex items-start space-x-2 pt-2">
                                                        <RadioGroupItem value="Binary" id="Binary"/>
                                                        <Label className="w-[80px]" htmlFor="Binary">
                                                            Binary:
                                                        </Label>
                                                    </div>
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <Select
                                                            value={methodState.BinaryMethod ?? "BSEUCLID"}
                                                            defaultValue={methodState.BinaryMethod ?? "BSEUCLID"}
                                                            onValueChange={(value) => handleChange("BinaryMethod", value)}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select a method"/>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {BINARYMETHODS.map((method, index) => (
                                                                    <SelectItem key={index}
                                                                                value={method}>{capitalize(method) + "'s Method"}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <div className="flex flex-row gap-2">
                                                            <div className="flex flex-row w-full items-center gap-2">
                                                                <Label>Present: </Label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder=""
                                                                    value={methodState.Present ?? ""}
                                                                    onChange={(e) => handleChange("Present", e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="flex flex-row w-full items-center gap-2">
                                                                <Label>Absent: </Label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder=""
                                                                    value={methodState.Absent ?? ""}
                                                                    onChange={(e) => handleChange("Absent", e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle/>
                            <ResizablePanel defaultSize={33}>
                                <ResizablePanelGroup direction="horizontal">
                                    <ResizablePanel defaultSize={65}>
                                        <div className="flex flex-col h-full gap-2 p-2">
                                            <Label className="font-bold">Transform Values</Label>
                                            <div className="flex flex-row gap-2">
                                                <div className="pt-1">
                                                    <Label>Standardize</Label>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <Select
                                                        value={methodState.StandardizeMethod ?? "None"}
                                                        defaultValue={methodState.StandardizeMethod ?? "None"}
                                                        onValueChange={(value) => handleChange("StandardizeMethod", value)}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue placeholder="Select a fruit"/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>Fruits</SelectLabel>
                                                                <SelectItem value="None">None</SelectItem>
                                                                <SelectItem value="banana">Banana</SelectItem>
                                                                <SelectItem value="blueberry">Blueberry</SelectItem>
                                                                <SelectItem value="grapes">Grapes</SelectItem>
                                                                <SelectItem value="pineapple">Pineapple</SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    <RadioGroup
                                                        defaultValue="ByVariable"
                                                        value={methodState.ByVariable ? "ByVariable" : methodState.ByCase ? "ByCase" : "ByVariable"}
                                                        onValueChange={handleTransformGrp}
                                                    >
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="ByVariable" id="ByVariable"/>
                                                                <Label htmlFor="ByVariable">
                                                                    By Variable
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="ByCase" id="ByCase"/>
                                                                <Label htmlFor="ByCase">
                                                                    By Case
                                                                </Label>
                                                            </div>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            </div>
                                        </div>
                                    </ResizablePanel>
                                    <ResizableHandle/>
                                    <ResizablePanel defaultSize={35}>
                                        <div className="flex flex-col h-full gap-2 p-2">
                                            <Label className="font-bold">Transform Measure</Label>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="AbsValue"
                                                        checked={methodState.AbsValue}
                                                        onCheckedChange={(checked) => handleChange("AbsValue", checked)}
                                                    />
                                                    <label
                                                        htmlFor="AbsValue"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Absolute Values
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="ChangeSign"
                                                        checked={methodState.ChangeSign}
                                                        onCheckedChange={(checked) => handleChange("ChangeSign", checked)}
                                                    />
                                                    <label
                                                        htmlFor="ChangeSign"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Change Sign
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="RescaleRange"
                                                        checked={methodState.RescaleRange}
                                                        onCheckedChange={(checked) => handleChange("RescaleRange", checked)}
                                                    />
                                                    <label
                                                        htmlFor="RescaleRange"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Rescale to 0-1 Range
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsMethodOpen(false)}>
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
