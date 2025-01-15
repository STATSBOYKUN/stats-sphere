import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { CornerDownLeft, CornerDownRight } from "lucide-react";

interface CrosstabsModalProps {
    onClose: () => void;
}

const CrosstabsModal: React.FC<CrosstabsModalProps> = ({ onClose }) => {
    const initialListVariables = [
        "Age in years [age]",
        "Marital status [marital]",
        "Income before the program [incbef]",
        "Income after the program [incaft]",
        "Level of education [ed]",
        "Gender [gender]",
        "Number of people in household [household]",
        "Program status [prog]",
    ];

    const [listVariables, setListVariables] = useState<string[]>(initialListVariables);
    const [rowVariables, setRowVariables] = useState<string[]>([]);
    const [columnVariables, setColumnVariables] = useState<string[]>([]);
    const [layerVariables, setLayerVariables] = useState<string[][]>([[]]);
    const [currentLayer, setCurrentLayer] = useState<number>(0);
    const [highlightedVariable, setHighlightedVariable] = useState<string | null>(null);
    const [displayLayerOption, setDisplayLayerOption] = useState<boolean>(false);
    const [displayClusteredOption, setDisplayClusteredOption] = useState<boolean>(false);
    const [supressTablesOption, setSupressTablesOption] = useState<boolean>(false);

    const handleMoveRowVariables = () => {
        if (highlightedVariable) {
            if (listVariables.includes(highlightedVariable)) {
                // Pindahkan ke Rows
                setRowVariables((prev) => [...prev, highlightedVariable]);
                setListVariables((prev) =>
                    prev.filter((item) => item !== highlightedVariable)
                );
            } else if (rowVariables.includes(highlightedVariable)) {
                setListVariables((prev) => [...prev, highlightedVariable]);
                setRowVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            }
            setHighlightedVariable(null);
        }
    };

    const handleMoveColumnVariables = () => {
        if (highlightedVariable) {
            if (listVariables.includes(highlightedVariable)) {
                // Pindahkan ke Columns
                setColumnVariables((prev) => [...prev, highlightedVariable]);
                setListVariables((prev) =>
                    prev.filter((item) => item !== highlightedVariable)
                );
            } else if (columnVariables.includes(highlightedVariable)) {
                setListVariables((prev) => [...prev, highlightedVariable]);
                setColumnVariables((prev) => prev.filter((item) => item !== highlightedVariable));
            }
            setHighlightedVariable(null);
        }
    };

    const handleMoveLayerVariables = () => {
        if (highlightedVariable) {
            if (listVariables.includes(highlightedVariable)) {
                // Pindahkan ke layerVariables pada halaman saat ini
                setLayerVariables((prev) => {
                    const updated = [...prev];
                    updated[currentLayer] = [...updated[currentLayer], highlightedVariable];
                    return updated;
                });
                setListVariables((prev) =>
                    prev.filter((item) => item !== highlightedVariable)
                );
            } else if (layerVariables[currentLayer].includes(highlightedVariable)) {
                // Pindahkan kembali ke List Variables
                setListVariables((prev) => [...prev, highlightedVariable]);
                setLayerVariables((prev) => {
                    const updated = [...prev];
                    updated[currentLayer] = updated[currentLayer].filter(
                        (item) => item !== highlightedVariable
                    );
                    return updated;
                });
            }
            setHighlightedVariable(null);
        }
    };

    const handleNextLayerVariables = () => {
        if (currentLayer + 1 === layerVariables.length) {
            // Jika berada di layer terakhir, tambahkan layer baru
            setLayerVariables((prev) => [...prev, []]); // Tambahkan layer kosong
            setCurrentLayer((prev) => prev + 1); // Pindah ke layer baru
        } else if (layerVariables[currentLayer]?.length === 0) {
            // Jika layer saat ini kosong, hapus layer dan pindah ke layer sebelumnya
            setLayerVariables((prev) => {
                const updated = prev.filter((_, index) => index !== currentLayer); // Hapus layer kosong
                return updated;
            });
            setCurrentLayer((prev) => Math.max(0, prev - 1)); // Pindah ke layer sebelumnya
        } else {
            // Pindah ke layer berikutnya jika kondisi di atas tidak terpenuhi
            setCurrentLayer((prev) => prev + 1);
        }
    };
    
    const handlePreviousLayerVariables = () => {
        if (layerVariables[currentLayer]?.length === 0) {
            // Hapus layer saat ini (kosong)
            setLayerVariables((prev) => {
                const updated = prev.filter((_, index) => index !== currentLayer); // Hapus layer kosong
                return updated;
            });
            // Pindah ke layer sebelumnya
            setCurrentLayer((prev) => prev - 1);
        } else {
            // Jika layer tidak kosong, tetap di layer sebelumnya
            setCurrentLayer((prev) => prev - 1);
        }
    };    

    const handleReset = () => {
        setListVariables(initialListVariables);
        setRowVariables([]);
        setColumnVariables([]);
        setLayerVariables([[]]);
        setCurrentLayer(0);
        setHighlightedVariable(null);
        setDisplayLayerOption(false);
        setDisplayClusteredOption(false);
        setSupressTablesOption(false);
    };

    const handleRunTest = () => {
        console.log("Running test with:", { rowVariables, columnVariables, layerVariables, displayLayerOption, displayClusteredOption, supressTablesOption });
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
                <DialogTitle>Crosstabs</DialogTitle>
            </DialogHeader>

            <Separator className="my-2" />

            <div className="grid grid-cols-9 gap-2 py-4 h-[580px] overflow-y-auto">
                {/* List Variables */}
                <div
                    className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                    style={{
                        width: "250px", // Fixed width
                        height: "520px",
                    }}
                >
                    <label className="font-semibold">List Variables</label>
                    <div className="space-y-2">
                        {listVariables.map((variable) => (
                            <div
                                key={variable}
                                className={`p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${
                                    highlightedVariable === variable
                                        ? "bg-blue-100 border-blue-500"
                                        : "border-gray-300"
                                }`}
                                onClick={() => setHighlightedVariable(variable)}
                            >
                                {variable}
                            </div>
                        ))}
                    </div>
                </div>
                {/* Move Buttons */}
                <div className="col-span-1 flex flex-col items-center justify-center space-y-32">
                    {/* Tombol pertama */}
                    <Button
                        variant="link"
                        onClick={handleMoveRowVariables}
                        disabled={
                            !highlightedVariable || // Jika tidak ada variable yang disorot
                            (layerVariables.some((layer) => layer.includes(highlightedVariable))) ||
                            (columnVariables.includes(highlightedVariable))
                        }
                    >
                        {highlightedVariable && listVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} />
                        ) : highlightedVariable && rowVariables.includes(highlightedVariable) ? (
                            <CornerDownLeft size={24} />
                        ) : (
                            <CornerDownLeft size={24} />
                        )}
                    </Button>

                    {/* Tombol kedua */}
                    <Button
                        variant="link"
                        onClick={handleMoveColumnVariables}
                        disabled={
                            !highlightedVariable || // Jika tidak ada variable yang disorot
                            (layerVariables.some((layer) => layer.includes(highlightedVariable))) ||
                            (rowVariables.includes(highlightedVariable))
                        }
                    >
                        {highlightedVariable && listVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} />
                        ) : highlightedVariable && columnVariables.includes(highlightedVariable) ? (
                            <CornerDownLeft size={24} />
                        ) : (
                            <CornerDownLeft size={24} />
                        )}
                    </Button>

                    {/* Tombol kedua */}
                    <Button
                        variant="link"
                        onClick={handleMoveLayerVariables}
                        disabled={
                            !highlightedVariable || // Jika tidak ada variable yang disorot
                            (columnVariables.includes(highlightedVariable)) ||
                            (rowVariables.includes(highlightedVariable))
                        }
                    >
                        {highlightedVariable && listVariables.includes(highlightedVariable) ? (
                            <CornerDownRight size={24} />
                        ) : highlightedVariable && columnVariables.includes(highlightedVariable) ? (
                            <CornerDownLeft size={24} />
                        ) : (
                            <CornerDownLeft size={24} />
                        )}
                    </Button>
                </div>

                <div className="grid gap-2 col-span-3 items-start">
                    {/* Rows */}
                    <div className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                        style={{
                            width: "250px",
                            height: "161px",
                        }}
                    >
                        <label className="font-semibold">Rows</label>
                        <div className="space-y-2">
                            {rowVariables.map((variable) => (
                                <div
                                    key={variable}
                                    className={`p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${
                                        highlightedVariable === variable
                                            ? "bg-blue-100 border-blue-500"
                                            : "border-gray-300"
                                    }`}
                                    onClick={() => setHighlightedVariable(variable)}
                                >
                                    {variable}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Columns */}
                    <div className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                        style={{
                            width: "250px", // Fixed width
                            minHeight: "161px", // Minimum height
                            maxHeight: "161px", // Maximum height
                        }}
                    >
                        <label className="font-semibold">Columns</label>
                        <div className="space-y-2">
                            {columnVariables.map((variable) => (
                                <div
                                    key={variable}
                                    className={`p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${
                                        highlightedVariable === variable
                                            ? "bg-blue-100 border-blue-500"
                                            : "border-gray-300"
                                    }`}
                                    onClick={() => setHighlightedVariable(variable)}
                                >
                                    {variable}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-3 ">
                        <Label htmlFor="layers" className="font-semibold text-base">
                            Layer {currentLayer + 1} of {layerVariables.length}
                        </Label>
                        <div className="col-span-3 flex flex-col border p-4 rounded-md overflow-y-auto"
                            style={{
                                width: "250px", // Fixed width
                                minHeight: "114px", // Minimum height
                                maxHeight: "114px", // Maximum height
                            }}
                        >
                            <div className="space-y-2">
                                {layerVariables[currentLayer]?.map((variable) => (
                                    <div
                                        key={variable}
                                        className={`p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${
                                            highlightedVariable === variable
                                                ? "bg-blue-100 border-blue-500"
                                                : "border-gray-300"
                                        }`}
                                        onClick={() => setHighlightedVariable(variable)}
                                    >
                                        {variable}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-center space-x-4 mt-2">
                            <Button
                                variant="outline"
                                onClick={handlePreviousLayerVariables}
                                disabled={currentLayer + 1 === 1}
                                className="w-[86px]">
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleNextLayerVariables}
                                disabled={currentLayer + 1 === layerVariables.length &&
                                          layerVariables[currentLayer]?.length === 0}
                                className="w-[86px]">
                                Next
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="col-span-2 flex flex-col justify-start space-y-4 p-4">
                    <Button variant="outline">Exact...</Button>
                    <Button variant="outline">Statistics...</Button>
                    <Button variant="outline">Cells...</Button>
                    <Button variant="outline">Format...</Button>
                    <Button variant="outline">Style...</Button>
                    <Button variant="outline">Bootstrap...</Button>
                </div>

                <div className="col-span-3">
                    <div className="col-span-3 flex items-center space-x-4 py-2">
                        <Checkbox
                            id="display-clustered-option"
                            checked={displayClusteredOption}
                            onCheckedChange={(checked) => setDisplayClusteredOption(checked as boolean)}
                        />
                        <label htmlFor="display-clustered-option">Display clustered bar charts</label>
                    </div>
                    <div className="col-span-3 flex items-center space-x-4 py-2">
                        <Checkbox
                            id="supress-tables"
                            checked={supressTablesOption}
                            onCheckedChange={(checked) => setSupressTablesOption(checked as boolean)}
                        />
                        <label htmlFor="supress-tables">Supress tables</label>
                    </div>
                </div>
                <div className="col-span-1"></div>
                <div className="col-span-3">
                    <div className="col-span-3 flex items-center space-x-4 py-2">
                        <Checkbox
                            id="display-layer-option"
                            checked={displayLayerOption}
                            onCheckedChange={(checked) => setDisplayLayerOption(checked as boolean)}
                        />
                        <label htmlFor="display-layer-option">Display layer variables in table layers</label>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="flex justify-center space-x-4">
                <Button onClick={handleRunTest} disabled={rowVariables.length === 0}>
                    OK
                </Button>
                <Button variant="outline">Paste</Button>
                <Button variant="outline" onClick={handleReset}>
                    Reset</Button>
                <Button variant="outline" onClick={onClose}>
                    Cancel</Button>
                <Button variant="outline">Help</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default CrosstabsModal;
