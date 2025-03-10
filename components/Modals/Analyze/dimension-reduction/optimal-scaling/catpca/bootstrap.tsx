import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    OptScaCatpcaBootstrapProps,
    OptScaCatpcaBootstrapType
} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {CheckedState} from "@radix-ui/react-checkbox";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Input} from "@/components/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {DISCRETIZEMETHOD} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-sca-method";
import { ScrollArea } from "@/components/ui/scroll-area";

export const OptScaCatpcaBootstrap = ({
                                          isBootstrapOpen,
                                          setIsBootstrapOpen,
                                          updateFormData,
                                          data
                                      }: OptScaCatpcaBootstrapProps) => {
    const [bootstrapState, setBootstrapState] = useState<OptScaCatpcaBootstrapType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    useEffect(() => {
        if (isBootstrapOpen) {
            setBootstrapState({...data});
        }
    }, [isBootstrapOpen, data]);

    const handleChange = (field: keyof OptScaCatpcaBootstrapType, value: CheckedState | number | string | null) => {
        setBootstrapState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleBootsGrp = (value: string) => {
        setBootstrapState((prevState) => ({
            ...prevState,
            Balanced: value === "Balanced",
            Unbalanced: value === "Unbalanced",
        }));
    };

    const handleMatchGrp = (value: string) => {
        setBootstrapState((prevState) => ({
            ...prevState,
            Procrustes: value === "Procrustes",
            Reflection: value === "Reflection",
        }));
    };

    const handleContinue = () => {
        Object.entries(bootstrapState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaCatpcaBootstrapType, value);
        });
        setIsBootstrapOpen(false);
    };

    return (
        <>
            {/* Bootstrap Dialog */}
            <Dialog open={isBootstrapOpen} onOpenChange={setIsBootstrapOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Categorical Principal Components: Bootstrap</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="h-[450px] flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="PerformBT"
                                checked={bootstrapState.PerformBT}
                                onCheckedChange={(checked) => handleChange("PerformBT", checked)}
                            />
                            <label
                                htmlFor="PerformBT"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Perform Bootstrap
                            </label>
                        </div>
                        <ScrollArea>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[665px] max-w-xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={18}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <RadioGroup
                                            value={bootstrapState.Balanced ? "Balanced" : "Unbalanced"}
                                            onValueChange={handleBootsGrp}
                                        >
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Balanced" id="Balanced"/>
                                                    <Label htmlFor="Balanced">
                                                        Balanced
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Unbalanced" id="Unbalanced"/>
                                                    <Label htmlFor="Unbalanced">
                                                        Unbalanced
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                        <div className="flex items-center space-x-2">
                                            <Label className="w-[150px]">Number of Samples:</Label>
                                            <div className="w-[75px]">
                                                <Input
                                                    id="NumberSamples"
                                                    type="number"
                                                    placeholder=""
                                                    value={bootstrapState.NumberSamples || ""}
                                                    onChange={(e) => handleChange("NumberSamples", Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Label className="w-[150px]">Confidence Level (%):</Label>
                                            <div className="w-[75px]">
                                                <Input
                                                    id="ConfLevel"
                                                    type="number"
                                                    placeholder=""
                                                    value={bootstrapState.ConfLevel || ""}
                                                    onChange={(e) => handleChange("ConfLevel", Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={8}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Matching Method</Label>
                                        <RadioGroup
                                            value={bootstrapState.Procrustes ? "Procrustes" : "Reflection"}
                                            onValueChange={handleMatchGrp}
                                        >
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Procrustes" id="Procrustes"/>
                                                    <Label htmlFor="Procrustes">
                                                        Procrustes
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Reflection" id="Reflection"/>
                                                    <Label htmlFor="Reflection">
                                                        Reflection
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={74}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Confidence Ellipses</Label>
                                        <div className="flex flex-col gap-2 p-2">
                                            <Label>Loading Plot</Label>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[250px]">Threshold Area</TableHead>
                                                        <TableHead className="w-[75px]">Operator</TableHead>
                                                        <TableHead className="w-[100px]">Value</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell>
                                                            <Select
                                                                value={bootstrapState.ThresholdLoading ?? ""}
                                                                onValueChange={(value) => handleChange("ThresholdLoading", value)}
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
                                                        </TableCell>
                                                        <TableCell>
                                                            <Select
                                                                value={bootstrapState.OperatorLoading ?? ""}
                                                                onValueChange={(value) => handleChange("OperatorLoading", value)}
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
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                id="ValueLoading"
                                                                type="number"
                                                                placeholder=""
                                                                value={bootstrapState.ValueLoading || ""}
                                                                onChange={(e) => handleChange("ValueLoading", Number(e.target.value))}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                        <div className="flex flex-col gap-2 p-2">
                                            <Label>Object Plot</Label>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[250px]">Threshold Area</TableHead>
                                                        <TableHead className="w-[75px]">Operator</TableHead>
                                                        <TableHead className="w-[100px]">Value</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell>
                                                            <Select
                                                                value={bootstrapState.ThresholdObject ?? ""}
                                                                onValueChange={(value) => handleChange("ThresholdObject", value)}
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
                                                        </TableCell>
                                                        <TableCell>
                                                            <Select
                                                                value={bootstrapState.OperatorObject ?? ""}
                                                                onValueChange={(value) => handleChange("OperatorObject", value)}
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
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                id="ValueObject"
                                                                type="number"
                                                                placeholder=""
                                                                value={bootstrapState.ValueObject || ""}
                                                                onChange={(e) => handleChange("ValueObject", Number(e.target.value))}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                        <div className="flex flex-col gap-2 p-2">
                                            <Label>Category Plot</Label>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[250px]">Threshold Area</TableHead>
                                                        <TableHead className="w-[75px]">Operator</TableHead>
                                                        <TableHead className="w-[100px]">Value</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell>
                                                            <Select
                                                                value={bootstrapState.ThresholdCategory ?? ""}
                                                                onValueChange={(value) => handleChange("ThresholdCategory", value)}
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
                                                        </TableCell>
                                                        <TableCell>
                                                            <Select
                                                                value={bootstrapState.OperatorCategory ?? ""}
                                                                onValueChange={(value) => handleChange("OperatorCategory", value)}
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
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                id="ValueCategory"
                                                                type="number"
                                                                placeholder=""
                                                                value={bootstrapState.ValueCategory || ""}
                                                                onChange={(e) => handleChange("ValueCategory", Number(e.target.value))}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Label className="w-[250px]">Number of Ellipse Contour Points:</Label>
                                            <div className="w-[75px]">
                                                <Input
                                                    id="NumberPoints"
                                                    type="number"
                                                    placeholder=""
                                                    value={bootstrapState.NumberPoints || ""}
                                                    onChange={(e) => handleChange("NumberPoints", Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ScrollArea>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsBootstrapOpen(false)}>
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
