import React, { useState, useEffect, FC} from "react";
import { CornerDownLeft, CornerDownRight } from "lucide-react";
import { useVariableStore } from "@/stores/useVariableStore";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"; 
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { handleDecomposition } from "./handleAnalyze/handleDecomposition";
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
interface DecompositionModalProps {
    onClose: () => void;
}

const DecompositionModal: React.FC<DecompositionModalProps> = ({ onClose }) => {
    const decompositionMethods = [
        { value: 'additive', label: 'additive' },
        { value: 'multiplicative', label: 'multiplicative' },
    ];

    const trendedMethods = [
        { value: 'linear', label: 'Linear' },
        { value: 'exponential', label: 'Exponential' },
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

    const [selectedDecompositionMethod, setSelectedDecompositionMethod] = useState<string[]>(['additive','Additive']);
    const [selectedTrendedMethod, setSelectedTrendedMethod] = useState<string[]>(['linear','Linear']);
    const [selectedPeriod, setSelectedPeriod] = useState<string[]>(['7','Daily in Week']);
    const [saveDecomposition, setSaveDecomposition] = useState<boolean>(false);
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
        setSelectedDecompositionMethod(['additive','Additive']);
        setSelectedTrendedMethod(['linear','Linear']);
        setSelectedPeriod(['7','Daily in Week']);
        setSaveDecomposition(false);
        setAvailableVariables(variables.map((v) => v.name));
        setDataVariable([]);
        setTimeVariable([]);
        setHighlightedVariable(null);
    };

    const handleAnalyzes = async () => {
        if (!dataVariable.length) {
            setErrorMsg("Please select at least one used variable.");
            return;
        }
        if (!timeVariable.length) {
            setErrorMsg("Please select at least one time variable.");
            return;
        }
        if (!selectedTrendedMethod[0]) {
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
                    const num = parseFloat(rawValue);
                    rowObj[varName] = isNaN(num) ? (rawValue === "" ? null : rawValue) : num;
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
            if (dataValues.length < 4 * Number(selectedPeriod[0])) {
                setErrorMsg(`Data length is less than 4 times the periodicity.`);
                setIsCalculating(false);
                return;
            }
            if (dataValues.length % Number(selectedPeriod[0]) !== 0) {
                setErrorMsg("Data length is not a multiple of the periodicity.");
                setIsCalculating(false);
                return;
            }

            let [testing, seasonal, trend, irrengular, forecasting, evaluation, seasonIndices, equation]:
                [any[],any[], any[], any[], any[], any, any, any] = 
                await handleDecomposition(
                    dataValues as number[],
                    varDefs[0].name,
                    timeValues as string[],
                    varDefs[1].name,
                    selectedDecompositionMethod[0],
                    selectedTrendedMethod[0],
                    Number(selectedPeriod[0]),
                    selectedPeriod[1],
                )
            ;

            // Testing
            console.log(testing);

            // Membuat Log
            const logMsg = `DECOMPOSITION: ${varDefs[0].label? varDefs[0].label + ' Using' : varDefs[0].name + ' Using'} ${selectedDecompositionMethod[1]}.`;
            const logId = await addLog({ log: logMsg });

            // Membuat Judul Log
            const analyticId = await addAnalytic({
                log_id: logId,
                title: `Decomposition ${selectedDecompositionMethod[1]}`,
                note: "",
            });

            // Membuat Tabel Seasonal Index pada Log
            const seasonIndicesTable = await addStatistic({
                analytic_id: analyticId,
                title: "Seasonal Indices",
                output_data: seasonIndices,
                components: "Seasonal Indices",
            });

            if(selectedDecompositionMethod[0]==='multiplicative'){
                // Membuat Tabel Persamaan Trend pada Log
                const equationTrendTable = await addStatistic({
                    analytic_id: analyticId,
                    title: "Equation",
                    output_data: equation,
                    components: "Equation Trend",
                });
            }

            // Membuat Tabel Evaluasi pada Log
            const evalTable = await addStatistic({
                analytic_id: analyticId,
                title: "Evalution",
                output_data: evaluation,
                components: "Forecasting Evaluation",
            });

            // Jika Menyimpan Decomposition Dicentang
            if (saveDecomposition) {
                // Index Variabel
                let length = variables.length;

                // Menyimpan Seasonal Component
                // Jika panjang lebih pendek, tambahkan nilai kosong
                if (seasonal.length < data.length) {
                    const missingRows = data.length - seasonal.length;
                    const filler = new Array(missingRows).fill("");
                    seasonal = [...seasonal, ...filler];
                }
                // Tambahkan nilai smoothingResult ke kolom pertama yang kosong di setiap baris
                const updateSeasonal = data.map((row, index) => {
                    const updatedRow = [...row];
                    for (let colIndex = 0; colIndex < updatedRow.length; colIndex++) {
                        if (updatedRow[colIndex] === '') {
                            updatedRow[colIndex] = seasonal[index].toString();
                            break;
                        }
                    }
                    return updatedRow;
                });
                setData(updateSeasonal);
                // Definisi Metadata
                const seasonalMetadata = {
                    name: `${varDefs[0].name}-SC-${length}`,
                    columnIndex: length,
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
                addVariable(seasonalMetadata);
                // Perbarui state variables di store
                const updatedSeasonal = [...variables, seasonalMetadata];
                useVariableStore.setState({ variables: updatedSeasonal });
                // Simpan hasil smoothing ke IndexDB
                const seasonalCells = seasonal.map((value, index) => ({
                    x: seasonalMetadata.columnIndex,
                    y: index,
                    value: value.toString(),
                }));
                db.cells.bulkPut(seasonalCells);
                length++;

                // Menyimpan Trend Component
                // Jika panjang lebih pendek, tambahkan nilai kosong
                if (trend.length < data.length) {
                    const missingRows = data.length - trend.length;
                    const filler = new Array(missingRows).fill("");
                    trend = [...trend, ...filler];
                }
                // Tambahkan nilai smoothingResult ke kolom pertama yang kosong di setiap baris
                const updateTrend = updateSeasonal.map((row, index) => {
                    const updatedRow = [...row];
                    for (let colIndex = 0; colIndex < updatedRow.length; colIndex++) {
                        if (updatedRow[colIndex] === '') {
                            updatedRow[colIndex] = trend[index].toString();
                            break;
                        }
                    }
                    return updatedRow;
                });
                setData(updateTrend);
                // Definisi Metadata
                const trendMetadata = {
                    name: `${varDefs[0].name}-TC-${length-1}`,
                    columnIndex: length,
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
                addVariable(trendMetadata);
                // Perbarui state variables di store
                const updatedTrend = [...variables, seasonalMetadata, trendMetadata];
                useVariableStore.setState({ variables: updatedTrend });
                // Simpan hasil smoothing ke IndexDB
                const trendCells = trend.map((value, index) => ({
                    x: trendMetadata.columnIndex,
                    y: index,
                    value: value.toString(),
                }));
                db.cells.bulkPut(trendCells);
                length++;

                // // Menyimpan Irregular Component
                // Jika panjang lebih pendek, tambahkan nilai kosong
                if (irrengular.length < data.length) {
                    const missingRows = data.length - irrengular.length;
                    const filler = new Array(missingRows).fill("");
                    irrengular = [...irrengular, ...filler];
                }
                // Tambahkan nilai smoothingResult ke kolom pertama yang kosong di setiap baris
                const updateIrrengular = updateTrend.map((row, index) => {
                    const updatedRow = [...row];
                    for (let colIndex = 0; colIndex < updatedRow.length; colIndex++) {
                        if (updatedRow[colIndex] === '') {
                            updatedRow[colIndex] = irrengular[index].toString();
                            break;
                        }
                    }
                    return updatedRow;
                });
                setData(updateIrrengular);
                // Definisi Metadata
                const irrengularMetadata = {
                    name: `${varDefs[0].name}-IC-${length-2}`,
                    columnIndex: length,
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
                addVariable(irrengularMetadata);
                // Perbarui state variables di store
                const updatedIrrengular = [...variables, seasonalMetadata, trendMetadata, irrengularMetadata];
                useVariableStore.setState({ variables: updatedIrrengular });
                // Simpan hasil smoothing ke IndexDB
                const irrengularCells = irrengular.map((value, index) => ({
                    x: irrengularMetadata.columnIndex,
                    y: index,
                    value: value.toString(),
                }));
                db.cells.bulkPut(irrengularCells);
                length++;

                // // Menyimpan Forecasting Component
                // Jika panjang lebih pendek, tambahkan nilai kosong
                if (forecasting.length < data.length) {
                    const missingRows = data.length - forecasting.length;
                    const filler = new Array(missingRows).fill("");
                    forecasting = [...forecasting, ...filler];
                }
                // Tambahkan nilai smoothingResult ke kolom pertama yang kosong di setiap baris
                const updateForecasting = updateIrrengular.map((row, index) => {
                    const updatedRow = [...row];
                    for (let colIndex = 0; colIndex < updatedRow.length; colIndex++) {
                        if (updatedRow[colIndex] === '') {
                            updatedRow[colIndex] = forecasting[index].toString();
                            break;
                        }
                    }
                    return updatedRow;
                });
                setData(updateForecasting);
                // Definisi Metadata
                const forecastingMetadata = {
                    name: `${varDefs[0].name}-Forecasting-${length-3}`,
                    columnIndex: length,
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
                addVariable(forecastingMetadata);
                // Perbarui state variables di store
                const updatedForecasting = [...variables, seasonalMetadata, trendMetadata, irrengularMetadata, forecastingMetadata];
                useVariableStore.setState({ variables: updatedForecasting });
                // Simpan hasil smoothing ke IndexDB
                const forecastingCells = forecasting.map((value, index) => ({
                    x: forecastingMetadata.columnIndex,
                    y: index,
                    value: value.toString(),
                }));
                db.cells.bulkPut(forecastingCells);
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
                    <DialogTitle className="font-bold text-2xl">Decomposition</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
            </div>

            {/* Awal Fitur Content */}
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
                        <div className="border-2 rounded-md w-[370px] p-4 flex flex-col gap-4">
                            <label className="font-semibold">Decomposition Method</label>
                            <RadioGroup
                                value={selectedDecompositionMethod[0]}
                                onValueChange={(value) => setSelectedDecompositionMethod([value,decompositionMethods.find((method) => method.value === value)!.label])}
                                className="flex flex-row gap-4"
                            >
                                {decompositionMethods.map((method) => (
                                    <div key={method.value} className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value={method.value}
                                            id={method.value}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor={method.value} className="text-sm font-medium text-gray-700">
                                            {method.label}
                                        </label>
                                    </div>
                                ))}
                            </RadioGroup>
                            {selectedDecompositionMethod[0] === 'multiplicative' && (
                                <div className="flex flex-row gap-2 items-center">
                                    <label className="text-sm w-[150px] font-semibold">trend method:</label>
                                    <Select value={selectedTrendedMethod[0]}
                                        onValueChange={(value) => setSelectedTrendedMethod([value,trendedMethods.find((method) => method.value === value)!.label])}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose Your Method">
                                                {selectedTrendedMethod[1] || "Choose Your Method"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {trendedMethods.map((method) => (
                                                <SelectItem key={method.value} value={method.value}>
                                                    {method.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="flex flex-row gap-2 items-center">
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
                        </div>
                        {/* Akhir Baris Satu Kolom Tiga */}
                        
                        {/* Awal Baris Dua Kolom Tiga */}
                        <div className="border-2 rounded-md w-[370px] pl-2 pt-2 pb-4 flex flex-col gap-2">
                            <div className="ml-2">
                                <Label className="font-semibold">Save:</Label>
                            </div>
                            <div className="flex flex-row gap-2 ml-8">
                                <Checkbox 
                                    checked={saveDecomposition !== false} 
                                    onCheckedChange={(isChecked) => setSaveDecomposition(isChecked ? true : false)}
                                />
                                <Label>Save Decomposition Component as Variable</Label>
                            </div>
                        </div>
                        {/* Akhir Baris Dua Kolom Tiga */}
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

export default DecompositionModal;