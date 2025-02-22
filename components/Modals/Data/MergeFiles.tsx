"use client";

import React, { useState } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AddVariablesModalProps {
    onClose: () => void;
    activeDatasetName: string; // contoh: "dummy.sav [DataSet1]"
    openDatasets?: string[];   // daftar dataset SPSS yang terbuka
}

const AddVariablesModal: React.FC<AddVariablesModalProps> = ({
                                                                 onClose,
                                                                 activeDatasetName,
                                                                 openDatasets = [],
                                                             }) => {
    const [sourceType, setSourceType] = useState<"open" | "external">("open");
    const [selectedOpenDataset, setSelectedOpenDataset] = useState<string | null>(null);
    const [externalFilePath, setExternalFilePath] = useState<string>("");

    // Untuk menentukan apakah tombol Continue aktif
    const canContinue =
        (sourceType === "open" && selectedOpenDataset !== null) ||
        (sourceType === "external" && externalFilePath.trim() !== "");

    const handleContinue = () => {
        // Logika untuk melanjutkan proses merge
        // ...
        onClose();
    };

    return (
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>Add Variables to {activeDatasetName}</DialogTitle>
                <DialogDescription>
                    Select a dataset from the list of open datasets or from a file to merge
                    with the active dataset.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
                {/* Pilihan: An open dataset */}
                <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="datasetSource"
                            checked={sourceType === "open"}
                            onChange={() => setSourceType("open")}
                        />
                        An open dataset
                    </label>

                    {/* List open datasets (contoh tampilan sederhana) */}
                    <div className={`ml-6 mt-2 ${sourceType === "open" ? "block" : "hidden"}`}>
                        {openDatasets.length > 0 ? (
                            <select
                                value={selectedOpenDataset || ""}
                                onChange={(e) => setSelectedOpenDataset(e.target.value)}
                                className="border p-1 w-full"
                            >
                                <option value="">-- Select an open dataset --</option>
                                {openDatasets.map((ds) => (
                                    <option key={ds} value={ds}>
                                        {ds}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-gray-500 italic">No open datasets available.</p>
                        )}
                    </div>
                </div>

                {/* Pilihan: An external SPSS Statistics data file */}
                <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="datasetSource"
                            checked={sourceType === "external"}
                            onChange={() => setSourceType("external")}
                        />
                        An external SPSS Statistics data file
                    </label>

                    {/* Input file path dan tombol Browse */}
                    <div className={`ml-6 mt-2 ${sourceType === "external" ? "block" : "hidden"}`}>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="File path..."
                                value={externalFilePath}
                                onChange={(e) => setExternalFilePath(e.target.value)}
                                className="border p-1 flex-1"
                            />
                            <Button
                                variant="outline"
                                onClick={() => {
                                    // Contoh logika untuk file picker
                                    const fakePath = "C:\\Users\\Example\\Documents\\external.sav";
                                    setExternalFilePath(fakePath);
                                }}
                            >
                                Browse
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Catatan tentang Non-SPSS files */}
                <div className="text-sm text-gray-500">
                    Non-SPSS Statistics data files must be opened in SPSS Statistics before
                    they can be used as part of a merge.
                </div>
            </div>

            <DialogFooter className="mt-4">
                <Button
                    variant="outline"
                    disabled={!canContinue}
                    onClick={handleContinue}
                >
                    Continue
                </Button>
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="outline" onClick={() => alert("Help dialog here")}>
                    Help
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default AddVariablesModal;
