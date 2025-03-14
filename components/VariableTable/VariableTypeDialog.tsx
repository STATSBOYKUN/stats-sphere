"use client"

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type VariableType =
    | "NUMERIC"
    | "COMMA"
    | "DOT"
    | "SCIENTIFIC"
    | "DATE"
    | "ADATE"
    | "EDATE"
    | "SDATE"
    | "JDATE"
    | "QYR"
    | "MOYR"
    | "WKYR"
    | "DATETIME"
    | "TIME"
    | "DTIME"
    | "WKDAY"
    | "MONTH"
    | "DOLLAR"
    | "CCA"
    | "CCB"
    | "CCC"
    | "CCD"
    | "CCE"
    | "STRING"
    | "RESTRICTED_NUMERIC";

interface DateFormatOption {
    value: string;
    label: string;
    type: VariableType;
    width: number;
}

interface DollarFormatOption {
    value: string;
    label: string;
    width: number;
    decimals: number;
}

interface VariableTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (type: string, width: number, decimals: number) => void;
    initialType: string;
    initialWidth: number;
    initialDecimals: number;
}

export const VariableTypeDialog: React.FC<VariableTypeDialogProps> = ({
                                                                          open,
                                                                          onOpenChange,
                                                                          onSave,
                                                                          initialType,
                                                                          initialWidth,
                                                                          initialDecimals
                                                                      }) => {
    const [selectedType, setSelectedType] = useState<string>(initialType);
    const [width, setWidth] = useState<number>(initialWidth);
    const [decimals, setDecimals] = useState<number>(initialDecimals);
    const [dateFormat, setDateFormat] = useState<string>("dd-mmm-yyyy");
    const [dollarFormat, setDollarFormat] = useState<string>("$### ###,###.##");
    const [selectedCurrencyFormat, setSelectedCurrencyFormat] = useState<string>("CCA");

    useEffect(() => {
        const defaultDateFormat = dateFormats.find(f => f.value === "dd-mmm-yyyy");
        if (defaultDateFormat) {
            if (selectedType === "DATE") {
                setWidth(defaultDateFormat.width);
            }
        }

        const defaultDollarFormat = dollarFormats.find(f => f.value === "$### ###,###.##");
        if (defaultDollarFormat) {
            if (selectedType === "DOLLAR") {
                setWidth(defaultDollarFormat.width);
                setDecimals(defaultDollarFormat.decimals);
            }
        }
    }, []);

    const dateFormats: DateFormatOption[] = [
        { value: "dd-mmm-yyyy", label: "dd-mmm-yyyy", type: "DATE", width: 11 },
        { value: "dd-mmm-yy", label: "dd-mmm-yy", type: "DATE", width: 9 },
        { value: "mm/dd/yyyy", label: "mm/dd/yyyy", type: "ADATE", width: 10 },
        { value: "mm/dd/yy", label: "mm/dd/yy", type: "ADATE", width: 8 },
        { value: "dd.mm.yyyy", label: "dd.mm.yyyy", type: "EDATE", width: 10 },
        { value: "dd.mm.yy", label: "dd.mm.yy", type: "EDATE", width: 8 },
        { value: "yyyy/mm/dd", label: "yyyy/mm/dd", type: "SDATE", width: 10 },
        { value: "yy/mm/dd", label: "yy/mm/dd", type: "SDATE", width: 8 },
        { value: "yydddd", label: "yydddd", type: "JDATE", width: 5 },
        { value: "yyyyddd", label: "yyyyddd", type: "JDATE", width: 7 },
        { value: "q Q yyyy", label: "q Q yyyy", type: "QYR", width: 8 },
        { value: "q Q yy", label: "q Q yy", type: "QYR", width: 6 },
        { value: "mmm yyyy", label: "mmm yyyy", type: "MOYR", width: 8 },
        { value: "mmm yy", label: "mmm yy", type: "MOYR", width: 6 },
        { value: "ww WK yyyy", label: "ww WK yyyy", type: "WKYR", width: 10 },
        { value: "ww WK yy", label: "ww WK yy", type: "WKYR", width: 8 },
        { value: "dd-mmm-yyyy hh:mm", label: "dd-mmm-yyyy hh:mm", type: "DATETIME", width: 17 },
        { value: "dd-mmm-yyyy hh:mm:ss", label: "dd-mmm-yyyy hh:mm:ss", type: "DATETIME", width: 20 },
        { value: "dd-mmm-yyyy hh:mm:ss.ss", label: "dd-mmm-yyyy hh:mm:ss.ss", type: "DATETIME", width: 23 },
        { value: "my-mm-dd hh:mm", label: "my-mm-dd hh:mm", type: "DATETIME", width: 16 },
        { value: "my-mm-dd hh:mm:ss", label: "my-mm-dd hh:mm:ss", type: "DATETIME", width: 19 },
        { value: "yyyy-mm-dd hh:mm:ss.ss", label: "yyyy-mm-dd hh:mm:ss.ss", type: "DATETIME", width: 22 },
        { value: "mm:ss", label: "mm:ss", type: "TIME", width: 5 },
        { value: "mm:ss.ss", label: "mm:ss.ss", type: "TIME", width: 8 },
        { value: "hh:mm", label: "hh:mm", type: "TIME", width: 5 },
        { value: "hh:mm:ss", label: "hh:mm:ss", type: "TIME", width: 8 },
        { value: "hh:mm:ss.ss", label: "hh:mm:ss.ss", type: "TIME", width: 11 },
        { value: "ddd hh:mm", label: "ddd hh:mm", type: "DTIME", width: 9 },
        { value: "ddd hh:mm:ss", label: "ddd hh:mm:ss", type: "DTIME", width: 12 },
        { value: "ddd hh:mm:ss.ss", label: "ddd hh:mm:ss.ss", type: "DTIME", width: 15 },
        { value: "Monday, Tuesday, ...", label: "Monday, Tuesday, ...", type: "WKDAY", width: 9 },
        { value: "Mon, Tue, Wed, ...", label: "Mon, Tue, Wed, ...", type: "WKDAY", width: 3 },
        { value: "January, February, ...", label: "January, February, ...", type: "MONTH", width: 9 },
        { value: "Jan, Feb, Mar, ...", label: "Jan, Feb, Mar, ...", type: "MONTH", width: 3 }
    ];

    // Dollar format options
    const dollarFormats: DollarFormatOption[] = [
        { value: "$# ###", label: "$# ###", width: 6, decimals: 0 },
        { value: "$# ###.##", label: "$# ###.##", width: 9, decimals: 2 },
        { value: "$###,###", label: "$###,###", width: 8, decimals: 0 },
        { value: "$###,###.##", label: "$###,###.##", width: 11, decimals: 2 },
        { value: "$### ###", label: "$### ###", width: 8, decimals: 0 },
        { value: "$### ###.##", label: "$### ###.##", width: 11, decimals: 2 },
        { value: "$### ###,###", label: "$### ###,###", width: 12, decimals: 0 },
        { value: "$### ###,###.##", label: "$### ###,###.##", width: 15, decimals: 2 }
    ];

    // Set default values based on type
    useEffect(() => {
        if (selectedType === "STRING") {
            setWidth(8);
            setDecimals(0);
        } else if (["NUMERIC", "COMMA", "DOT", "SCIENTIFIC"].includes(selectedType)) {
            if (initialType !== selectedType) {
                setWidth(8);
                setDecimals(2);
            }
        } else if (selectedType === "RESTRICTED_NUMERIC") {
            setWidth(8);
            setDecimals(0);
        } else if (selectedType === "DATE") {
            const format = dateFormats.find(f => f.value === dateFormat);
            if (format) {
                setWidth(format.width);
                setDecimals(0);
            }
        } else if (selectedType === "DOLLAR") {
            const format = dollarFormats.find(f => f.value === dollarFormat);
            if (format) {
                setWidth(format.width);
                setDecimals(format.decimals);
            } else {
                setWidth(8);
                setDecimals(2);
            }
        } else if (selectedType === "CUSTOM_CURRENCY") {
            setWidth(8);
            setDecimals(2);
        } else if (["CCA", "CCB", "CCC", "CCD", "CCE"].includes(selectedType)) {
            if (initialType !== selectedType) {
                setWidth(8);
                setDecimals(2);
            }
        }
    }, [selectedType, dateFormat, dollarFormat]);

    // Handle date format change
    const handleDateFormatChange = (value: string) => {
        setDateFormat(value);
        const format = dateFormats.find(f => f.value === value);
        if (format) {
            // Hanya update width berdasarkan format yang dipilih
            setWidth(format.width);
        }
    };

    // Handle dollar format selection
    const handleDollarFormatSelect = (value: string) => {
        setDollarFormat(value);
        const format = dollarFormats.find(f => f.value === value);
        if (format) {
            setWidth(format.width);
            setDecimals(format.decimals);
        }
    };

    // Handle currency format selection
    const handleCurrencyFormatSelect = (currencyType: string) => {
        setSelectedType(currencyType);
    };

    // Handle save
    const handleSave = () => {
        let finalType = selectedType;
        let finalWidth = width;
        let finalDecimals = decimals;

        // For date types, get the correct type based on format
        if (selectedType === "DATE") {
            const format = dateFormats.find(f => f.value === dateFormat);
            if (format) {
                finalType = format.type as string;
            }
        }

        // For custom currency, use the selected format as type
        if (selectedType === "CUSTOM_CURRENCY" && selectedCurrencyFormat) {
            finalType = selectedCurrencyFormat;
        }

        onSave(finalType, finalWidth, finalDecimals);
        onOpenChange(false);
    };

    const isNumericType = ["NUMERIC", "COMMA", "DOT", "SCIENTIFIC", "RESTRICTED_NUMERIC"].includes(selectedType);
    const isCurrencyType = ["CCA", "CCB", "CCC", "CCD", "CCE"].includes(selectedType) || selectedType === "DOLLAR";
    const isDateType = ["DATE", "ADATE", "EDATE", "SDATE", "JDATE", "QYR", "MOYR", "WKYR", "DATETIME", "TIME", "DTIME", "WKDAY", "MONTH"].includes(selectedType);

    // Group date formats by type for SelectContent
    const groupedDateFormats: { [key: string]: DateFormatOption[] } = dateFormats.reduce((acc, format) => {
        const type = format.type as string;
        if (!acc[type]) acc[type] = [];
        acc[type].push(format);
        return acc;
    }, {} as { [key: string]: DateFormatOption[] });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white shadow-md">
                <DialogHeader className="pb-2 border-b border-gray-100">
                    <DialogTitle className="text-lg font-medium">Variable Type</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <RadioGroup value={selectedType} onValueChange={setSelectedType}>
                            {[
                                { id: "NUMERIC", label: "Numeric" },
                                { id: "COMMA", label: "Comma" },
                                { id: "DOT", label: "Dot" },
                                { id: "SCIENTIFIC", label: "Scientific notation" },
                                { id: "DATE", label: "Date" },
                                { id: "DOLLAR", label: "Dollar" },
                                { id: "CUSTOM_CURRENCY", label: "Custom currency" },
                                { id: "STRING", label: "String" },
                                { id: "RESTRICTED_NUMERIC", label: "Restricted Numeric (integer with leading zeros)" }
                            ].map((type) => (
                                <div key={type.id} className="flex items-center space-x-2 py-1.5">
                                    <RadioGroupItem value={type.id} id={type.id} className="border-gray-400 text-gray-800" />
                                    <Label htmlFor={type.id} className="text-gray-800">
                                        {type.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <div className="h-72 overflow-y-auto border border-gray-200 rounded p-1.5">
                        <div className="space-y-4">
                            {isNumericType && (
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="width" className="text-gray-700">
                                            Width:
                                        </Label>
                                        <Input
                                            id="width"
                                            type="number"
                                            value={width}
                                            onChange={(e) => setWidth(Number(e.target.value))}
                                            min={1}
                                            max={64}
                                        />
                                    </div>

                                    {selectedType !== "RESTRICTED_NUMERIC" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="decimals" className="text-gray-700">
                                                Decimal Places:
                                            </Label>
                                            <Input
                                                id="decimals"
                                                type="number"
                                                value={decimals}
                                                onChange={(e) => setDecimals(Number(e.target.value))}
                                                min={0}
                                                max={16}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {isDateType && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Format:</Label>
                                        <Select value={dateFormat} onValueChange={handleDateFormatChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select format" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-72">
                                                {dateFormats.map(format => (
                                                    <SelectItem key={format.value} value={format.value}>
                                                        {format.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dateWidth" className="text-gray-700">
                                            Width:
                                        </Label>
                                        <Input
                                            id="dateWidth"
                                            type="number"
                                            value={width}
                                            readOnly
                                            className="bg-gray-50"
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedType === "STRING" && (
                                <div className="space-y-2">
                                    <Label htmlFor="characters" className="text-gray-700">
                                        Characters:
                                    </Label>
                                    <Input
                                        id="characters"
                                        type="number"
                                        value={width}
                                        onChange={(e) => setWidth(Number(e.target.value))}
                                        min={1}
                                        max={64}
                                    />
                                </div>
                            )}

                            {selectedType === "CUSTOM_CURRENCY" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Currency Format:</Label>
                                        <div className="border rounded h-20 overflow-y-auto">
                                            {[
                                                { type: "CCA", label: "CCA" },
                                                { type: "CCB", label: "CCB" },
                                                { type: "CCC", label: "CCC" },
                                                { type: "CCD", label: "CCD" },
                                                { type: "CCE", label: "CCE" }
                                            ].map(currency => (
                                                <div
                                                    key={currency.type}
                                                    className={`p-1.5 cursor-pointer border-l-2 ${selectedCurrencyFormat === currency.type ? 'bg-gray-200 border-l-gray-800' : 'border-l-transparent hover:bg-gray-100'}`}
                                                    onClick={() => {
                                                        setSelectedCurrencyFormat(currency.type);
                                                    }}
                                                >
                                                    {currency.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="currencyWidth" className="text-gray-700">
                                            Width:
                                        </Label>
                                        <Input
                                            id="currencyWidth"
                                            type="number"
                                            value={width}
                                            onChange={(e) => setWidth(Number(e.target.value))}
                                            min={1}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="currencyDecimals" className="text-gray-700">
                                            Decimal Places:
                                        </Label>
                                        <Input
                                            id="currencyDecimals"
                                            type="number"
                                            value={decimals}
                                            onChange={(e) => setDecimals(Number(e.target.value))}
                                            min={0}
                                            max={16}
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedType === "DOLLAR" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Dollar Format:</Label>
                                        <div className="border rounded h-24 overflow-y-auto">
                                            {dollarFormats.map(format => (
                                                <div
                                                    key={format.value}
                                                    className={`p-1.5 cursor-pointer border-l-2 ${dollarFormat === format.value ? 'bg-gray-200 border-l-gray-800' : 'border-l-transparent hover:bg-gray-100'}`}
                                                    onClick={() => handleDollarFormatSelect(format.value)}
                                                >
                                                    {format.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dollarWidth" className="text-gray-700">
                                            Width:
                                        </Label>
                                        <Input
                                            id="dollarWidth"
                                            type="number"
                                            value={width}
                                            readOnly
                                            className="bg-gray-50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dollarDecimals" className="text-gray-700">
                                            Decimal Places:
                                        </Label>
                                        <Input
                                            id="dollarDecimals"
                                            type="number"
                                            value={decimals}
                                            readOnly
                                            className="bg-gray-50"
                                        />
                                    </div>
                                </div>
                            )}

                            {["CCA", "CCB", "CCC", "CCD", "CCE"].includes(selectedType) && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">
                                            {selectedType} Currency Format
                                        </Label>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customCurrencyWidth" className="text-gray-700">
                                            Width:
                                        </Label>
                                        <Input
                                            id="customCurrencyWidth"
                                            type="number"
                                            value={width}
                                            onChange={(e) => setWidth(Number(e.target.value))}
                                            min={1}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customCurrencyDecimals" className="text-gray-700">
                                            Decimal Places:
                                        </Label>
                                        <Input
                                            id="customCurrencyDecimals"
                                            type="number"
                                            value={decimals}
                                            onChange={(e) => setDecimals(Number(e.target.value))}
                                            min={0}
                                            max={16}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-start mt-4 text-sm">
                    <div className="text-blue-600 mr-2 text-2xl">ⓘ</div>
                    <div>
                        The Numeric type honors the digit grouping setting, while the Restricted Numeric never uses digit grouping.
                    </div>
                </div>

                <DialogFooter className="flex justify-center space-x-2 mt-3 pt-2 border-t border-gray-100">
                    <Button onClick={handleSave} variant="secondary" className="bg-gray-800 hover:bg-gray-700 text-white">OK</Button>
                    <Button onClick={() => onOpenChange(false)} variant="outline" className="border-gray-300 text-gray-800">Cancel</Button>
                    <Button variant="secondary" className="bg-gray-800 hover:bg-gray-700 text-white">Help</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};