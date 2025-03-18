import init, {Smoothing} from '../../../../../src/wasm/pkg/wasm.js';

export async function handleSmoothing(
    data: (number)[], 
    dataHeader: (string), 
    time: (string)[], 
    timeHeader: (string), 
    pars: (number)[], 
    method: string): 
Promise<[number[], string, string]> {
    await init(); // Inisialisasi WebAssembly
    const inputData = Array.isArray(data) && Array.isArray(time) ? data : null;
    
    if (!inputData) {
        throw new Error("Invalid input data");
    }

    try {
        if(data.length != time.length){
            throw new Error("Data and Time length is not equal");
        }
        if (!data.every((val) => typeof val === 'number')) {
            throw new Error("dataValues contains non-numeric values");
        }
        if (!(time as string[]).every((val) => typeof val === 'string')) {
            throw new Error("timeValues contains non-string values");
        }

        let smoothing;
        let smoothingValue;
        let nameMethod;
        
        smoothing = new Smoothing(dataHeader, new Float64Array(data), timeHeader as string, time as string[]);
        console.log("Smoothing initialized:", smoothing);
        switch (method) {
            case 'sma':
                smoothingValue = smoothing.calculate_sma(pars[0]);
                nameMethod = 'Simple Moving Average';
                break;
            case 'dma':
                smoothingValue = smoothing.calculate_dma(pars[0]);
                nameMethod = 'Double Moving Average';
                break;
            case 'ses':
                smoothingValue = smoothing.calculate_ses(pars[0]);
                nameMethod = 'Simple Exponential Smoothing';
                break;
            case 'des':
                smoothingValue = smoothing.calculate_des(pars[0]);
                nameMethod = 'Double Exponential Smoothing';
                break;
            case 'holt':
                smoothingValue = smoothing.calculate_holt(pars[0], pars[1]);
                nameMethod = 'Holt\'s Method';
                break;
            case 'winter':
                smoothingValue = smoothing.calculate_winter(pars[0], pars[1], pars[2], pars[3]);
                nameMethod = 'Winter\'s Method';
                break;
            default:
                throw new Error(`Unknown method: ${method}`);
        }

        let smoothingArray = Array.from(smoothingValue);
        let smoothingRound = smoothingArray.map(value => Number(parseFloat(value.toString()).toFixed(3)));
        let structuredSmoothing: any[] = [];
        // Validasi panjang array
        if (time.length === data.length && data.length === smoothingArray.length) {
            for (let i = 0; i < time.length; i++) {
                structuredSmoothing.push({
                    category: time[i],
                    subcategory: `${dataHeader}`,
                    value: data[i],
                });
                structuredSmoothing.push({
                    category: time[i],
                    subcategory: `${nameMethod}`,
                    value: smoothingArray[i] === 0? null : smoothingArray[i],
                });
            }
        } else {
            throw new Error("Panjang array tidak sama!");
        }
        let graphicJSON = JSON.stringify({
            charts: [
                {
                    chartType: "Multiple Line Chart",
                    chartMetaData: {
                        axisInfo: {
                            category: `${timeHeader}`,
                            subCategory: [`${dataHeader}`, `$(nameMethod) Smoothing`],
                        },
                        description: `Smoothing ${dataHeader} using ${nameMethod}`,
                        notes: `Smoothing ${dataHeader}`,
                    },
                    chartData: structuredSmoothing,
                    chartConfig: {
                        "width": 800,
                        "height": 600,
                        "chartColor": ["#4682B4"],
                        "useLegend": true,
                        "useAxis": true,
                    }
                }
            ]
        });

        let evalValue = await smoothing.smoothing_evaluation(smoothingValue) as Record<string, number>;
        let evalJSON = JSON.stringify({
            tables: [
                {
                    title: `Smoothing Evaluation Results`,
                    columnHeaders: [{header:""},{header: 'value'}], 
                    rows: Object.entries(evalValue).map(([key, value]) => ({
                        rowHeader: [key], 
                        value: value.toFixed(3),     
                    })),
                },
            ],
        });
        return [smoothingRound, graphicJSON, evalJSON];
    } catch (error) {
        let errorMessage = error as Error;
        return [[0],"" ,JSON.stringify({ error: errorMessage.message })];
    }
}