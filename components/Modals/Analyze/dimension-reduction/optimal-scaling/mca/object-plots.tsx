import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    OptScaMCAObjectPlotsProps,
    OptScaMCAObjectPlotsType,
} from "@/models/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { CheckedState } from "@radix-ui/react-checkbox";

export const OptScaMCAObjectPlots = ({
    isObjectPlotsOpen,
    setIsObjectPlotsOpen,
    updateFormData,
    data,
}: OptScaMCAObjectPlotsProps) => {
    const [objectPlotsState, setObjectPlotsState] =
        useState<OptScaMCAObjectPlotsType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    useEffect(() => {
        if (isObjectPlotsOpen) {
            setObjectPlotsState({ ...data });
        }
    }, [isObjectPlotsOpen, data]);

    const handleChange = (
        field: keyof OptScaMCAObjectPlotsType,
        value: CheckedState | number | string | null
    ) => {
        setObjectPlotsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleBTInclude = (value: string) => {
        setObjectPlotsState((prevState) => ({
            ...prevState,
            BTIncludeAllVars: value === "BTIncludeAllVars",
            BTIncludeSelectedVars: value === "BTIncludeSelectedVars",
        }));
    };

    const handleLabelObj = (value: string) => {
        setObjectPlotsState((prevState) => ({
            ...prevState,
            LabelObjLabelByCaseNumber: value === "LabelObjLabelByCaseNumber",
            LabelObjLabelByVar: value === "LabelObjLabelByVar",
        }));
    };

    const handleContinue = () => {
        Object.entries(objectPlotsState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaMCAObjectPlotsType, value);
        });
        setIsObjectPlotsOpen(false);
    };

    return (
        <>
            {/* Object Plots Dialog */}
            <Dialog
                open={isObjectPlotsOpen}
                onOpenChange={setIsObjectPlotsOpen}
            >
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            Multiple Correspondence Analysis: Object Plots
                        </DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="h-[450px] flex flex-col gap-2">
                        <ScrollArea>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[575px] max-w-xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={15}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Plots
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="ObjectPoints"
                                                checked={
                                                    objectPlotsState.ObjectPoints
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "ObjectPoints",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="ObjectPoints"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Object Points
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="Biplot"
                                                checked={
                                                    objectPlotsState.Biplot
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "Biplot",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="Biplot"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Object and Variable (Biplot)
                                            </label>
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={45}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Biplot Variables
                                        </Label>
                                        <ResizablePanelGroup direction="horizontal">
                                            <ResizablePanel defaultSize={65}>
                                                <div className="grid grid-cols-2 gap-2 p-2">
                                                    <div className="flex flex-col gap-2">
                                                        <Label>Include: </Label>
                                                        <RadioGroup
                                                            value={
                                                                objectPlotsState.BTIncludeAllVars
                                                                    ? "BTIncludeAllVars"
                                                                    : "BTIncludeSelectedVars"
                                                            }
                                                            onValueChange={
                                                                handleBTInclude
                                                            }
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="BTIncludeAllVars"
                                                                    id="BTIncludeAllVars"
                                                                />
                                                                <Label htmlFor="BTIncludeAllVars">
                                                                    All
                                                                    Variables
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="BTIncludeSelectedVars"
                                                                    id="BTIncludeSelectedVars"
                                                                />
                                                                <Label htmlFor="BTIncludeSelectedVars">
                                                                    Selected
                                                                    Variables
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label>
                                                            Available:{" "}
                                                        </Label>
                                                        <Input
                                                            id="BTAvailableVars"
                                                            type="text"
                                                            className="w-full min-h-[175px]"
                                                            placeholder=""
                                                            value={
                                                                objectPlotsState.BTAvailableVars ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "BTAvailableVars",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle withHandle />
                                            <ResizablePanel defaultSize={35}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label>Selected: </Label>
                                                    <Input
                                                        id="BTSelectedVars"
                                                        type="text"
                                                        className="w-full min-h-[175px]"
                                                        placeholder=""
                                                        value={
                                                            objectPlotsState.BTSelectedVars ??
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "BTSelectedVars",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={40}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Label Objects
                                        </Label>
                                        <ResizablePanelGroup direction="horizontal">
                                            <ResizablePanel defaultSize={65}>
                                                <div className="grid grid-cols-2 gap-2 p-2">
                                                    <div className="flex flex-col gap-2">
                                                        <Label>
                                                            Label By:{" "}
                                                        </Label>
                                                        <RadioGroup
                                                            value={
                                                                objectPlotsState.LabelObjLabelByCaseNumber
                                                                    ? "LabelObjLabelByCaseNumber"
                                                                    : "LabelObjLabelByVar"
                                                            }
                                                            onValueChange={
                                                                handleLabelObj
                                                            }
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="LabelObjLabelByCaseNumber"
                                                                    id="LabelObjLabelByCaseNumber"
                                                                />
                                                                <Label htmlFor="LabelObjLabelByCaseNumber">
                                                                    Case Number
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="LabelObjLabelByVar"
                                                                    id="LabelObjLabelByVar"
                                                                />
                                                                <Label htmlFor="LabelObjLabelByVar">
                                                                    Variable
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label>
                                                            Available:{" "}
                                                        </Label>
                                                        <Input
                                                            id="LabelObjAvailableVars"
                                                            type="text"
                                                            className="w-full min-h-[150px]"
                                                            placeholder=""
                                                            value={
                                                                objectPlotsState.LabelObjAvailableVars ??
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "LabelObjAvailableVars",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle withHandle />
                                            <ResizablePanel defaultSize={35}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <Label>Selected: </Label>
                                                    <Input
                                                        id="LabelObjSelectedVars"
                                                        type="text"
                                                        className="w-full min-h-[150px]"
                                                        placeholder=""
                                                        value={
                                                            objectPlotsState.LabelObjSelectedVars ??
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "LabelObjSelectedVars",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ScrollArea>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            disabled={isContinueDisabled}
                            type="button"
                            onClick={handleContinue}
                        >
                            Continue
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsObjectPlotsOpen(false)}
                        >
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
