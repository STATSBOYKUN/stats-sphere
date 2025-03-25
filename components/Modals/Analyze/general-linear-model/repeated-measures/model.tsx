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
    RepeatedMeasuresModelProps,
    RepeatedMeasuresModelType,
} from "@/models/general-linear-model/repeated-measures/repeated-measures";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
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
    SUMSQUARESMETHOD,
} from "@/constants/general-linear-model/multivariate/multivariate-method";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Badge } from "@/components/ui/badge";

export const RepeatedMeasuresModel = ({
    isModelOpen,
    setIsModelOpen,
    updateFormData,
    data,
}: RepeatedMeasuresModelProps) => {
    const [modelState, setModelState] = useState<RepeatedMeasuresModelType>({
        ...data,
    });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    // Add state for selected variable
    const [selectedVariable, setSelectedVariable] = useState<string | null>(
        null
    );

    // Add state for current build term
    const [currentBuildTerm, setCurrentBuildTerm] = useState<string>("");

    // Add state to track if a variable is within parentheses
    const [withinParentheses, setWithinParentheses] = useState<boolean>(false);
    const [parenthesesDepth, setParenthesesDepth] = useState<number>(0);

    // Add state for available variables
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);

    useEffect(() => {
        if (isModelOpen) {
            setModelState({ ...data });
            setAvailableVariables(data.BetSubVar ?? []);
            // Reset build term states
            setCurrentBuildTerm("");
            setSelectedVariable(null);
            setWithinParentheses(false);
            setParenthesesDepth(0);
        }
    }, [isModelOpen, data]);

    const handleChange = (
        field: keyof RepeatedMeasuresModelType,
        value: CheckedState | number | string | null
    ) => {
        setModelState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleSpecifyGrp = (value: string) => {
        setModelState((prevState) => ({
            ...prevState,
            NonCust: value === "NonCust",
            Custom: value === "Custom",
            BuildCustomTerm: value === "BuildCustomTerm",
        }));

        // Reset build term when changing modes
        setCurrentBuildTerm("");
    };

    const handleDrop = (target: string, variable: string) => {
        setModelState((prev) => {
            const updatedState = { ...prev };
            if (target === "BetSubModel") {
                updatedState.BetSubModel = [
                    ...(updatedState.BetSubModel || []),
                    variable,
                ];
            }
            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setModelState((prev) => {
            const updatedState = { ...prev };
            if (target === "BetSubModel") {
                updatedState.BetSubModel = (
                    updatedState.BetSubModel || []
                ).filter((item) => item !== variable);
            }
            return updatedState;
        });
    };

    // Handle variable selection
    const handleVariableClick = (variable: string) => {
        setSelectedVariable(variable);
    };

    // Perbaikan fungsi handleArrowClick untuk menangani placeholder {variable} dan mencegah nested variable yang sama
    const handleArrowClick = () => {
        if (selectedVariable) {
            // Jika term mengandung placeholder {variable}, periksa apakah kita mencoba menambahkan variabel yang sama
            if (currentBuildTerm.includes("{variable}")) {
                // Ekstrak variabel yang melakukan "wrap" (yang muncul sebelum placeholder)
                // Mencari pola seperti Name({variable}) atau Name(Other({variable}))
                const matches = currentBuildTerm.match(
                    /([^()\s]+)\((?:[^()\s]+\()*\{variable\}/
                );
                if (matches && matches[1] === selectedVariable) {
                    // Mencegah nested variable yang sama (misalnya Age(Age) atau Age(Year(Age)))
                    return; // Tidak melakukan apa-apa jika mencoba nested variable yang sama
                }

                // Jika tidak sama, ganti placeholder dengan variabel yang dipilih
                const newTerm = currentBuildTerm.replace(
                    "{variable}",
                    selectedVariable
                );
                setCurrentBuildTerm(newTerm);
            }
            // Jika term kosong, tambahkan variabel saja
            else if (currentBuildTerm.trim() === "") {
                setCurrentBuildTerm(selectedVariable);
            }
            // Jika term berakhir dengan "(" atau " * ", tambahkan variabel tanpa spasi tambahan
            else if (
                currentBuildTerm.endsWith("(") ||
                currentBuildTerm.endsWith(" * ")
            ) {
                setCurrentBuildTerm((prev) => prev + selectedVariable);
            }
            // Jika tidak, tambahkan spasi dan variabel
            else {
                setCurrentBuildTerm((prev) => prev + " " + selectedVariable);
            }
        }
    };

    // Perbaikan handleByClick untuk menangani term yang berisi placeholder {variable}
    const handleByClick = () => {
        // Jika term mengandung placeholder {variable}, tombol By tidak perlu diaktifkan
        if (currentBuildTerm.includes("{variable}")) {
            return;
        }

        // Pastikan term tidak kosong
        if (currentBuildTerm.trim() === "") {
            return;
        }

        // Hanya tambahkan "*" jika term tidak berakhir dengan * atau (
        if (
            !currentBuildTerm.endsWith(" * ") &&
            !currentBuildTerm.endsWith("(")
        ) {
            setCurrentBuildTerm((prev) => prev + " * ");
        }
    };

    // Perbaikan fungsi handleWithinClick untuk mendukung nested structures bertingkat
    const handleWithinClick = () => {
        // Pastikan term tidak kosong dan tidak mengandung placeholder
        if (
            currentBuildTerm.trim() === "" ||
            currentBuildTerm.includes("{variable}")
        ) {
            return;
        }

        // Jika term tidak berakhir dengan * atau (
        if (
            !currentBuildTerm.endsWith(" * ") &&
            !currentBuildTerm.endsWith("(")
        ) {
            let newTerm = currentBuildTerm;

            // Cek apakah term berakhir dengan kurung tutup
            if (newTerm.endsWith(")")) {
                // Kasus: term berakhir dengan ")" - seperti "Age(Year)" atau "Age(Year(Month))"
                // Kita ingin mengubahnya menjadi "Age(Year({variable}))" atau "Age(Year(Month({variable})))"

                // Temukan kurung tutup terakhir
                const lastClosingIndex = newTerm.lastIndexOf(")");

                // Sisipkan "({variable})" sebelum kurung tutup terakhir
                newTerm =
                    newTerm.substring(0, lastClosingIndex) +
                    "({variable})" +
                    newTerm.substring(lastClosingIndex);
            } else {
                // Kasus: term tidak berakhir dengan ")" - seperti "Age"
                // Kita ingin mengubahnya menjadi "Age({variable})"
                newTerm += "({variable})";
            }

            setCurrentBuildTerm(newTerm);
            setWithinParentheses(true);
            setParenthesesDepth((prev) => prev + 1);
            setSelectedVariable(null);
        }
    };

    // Perbaikan handleClearTermClick untuk me-reset state
    const handleClearTermClick = () => {
        setCurrentBuildTerm("");
        setWithinParentheses(false);
        setParenthesesDepth(0);
        setSelectedVariable(null);
    };

    // Handle Add button click - add the current build term to BetSubModel
    const handleAddTermClick = () => {
        if (currentBuildTerm.length > 0) {
            // Balance any open parentheses
            let term = currentBuildTerm;
            for (let i = 0; i < parenthesesDepth; i++) {
                term += ")";
            }

            // Add the term to BetSubModel
            setModelState((prev) => {
                const updatedState = { ...prev };
                updatedState.BetSubModel = [
                    ...(updatedState.BetSubModel || []),
                    term,
                ];
                return updatedState;
            });

            // Reset the current build term
            setCurrentBuildTerm("");
            setWithinParentheses(false);
            setParenthesesDepth(0);
        }
    };

    // Handle Remove button click - remove selected variable from BetSubModel
    const handleRemoveTermClick = () => {
        if (selectedVariable) {
            handleRemoveVariable("BetSubModel", selectedVariable);
        }
    };

    const handleContinue = () => {
        Object.entries(modelState).forEach(([key, value]) => {
            updateFormData(key as keyof RepeatedMeasuresModelType, value);
        });
        setIsModelOpen(false);
    };

    return (
        <>
            {/* Model Dialog */}
            <Dialog open={isModelOpen} onOpenChange={setIsModelOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Model</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="h-[450px] flex flex-col gap-2">
                        <ScrollArea>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[400px] max-w-2xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={15}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">
                                            Specify Model
                                        </Label>
                                        <RadioGroup
                                            value={
                                                modelState.NonCust
                                                    ? "NonCust"
                                                    : modelState.Custom
                                                    ? "Custom"
                                                    : "BuildCustomTerm"
                                            }
                                            onValueChange={handleSpecifyGrp}
                                        >
                                            <div className="grid grid-cols-3">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="NonCust"
                                                        id="NonCust"
                                                    />
                                                    <Label htmlFor="NonCust">
                                                        Full Factorial
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="Custom"
                                                        id="Custom"
                                                    />
                                                    <Label htmlFor="Custom">
                                                        Build Terms
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="BuildCustomTerm"
                                                        id="BuildCustomTerm"
                                                    />
                                                    <Label htmlFor="BuildCustomTerm">
                                                        Build Custom Terms
                                                    </Label>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={60}>
                                    <ResizablePanelGroup direction="horizontal">
                                        <ResizablePanel defaultSize={30}>
                                            <div className="w-full p-2">
                                                <Label>
                                                    Factor & Covariates:{" "}
                                                </Label>
                                                <ScrollArea>
                                                    <div className="flex flex-col justify-start items-start h-[150px] p-2 border rounded overflow-hidden">
                                                        {availableVariables.map(
                                                            (
                                                                variable: string,
                                                                index: number
                                                            ) => (
                                                                <Badge
                                                                    key={index}
                                                                    className="w-full text-start text-sm font-light p-2 cursor-pointer"
                                                                    variant={
                                                                        selectedVariable ===
                                                                        variable
                                                                            ? "default"
                                                                            : "outline"
                                                                    }
                                                                    draggable={
                                                                        !modelState.NonCust &&
                                                                        !modelState.BuildCustomTerm
                                                                    }
                                                                    onDragStart={(
                                                                        e
                                                                    ) =>
                                                                        e.dataTransfer.setData(
                                                                            "text",
                                                                            variable
                                                                        )
                                                                    }
                                                                    onClick={() =>
                                                                        handleVariableClick(
                                                                            variable
                                                                        )
                                                                    }
                                                                >
                                                                    {variable}
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        </ResizablePanel>
                                        <ResizableHandle />
                                        <ResizablePanel defaultSize={30}>
                                            <div className="flex flex-col gap-2 p-2">
                                                <Label className="font-bold">
                                                    Build Term(s):
                                                </Label>
                                                <div className="flex items-center space-x-2">
                                                    <Label className="w-[75px]">
                                                        Type:
                                                    </Label>
                                                    <Select
                                                        value={
                                                            modelState.BuildTermMethod ??
                                                            ""
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            handleChange(
                                                                "BuildTermMethod",
                                                                value
                                                            )
                                                        }
                                                        disabled={
                                                            modelState.NonCust ||
                                                            modelState.BuildCustomTerm
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="w-[150px]">
                                                            <SelectGroup>
                                                                {BUILDTERMMETHOD.map(
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
                                            </div>
                                        </ResizablePanel>
                                        <ResizableHandle />
                                        <ResizablePanel defaultSize={40}>
                                            <div className="w-full p-2">
                                                <Label>
                                                    Between-Subjects Model:{" "}
                                                </Label>
                                                <div className="border rounded p-2 h-[150px] overflow-auto mb-2">
                                                    <ScrollArea>
                                                        <div className="w-full h-[150px]">
                                                            {modelState.BetSubModel &&
                                                            modelState
                                                                .BetSubModel
                                                                .length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {modelState.BetSubModel.map(
                                                                        (
                                                                            variable,
                                                                            index
                                                                        ) => (
                                                                            <Badge
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="text-start text-sm font-light p-2 cursor-pointer"
                                                                                variant={
                                                                                    selectedVariable ===
                                                                                    variable
                                                                                        ? "default"
                                                                                        : "outline"
                                                                                }
                                                                                onClick={() =>
                                                                                    handleVariableClick(
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
                                                                    {modelState.Custom
                                                                        ? "Drop variables here."
                                                                        : modelState.BuildCustomTerm
                                                                        ? "Use the buttons below to build and add terms."
                                                                        : "Select a model specification method."}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </ScrollArea>
                                                </div>
                                            </div>
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={25}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label>Build Term:</Label>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[150px]">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={
                                                                !modelState.BuildCustomTerm ||
                                                                !selectedVariable ||
                                                                (currentBuildTerm.length >
                                                                    0 &&
                                                                    !currentBuildTerm.includes(
                                                                        "{variable}"
                                                                    ) &&
                                                                    !currentBuildTerm.endsWith(
                                                                        " * "
                                                                    ) &&
                                                                    !currentBuildTerm.endsWith(
                                                                        "("
                                                                    ))
                                                            }
                                                            onClick={
                                                                handleArrowClick
                                                            }
                                                            title="Insert Variable"
                                                        >
                                                            →
                                                        </Button>
                                                    </TableHead>
                                                    <TableHead>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={
                                                                !modelState.BuildCustomTerm ||
                                                                currentBuildTerm.trim() ===
                                                                    "" ||
                                                                currentBuildTerm.includes(
                                                                    "{variable}"
                                                                ) ||
                                                                currentBuildTerm.endsWith(
                                                                    " * "
                                                                ) ||
                                                                currentBuildTerm.endsWith(
                                                                    "("
                                                                )
                                                            }
                                                            onClick={
                                                                handleByClick
                                                            }
                                                            title="By"
                                                        >
                                                            By *
                                                        </Button>
                                                    </TableHead>
                                                    <TableHead>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={
                                                                !modelState.BuildCustomTerm ||
                                                                currentBuildTerm.trim() ===
                                                                    "" ||
                                                                currentBuildTerm.includes(
                                                                    "{variable}"
                                                                ) ||
                                                                currentBuildTerm.endsWith(
                                                                    " * "
                                                                ) ||
                                                                currentBuildTerm.endsWith(
                                                                    "("
                                                                )
                                                            }
                                                            onClick={
                                                                handleWithinClick
                                                            }
                                                            title="Within"
                                                        >
                                                            (Within)
                                                        </Button>
                                                    </TableHead>
                                                    <TableHead>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={
                                                                !modelState.BuildCustomTerm ||
                                                                currentBuildTerm.length ===
                                                                    0
                                                            }
                                                            onClick={
                                                                handleClearTermClick
                                                            }
                                                            title="Clear Term"
                                                        >
                                                            Clear Term
                                                        </Button>
                                                    </TableHead>
                                                    <TableHead>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={
                                                                !modelState.BuildCustomTerm ||
                                                                currentBuildTerm.length ===
                                                                    0 ||
                                                                currentBuildTerm.includes(
                                                                    "{variable}"
                                                                ) ||
                                                                currentBuildTerm.endsWith(
                                                                    " * "
                                                                ) ||
                                                                currentBuildTerm.endsWith(
                                                                    "("
                                                                )
                                                            }
                                                            onClick={
                                                                handleAddTermClick
                                                            }
                                                            title="Add"
                                                        >
                                                            Add
                                                        </Button>
                                                    </TableHead>
                                                    <TableHead>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={
                                                                !selectedVariable
                                                            }
                                                            onClick={
                                                                handleRemoveTermClick
                                                            }
                                                            title="Remove"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={6}
                                                        className="p-2 border"
                                                    >
                                                        <div className="p-2 rounded-md min-h-[30px]">
                                                            {currentBuildTerm ||
                                                                "(Empty)"}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ScrollArea>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                                <Label className="w-[200px]">
                                    Sum of Squares:
                                </Label>
                                <Select
                                    value={modelState.SumOfSquareMethod ?? ""}
                                    onValueChange={(value) =>
                                        handleChange("SumOfSquareMethod", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="w-full">
                                        <SelectGroup>
                                            {SUMSQUARESMETHOD.map(
                                                (method, index) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={method.value}
                                                    >
                                                        {method.name}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
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
                            onClick={() => setIsModelOpen(false)}
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
