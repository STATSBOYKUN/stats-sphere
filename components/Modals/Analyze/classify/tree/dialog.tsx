import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { TreeDialogProps, TreeMainType } from "@/models/classify/tree/tree";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GROWINGMETHOD } from "@/constants/classify/tree/tree-method";

export const TreeDialog = ({
    isMainOpen,
    setIsMainOpen,
    setIsCategoriesOpen,
    setIsOutputOpen,
    setIsValidationOpen,
    setIsCriteriaOpen,
    setIsSaveOpen,
    setIsOptionsOpen,
    updateFormData,
    data,
    globalVariables,
    onContinue,
    onReset,
}: TreeDialogProps) => {
    const [mainState, setMainState] = useState<TreeMainType>({ ...data });

    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    useEffect(() => {
        if (isMainOpen) {
            setMainState({ ...data });
        }
    }, [isMainOpen, data]);

    const handleChange = (
        field: keyof TreeMainType,
        value: CheckedState | number | string | null
    ) => {
        setMainState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof TreeMainType, value);
        });
        setIsMainOpen(false);
    };

    const openDialog =
        (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
            setter(true);
        };

    return (
        <>
            {/* Main Dialog */}
            <Dialog open={isMainOpen} onOpenChange={setIsMainOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">Decision Tree</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Decision Tree</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex items-center space-x-2">
                        <ResizablePanelGroup
                            direction="horizontal"
                            className="min-h-[400px] rounded-lg border md:min-w-[200px]"
                        >
                            {/* Variable List */}
                            <ResizablePanel defaultSize={25}>
                                <div className="flex h-full items-center justify-center p-2">
                                    <span className="font-semibold">
                                        List Variabel
                                    </span>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />

                            {/* Defining Variable */}
                            <ResizablePanel defaultSize={55}>
                                <div className="flex flex-col h-full w-full items-start justify-start gap-2 p-2">
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            Dependent Variable:{" "}
                                        </Label>
                                        <Input
                                            id="DependentTargetVar"
                                            type="text"
                                            className="w-full"
                                            placeholder=""
                                            value={
                                                mainState.DependentTargetVar ??
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "DependentTargetVar",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={openDialog(
                                                setIsCategoriesOpen
                                            )}
                                        >
                                            Categories...
                                        </Button>
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            Independent Variables:{" "}
                                        </Label>
                                        <Input
                                            id="InDependentTargetVar"
                                            type="text"
                                            className="w-full min-h-[150px]"
                                            placeholder=""
                                            value={
                                                mainState.InDependentTargetVar ??
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "InDependentTargetVar",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="Force"
                                            checked={mainState.Force}
                                            onCheckedChange={(checked) =>
                                                handleChange("Force", checked)
                                            }
                                        />
                                        <label
                                            htmlFor="Force"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Force first variable
                                        </label>
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            Influence Variable:{" "}
                                        </Label>
                                        <Input
                                            id="InfluenceTargetVar"
                                            type="text"
                                            className="w-full"
                                            placeholder=""
                                            value={
                                                mainState.InfluenceTargetVar ??
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "InfluenceTargetVar",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="w-full">
                                        <Label className="font-bold">
                                            Growing Method:{" "}
                                        </Label>
                                        <Select
                                            value={
                                                mainState.GrowingMethod ?? ""
                                            }
                                            onValueChange={(value) =>
                                                handleChange(
                                                    "GrowingMethod",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {GROWINGMETHOD.map(
                                                        (method, index) => (
                                                            <SelectItem
                                                                key={index}
                                                                value={method}
                                                            >
                                                                {capitalize(
                                                                    method
                                                                ) + "'s Method"}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </ResizablePanel>

                            {/* Tools Area */}
                            <ResizablePanel defaultSize={20}>
                                <div className="flex flex-col h-full items-start justify-start gap-1 p-2">
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsOutputOpen)}
                                    >
                                        Output...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(
                                            setIsValidationOpen
                                        )}
                                    >
                                        Validation...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsCriteriaOpen)}
                                    >
                                        Criteria...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsSaveOpen)}
                                    >
                                        Save...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsOptionsOpen)}
                                    >
                                        Options...
                                    </Button>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button type="button" onClick={handleContinue}>
                            OK
                        </Button>
                        <Button type="button" variant="secondary">
                            Reset
                        </Button>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="button" variant="secondary">
                            Help
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
