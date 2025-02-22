"use client";

import React, { useState } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export enum FindReplaceMode {
    FIND = "find",
    REPLACE = "replace",
}

enum TabType {
    FIND = "find",
    REPLACE = "replace",
}

interface FindAndReplaceModalProps {
    onClose: () => void;
    columns?: string[];
    defaultMode?: FindReplaceMode;
}

export const FindAndReplaceModal: React.FC<FindAndReplaceModalProps> = ({
                                                                            onClose,
                                                                            columns = ["MINUTE_", "HOUR_", "DATE_", "NAME_"],
                                                                            defaultMode = FindReplaceMode.FIND,
                                                                        }) => {
    const [activeTab, setActiveTab] = useState<TabType>(
        defaultMode === FindReplaceMode.REPLACE ? TabType.REPLACE : TabType.FIND
    );
    const [selectedColumn, setSelectedColumn] = useState<string>(columns[0]);
    const [findText, setFindText] = useState<string>("");
    const [replaceText, setReplaceText] = useState<string>("");
    const [matchCase, setMatchCase] = useState<boolean>(false);
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const [matchTo, setMatchTo] = useState<"contains" | "entire_cell" | "begins_with" | "ends_with">("contains");
    const [direction, setDirection] = useState<"up" | "down">("down");

    const handleFindNext = () => {
        console.log(
            `Find Next: column=${selectedColumn}, find=${findText}, matchCase=${matchCase}, matchTo=${matchTo}, direction=${direction}`
        );
    };

    const handleReplace = () => {
        console.log(
            `Replace: column=${selectedColumn}, find=${findText}, replace=${replaceText}, matchCase=${matchCase}, matchTo=${matchTo}, direction=${direction}`
        );
    };

    const handleReplaceAll = () => {
        console.log(
            `Replace All: column=${selectedColumn}, find=${findText}, replace=${replaceText}, matchCase=${matchCase}, matchTo=${matchTo}, direction=${direction}`
        );
    };

    return (
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto px-4">
            <DialogHeader>
                <DialogTitle>Find and Replace - Data View</DialogTitle>
            </DialogHeader>

            {/* Tabs */}
            <div role="tablist" className="flex flex-wrap gap-2 border-b mb-4">
                {([TabType.FIND, TabType.REPLACE] as const).map((tab) => (
                    <button
                        key={tab}
                        role="tab"
                        aria-selected={activeTab === tab}
                        className={`py-2 px-4 rounded-t focus:outline-none focus:ring ${
                            activeTab === tab
                                ? "bg-gray-300 font-bold text-black"
                                : "bg-white text-black hover:bg-gray-100"
                        }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {/* Dropdown Column */}
                <div>
                    <label className="font-semibold mr-2" htmlFor="column-select">
                        Column:
                    </label>
                    <select
                        id="column-select"
                        className="border border-gray-300 p-2 w-full rounded focus:ring focus:border-gray-500 bg-white text-black"
                        value={selectedColumn}
                        onChange={(e) => setSelectedColumn(e.target.value)}
                    >
                        {columns.map((col) => (
                            <option key={col} value={col}>
                                {col}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Input Find */}
                <div>
                    <label className="block font-semibold mb-1" htmlFor="find-input">
                        Find:
                    </label>
                    <input
                        id="find-input"
                        type="text"
                        className="border border-gray-300 p-2 w-full rounded focus:ring focus:border-gray-500 bg-white text-black"
                        value={findText}
                        onChange={(e) => setFindText(e.target.value)}
                    />
                </div>

                {/* Input Replace (untuk tab Replace) */}
                {activeTab === TabType.REPLACE && (
                    <div>
                        <label className="block font-semibold mb-1" htmlFor="replace-input">
                            Replace with:
                        </label>
                        <input
                            id="replace-input"
                            type="text"
                            className="border border-gray-300 p-2 w-full rounded focus:ring focus:border-gray-500 bg-white text-black"
                            value={replaceText}
                            onChange={(e) => setReplaceText(e.target.value)}
                        />
                    </div>
                )}

                {/* Match Case */}
                <div className="flex items-center gap-2">
                    <input
                        id="match-case"
                        type="checkbox"
                        checked={matchCase}
                        onChange={() => setMatchCase((prev) => !prev)}
                    />
                    <label htmlFor="match-case" className="text-black">
                        Match case
                    </label>
                </div>

                {/* Toggle Advanced Options sebagai Button */}
                <div>
                    <Button
                        variant="outline"
                        onClick={() => setShowOptions((prev) => !prev)}
                        className="w-full sm:w-auto"
                    >
                        {showOptions ? "Hide Options" : "Show Options"}
                    </Button>
                </div>

                {/* Advanced Options */}
                {showOptions && (
                    <div className="border border-gray-300 p-2 rounded space-y-4 bg-white">
                        {/* Match To */}
                        <div>
                            <p className="font-semibold mb-1 text-black">Match to:</p>
                            <div className="flex flex-col gap-1">
                                {["contains", "entire_cell", "begins_with", "ends_with"].map((option) => (
                                    <label key={option} className="flex items-center gap-2 text-black">
                                        <input
                                            type="radio"
                                            name="matchTo"
                                            checked={matchTo === option}
                                            onChange={() => setMatchTo(option as any)}
                                        />
                                        {option
                                            .replace("_", " ")
                                            .replace(/\b\w/g, (char) => char.toUpperCase())}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Direction */}
                        <div>
                            <p className="font-semibold mb-1 text-black">Direction:</p>
                            <div className="flex flex-col gap-1">
                                {["up", "down"].map((dir) => (
                                    <label key={dir} className="flex items-center gap-2 text-black">
                                        <input
                                            type="radio"
                                            name="direction"
                                            checked={direction === dir}
                                            onChange={() => setDirection(dir as "up" | "down")}
                                        />
                                        {dir.charAt(0).toUpperCase() + dir.slice(1)}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <DialogFooter className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2 justify-end">
                <Button variant="outline" onClick={handleFindNext} disabled={!findText.trim()}>
                    Find Next
                </Button>

                {activeTab === TabType.REPLACE && (
                    <>
                        <Button variant="outline" onClick={handleReplace} disabled={!findText.trim()}>
                            Replace
                        </Button>
                        <Button variant="outline" onClick={handleReplaceAll} disabled={!findText.trim()}>
                            Replace All
                        </Button>
                    </>
                )}

                <Button variant="outline" onClick={onClose}>
                    Close
                </Button>
                <Button variant="outline" onClick={() => alert("Help dialog here")}>
                    Help
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};
