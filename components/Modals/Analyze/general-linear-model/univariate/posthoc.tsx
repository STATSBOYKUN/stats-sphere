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
    UnivariatePostHocProps,
    UnivariatePostHocType,
} from "@/models/general-linear-model/univariate/univariate";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BUILDTERMMETHOD,
    DUNNETMETHOD,
} from "@/constants/general-linear-model/multivariate/multivariate-method";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Badge } from "@/components/ui/badge";

export const UnivariatePostHoc = ({
    isPostHocOpen,
    setIsPostHocOpen,
    updateFormData,
    data,
}: UnivariatePostHocProps) => {
    const [postHocState, setPostHocState] = useState<UnivariatePostHocType>({
        ...data,
    });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);

    useEffect(() => {
        if (isPostHocOpen) {
            setPostHocState({ ...data });
            setAvailableVariables(data.SrcList ?? []);
        }
    }, [isPostHocOpen, data]);

    const handleChange = (
        field: keyof UnivariatePostHocType,
        value: CheckedState | number | string | null
    ) => {
        setPostHocState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDrop = (target: string, variable: string) => {
        setPostHocState((prev) => {
            const updatedState = { ...prev };

            // Add to target array if it doesn't already exist in that array
            if (target === "FixFactorVars") {
                const currentArray = Array.isArray(updatedState.FixFactorVars)
                    ? updatedState.FixFactorVars
                    : updatedState.FixFactorVars
                    ? [updatedState.FixFactorVars]
                    : [];

                if (!currentArray.includes(variable)) {
                    updatedState.FixFactorVars = [...currentArray, variable];
                }
            }

            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setPostHocState((prev) => {
            const updatedState = { ...prev };

            if (
                target === "FixFactorVars" &&
                Array.isArray(updatedState.FixFactorVars)
            ) {
                updatedState.FixFactorVars = updatedState.FixFactorVars.filter(
                    (item) => item !== variable
                );
            }

            return updatedState;
        });
    };

    const handleContinue = () => {
        Object.entries(postHocState).forEach(([key, value]) => {
            updateFormData(key as keyof UnivariatePostHocType, value);
        });
        setIsPostHocOpen(false);
    };

    return (
        <>
            {/* Post Hoc Dialog */}
            <Dialog open={isPostHocOpen} onOpenChange={setIsPostHocOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Univariate: Post Hoc</DialogTitle>
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
                                                    <ScrollArea className="h-[175px] w-full p-2 border rounded">
                                                        <div className="flex flex-col gap-1 justify-start items-start">
                                                            {availableVariables.map(
                                                                (
                                                                    variable: string,
                                                                    index: number
                                                                ) => (
                                                                    <Badge
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="w-full text-start text-sm font-light p-2 cursor-pointer"
                                                                        variant="outline"
                                                                        draggable
                                                                        onDragStart={(
                                                                            e
                                                                        ) =>
                                                                            e.dataTransfer.setData(
                                                                                "text",
                                                                                variable
                                                                            )
                                                                        }
                                                                    >
                                                                        {
                                                                            variable
                                                                        }
                                                                    </Badge>
                                                                )
                                                            )}
                                                        </div>
                                                    </ScrollArea>
                                                </div>
                                            </ResizablePanel>
                                            <ResizableHandle withHandle />
                                            <ResizablePanel defaultSize={50}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <div
                                                        className="flex flex-col w-full gap-2"
                                                        onDragOver={(e) =>
                                                            e.preventDefault()
                                                        }
                                                        onDrop={(e) => {
                                                            const variable =
                                                                e.dataTransfer.getData(
                                                                    "text"
                                                                );
                                                            handleDrop(
                                                                "FixFactorVars",
                                                                variable
                                                            );
                                                        }}
                                                    >
                                                        <Label>
                                                            Post Hoc Tests for:{" "}
                                                        </Label>
                                                        <div className="w-full h-[175px] p-2 border rounded overflow-hidden">
                                                            <ScrollArea>
                                                                <div className="w-full h-[155px]">
                                                                    {Array.isArray(
                                                                        postHocState.FixFactorVars
                                                                    ) &&
                                                                    postHocState
                                                                        .FixFactorVars
                                                                        .length >
                                                                        0 ? (
                                                                        <div className="flex flex-col gap-1">
                                                                            {postHocState.FixFactorVars.map(
                                                                                (
                                                                                    variable,
                                                                                    index
                                                                                ) => (
                                                                                    <Badge
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                        className="text-start text-sm font-light p-2 cursor-pointer"
                                                                                        variant="outline"
                                                                                        onClick={() =>
                                                                                            handleRemoveVariable(
                                                                                                "FixFactorVars",
                                                                                                variable
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            variable
                                                                                        }
                                                                                    </Badge>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-sm font-light text-gray-500">
                                                                            Drop
                                                                            variables
                                                                            here.
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </ScrollArea>
                                                        </div>
                                                        <input
                                                            type="hidden"
                                                            value={
                                                                postHocState.FixFactorVars ??
                                                                ""
                                                            }
                                                            name="FixFactorVars"
                                                        />
                                                    </div>
                                                </div>
                                            </ResizablePanel>
                                        </ResizablePanelGroup>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={45}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Equal Variances Assumed
                                        </Label>
                                        <ResizablePanelGroup direction="horizontal">
                                            <ResizablePanel defaultSize={50}>
                                                <div className="grid grid-cols-2 gap-2 p-2">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="Lsd"
                                                                checked={
                                                                    postHocState.Lsd
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleChange(
                                                                        "Lsd",
                                                                        checked
                                                                    )
                                                                }
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
                                                                checked={
                                                                    postHocState.Bonfe
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleChange(
                                                                        "Bonfe",
                                                                        checked
                                                                    )
                                                                }
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
                                                                checked={
                                                                    postHocState.Sidak
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleChange(
                                                                        "Sidak",
                                                                        checked
                                                                    )
                                                                }
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
                                                                checked={
                                                                    postHocState.Scheffe
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleChange(
                                                                        "Scheffe",
                                                                        checked
                                                                    )
                                                                }
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
                                                                checked={
                                                                    postHocState.Regwf
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleChange(
                                                                        "Regwf",
                                                                        checked
                                                                    )
                                                                }
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
                                                                checked={
                                                                    postHocState.Regwq
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleChange(
                                                                        "Regwq",
                                                                        checked
                                                                    )
                                                                }
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
                                                                checked={
                                                                    postHocState.Snk
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleChange(
                                                                        "Snk",
                                                                        checked
                                                                    )
                                                                }
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
                                                                checked={
                                                                    postHocState.Tu
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleChange(
                                                                        "Tu",
                                                                        checked
                                                                    )
                                                                }
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
                                                                checked={
                                                                    postHocState.Tub
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleChange(
                                                                        "Tub",
                                                                        checked
                                                                    )
                                                                }
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
                                                                checked={
                                                                    postHocState.Dun
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleChange(
                                                                        "Dun",
                                                                        checked
                                                                    )
                                                                }
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
                                                                checked={
                                                                    postHocState.Hoc
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleChange(
                                                                        "Hoc",
                                                                        checked
                                                                    )
                                                                }
                                                            />
                                                            <label
                                                                htmlFor="Hoc"
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Hochberg&apos;s
                                                                GT2
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="Gabriel"
                                                                checked={
                                                                    postHocState.Gabriel
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handleChange(
                                                                        "Gabriel",
                                                                        checked
                                                                    )
                                                                }
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
                                            <ResizableHandle />
                                            <ResizablePanel defaultSize={50}>
                                                <div className="flex flex-col gap-2 p-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="Waller"
                                                            checked={
                                                                postHocState.Waller
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                handleChange(
                                                                    "Waller",
                                                                    checked
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor="Waller"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Waller-Duncan
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-2 pl-6">
                                                        <Label className="w-[150px]">
                                                            Type I/Type II Error
                                                            Ratio:
                                                        </Label>
                                                        <div className="w-[75px]">
                                                            <Input
                                                                id="ErrorRatio"
                                                                type="number"
                                                                placeholder=""
                                                                value={
                                                                    postHocState.ErrorRatio ??
                                                                    ""
                                                                }
                                                                disabled={
                                                                    !postHocState.Waller
                                                                }
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        "ErrorRatio",
                                                                        Number(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="Dunnett"
                                                            checked={
                                                                postHocState.Dunnett
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                handleChange(
                                                                    "Dunnett",
                                                                    checked
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor="Dunnett"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Dunnett
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-2 pl-6">
                                                        <Label className="w-[150px]">
                                                            Category Control:
                                                        </Label>
                                                        <Select
                                                            value={
                                                                postHocState.CategoryMethod ??
                                                                ""
                                                            }
                                                            disabled={
                                                                !postHocState.Dunnett
                                                            }
                                                            onValueChange={(
                                                                value
                                                            ) =>
                                                                handleChange(
                                                                    "CategoryMethod",
                                                                    value
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="w-[150px]">
                                                                <SelectGroup>
                                                                    {DUNNETMETHOD.map(
                                                                        (
                                                                            method,
                                                                            index
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    index
                                                                                }
                                                                                value={
                                                                                    method.value
                                                                                }
                                                                            >
                                                                                {
                                                                                    method.name
                                                                                }
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <Label className="font-bold">
                                                        Test
                                                    </Label>
                                                    <RadioGroup>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="Twosided"
                                                                    id="Twosided"
                                                                />
                                                                <Label htmlFor="Twosided">
                                                                    2-Sided
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="LtControl"
                                                                    id="LtControl"
                                                                />
                                                                <Label htmlFor="LtControl">
                                                                    &lt; Control
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="GtControl"
                                                                    id="GtControl"
                                                                />
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
                                <ResizableHandle />
                                <ResizablePanel defaultSize={10}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Equal Variances Not Assumed
                                        </Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="Tam"
                                                    checked={postHocState.Tam}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "Tam",
                                                            checked
                                                        )
                                                    }
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
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "Dunt",
                                                            checked
                                                        )
                                                    }
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
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "Games",
                                                            checked
                                                        )
                                                    }
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
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        handleChange(
                                                            "Dunc",
                                                            checked
                                                        )
                                                    }
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
                            onClick={() => setIsPostHocOpen(false)}
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
