import React, { useState, useEffect, FC} from "react";
import { CornerDownLeft, CornerDownRight } from "lucide-react";
import { useVariableStore } from "@/stores/useVariableStore";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"; 
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { handleBoxJenkinsModel } from "./handleAnalyze/handleBoxJenkinsModel";
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
interface BoxJenkinsModelModalProps {
    onClose: () => void;
}

const BoxJenkinsModelModal: React.FC<BoxJenkinsModelModalProps> = ({ onClose }) => {
    const periods = [
        { value: '7', label: 'Daily in Week', id: 'diw'},
        { value: '30', label: 'Daily in Month', id: 'dim'},
        { value: '4', label: 'Weekly in Month', id: 'wim'},
        { value: '2', label: 'Semi Annual', id: 'sa'},
        { value: '3', label: 'Four-Monthly', id: 'fm'},
        { value: '4', label: 'Quarterly', id: 'q'},
        { value: '12', label: 'Monthly', id: 'm'},
    ];

    const [selectedPeriod, setSelectedPeriod] = useState<string[]>(['7','Daily in Week']);
    const [maOrder, setMaOrder] = useState<number>(0);
    const [arOrder, setArOrder] = useState<number>(0);
    const [diffOrder, setDiffOrder] = useState<number>(0);
    const [checkedForecasting, setCheckedForecasting] = useState<boolean>(false);
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

    const handleReset = () => {
        setMaOrder(0);
        setArOrder(0);
        setDiffOrder(0);
        setCheckedForecasting(false);
        setAvailableVariables(variables.map((v) => v.name));
        setDataVariable([]);
        setTimeVariable([]);
        setHighlightedVariable(null);
        setSelectedPeriod(['7','Daily in Week']);
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

            let [test, coeficient, criteria, evaluation, forecast]: [any[], any, any, any, any[]] = await handleBoxJenkinsModel(dataValues as number[], varDefs[0].name, timeValues as string[], varDefs[1].name, [arOrder, diffOrder, maOrder], checkedForecasting, Number(selectedPeriod[0]));
            console.log(test);
            console.log(coeficient);
            console.log(criteria);
            console.log(evaluation);
            // Membuat Log
            const logMsg = `ARIMA(${arOrder},${diffOrder},${maOrder}) ${varDefs[0].label? varDefs[0].label : varDefs[0].name }.`;
            const logId = await addLog({ log: logMsg });

            // Membuat Judul Log
            const analyticId = await addAnalytic({
                log_id: logId,
                title: `ARIMA(${arOrder},${diffOrder},${maOrder})`,
                note: "",
            });

            // Membuat Tabel Coeficient Test pada Log
            const coeficientTable = await addStatistic({
                analytic_id: analyticId,
                title: `Coeficient Test for ARIMA(${arOrder},${diffOrder},${maOrder})`,
                output_data: coeficient,
                components: `Coeficient Test for ARIMA(${arOrder},${diffOrder},${maOrder})`,
            });

            // Membuat Tabel Criteria Selection pada Log
            const criteriaTable = await addStatistic({
                analytic_id: analyticId,
                title: `Criteria Selection for ARIMA(${arOrder},${diffOrder},${maOrder})`,
                output_data: criteria,
                components: `Criteria Selection for ARIMA(${arOrder},${diffOrder},${maOrder})`,
            });

            if (checkedForecasting) {
                // Membuat Tabel Forecasting Evaluation pada Log
                const evaluationTable = await addStatistic({
                    analytic_id: analyticId,
                    title: `Forecasting Evaluation for ARIMA(${arOrder},${diffOrder},${maOrder})`,
                    output_data: evaluation,
                    components: `Forecasting Evaluation for ARIMA(${arOrder},${diffOrder},${maOrder})`,
                });
            }

            // Jika Forecasting Dicentang
            if (checkedForecasting) {
                // Jika panjang forecast lebih pendek, tambahkan nilai kosong atau nilai default
                if (forecast.length < data.length) {
                    const missingRows = data.length - forecast.length;
                    const filler = new Array(missingRows).fill(""); // Menambahkan nilai kosong atau sesuai kebutuhan
                    forecast = [...forecast, ...filler];
                }
                // Menambahkan nilai dari newStringRow ke setiap baris di data sebagai kolom baru
                const updatedData = data.map((row, index) => {
                    // Cari kolom pertama yang kosong
                    const updatedRow = [...row];
                    for (let colIndex = 0; colIndex < updatedRow.length; colIndex++) {
                        // Jika kolom kosong, masukkan nilai dari forecast
                        if (updatedRow[colIndex] === '') {
                            updatedRow[colIndex] = forecast[index].toString(); // Menambahkan nilai ke kolom yang kosong
                            break; // Keluar dari loop setelah mengisi kolom pertama yang kosong
                        }
                    }
                    return updatedRow;
                });
                setData(updatedData);
                const forecastVariable = {
                    name: `${varDefs[0].name} ARIMA (${arOrder},${diffOrder},${maOrder}) ${variables.length}`,
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
                await addVariable(forecastVariable);
                // Perbarui state `variables` di store secara langsung
                const updatedVariables = [...variables, forecastVariable];
                useVariableStore.setState({ variables: updatedVariables });
                // Simpan hasil smoothing ke IndexDB
                const forecastCells = forecast.map((value, index) => ({
                    x: forecastVariable.columnIndex, // Kolom baru untuk hasil smoothing
                    y: index, // Baris yang sesuai
                    value: value.toString(), // Konversi nilai ke string
                }));
                await db.cells.bulkPut(forecastCells);
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

    return (
        <DialogContent className="max-w-[75vw] max-h-[90vh] flex flex-col space-y-0 overflow-y-auto">
            <div className="pb-4 ml-4">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">Box-Jenkins Model</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
            </div>

            {/* Awal Fitur Content */}
            <div className="flex items-center justify-center">
                <div className="flex md:flex-row flex-col gap-4">
                    {/* Awal Kolom Satu */}
                    <div className="col-span-3 flex flex-col border-2 gap-4 p-4 rounded-md max-h-[300px] overflow-y-auto w-[200px]">
                        <label className="font-semibold text-center">Available Variables</label>
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
                            <div className="flex flex-col border-2 gap-4 p-4 rounded-md h-[120px] overflow-y-auto w-[200px]">
                                <label className="font-semibold text-center">Used Variable</label>
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
                            <div className="flex flex-col border-2 gap-4 p-4 rounded-md h-[120px] overflow-y-auto w-[200px]">
                                <label className="font-semibold text-center">Time Variable</label>
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
                        <div className="border-2 rounded-md w-[420px] flex flex-col gap-4 py-4">
                            <div className="ml-4">
                                <label className="font-semibold">Parameter Order</label>
                            </div>

                            <div className="flex flex-row ml-4 mt-2">
                                <div className="flex flex-row gap-4 ml-4">
                                    <div className="flex items-center">
                                        <Label>p:</Label>
                                    </div>
                                    <Input type="number" className="w-[80px]" 
                                        placeholder="1" min="0" max="10" step="1"
                                        value={arOrder}
                                        onChange={(e) => setArOrder(Number(e.target.value))}
                                    />
                                </div>
                                <div className="flex flex-row gap-4 ml-4">
                                    <div className="flex items-center">
                                        <Label>d:</Label>
                                    </div>
                                    <Input type="number" className="w-[80px]" 
                                        placeholder="1" min="0" max="10" step="1"
                                        value={diffOrder}
                                        onChange={(e) => setDiffOrder(Number(e.target.value))}
                                    />
                                </div>
                                <div className="flex flex-row gap-4 ml-4">
                                    <div className="flex items-center">
                                        <Label>q:</Label>
                                    </div>
                                    <Input type="number" className="w-[80px]" 
                                        placeholder="1" min="0" max="10" step="1"
                                        value={maOrder}
                                        onChange={(e) => setMaOrder(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-row gap-2 ml-8 mt-2">
                                <Checkbox 
                                    checked={checkedForecasting !== false} 
                                    onCheckedChange={(isChecked) => setCheckedForecasting(isChecked ? true : false)}
                                />
                                <Label>Forecasting Model</Label>
                            </div>

                            {checkedForecasting && (
                                <div className="flex flex-row gap-2 items-center mx-8">
                                    <label className="text-sm w-[150px] font-semibold">periodicity: {selectedPeriod[0]}</label>
                                    <Select
                                        onValueChange={(value) => {
                                            const selected = periods.find((period) => period.id === value);
                                            if (selected) {
                                                setSelectedPeriod([selected.value, selected.label]);
                                            }
                                        }}
                                        defaultValue={selectedPeriod[1]}>
                                        <SelectTrigger>
                                            <SelectValue>{selectedPeriod[1]}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {periods.map((period) => (
                                                <SelectItem
                                                    key={period.id}
                                                    value={period.id}
                                                >
                                                    {period.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        {/* Akhir Baris Satu Kolom Tiga */}
                    </div>
                    {/* Akhir Kolom Tiga */}
                </div>
            </div>
            {/* Akhir Fitur Content */}

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

export default BoxJenkinsModelModal;