import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    OptScaCatpcaCategoryPlotsProps,
    OptScaCatpcaCategoryPlotsType
} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {CheckedState} from "@radix-ui/react-checkbox";

export const OptScaCatpcaCategoryPlots = ({
                                              isCategoryPlotsOpen,
                                              setIsCategoryPlotsOpen,
                                              updateFormData,
                                              data
                                          }: OptScaCatpcaCategoryPlotsProps) => {
    const [categoryPlotsState, setCategoryPlotsState] = useState<OptScaCatpcaCategoryPlotsType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isCategoryPlotsOpen) {
            setCategoryPlotsState({...data});
        }
    }, [isCategoryPlotsOpen, data]);

    const handleChange = (field: keyof OptScaCatpcaCategoryPlotsType, value: CheckedState | number | string | null) => {
        setCategoryPlotsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(categoryPlotsState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaCatpcaCategoryPlotsType, value);
        });
        setIsCategoryPlotsOpen(false);
    };

    return (
        <>
            {/* Category Plots Dialog */}
            <Dialog open={isCategoryPlotsOpen} onOpenChange={setIsCategoryPlotsOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Categorical Principal Components: Category Plots</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="flex flex-col gap-2">
                        <ResizablePanelGroup
                            direction="horizontal"
                            className="min-h-[450px] max-w-xl rounded-lg border md:min-w-[200px]"
                        >
                            {/* Variable List */}
                            <ResizablePanel defaultSize={25}>
                                <div className="flex h-full items-center justify-center p-2">
                                    <span className="font-semibold">List Variabel</span>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle/>

                            {/* Defining Variable */}
                            <ResizablePanel defaultSize={75}>
                                <div className="flex flex-col p-2">
                                    <div className="w-full">
                                        <Label>Category Plots: </Label>
                                        <Input
                                            id="CatPlotsVar"
                                            type="text"
                                            className="w-full min-h-[65px]"
                                            placeholder=""
                                            value={categoryPlotsState.CatPlotsVar ?? ""}
                                            onChange={(e) => handleChange("CatPlotsVar", e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full">
                                        <Label>Joint Category Plots: </Label>
                                        <Input
                                            id="JointCatPlotsVar"
                                            type="text"
                                            className="w-full min-h-[65px]"
                                            placeholder=""
                                            value={categoryPlotsState.JointCatPlotsVar ?? ""}
                                            onChange={(e) => handleChange("JointCatPlotsVar", e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="w-full">
                                            <Label>Transformation Plots: </Label>
                                            <Input
                                                id="TransPlotsVar"
                                                type="text"
                                                className="w-full min-h-[65px]"
                                                placeholder=""
                                                value={categoryPlotsState.TransPlotsVar ?? ""}
                                                onChange={(e) => handleChange("TransPlotsVar", e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Label className="w-[225px]">Dimensions for Multiple Nominal:</Label>
                                            <div className="w-[75px]">
                                                <Input
                                                    id="DimensionsForMultiNom"
                                                    type="number"
                                                    placeholder=""
                                                    value={categoryPlotsState.DimensionsForMultiNom || ""}
                                                    onChange={(e) => handleChange("DimensionsForMultiNom", Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="InclResidPlots"
                                                checked={categoryPlotsState.InclResidPlots}
                                                onCheckedChange={(checked) => handleChange("InclResidPlots", checked)}
                                            />
                                            <label
                                                htmlFor="InclResidPlots"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Include Residual Plots
                                            </label>
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <Label>Project Centroids Of: </Label>
                                        <Input
                                            id="PrjCentroidsOfVar"
                                            type="text"
                                            className="w-full min-h-[65px]"
                                            placeholder=""
                                            value={categoryPlotsState.PrjCentroidsOfVar ?? ""}
                                            onChange={(e) => handleChange("PrjCentroidsOfVar", e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full">
                                        <Label>Onto: </Label>
                                        <Input
                                            id="PrjCentroidsOntoVar"
                                            type="text"
                                            className="w-full"
                                            placeholder=""
                                            value={categoryPlotsState.PrjCentroidsOntoVar ?? ""}
                                            onChange={(e) => handleChange("PrjCentroidsOntoVar", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary"
                                onClick={() => setIsCategoryPlotsOpen(false)}>
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
