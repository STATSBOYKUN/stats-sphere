import React, {useEffect, useState} from "react";
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {DiscriminantDialogProps, DiscriminantMainType} from "@/models/classify/discriminant/discriminant";
import {Badge} from "@/components/ui/badge";
import {ScrollArea} from "@/components/ui/scroll-area";
import {useModal} from "@/hooks/useModal";

export const DiscriminantDialog = ({
                                       isMainOpen,
                                       setIsMainOpen,
                                       setIsDefineRangeOpen,
                                       setIsSetValueOpen,
                                       setIsStatisticsOpen,
                                       setIsMethodOpen,
                                       setIsClassifyOpen,
                                       setIsSaveOpen,
                                       setIsBootstrapOpen,
                                       updateFormData,
                                       data,
                                       globalVariables,
                                       onContinue,
                                       onReset,
                                   }: DiscriminantDialogProps) => {
    const [mainState, setMainState] = useState<DiscriminantMainType>({...data});
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);

    const {closeModal} = useModal();

    useEffect(() => {
        setMainState({...data});
        setAvailableVariables(globalVariables);
    }, [data, globalVariables]);

    useEffect(() => {
        const usedVariables = [
            mainState.GroupingVariable,
            ...(mainState.IndependentVariables || []),
            mainState.SelectionVariable,
        ].filter(Boolean);

        const updatedVariables = globalVariables.filter(
            (variable) => !usedVariables.includes(variable)
        );
        setAvailableVariables(updatedVariables);
    }, [mainState]);

    const handleDrop = (target: string, variable: string) => {
        setMainState((prev) => {
            const updatedState = {...prev};
            if (target === "GroupingVariable") {
                updatedState.GroupingVariable = variable;
            } else if (target === "IndependentVariables") {
                updatedState.IndependentVariables = [
                    ...(updatedState.IndependentVariables || []),
                    variable,
                ];
            } else if (target === "SelectionVariable") {
                updatedState.SelectionVariable = variable;
            }
            return updatedState;
        });
    };

    const handleRemoveVariable = (target: string, variable?: string) => {
        setMainState((prev) => {
            const updatedState = {...prev};
            if (target === "GroupingVariable") {
                updatedState.GroupingVariable = "";
            } else if (target === "IndependentVariables") {
                updatedState.IndependentVariables = (
                    updatedState.IndependentVariables || []
                ).filter((item) => item !== variable);
            } else if (target === "SelectionVariable") {
                updatedState.SelectionVariable = "";
            }
            return updatedState;
        });
    };

    const handleMethodGrp = (value: string) => {
        setMainState((prev) => ({
            ...prev,
            Together: value === "Together",
            Stepwise: value === "Stepwise",
        }));
    };

    const handleContinue = async () => {
        Object.entries(mainState).forEach(([key, value]) => {
            updateFormData(key as keyof DiscriminantMainType, value);
        });

        setIsMainOpen(false);

        onContinue(mainState);
    };

    const openDialog = (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
        setter(true);
    };

    const handleDialog = () => {
        setIsMainOpen(false);
        closeModal();
    }

    return (
        <>
            {/* Main Dialog */}
            <Dialog open={isMainOpen} onOpenChange={handleDialog}>
                {/*<DialogTrigger asChild>*/}
                {/*    <Button variant="outline">Discriminant</Button>*/}
                {/*</DialogTrigger>*/}
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Discriminant Analysis</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="flex items-center space-x-2">
                        <ResizablePanelGroup
                            direction="horizontal"
                            className="min-h-[400px] rounded-lg border md:min-w-[200px]"
                        >
                            {/* Variable List */}
                            <ResizablePanel defaultSize={25}>
                                <ScrollArea>
                                    <div className="flex flex-col gap-1 justify-start items-start h-[400px] w-full p-2">
                                        {availableVariables.map((variable: string, index: number) => (
                                            <Badge
                                                key={index}
                                                className="w-full text-start text-sm font-light p-2 cursor-pointer"
                                                variant="outline"
                                                draggable
                                                onDragStart={(e) => e.dataTransfer.setData("text", variable)}
                                            >
                                                {variable}
                                            </Badge>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </ResizablePanel>
                            <ResizableHandle withHandle/>

                            {/* Defining Variable */}
                            <ResizablePanel defaultSize={55}>
                                <div className="flex flex-col h-full w-full items-start justify-start gap-6 p-2">
                                    <div className="flex flex-col w-full gap-2">
                                        <div
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                handleDrop("GroupingVariable", e.dataTransfer.getData("text"));
                                            }}
                                        >
                                            <Label className="font-bold">Grouping Variable:</Label>
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-full min-h-[40px] p-2 border rounded"
                                                    onDrop={(e) => {
                                                        handleDrop("GroupingVariable", e.dataTransfer.getData("text"));
                                                    }}
                                                    onDragOver={(e) => e.preventDefault()}
                                                >
                                                    {mainState.GroupingVariable ? (
                                                        <Badge
                                                            className="text-start text-sm font-light p-2 cursor-pointer"
                                                            variant="outline"
                                                            onClick={() => handleRemoveVariable("GroupingVariable")}
                                                        >
                                                            {mainState.GroupingVariable}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm font-light text-gray-500">Drop variables here.</span>
                                                    )}
                                                </div>
                                                <input
                                                    type="hidden"
                                                    value={mainState.GroupingVariable ?? ""}
                                                    name="GroupingVariable"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={openDialog(setIsDefineRangeOpen)}
                                            >
                                                Define Range...
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-full gap-2">
                                        <div
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                const variable = e.dataTransfer.getData("text");
                                                handleDrop("IndependentVariables", variable);
                                            }}
                                        >
                                            <Label className="font-bold">Independents:</Label>
                                            <div className="w-full h-[100px] p-2 border rounded overflow-hidden">
                                                <ScrollArea>
                                                    <div className="w-full h-[100px]">
                                                        {mainState.IndependentVariables && mainState.IndependentVariables.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {mainState.IndependentVariables.map((variable, index) => (
                                                                    <Badge
                                                                        key={index}
                                                                        className="text-start text-sm font-light p-2 cursor-pointer"
                                                                        variant="outline"
                                                                        onClick={() => handleRemoveVariable("IndependentVariables", variable)}
                                                                    >
                                                                        {variable}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm font-light text-gray-500">Drop variables here.</span>
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                            <input
                                                type="hidden"
                                                value={mainState.IndependentVariables ?? ""}
                                                name="Independents"
                                            />
                                        </div>
                                        <div>
                                            <RadioGroup
                                                defaultValue="Together"
                                                value={mainState.Together ? "Together" : mainState.Stepwise ? "Stepwise" : "Together"}
                                                onValueChange={handleMethodGrp}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Together" id="Together"/>
                                                    <Label htmlFor="Together">
                                                        Enter independents together
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Stepwise" id="Stepwise"/>
                                                    <Label htmlFor="Stepwise">Use stepwise method</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-full gap-2">
                                        <Label className="font-bold">Selection Variable:</Label>
                                        <div className="flex w-full items-center space-x-2">
                                            <div className="flex w-full items-center space-x-2">
                                                <div
                                                    className="w-full min-h-[40px] p-2 border rounded"
                                                    onDrop={(e) => {
                                                        handleDrop("SelectionVariable", e.dataTransfer.getData("text"));
                                                    }}
                                                    onDragOver={(e) => e.preventDefault()}
                                                >
                                                    {mainState.SelectionVariable ? (
                                                        <Badge
                                                            className="text-start text-sm font-light p-2 cursor-pointer"
                                                            variant="outline"
                                                            onClick={() => handleRemoveVariable("SelectionVariable")}
                                                        >
                                                            {mainState.SelectionVariable}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm font-light text-gray-500">Drop variables here.</span>
                                                    )}
                                                </div>
                                                <input
                                                    type="hidden"
                                                    value={mainState.SelectionVariable ?? ""}
                                                    name="GroupingVariable"
                                                />
                                            </div>
                                            <Button type="button" variant="secondary"
                                                    onClick={openDialog(setIsSetValueOpen)}>
                                                Value...
                                            </Button>
                                        </div>
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
                                        onClick={openDialog(setIsStatisticsOpen)}
                                    >
                                        Statistics...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        disabled={mainState.Together}
                                        onClick={openDialog(setIsMethodOpen)}
                                    >
                                        Method...
                                    </Button>
                                    <Button
                                        className="w-full"
                                        type="button"
                                        variant="secondary"
                                        onClick={openDialog(setIsClassifyOpen)}
                                    >
                                        Classify...
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
                                        onClick={openDialog(setIsBootstrapOpen)}
                                        disabled={mainState.Stepwise}
                                    >
                                        Bootstrap...
                                    </Button>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            onClick={handleContinue}
                        >
                            OK
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onReset}
                        >
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
