import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
    OptScaCatpcaSaveProps,
    OptScaCatpcaSaveType
} from "@/models/dimension-reduction/optimal-scaling/catpca/optimal-scaling-captca";
import {ScrollArea} from "@/components/ui/scroll-area";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {CheckedState} from "@radix-ui/react-checkbox";

export const OptScaCatpcaSave = ({isSaveOpen, setIsSaveOpen, updateFormData, data}: OptScaCatpcaSaveProps) => {
    const [saveState, setSaveState] = useState<OptScaCatpcaSaveType>({...data});
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isSaveOpen) {
            setSaveState({...data});
        }
    }, [isSaveOpen, data]);

    const handleChange = (field: keyof OptScaCatpcaSaveType, value: CheckedState | number | string | null) => {
        setSaveState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleDiscGrp = (value: string) => {
        setSaveState((prevState) => ({
            ...prevState,
            DiscNewdata: value === "DiscNewdata",
            DiscWriteNewdata: value === "DiscWriteNewdata",
        }));
    };

    const handleTransGrp = (value: string) => {
        setSaveState((prevState) => ({
            ...prevState,
            TransNewdata: value === "TransNewdata",
            TransWriteNewdata: value === "TransWriteNewdata",
        }));
    };

    const handleObjGrp = (value: string) => {
        setSaveState((prevState) => ({
            ...prevState,
            ObjNewdata: value === "ObjNewdata",
            ObjWriteNewdata: value === "ObjWriteNewdata",
        }));
    };

    const handleApproxGrp = (value: string) => {
        setSaveState((prevState) => ({
            ...prevState,
            ApproxNewdata: value === "ApproxNewdata",
            ApproxWriteNewdata: value === "ApproxWriteNewdata",
        }));
    };

    const handleBTGrp = (value: string) => {
        setSaveState((prevState) => ({
            ...prevState,
            BTNewDataset: value === "BTNewDataset",
            BTWriteDataFile: value === "BTWriteDataFile",
        }));
    };

    const handleNomGrp = (value: string) => {
        setSaveState((prevState) => ({
            ...prevState,
            All: value === "All",
            First: value === "First",
        }));
    };

    const handleContinue = () => {
        Object.entries(saveState).forEach(([key, value]) => {
            updateFormData(key as keyof OptScaCatpcaSaveType, value);
        });
        setIsSaveOpen(false);
    };

    return (
        <>
            {/* Save Dialog */}
            <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Categorical Principal Components: Save</DialogTitle>
                    </DialogHeader>
                    <Separator/>
                    <div className="h-[450px] flex flex-col gap-2">
                        <ScrollArea>
                            <ResizablePanelGroup
                                direction="vertical"
                                className="min-h-[625px] max-w-xl rounded-lg border md:min-w-[200px]"
                            >
                                <ResizablePanel defaultSize={35}>
                                    <ResizablePanelGroup direction="horizontal">
                                        <ResizablePanel defaultSize={50}>
                                            <div className="flex flex-col gap-2 p-2">
                                                <Label className="font-bold">Discretized Data</Label>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="Discretized"
                                                        checked={saveState.Discretized}
                                                        onCheckedChange={(checked) => handleChange("Discretized", checked)}
                                                    />
                                                    <label
                                                        htmlFor="Discretized"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Create Discretized Data
                                                    </label>
                                                </div>
                                                <RadioGroup
                                                    value={saveState.DiscNewdata ? "DiscNewdata" : saveState.DiscWriteNewdata ? "DiscWriteNewdata" : ""}
                                                    onValueChange={handleDiscGrp}
                                                >
                                                    <div className="flex flex-col gap-1 pl-6">
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="DiscNewdata" id="DiscNewdata"/>
                                                            <Label htmlFor="DiscNewdata">
                                                                Create a New Dataset
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 pl-6">
                                                            <Label className="w-[75px]">Name:</Label>
                                                            <div className="w-[75px]">
                                                                <Input
                                                                    id="DiscDataset"
                                                                    type="text"
                                                                    placeholder=""
                                                                    value={saveState.DiscDataset || ""}
                                                                    onChange={(e) => handleChange("DiscDataset", e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="DiscWriteNewdata"
                                                                            id="DiscWriteNewdata"/>
                                                            <Label htmlFor="DiscWriteNewdata">
                                                                Write New Dataset File
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 pl-6">
                                                            <Input
                                                                id="DiscretizedFile"
                                                                type="file"
                                                                placeholder=""
                                                                onChange={(e) => handleChange("DiscretizedFile", e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </ResizablePanel>
                                        <ResizableHandle/>
                                        <ResizablePanel defaultSize={50}>
                                            <div className="flex flex-col gap-2 p-2">
                                                <Label className="font-bold">Transformed Variables</Label>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="SaveTrans"
                                                        checked={saveState.SaveTrans}
                                                        onCheckedChange={(checked) => handleChange("SaveTrans", checked)}
                                                    />
                                                    <label
                                                        htmlFor="SaveTrans"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Save to The Active Dataset
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="Trans"
                                                        checked={saveState.Trans}
                                                        onCheckedChange={(checked) => handleChange("Trans", checked)}
                                                    />
                                                    <label
                                                        htmlFor="Trans"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Create Variables
                                                    </label>
                                                </div>
                                                <RadioGroup
                                                    value={saveState.TransNewdata ? "TransNewdata" : saveState.TransWriteNewdata ? "TransWriteNewdata" : ""}
                                                    onValueChange={handleTransGrp}
                                                >
                                                    <div className="flex flex-col gap-1 pl-6">
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="TransNewdata" id="TransNewdata"/>
                                                            <Label htmlFor="TransNewdata">
                                                                Create a New Dataset
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 pl-6">
                                                            <Label className="w-[75px]">Name:</Label>
                                                            <div className="w-[75px]">
                                                                <Input
                                                                    id="TransDataset"
                                                                    type="text"
                                                                    placeholder=""
                                                                    value={saveState.TransDataset || ""}
                                                                    onChange={(e) => handleChange("TransDataset", e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="TransWriteNewdata"
                                                                            id="TransWriteNewdata"/>
                                                            <Label htmlFor="TransWriteNewdata">
                                                                Write New Dataset File
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 pl-6">
                                                            <Input
                                                                id="TransformedFile"
                                                                type="file"
                                                                placeholder=""
                                                                onChange={(e) => handleChange("TransformedFile", e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={35}>
                                    <ResizablePanelGroup direction="horizontal">
                                        <ResizablePanel defaultSize={50}>
                                            <div className="flex flex-col gap-2 p-2">
                                                <Label className="font-bold">Object Scores</Label>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="SaveObjScores"
                                                        checked={saveState.SaveObjScores}
                                                        onCheckedChange={(checked) => handleChange("SaveObjScores", checked)}
                                                    />
                                                    <label
                                                        htmlFor="SaveObjScores"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Save to The Active Dataset
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="ObjScores"
                                                        checked={saveState.ObjScores}
                                                        onCheckedChange={(checked) => handleChange("ObjScores", checked)}
                                                    />
                                                    <label
                                                        htmlFor="ObjScores"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Create Object Scores
                                                    </label>
                                                </div>
                                                <RadioGroup
                                                    value={saveState.ObjNewdata ? "ObjNewdata" : saveState.ObjWriteNewdata ? "ObjWriteNewdata" : ""}
                                                    onValueChange={handleObjGrp}
                                                >
                                                    <div className="flex flex-col gap-1 pl-6">
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="ObjNewdata" id="ObjNewdata"/>
                                                            <Label htmlFor="ObjNewdata">
                                                                Create a New Dataset
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 pl-6">
                                                            <Label className="w-[75px]">Name:</Label>
                                                            <div className="w-[75px]">
                                                                <Input
                                                                    id="ObjDataset"
                                                                    type="text"
                                                                    placeholder=""
                                                                    value={saveState.ObjDataset || ""}
                                                                    onChange={(e) => handleChange("ObjDataset", e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="ObjWriteNewdata"
                                                                            id="ObjWriteNewdata"/>
                                                            <Label htmlFor="ObjWriteNewdata">
                                                                Write New Dataset File
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 pl-6">
                                                            <Input
                                                                id="ObjScoresFile"
                                                                type="file"
                                                                placeholder=""
                                                                onChange={(e) => handleChange("ObjScoresFile", e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </ResizablePanel>
                                        <ResizableHandle/>
                                        <ResizablePanel defaultSize={50}>
                                            <div className="flex flex-col gap-2 p-2">
                                                <Label className="font-bold">Approximations</Label>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="SaveApprox"
                                                        checked={saveState.SaveApprox}
                                                        onCheckedChange={(checked) => handleChange("SaveApprox", checked)}
                                                    />
                                                    <label
                                                        htmlFor="SaveApprox"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Save to The Active Dataset
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="Approx"
                                                        checked={saveState.Approx}
                                                        onCheckedChange={(checked) => handleChange("Approx", checked)}
                                                    />
                                                    <label
                                                        htmlFor="Approx"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Create Approximations
                                                    </label>
                                                </div>
                                                <RadioGroup
                                                    value={saveState.ApproxNewdata ? "ApproxNewdata" : saveState.ApproxWriteNewdata ? "ApproxWriteNewdata" : ""}
                                                    onValueChange={handleApproxGrp}
                                                >
                                                    <div className="flex flex-col gap-1 pl-6">
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="ApproxNewdata" id="ApproxNewdata"/>
                                                            <Label htmlFor="ApproxNewdata">
                                                                Create a New Dataset
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 pl-6">
                                                            <Label className="w-[75px]">Name:</Label>
                                                            <div className="w-[75px]">
                                                                <Input
                                                                    id="ApproxDataset"
                                                                    type="text"
                                                                    placeholder=""
                                                                    value={saveState.ApproxDataset || ""}
                                                                    onChange={(e) => handleChange("ApproxDataset", e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="ApproxWriteNewdata"
                                                                            id="ApproxWriteNewdata"/>
                                                            <Label htmlFor="ApproxWriteNewdata">
                                                                Write New Dataset File
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 pl-6">
                                                            <Input
                                                                id="ApproximationsFile"
                                                                type="file"
                                                                placeholder=""
                                                                onChange={(e) => handleChange("ApproximationsFile", e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                </ResizablePanel>
                                <ResizableHandle/>
                                <ResizablePanel defaultSize={30}>
                                    <div className="flex flex-col gap-2 p-2">
                                        <Label className="font-bold">Bootstrap Confidence Elipses</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col gap-2 p-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="BTLoading"
                                                        checked={saveState.BTLoading}
                                                        onCheckedChange={(checked) => handleChange("BTLoading", checked)}
                                                    />
                                                    <label
                                                        htmlFor="BTLoading"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Confidence Ellipses Areas for Loadings
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="BTObject"
                                                        checked={saveState.BTObject}
                                                        onCheckedChange={(checked) => handleChange("BTObject", checked)}
                                                    />
                                                    <label
                                                        htmlFor="BTObject"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Confidence Ellipses Areas for Object Scores
                                                    </label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="BTCategories"
                                                        checked={saveState.BTCategories}
                                                        onCheckedChange={(checked) => handleChange("BTCategories", checked)}
                                                    />
                                                    <label
                                                        htmlFor="BTCategories"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Confidence Ellipses Areas for Categories
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 p-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="BTEllipseCoord"
                                                        checked={saveState.BTEllipseCoord}
                                                        onCheckedChange={(checked) => handleChange("BTEllipseCoord", checked)}
                                                    />
                                                    <label
                                                        htmlFor="BTEllipseCoord"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Ellipse Coordinates
                                                    </label>
                                                </div>
                                                <RadioGroup
                                                    value={saveState.BTNewDataset ? "BTNewDataset" : saveState.BTWriteDataFile ? "BTWriteDataFile" : ""}
                                                    onValueChange={handleBTGrp}
                                                >
                                                    <div className="flex flex-col gap-1 pl-6">
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="BTNewDataset" id="BTNewDataset"/>
                                                            <Label htmlFor="BTNewDataset">
                                                                Create a New Dataset
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 pl-6">
                                                            <Label className="w-[75px]">Name:</Label>
                                                            <div className="w-[75px]">
                                                                <Input
                                                                    id="BTDatasetName"
                                                                    type="text"
                                                                    placeholder=""
                                                                    value={saveState.BTDatasetName || ""}
                                                                    onChange={(e) => handleChange("BTDatasetName", e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="BTWriteDataFile"
                                                                            id="BTWriteDataFile"/>
                                                            <Label htmlFor="BTWriteDataFile">
                                                                Write New Dataset File
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 pl-6">
                                                            <Input
                                                                id="BTFileText"
                                                                type="file"
                                                                placeholder=""
                                                                onChange={(e) => handleChange("BTFileText", e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ScrollArea>
                        <RadioGroup
                            value={saveState.All ? "All" : saveState.First ? "First" : ""}
                            onValueChange={handleNomGrp}
                        >
                            <div className="flex flex-row items-center gap-2">
                                <Label className="font-bold">Multiple Nominal Dimensions</Label>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="All" id="All"/>
                                    <Label htmlFor="All">
                                        All
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="First" id="First"/>
                                    <Label htmlFor="First">
                                        First:
                                    </Label>
                                </div>
                                <Input
                                    id="MultiNomDim"
                                    type="text"
                                    className="w-[65px]"
                                    placeholder=""
                                    value={saveState.MultiNomDim ?? ""}
                                    onChange={(e) => handleChange("MultiNomDim", e.target.value)}
                                />
                            </div>
                        </RadioGroup>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsSaveOpen(false)}>
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
