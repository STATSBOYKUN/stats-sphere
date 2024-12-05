// components/ChartSettingsModal.tsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";  // Import the Label component

interface ChartSettingsModalProps {
    onClose: () => void;
}

const ChartSettingsModal: React.FC<ChartSettingsModalProps> = ({ onClose }) => {
    const [chartType, setChartType] = useState<string>("none");
    const [chartValues, setChartValues] = useState<string>("frequencies");
    const [showNormalCurve, setShowNormalCurve] = useState<boolean>(false);

    // Handle checkbox state changes (including 'indeterminate')
    const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
        if (checked === 'indeterminate') {
            // Handle the 'indeterminate' state if necessary
            console.log('Checkbox is indeterminate');
        } else {
            setShowNormalCurve(checked); // Handle the boolean state
        }
    };

    const handleContinue = () => {
        // Handle continue logic here (e.g., submit the selected values)
        console.log("Chart Type:", chartType);
        console.log("Chart Values:", chartValues);
        console.log("Show Normal Curve:", showNormalCurve);
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>Chart Settings</DialogTitle>
            </DialogHeader>

            <Separator className="my-2" />

            {/* Chart Type Radio Group */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Chart Type</h3>
                <RadioGroup value={chartType} onValueChange={setChartType}>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="none" id="none" />
                            <Label htmlFor="none">None</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="bar" id="bar" />
                            <Label htmlFor="bar">Bar Charts</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pie" id="pie" />
                            <Label htmlFor="pie">Pie Charts</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="histogram" id="histogram" />
                            <Label htmlFor="histogram">Histogram</Label>
                        </div>
                    </div>
                </RadioGroup>
            </div>

            {/* Show Normal Curve Checkbox (only appears for Histogram) */}
            {chartType === "histogram" && (
                <div className="space-y-2 mt-4">
                    <Checkbox
                        checked={showNormalCurve}
                        onCheckedChange={handleCheckboxChange}  // Update the handler to accept 'CheckedState'
                    >
                        Show Normal Curve on Histogram
                    </Checkbox>
                </div>
            )}

            {/* Chart Values Radio Group */}
            <div className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Chart Values</h3>
                <RadioGroup value={chartValues} onValueChange={setChartValues}>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="frequencies" id="frequencies" />
                            <Label htmlFor="frequencies">Frequencies</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="percentages" id="percentages" />
                            <Label htmlFor="percentages">Percentages</Label>
                        </div>
                    </div>
                </RadioGroup>
            </div>

            <DialogFooter className="flex justify-center space-x-4 mt-6">
                <Button onClick={handleContinue}>Continue</Button>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="outline">Help</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default ChartSettingsModal;
