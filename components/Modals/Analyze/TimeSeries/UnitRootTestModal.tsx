import React, { useState, useEffect, FC} from "react";
import { useVariableStore } from "@/stores/useVariableStore";
import { useDataStore } from "@/stores/useDataStore";
import useResultStore from "@/stores/useResultStore";
import { CornerDownLeft, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { handleUnitRootTest } from "./handleAnalyze/handleUnitRootTest";
import { Checkbox } from "@/components/ui/checkbox";

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
interface UnitRootTestModalProps {
    onClose: () => void;
}

const UnitRootTestModal: React.FC<UnitRootTestModalProps> = ({ onClose }) => {
    const methods =[
        {value: 'dickey-fuller', label: 'dickey-fuller'},
        {value: 'augmented-dickey-fuller', label: 'augmented dickey-fuller'},
    ]

    const differences =[
        {value: 'level', label: 'level'},
        {value: 'first-difference', label: 'first difference'},
        {value: 'second-difference', label: 'second difference'},
    ]

    const equations =[
        {value: 'no_constant', label: 'none'},
        {value: 'no_trend', label: 'intercept'},
        {value: 'with_trend', label: 'trend and intercept'},
    ]

    const [selectedMethod, setSelectedMethod] = useState<string[]>(['dickey-fuller','dickey-fuller']);
    const [selectedDifference, setSelectedDifference] = useState<string[]>(['level','level']);
    const [selectedEquation, setSelectedEquation] = useState<string[]>(['no_trend','intercept']);
    const [lengthLag, setLengthLag] = useState<number>(1);
    const [availableVariables, setAvailableVariables] = useState<string[]>([]);
    const [dataVariable, setDataVariable] = useState<string[]>([]);
    const [timeVariable, setTimeVariable] = useState<string[]>([]);
    const [highlightedVariable, setHighlightedVariable] = useState<string | null>(null);
    const [isCalculating, setIsCalculating] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    
    const variables = useVariableStore((state) => state.variables) as VariableDef[];
    const data = useDataStore((state) => state.data) as RawData;
    const { addLog, addAnalytic, addStatistic } = useResultStore();

    useEffect(() => {
            setAvailableVariables(variables.map((v) => v.name));
    }, [variables]);

    const handleReset = () => {
        setDataVariable([]);
        setAvailableVariables(variables.map((v) => v.name));
        setHighlightedVariable(null);
        setSelectedMethod(['dickey-fuller','dickey-fuller']);
        setSelectedDifference(['level','level']);
        setSelectedEquation(['no_trend','intercept']);
        setLengthLag(1);
    };

    const handleMethodChange = (value:string) => {
        setSelectedEquation(['no_trend','intercept']);
        setSelectedMethod([value,methods.find((method) => method.value === value)!.label]);
    };

    const handleSelectDataVariable = (variable: string) => {
        if (highlightedVariable === variable && dataVariable.length === 0) {
            setDataVariable((prev) => [...prev, variable]);
            setAvailableVariables((prev) => prev.filter((item) => item !== variable));
            setHighlightedVariable(null);
        } else {
            alert("A variable can only belong to one group, and Data Variable can only contain one variable.");
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

    const handleAnalyzes = async() => {
        if (!dataVariable.length) {
            setErrorMsg("Please select at least one used variable.");
            return;
        }
        if (lengthLag < 1 || lengthLag > 5) {
            setErrorMsg("Lag length must be between 1 and 5.");
            return
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

            if (dataValues.length === 0) {
                setErrorMsg("No data available for the selected variables.");
                setIsCalculating(false);
                return;
            }

            let [testing, df_stat, coef_stat, fit, methodName]: [any,any,any,any,any] = await handleUnitRootTest(dataValues as number[], varDefs[0].name, selectedMethod[0], lengthLag, selectedEquation[0], selectedDifference[0]);
            
            console.log(testing);
            console.log(df_stat);
            console.log(coef_stat);
            console.log(fit);

            // Membuat Log
            const logMsg = `UNIT ROOT TEST: ${varDefs[0].label? varDefs[0].label : varDefs[0].name} on ${selectedDifference[1]} ${selectedEquation[1]} ${selectedMethod[1] == 'augmented dickey-fuller' ? `with lag length ${lengthLag}` : ''}`;
            const logId = await addLog({ log: logMsg });

            // Membuat Judul Log
            const analyticId = await addAnalytic({
                log_id: logId,
                title: `Unit Root Test: ${methodName}`,
                note: "",
            });

            // Membuat Tabel Dickey Fuller Test Statistic
            const df_stat_table = await addStatistic({
                analytic_id: analyticId,
                title: `${methodName} Test Statistic`,
                output_data: df_stat,
                components: `${methodName} Test Statistic`,
            });

            // Membuat Tabel Coeficient Regression Test
            const coef_stat_table = await addStatistic({
                analytic_id: analyticId,
                title: `Coeficient Regression Test`,
                output_data: coef_stat,
                components: `Coeficient Regression Test`,
            });

            // Membuat Tabel Fit Regression
            const fit_table = await addStatistic({
                analytic_id: analyticId,
                title: `Fit Regression`,
                output_data: fit,
                components: `Fit Regression`,
            });

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
    };

    return (
        <DialogContent className="max-w-[75vw] max-h-[90vh] flex flex-col space-y-0 overflow-y-auto">
            <div className="pb-4 ml-4">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">Unit Root Test</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
            </div>

            {/* Awal Fitur Content */}
            <div className="flex items-center justify-center">
                <div className="flex md:flex-row flex-col gap-4">
                    {/* Awal Kolom Satu */}
                    <div className="col-span-3 flex flex-col border-2 p-4 gap-4 rounded-md max-h-[300px] overflow-y-auto w-[200px]">
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
                            <div className="flex flex-col border-2 p-4 gap-4 rounded-md h-[120px] overflow-y-auto w-[200px]">
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
                        <div className="flex flex-col gap-4 border-2 p-4 rounded-md w-[270px]">
                            <label className="w-[100px] font-semibold">Method:</label>
                            <RadioGroup
                                value={selectedMethod[0]}
                                onValueChange={(value) => handleMethodChange(value)}
                                className="flex flex-col gap-4"
                            >
                                {methods.map((method) => (
                                    <div key={method.value} className="flex flex-row items-center space-x-2">
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
                        </div>
                        {/* Akhir Baris Satu Kolom Dua */}
                    </div>
                    {/* Akhir Kolom Dua */}

                    {/* Awal Kolom Tiga */}
                    <div className="flex flex-col gap-4">
                        <div className="border-2 rounded-md w-[420px] pb-2">
                            <div className="mt-4 ml-4">
                                <label className="font-semibold">Unit Root Test Options:</label>
                            </div>
                            <div className="w-full pl-4 pr-4 border-0 rounded-t-md flex flex-col gap-4 mt-4">
                                <Label className="w-[200px]">autocorrelate on:</Label>
                                <RadioGroup
                                    value={selectedDifference[0]}
                                    onValueChange={(value) => setSelectedDifference([value,differences.find((difference) => difference.value === value)!.label])}
                                    className="flex flex-row gap-4"
                                >
                                    {differences.map((difference) => (
                                        <div key={difference.value} className="flex flex-row items-center space-x-2">
                                            <RadioGroupItem
                                                value={difference.value}
                                                id={difference.value}
                                                className="w-4 h-4"
                                            />
                                            <label htmlFor={difference.value} className="text-sm font-medium text-gray-700">
                                                {difference.label}
                                            </label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                            <div className="w-full pl-4 pr-4 border-0 rounded-t-md flex flex-col gap-4 mt-4">
                                <Label className="w-[120px]">equation: </Label>
                                <RadioGroup
                                    value={selectedEquation[0]}
                                    onValueChange={(value) => setSelectedEquation([value, equations.find((equation) => equation.value === value)!.label])}
                                    className="flex flex-row gap-4"
                                >
                                    {equations.map((equation) => (
                                        (selectedMethod[0] === 'augmented-dickey-fuller' && equation.value === 'no_constant') ? null :
                                            <div key={equation.value} className="flex flex-row items-center space-x-2">
                                                <RadioGroupItem
                                                    value={equation.value}
                                                    id={equation.value}
                                                    className="w-4 h-4"
                                                />
                                                <label htmlFor={equation.value} className="text-sm font-medium text-gray-700">
                                                    {equation.label}
                                                </label>
                                            </div>
                                        
                                    ))}
                                </RadioGroup>
                            </div>
                            {selectedMethod[0] === 'augmented-dickey-fuller' && (
                                <div className="flex flex-row gap-4 ml-4 mt-4">
                                    <div className="flex items-center">
                                        <Label>lag length:</Label>
                                    </div>
                                    <Input type="number" className="w-[60px]" 
                                        placeholder="1" min="1" max="5" step="1"
                                        value={lengthLag}
                                        onChange={(e) => setLengthLag(Number(e.target.value))}
                                    /> 
                                </div>
                            )}
                        </div>
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

export default UnitRootTestModal;