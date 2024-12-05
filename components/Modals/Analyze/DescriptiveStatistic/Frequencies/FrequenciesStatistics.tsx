// components/Modals/StatisticsSettingsModal.tsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface StatisticsSettingsModalProps {
    onClose: () => void;
}

const StatisticsSettingsModal: React.FC<StatisticsSettingsModalProps> = ({ onClose }) => {
    const [percentileValues, setPercentileValues] = useState({
        quartiles: false,
        cutPoints: false,
        equalGroups: 4,
    });
    const [centralTendency, setCentralTendency] = useState({
        mean: false,
        median: false,
        mode: false,
        sum: false,
    });
    const [dispersion, setDispersion] = useState({
        stdDeviation: false,
        variance: false,
        range: false,
        minimum: false,
        maximum: false,
        stdErrorMean: false,
    });
    const [posteriorDist, setPosteriorDist] = useState({
        skewness: false,
        kurtosis: false,
    });

    const handleContinue = () => {
        // Handle continue logic here (e.g., submit the selected values)
        console.log("Percentile Values:", percentileValues);
        console.log("Central Tendency:", centralTendency);
        console.log("Dispersion:", dispersion);
        console.log("Posterior Dist:", posteriorDist);
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>Statistics Settings</DialogTitle>
            </DialogHeader>

            <Separator className="my-2" />

            {/* Percentile Values Group */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Percentile Values</h3>
                <Checkbox
                    checked={percentileValues.quartiles}
                    onCheckedChange={(checked) => setPercentileValues((prev) => ({
                        ...prev,
                        quartiles: !!checked,  // Convert to boolean
                    }))}
                >
                    Quartiles
                </Checkbox>
                <Checkbox
                    checked={percentileValues.cutPoints}
                    onCheckedChange={(checked) => setPercentileValues((prev) => ({
                        ...prev,
                        cutPoints: !!checked,  // Convert to boolean
                    }))}
                >
                    Cut Points for
                    {percentileValues.cutPoints && (
                        <div className="inline-block ml-2">
                            <Input
                                type="number"
                                value={percentileValues.equalGroups}
                                onChange={(e) => setPercentileValues({ ...percentileValues, equalGroups: parseInt(e.target.value) })}
                                className="w-16"
                            />
                            <span className="ml-1">equal groups</span>
                        </div>
                    )}
                </Checkbox>
            </div>

            {/* Central Tendency Group */}
            <div className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Central Tendency</h3>
                <Checkbox
                    checked={centralTendency.mean}
                    onCheckedChange={(checked) => setCentralTendency((prev) => ({
                        ...prev,
                        mean: !!checked,  // Convert to boolean
                    }))}
                >
                    Mean
                </Checkbox>
                <Checkbox
                    checked={centralTendency.median}
                    onCheckedChange={(checked) => setCentralTendency((prev) => ({
                        ...prev,
                        median: !!checked,  // Convert to boolean
                    }))}
                >
                    Median
                </Checkbox>
                <Checkbox
                    checked={centralTendency.mode}
                    onCheckedChange={(checked) => setCentralTendency((prev) => ({
                        ...prev,
                        mode: !!checked,  // Convert to boolean
                    }))}
                >
                    Mode
                </Checkbox>
                <Checkbox
                    checked={centralTendency.sum}
                    onCheckedChange={(checked) => setCentralTendency((prev) => ({
                        ...prev,
                        sum: !!checked,  // Convert to boolean
                    }))}
                >
                    Sum
                </Checkbox>
            </div>

            {/* Dispersion Group */}
            <div className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Dispersion</h3>
                <Checkbox
                    checked={dispersion.stdDeviation}
                    onCheckedChange={(checked) => setDispersion((prev) => ({
                        ...prev,
                        stdDeviation: !!checked,  // Convert to boolean
                    }))}
                >
                    Standard Deviation
                </Checkbox>
                <Checkbox
                    checked={dispersion.variance}
                    onCheckedChange={(checked) => setDispersion((prev) => ({
                        ...prev,
                        variance: !!checked,  // Convert to boolean
                    }))}
                >
                    Variance
                </Checkbox>
                <Checkbox
                    checked={dispersion.range}
                    onCheckedChange={(checked) => setDispersion((prev) => ({
                        ...prev,
                        range: !!checked,  // Convert to boolean
                    }))}
                >
                    Range
                </Checkbox>
                <Checkbox
                    checked={dispersion.minimum}
                    onCheckedChange={(checked) => setDispersion((prev) => ({
                        ...prev,
                        minimum: !!checked,  // Convert to boolean
                    }))}
                >
                    Minimum
                </Checkbox>
                <Checkbox
                    checked={dispersion.maximum}
                    onCheckedChange={(checked) => setDispersion((prev) => ({
                        ...prev,
                        maximum: !!checked,  // Convert to boolean
                    }))}
                >
                    Maximum
                </Checkbox>
                <Checkbox
                    checked={dispersion.stdErrorMean}
                    onCheckedChange={(checked) => setDispersion((prev) => ({
                        ...prev,
                        stdErrorMean: !!checked,  // Convert to boolean
                    }))}
                >
                    Standard Error of Mean
                </Checkbox>
            </div>

            {/* Characterize Posterior Distribution Group */}
            <div className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Characterize Posterior Dist.</h3>
                <Checkbox
                    checked={posteriorDist.skewness}
                    onCheckedChange={(checked) => setPosteriorDist((prev) => ({
                        ...prev,
                        skewness: !!checked,  // Convert to boolean
                    }))}
                >
                    Skewness
                </Checkbox>
                <Checkbox
                    checked={posteriorDist.kurtosis}
                    onCheckedChange={(checked) => setPosteriorDist((prev) => ({
                        ...prev,
                        kurtosis: !!checked,  // Convert to boolean
                    }))}
                >
                    Kurtosis
                </Checkbox>
            </div>

            <DialogFooter className="flex justify-center space-x-4 mt-6">
                <Button onClick={handleContinue}>Continue</Button>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button variant="outline">Help</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default StatisticsSettingsModal;
