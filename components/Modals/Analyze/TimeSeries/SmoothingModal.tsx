import React, { useState, useEffect, FC} from "react";
import { CornerDownLeft, CornerDownRight } from "lucide-react";
import { useVariableStore } from "@/stores/useVariableStore";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";  
import { Label } from "@/components/ui/label";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { InputRow } from "./timeSeriesComponent/timeSeriesInput";
import { handleSmoothing } from "./handleAnalyze/handleSmoothing";
import db from "@/lib/db"; // Adjust the import path according to your project structure

interface VariableDef {
    name: string;
    columnIndex: number;
    type: string;
    label: string;
    values: string;
    missing: string;
    measure: string;
    width: number;
    decimals: number;
    columns: number;
    align: string;
}
type RawData = string[][];
interface SmoothingModalProps {
    onClose: () => void;
}

const SmoothingModal: React.FC<SmoothingModalProps> = ({ onClose }) => {
    const methods = [
        { value: 'sma', label: 'Simple Moving Average' },
        { value: 'dma', label: 'Double Moving Average' },
        { value: 'wma', label: 'Weighted Moving Average' },
        { value: 'ses', label: 'Simple Exponential Smoothing' },
        { value: 'des', label: 'Double Exponential Smoothing' },
        { value: 'holt', label: 'Holt\'s Method Exponential Smoothing' },
        { value: 'winter', label: 'Winter\'s Method Exponential Smoothing' },
    ];

    const periods = [
        { value: '7', label: 'Daily in Week', id: 'diw'},
        { value: '30', label: 'Daily in Month', id: 'dim'},
        { value: '4', label: 'Weekly in Month', id: 'wim'},
        { value: '2', label: 'Semi Annual', id: 'sa'},
        { value: '3', label: 'Four-Monthly', id: 'fm'},
        { value: '4', label: 'Quarterly', id: 'q'},
        { value: '12', label: 'Monthly', id: 'm'},
    ];

    const [selectedMethod, setSelectedMethod] = useState<string[]>(['','']);
    const [parameters, setParameters] = useState<number[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<string[]>(['7','Daily in Week']);
    const [saveForecasting, setSaveForecasting] = useState<boolean>(false);
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);
    const [dataVariable, setDataVariable] = useState<string[]>([]);
    const [timeVariable, setTimeVariable] = useState<string[]>([]);
    const [highlightedVariable, setHighlightedVariable] = useState<string | null>(null);
    const [isCalculating, setIsCalculating] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const variables = useVariableStore((state) => state.variables) as VariableDef[];
    const data = useDataStore((state) => state.data) as RawData;
    const setData = useDataStore((state) => state.setData);
    const addVariable = useVariableStore((state) => state.addVariable);
    const { addLog, addAnalytic, addStatistic } = useResultStore();

    useEffect(() => {
            setAvailableVariables(variables.map((v) => v.name));
    }, [variables]);

    const handleSelectDataVariable = (variable: string) => {
        if (highlightedVariable === variable && dataVariable.length === 0) {
            setDataVariable((prev) => [...prev, variable]);
            setAvailableVariables((prev) => prev.filter((item) => item !== variable));
            setHighlightedVariable(null);
        } else {
            alert("A variable can only belong to one group, and Data Variable can only contain one variable.");
        }
    };

    const handleSelectTimeVariable = (variable: string) => {
        if (highlightedVariable === variable && timeVariable.length === 0) {
            setTimeVariable((prev) => [...prev, variable]);
            setAvailableVariables((prev) => prev.filter((item) => item !== variable));
            setHighlightedVariable(null);
        } else {
            alert("A variable can only belong to one group, and Time Variable can only contain one variable.");
        }
    };

    const handleDeselectDataVariable = (variable: string) => {
        if (highlightedVariable === variable) {
            setAvailableVariables((prev) => [...prev, variable]);
            setDataVariable((prev) => prev.filter((item) => item !== variable));
            setHighlightedVariable(null);
        } else {
            setHighlightedVariable(variable);
        }
    };

    const handleDeselectTimeVariable = (variable: string) => {
        if (highlightedVariable === variable) {
            setAvailableVariables((prev) => [...prev, variable]);
            setTimeVariable((prev) => prev.filter((item) => item !== variable));
            setHighlightedVariable(null);
        } else {
            setHighlightedVariable(variable);
        }
    };

    const handleSelectedMethod = (value: string) => {
        setSelectedMethod([value,methods.find((method) => method.value === value)!.label]);
        setSaveForecasting(true);
    };

    const handleSelectedPeriod = (id: string) => {
        setSelectedPeriod([periods.find((period) => period.id === id)!.value, periods.find((period) => period.id === id)!.label]);
        parameters[3] = parseInt(periods.find((period) => period.id === id)!.value);
        handleInputChange(3, parameters[3]);
    }

    const handleInputChange = (index: number, value: number) => {
        let newParameters = [...parameters];  
        newParameters[index] = value;   
        setParameters(newParameters);         
    };    

    const handleReset = () => {
        setSelectedMethod(['','']);
        setParameters([]);
        setSelectedPeriod(['7','Daily in Week']);
        setSaveForecasting(false);
        setAvailableVariables(variables.map((v) => v.name));
        setDataVariable([]);
        setTimeVariable([]);
        setHighlightedVariable(null);
    }
    
    const handleAnalyzes = async () => {
        if (!dataVariable.length) {
            setErrorMsg("Please select at least one used variable.");
            return;
        }
        if (!timeVariable.length) {
            setErrorMsg("Please select at least one time variable.");
            return;
        }
        if (!selectedMethod[0]) {
            setErrorMsg("Please select a method.");
            return;
        }
        setErrorMsg(null);
        setIsCalculating(true);
        try{
            // Cari baris data terakhir yang masih berisi
            let maxIndex = -1;
            const selectedVariables = [...dataVariable, ...timeVariable];
            data.forEach((row, rowIndex) => {
                let hasData = false;
                for (const varName of selectedVariables) {
                    const varDef = variables.find((v) => v.name === varName);
                    if (!varDef) continue;
                    const rawValue = row[varDef.columnIndex];
                    if (rawValue !== null && rawValue !== "") {
                        hasData = true;
                        break;
                    }
                }
                if (hasData) maxIndex = rowIndex;
            });
            if (maxIndex < 0) maxIndex = 0;

            // Potong data sampai maxIndex
            const slicedData: Record<string, string | number | null>[] = [];
            for (let i = 0; i <= maxIndex; i++) {
                const row = data[i];
                const rowObj: Record<string, string | number | null> = {};
                selectedVariables.forEach((varName) => {
                    const varDef = variables.find((v) => v.name === varName);
                    if (!varDef) return;
                    const rawValue = row[varDef.columnIndex];
                    const num = rawValue;
                    rowObj[varName] = num;
                });
                slicedData.push(rowObj);
            }

            // Definisi variabel terpilih
            const varDefs = selectedVariables.map((varName) => {
                const varDef = variables.find((v) => v.name === varName);
                return {
                    name: varDef?.name ?? "",
                    type: varDef?.type ?? "",
                    label: varDef?.label ?? "",
                    values: varDef?.values ?? "",
                    missing: varDef?.missing ?? "",
                    measure: varDef?.measure ?? "",
                };
            });

            const dataValues = slicedData.map(rowObj => rowObj[varDefs[0].name]).filter(value => value !== null).map(value => parseFloat(value as string));
            const timeValues = slicedData.map(rowObj => rowObj[varDefs[1].name]).filter(value => value != null).map(value => String(value));

            if (dataValues.length === 0) {
                setErrorMsg("No data available for the selected variables.");
                setIsCalculating(false);
                return;
            }
            if (timeValues.length === 0) {
                setErrorMsg("No data available for the selected time variables.");
                setIsCalculating(false);
                return;
            }
            if(dataValues.length != timeValues.length){
                setErrorMsg("Data and Time length is not equal");
                setIsCalculating(false);
                return;
            }
            if (selectedMethod[0] === 'winter') {
                if (dataValues.length < 4 * Number(selectedPeriod[0])) {
                    setErrorMsg("Data length is less than 4 times the periodicity.");
                    setIsCalculating(false);
                    return;
                }
                if (dataValues.length % Number(selectedPeriod[0]) !== 0) {
                    setErrorMsg("Data length is not a multiple of the periodicity.");
                    setIsCalculating(false);
                    return;
                }
            }

            let [smoothingResult, smoothingGraphic, smoothingEvaluation]: [any[], any, any] = await handleSmoothing(dataValues as number[], varDefs[0].name, timeValues as string[], varDefs[1].name, parameters, selectedMethod[0]);
            console.log(slicedData);
            // Membuat Log
            const logMsg = `SMOOTHING: ${varDefs[0].label? varDefs[0].label + ' Using' : varDefs[0].name + ' Using'} ${selectedMethod[1]} method with parameters ${parameters.join(", ")}.`;
            const logId = await addLog({ log: logMsg });

            // Membuat Judul Log
            const analyticId = await addAnalytic({
                log_id: logId,
                title: `Smoothing ${selectedMethod[1]}`,
                note: "",
            });

            // Membuat Tabel Evaluasi pada Log
            const graphic = await addStatistic({
                analytic_id: analyticId,
                title: `Smoothing Graphic`,
                output_data: smoothingGraphic,
                components: "Smoothing Graphic",
            });

            // Membuat Tabel Evaluasi pada Log
            const evaluation = await addStatistic({
                    analytic_id: analyticId,
                    title: "Smoothing Evalution",
                    output_data: smoothingEvaluation,
                    components: "Smoothing Evaluation",
            });

            // Jika Menyimpan Forecasting Dicentang
            if (saveForecasting) {
                // Jika panjang smoothingResult lebih pendek, tambahkan nilai kosong atau nilai default
                if (smoothingResult.length < data.length) {
                    const missingRows = data.length - smoothingResult.length;
                    const filler = new Array(missingRows).fill(""); // Menambahkan nilai kosong atau sesuai kebutuhan
                    smoothingResult = [...smoothingResult, ...filler];
                }
                // Menambahkan nilai dari newStringRow ke setiap baris di data sebagai kolom baru
                const updatedData = data.map((row, index) => {
                    // Cari kolom pertama yang kosong
                    const updatedRow = [...row];
                    for (let colIndex = 0; colIndex < updatedRow.length; colIndex++) {
                        // Jika kolom kosong, masukkan nilai dari smoothingResult
                        if (updatedRow[colIndex] === '') {
                            updatedRow[colIndex] = smoothingResult[index].toString(); // Menambahkan nilai ke kolom yang kosong
                            break; // Keluar dari loop setelah mengisi kolom pertama yang kosong
                        }
                    }
                    return updatedRow;
                });
                setData(updatedData);
                const smoothingVariable = {
                    name: `${varDefs[0].name} ${selectedMethod[0]}-${variables.length}`,
                    columnIndex: variables.length,
                    type: 'numeric',
                    label: '',
                    values: '',
                    missing: '',
                    measure: 'scale',
                    width: 8,
                    decimals: 3,
                    columns: 200,
                    align: 'left',
                };
                await addVariable(smoothingVariable);
                // Perbarui state `variables` di store secara langsung
                const updatedVariables = [...variables, smoothingVariable];
                useVariableStore.setState({ variables: updatedVariables });
                // Simpan hasil smoothing ke IndexDB
                const smoothingCells = smoothingResult.map((value, index) => ({
                    x: smoothingVariable.columnIndex, // Kolom baru untuk hasil smoothing
                    y: index, // Baris yang sesuai
                    value: value.toString(), // Konversi nilai ke string
                }));
                await db.cells.bulkPut(smoothingCells);
            }

            setIsCalculating(false);
            onClose();
        }
        catch (ex){
            console.error(ex);
            if (ex instanceof Error) {
                setErrorMsg(ex.message);
            } else {
                setErrorMsg("An unknown error occurred.");
            }
            setIsCalculating(false);
        }
    }

    const inputParameters = (method: string) => {
        switch (method) {
            case 'sma': case 'dma': case 'wma':
                return (
                    <InputRow label="distance" id="par1" value={parameters[0]} min={'2'} max={'11'} step={'1'} onChange={(value) => handleInputChange(0, value)} />
                );
            case 'ses': case 'des':
                return (
                    <InputRow label="alpha" id="par1" value={parameters[0]} min={'0.1'} max={'0.9'} step={'0.1'} onChange={(value) => handleInputChange(0, value)} />
                );
            case 'holt':
                return (
                    <div className="flex flex-row gap-2">
                        <InputRow label="alpha" id="par1" value={parameters[0]} min={'0.1'} max={'0.9'} step={'0.1'} onChange={(value) => handleInputChange(0, value)} />
                        <InputRow label="beta" id="par2" value={parameters[1]} min={'0.1'} max={'0.9'} step={'0.1'} onChange={(value) => handleInputChange(1, value)} />
                    </div>
                );
            case 'winter':
                return (
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2">
                            <InputRow label="alpha" id="par1" value={parameters[0]} min={'0.1'} max={'0.9'} step={'0.1'} onChange={(value) => handleInputChange(0, value)} />
                            <InputRow label="beta" id="par2" value={parameters[1]} min={'0.1'} max={'0.9'} step={'0.1'} onChange={(value) => handleInputChange(1, value)} />
                            <InputRow label="gamma" id="par3" value={parameters[2]} min={'0.1'} max={'0.9'} step={'0.1'} onChange={(value) => handleInputChange(2, value)} />
                        </div>
                        
                        <div className="flex flex-row mt-2">
                            <div className="flex items-center"><label className="w-[100px] text-sm font-semibold" htmlFor="par4">periodicity : {selectedPeriod[0]}</label></div>
                            <Select onValueChange={(value) => handleSelectedPeriod(value)} defaultValue={selectedPeriod[1]}>
                                <SelectTrigger className="">
                                    <SelectValue>{selectedPeriod[1]}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {periods.map((period) => (<SelectItem key={period.id} value={period.id}>{period.label}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );
        default:
            return (<div></div>);
        }
    }

    useEffect(() => {
        switch (selectedMethod[0]) {
            case 'sma': case 'dma': case 'wma':
                setParameters([2]);
                break;
            case 'ses': case 'des':
                setParameters([0.1]);
                break;
            case 'holt':
                setParameters([0.1, 0.1]);
                break;
            case 'winter':
                setParameters([0.1, 0.1, 0.1, 2]);
                break;
            default:
                setParameters([]);
                break;
        }
    }, [selectedMethod]);

    console.log(availableVariables);

    return(
        <DialogContent className="max-w-[75vw] max-h-[90vh] flex flex-col space-y-0 overflow-y-auto">
            <div className="pb-4 ml-4">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">Smoothing</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
            </div>

            {/* Awal Konten */}
            <div className="flex items-center justify-center">
                <div className="flex md:flex-row flex-col gap-4">
                    {/* Awal Kolom Satu */}
                    <div className="col-span-3 flex flex-col border-2 p-4 rounded-md max-h-[300px] overflow-y-auto w-[200px]">
                        <label className="font-semibold">Available Variables</label>
                        <div className="space-y-2">
                            {availableVariables.map((variable) => (
                                <div
                                    key={variable} className={`p-2 border cursor-pointer rounded-md hover:bg-gray-100 ${
                                        highlightedVariable === variable ? "bg-blue-100 border-blue-500" : "border-gray-300"
                                    }`} onClick={() => setHighlightedVariable(variable)}
                                >
                                    {variable}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Akhir Kolom Satu */}

                    {/* Awal Kolom Dua */}
                    <div className="col-span-1 flex flex-col gap-4">
                        {/* Awal Baris Satu Kolom Dua */}
                        <div className="flex flex-row gap-4">
                            <div className="flex items-center">
                                <Button
                                    variant="link" className="border-2 rounded-md" disabled={!highlightedVariable}
                                    onClick={() => highlightedVariable && (dataVariable.length === 0 || availableVariables.includes(highlightedVariable))?
                                        handleSelectDataVariable(highlightedVariable!) : highlightedVariable && handleDeselectDataVariable(highlightedVariable!)
                                    }
                                >
                                    {highlightedVariable && availableVariables.includes(highlightedVariable) ? (
                                        <CornerDownRight size={24} />
                                    ) : highlightedVariable && dataVariable.includes(highlightedVariable) ? (
                                        <CornerDownLeft size={24} />
                                    ) : (
                                        <CornerDownLeft size={24} />
                                    )}
                                </Button>
                            </div>
                            <div className="flex flex-col border-2 p-4 rounded-md h-[120px] overflow-y-auto w-[200px]">
                                <label className="font-semibold">Used Variable</label>
                                <div className="space-y-2">
                                    {dataVariable.map((variable) => (
                                        <div key={variable} className={`p-2 border cursor-pointer rounded-md hover:bg-blue-100 ${
                                                highlightedVariable === variable ? "bg-blue-100 border-blue-500" : "border-gray-300"
                                            }`} onClick={() => setHighlightedVariable(variable)}
                                        >
                                            {variable}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Akhir Baris Satu Kolom Dua */}
                        
                        {/* Awal Baris Dua Kolom Dua */}
                        <div className="flex flex-row gap-4">
                            <div className="flex items-center">
                                <Button
                                    variant="link" className="border-2 rounded-md" disabled={!highlightedVariable}
                                    onClick={() => highlightedVariable && (timeVariable.length === 0 || availableVariables.includes(highlightedVariable)) ?
                                        handleSelectTimeVariable(highlightedVariable) : highlightedVariable && handleDeselectTimeVariable(highlightedVariable)
                                    }
                                >
                                    {highlightedVariable && availableVariables.includes(highlightedVariable) ? (
                                        <CornerDownRight size={24} />
                                    ) : highlightedVariable && timeVariable.includes(highlightedVariable) ? (
                                        <CornerDownLeft size={24} />
                                    ) : (
                                        <CornerDownLeft size={24} />
                                    )}
                                </Button>
                            </div>
                            <div className="flex flex-col border-2 p-4 rounded-md h-[120px] overflow-y-auto w-[200px]">
                                <label className="font-semibold">Time Variable</label>
                                <div className="space-y-2">
                                    {timeVariable.map((variable) => (
                                        <div key={variable} className={`p-2 border cursor-pointer rounded-md hover:bg-blue-100 ${
                                                highlightedVariable === variable ? "bg-blue-100 border-blue-500" : "border-gray-300"
                                            }`} onClick={() => setHighlightedVariable(variable)}
                                        >
                                            {variable}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Akhir Baris Satu Kolom Dua */}
                    </div>
                    {/* Akhir Kolom Dua */}

                    {/* Awal Kolom Tiga */}
                    <div className="flex flex-col gap-4">
                        {/* Awal Baris Satu Kolom Tiga */}
                        <div className="border-2 rounded-md w-[420px] pb-2">
                            <div className="mt-4 ml-4">
                                <label className="font-semibold">Smoothing Method</label>
                            </div>
                            <div className="w-full pl-4 border-0 rounded-t-md flex flex-row gap-4 mt-4">
                                <div className="flex items-center">
                                    <Label className="font-semibold">method:</Label>
                                </div>
                                <Select onValueChange={(value) => handleSelectedMethod(value)}>
                                    <SelectTrigger className="mr-2">
                                        <SelectValue placeholder="Choose Your Method">
                                            {selectedMethod[1] || "Choose Your Method"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {methods.map((method) => (
                                            <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2 p-2 ml-2 mt-2">
                                {inputParameters(selectedMethod[0])}
                            </div>
                        </div>
                        {/* Akhir Baris Satu Kolom Tiga */}

                        {/* Awal Baris Dua Kolom Tiga */}
                        <div className="border-2 rounded-md w-[420px] pl-2 pt-2 pb-4 flex flex-col gap-2">
                            <div className="ml-2">
                                <Label className="font-semibold">Save:</Label>
                            </div>
                            <div className="flex flex-row gap-2 ml-8">
                                <Checkbox 
                                    checked={saveForecasting !== false} 
                                    onCheckedChange={(isChecked) => setSaveForecasting(isChecked ? true : false)}
                                />
                                <Label>Save Smoothing Result as Variable</Label>
                            </div>
                        </div>
                        {/* Akhir Baris Dua Kolom Tiga */}
                    </div>
                    {/* Akhir Kolom Tiga */}
                </div>
            </div>
            {/* Akhir Konten */}

            {errorMsg && <div className="text-red-600 mb-2 flex justify-center">{errorMsg}</div>}
            <div className="flex justify-center pt-4">
                <DialogFooter>
                    <Button variant="outline" disabled={isCalculating} onClick={onClose}> Cancel </Button>
                    <Button variant="outline" disabled={isCalculating} onClick={handleReset}> Reset </Button>
                    <Button variant="outline" disabled={isCalculating} onClick={handleAnalyzes}> {isCalculating ? "Calculating..." : "OK"} </Button>
                </DialogFooter>
            </div>
        </DialogContent>
    );
};
export default SmoothingModal;