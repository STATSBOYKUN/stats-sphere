import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    RepeatedMeasuresPostHocProps,
    RepeatedMeasuresPostHocType
} from "@/models/general-linear-model/repeated-measures/repeated-measures";
import {ScrollArea} from "@/components/ui/scroll-area";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {BUILDTERMMETHOD} from "@/constants/general-linear-model/multivariate/multivariate-method";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {CheckedState} from "@radix-ui/react-checkbox";

export const RepeatedMeasuresPostHoc = ({ isPostHocOpen, setIsPostHocOpen, updateFormData, data }: RepeatedMeasuresPostHocProps) => {
    const [postHocState, setPostHocState] = useState<RepeatedMeasuresPostHocType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    useEffect(() => {
        if (isPostHocOpen) {
            setPostHocState({ ...data });
        }
    }, [isPostHocOpen, data]);

    const handleChange = (field: keyof RepeatedMeasuresPostHocType, value: CheckedState | number | string | null) => {
        setPostHocState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(postHocState).forEach(([key, value]) => {
            updateFormData(key as keyof RepeatedMeasuresPostHocType, value);
        });
        setIsPostHocOpen(false);
    };

    return (
        <>
            {/* Post Hoc Dialog */}
            <Dialog open={isPostHocOpen} onOpenChange={setIsPostHocOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Repeated Measures: Post Hoc</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="h-[450px] flex flex-col gap-2">
                        <ScrollArea>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[525px] max-w-2xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={45}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <ResizablePanelGroup direction="horizontal">
                                            <ResizablePanel defaultSize={50}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label>Factor(s): </Label>
                                                    <Input
                                                        id="SrcList"
                                                        type="text"
                                                        className="w-full min-h-[175px]"
                                                        placeholder=""
                                                        value={postHocState.SrcList ?? ""}
                                                        onChange={(e) => handleChange("SrcList", e.target.value)}
                                                    />
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle withHandle/>
                                            <ResizablePanel defaultSize={50}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label>Post Hoc Tests for: </Label>
                                                    <Input
                                                        id="FixFactorVars"
                                                        type="text"
                                                        className="w-full min-h-[175px]"
                                                        placeholder=""
                                                        value={postHocState.FixFactorVars ?? ""}
                                                        onChange={(e) => handleChange("FixFactorVars", e.target.value)}
                                                    />
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={45}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Equal Variances Assumed</Label>
                                        <ResizablePanelGroup direction="horizontal">
                                            <ResizablePanel defaultSize={50}>
                                                <div className="grid grid-cols-2 gap-2 p-2">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="Lsd"
                                                                checked={postHocState.Lsd}
                                                                onCheckedChange={(checked) => handleChange("Lsd", checked)}
                                                            />
                                                            <label
                                                                htmlFor="Lsd"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                LSD
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="Bonfe"
                                                                checked={postHocState.Bonfe}
                                                                onCheckedChange={(checked) => handleChange("Bonfe", checked)}
                                                            />
                                                            <label
                                                                htmlFor="Bonfe"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Bonferroni
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="Sidak"
                                                                checked={postHocState.Sidak}
                                                                onCheckedChange={(checked) => handleChange("Sidak", checked)}
                                                            />
                                                            <label
                                                                htmlFor="Sidak"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Sidak
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="Scheffe"
                                                                checked={postHocState.Scheffe}
                                                                onCheckedChange={(checked) => handleChange("Scheffe", checked)}
                                                            />
                                                            <label
                                                                htmlFor="Scheffe"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Scheffe
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="Regwf"
                                                                checked={postHocState.Regwf}
                                                                onCheckedChange={(checked) => handleChange("Regwf", checked)}
                                                            />
                                                            <label
                                                                htmlFor="Regwf"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                R-E-G-W-F
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="Regwq"
                                                                checked={postHocState.Regwq}
                                                                onCheckedChange={(checked) => handleChange("Regwq", checked)}
                                                            />
                                                            <label
                                                                htmlFor="Regwq"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                R-E-G-W-Q
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="Snk"
                                                                checked={postHocState.Snk}
                                                                onCheckedChange={(checked) => handleChange("Snk", checked)}
                                                            />
                                                            <label
                                                                htmlFor="Snk"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                SNK
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="Tu"
                                                                checked={postHocState.Tu}
                                                                onCheckedChange={(checked) => handleChange("Tu", checked)}
                                                            />
                                                            <label
                                                                htmlFor="Tu"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Tukey
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="Tub"
                                                                checked={postHocState.Tub}
                                                                onCheckedChange={(checked) => handleChange("Tub", checked)}
                                                            />
                                                            <label
                                                                htmlFor="Tub"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Tukey&apos;s B
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="Dun"
                                                                checked={postHocState.Dun}
                                                                onCheckedChange={(checked) => handleChange("Dun", checked)}
                                                            />
                                                            <label
                                                                htmlFor="Dun"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Duncan
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="Hoc"
                                                                checked={postHocState.Hoc}
                                                                onCheckedChange={(checked) => handleChange("Hoc", checked)}
                                                            />
                                                            <label
                                                                htmlFor="Hoc"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Hochberg&apos;s GT2
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="Gabriel"
                                                                checked={postHocState.Gabriel}
                                                                onCheckedChange={(checked) => handleChange("Gabriel", checked)}
                                                            />
                                                            <label
                                                                htmlFor="Gabriel"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Gabriel
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle/>
                                            <ResizablePanel defaultSize={50}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="Waller"
                                                            checked={postHocState.Waller}
                                                            onCheckedChange={(checked) => handleChange("Waller", checked)}
                                                        />
                                                        <label
                                                            htmlFor="Waller"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Waller-Duncan
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-2 pl-6">
                                                        <Label className="w-[150px]">Type I/Type II Error Ratio:</Label>
                                                        <div className="w-[75px]">
                                                            <Input
                                                                id="ErrorRatio"
                                                                type="number"
                                                                placeholder=""
                                                                value={postHocState.ErrorRatio || ""}
                                                                onChange={(e) => handleChange("ErrorRatio", Number(e.target.value))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="Dunnett"
                                                            checked={postHocState.Dunnett}
                                                            onCheckedChange={(checked) => handleChange("Dunnett", checked)}
                                                        />
                                                        <label
                                                            htmlFor="Dunnett"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Dunnett
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-2 pl-6">
                                                        <Label className="w-[150px]">Category Control:</Label>
                                                        <Select
                                                            value={postHocState.CategoryMethod ?? ""}
                                                            onValueChange={(value) => handleChange("CategoryMethod", value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue/>
                                                            </SelectTrigger>
                                                            <SelectContent
                                                                className="w-[150px]"
                                                            >
                                                                <SelectGroup>
                                                                    {BUILDTERMMETHOD.map((method, index) => (
                                                                        <SelectItem key={index}
                                                                                    value={method}>{capitalize(method) + "'s Method"}</SelectItem>
                                                                    ))}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <Label className="font-bold">Test</Label>
                                                    <RadioGroup

                                                    >
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="Twosided" id="Twosided"/>
                                                                <Label htmlFor="Twosided">
                                                                    2-Sided
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="LtControl" id="LtControl"/>
                                                                <Label htmlFor="LtControl">
                                                                    &lt; Control
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="GtControl" id="GtControl"/>
                                                                <Label htmlFor="GtControl">
                                                                    &gt; Control
                                                                </Label>
                                                            </div>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={10}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Equal Variances Not Assumed</Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="Tam"
                                                    checked={postHocState.Tam}
                                                    onCheckedChange={(checked) => handleChange("Tam", checked)}
                                                />
                                                <label
                                                    htmlFor="Tam"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Tamhane&apos;s T2
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="Dunt"
                                                    checked={postHocState.Dunt}
                                                    onCheckedChange={(checked) => handleChange("Dunt", checked)}
                                                />
                                                <label
                                                    htmlFor="Dunt"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Dunnett&apos;s T3
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="Games"
                                                    checked={postHocState.Games}
                                                    onCheckedChange={(checked) => handleChange("Games", checked)}
                                                />
                                                <label
                                                    htmlFor="Games"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Games-Howell
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="Dunc"
                                                    checked={postHocState.Dunc}
                                                    onCheckedChange={(checked) => handleChange("Dunc", checked)}
                                                />
                                                <label
                                                    htmlFor="Dunc"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Dunnett&apos;s C
                                                </label>
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
                        <Button type="button" variant="secondary" onClick={() => setIsPostHocOpen(false)}>
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
