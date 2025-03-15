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
    CorrespondenceStatisticsProps,
    CorrespondenceStatisticsType,
} from "@/models/dimension-reduction/correspondence-analysis/correspondence-analysis";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";

export const CorrespondenceStatistics = ({
    isStatisticsOpen,
    setIsStatisticsOpen,
    updateFormData,
    data,
}: CorrespondenceStatisticsProps) => {
    const [statisticsState, setStatisticsState] =
        useState<CorrespondenceStatisticsType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    useEffect(() => {
        if (isStatisticsOpen) {
            setStatisticsState({ ...data });
        }
    }, [isStatisticsOpen, data]);

    const handleChange = (
        field: keyof CorrespondenceStatisticsType,
        value: CheckedState | number | null
    ) => {
        setStatisticsState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(statisticsState).forEach(([key, value]) => {
            updateFormData(key as keyof CorrespondenceStatisticsType, value);
        });
        setIsStatisticsOpen(false);
    };

    return (
        <>
            {/* Statistics Dialog */}
            <Dialog open={isStatisticsOpen} onOpenChange={setIsStatisticsOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            Correspondence Analysis: Statistics
                        </DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="CorrTable"
                                checked={statisticsState.CorrTable}
                                onCheckedChange={(checked) =>
                                    handleChange("CorrTable", checked)
                                }
                            />
                            <label
                                htmlFor="CorrTable"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Correspondence Table
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="RowPoints"
                                checked={statisticsState.RowPoints}
                                onCheckedChange={(checked) =>
                                    handleChange("RowPoints", checked)
                                }
                            />
                            <label
                                htmlFor="RowPoints"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Overviews of Row Points
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="ColPoints"
                                checked={statisticsState.ColPoints}
                                onCheckedChange={(checked) =>
                                    handleChange("ColPoints", checked)
                                }
                            />
                            <label
                                htmlFor="ColPoints"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Overviews of Column Points
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="PermutationTest"
                                checked={statisticsState.PermutationTest}
                                onCheckedChange={(checked) =>
                                    handleChange("PermutationTest", checked)
                                }
                            />
                            <label
                                htmlFor="PermutationTest"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Permutation of The Correspondence Table
                            </label>
                        </div>
                        <div className="flex items-center space-x-2 pl-6">
                            <Label className="w-[200px]">
                                Maximum Dimensions:
                            </Label>
                            <div className="w-[75px]">
                                <Input
                                    id="MaxPermutations"
                                    type="number"
                                    placeholder=""
                                    value={statisticsState.MaxPermutations ?? 0}
                                    onChange={(e) =>
                                        handleChange(
                                            "MaxPermutations",
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="RowProfile"
                                checked={statisticsState.RowProfile}
                                onCheckedChange={(checked) =>
                                    handleChange("RowProfile", checked)
                                }
                            />
                            <label
                                htmlFor="RowProfile"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Row Profile
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="ColProfile"
                                checked={statisticsState.ColProfile}
                                onCheckedChange={(checked) =>
                                    handleChange("ColProfile", checked)
                                }
                            />
                            <label
                                htmlFor="ColProfile"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Column Profile
                            </label>
                        </div>
                        <ResizablePanelGroup
                            direction="vertical"
                            className="min-h-[60px] max-w-xl rounded-lg border md:min-w-[200px]"
                        >
                            <ResizablePanel defaultSize={100}>
                                <div className="flex flex-col gap-2 p-2">
                                    <Label className="font-bold">
                                        Correspondence Statistics for
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="StatRowPoints"
                                                checked={
                                                    statisticsState.StatRowPoints
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "StatRowPoints",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="StatRowPoints"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Row Points
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="StatColPoints"
                                                checked={
                                                    statisticsState.StatColPoints
                                                }
                                                onCheckedChange={(checked) =>
                                                    handleChange(
                                                        "StatColPoints",
                                                        checked
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="StatColPoints"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Column Points
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
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
                            onClick={() => setIsStatisticsOpen(false)}
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
