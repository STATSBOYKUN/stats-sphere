// components/Modals/FrequenciesModal.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CornerDownLeft, CornerDownRight } from "lucide-react";
import { useStatistics } from "@/hooks/useStatistics"; // Import hook statistik
import { useVariableStore } from "@/stores/useVariableStore"; // Import store variabel

interface FrequenciesModalProps {
    onClose: () => void;
}

const FrequenciesModal: React.FC<FrequenciesModalProps> = ({ onClose }) => {
    const [leftVariables, setLeftVariables] = useState<string[]>([]);
    const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
    const [highlightedVariable, setHighlightedVariable] = useState<string | null>(null);

    const { calculateFrequencies, getVariableByColumnIndex } = useStatistics();
    const variables = useVariableStore((state) => state.variables);

    // Mengisi variabel yang tersedia (nama variabel)
    React.useEffect(() => {
        setLeftVariables(variables.map((v) => v.name));
    }, [variables]);

    // Fungsi untuk memilih variabel kiri
    const handleSelectLeft = (variable: string) => {
        if (highlightedVariable === variable) {
            setSelectedVariables((prev) => [...prev, variable]);
            setLeftVariables((prev) => prev.filter((item) => item !== variable));
            setHighlightedVariable(null);
        } else {
            setHighlightedVariable(variable);
        }
    };

    // Fungsi untuk membatalkan pemilihan variabel di kanan
    const handleDeselectRight = (variable: string) => {
        if (highlightedVariable === variable) {
            setLeftVariables((prev) => [...prev, variable]);
            setSelectedVariables((prev) => prev.filter((item) => item !== variable));
            setHighlightedVariable(null);
        } else {
            setHighlightedVariable(variable);
        }
    };

    // Fungsi untuk memindahkan variabel antara kiri dan kanan
    const handleMoveVariable = () => {
        if (highlightedVariable) {
            if (leftVariables.includes(highlightedVariable)) {
                setSelectedVariables((prev) => [...prev, highlightedVariable]);
                setLeftVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            } else if (selectedVariables.includes(highlightedVariable)) {
                setLeftVariables((prev) => [...prev, highlightedVariable]);
                setSelectedVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            }
            setHighlightedVariable(null);
        }
    };

    // Fungsi untuk menghitung frekuensi dan menampilkan hasil di console
    const handleAnalyze = () => {
        selectedVariables.forEach((variableName) => {
            const variable = variables.find((v) => v.name === variableName);
            if (variable) {
                const frequencies = calculateFrequencies(variable.columnIndex);
                console.log(`Frequencies for ${variableName}:`, frequencies);
            }
        });
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
                <DialogTitle>Frequencies</DialogTitle>
            </DialogHeader>

            <Separator className="my-0" />

            <div className="grid grid-cols-9 gap-2 py-2">
                <div className="col-span-3 flex flex-col border p-4 rounded-md max-h-[300px] overflow-y-auto">
                    <label className="font-semibold">Available Variables</label>
                    <div className="space-y-2">
                        {leftVariables.map((variable) => (
                            <div
                                key={variable}
                                className={`p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${highlightedVariable === variable ? "bg-blue-100 border-blue-500" : "border-gray-300"}`}
                                onClick={() => handleSelectLeft(variable)}
                            >
                                {variable}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Move Button (1/8 width) */}
                <div className="col-span-1 flex flex-col items-center justify-center space-y-10">
                    <Button
                        variant="link"
                        onClick={handleMoveVariable}
                        disabled={!highlightedVariable}
                    >
                        {highlightedVariable && leftVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} />
                        ) : highlightedVariable && selectedVariables.includes(highlightedVariable) ? (
                            <CornerDownLeft size={24} />
                        ) : (
                            <CornerDownLeft size={24} />
                        )}
                    </Button>
                </div>

                {/* Right Selected Variables List (3/8 width) */}
                <div className="col-span-3 flex flex-col border p-4 rounded-md max-h-[300px] overflow-y-auto">
                    <label className="font-semibold">Selected Variables</label>
                    <div className="space-y-2">
                        {selectedVariables.map((variable) => (
                            <div
                                key={variable}
                                className={`p-2 border cursor-pointer rounded-md hover:bg-blue-100 ${highlightedVariable === variable ? "bg-blue-100 border-blue-500" : "border-gray-300"}`}
                                onClick={() => handleDeselectRight(variable)}
                            >
                                {variable}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar for Buttons (1/8 width) */}
                <div className="col-span-2 flex flex-col justify-start space-y-4 p-4">
                    <Button variant="outline" onClick={handleAnalyze}>Analyze</Button>
                    <Button variant="outline">Charts</Button>
                    <Button variant="outline">Format</Button>
                    <Button variant="outline">Style</Button>
                    <Button variant="outline">Bootstrap</Button>
                </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-center space-x-4">
                <Button onClick={handleClose}>OK</Button>
                <Button variant="outline">Paste</Button>
                <Button variant="outline">Reset</Button>
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button variant="outline">Help</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default FrequenciesModal;
