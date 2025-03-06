import init, {Decomposition} from '../../../../../src/pkg/wasm.js';

export async function handleDecomposition(
    data: (number)[],
    dataHeader: (string),
    time: (string)[],
    timeHeader: (string),
    decompostionMethod: string,
    trendMethod: string,
    periodValue: number,
    periodLable: string,
): Promise<[number[], number[], number[], number[], number[], string, string, string]> {
    await init(); // Inisialisasi WebAssembly
    const inputData = Array.isArray(data) && Array.isArray(time) ? data : null;

    if (!inputData) {
        throw new Error("Invalid input data");
    }
    if (inputData.length < 4 * Number(periodValue)) {
        throw new Error("Data length is less than 4 times the periodicity");
    }
    if (inputData.length % Number(periodValue) !== 0) {
        throw new Error("Data length is not a multiple of the periodicity");
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

        let decomposition;
        let forecastingValue;
        let forecastingRound;
        switch (decompostionMethod) {
            case 'additive':
                decomposition = new Decomposition(new Float64Array(data), dataHeader as string, time as string[], timeHeader as string, periodValue);
                forecastingValue = Array.from(decomposition.additive_decomposition());
                forecastingRound = forecastingValue.map(value => Number(parseFloat(value.toString()).toFixed(3)));
                break;
            case 'multiplicative':
                decomposition = new Decomposition(new Float64Array(data), dataHeader as string, time as string[], timeHeader as string, periodValue);
                forecastingValue = Array.from(decomposition.multiplicative_decomposition(trendMethod));
                forecastingRound = forecastingValue.map(value => Number(parseFloat(value.toString()).toFixed(3)));
                break;
            default:
                throw new Error(`Unknown method: ${decompostionMethod}`);
        }

        // Testing
        let centered = Array.from(decomposition.calculate_centered_moving_average());

        let nameTrendMethod;
        switch (trendMethod) {
            case 'linear':
                nameTrendMethod = "Linear Trend Equation";
                break;
            case 'quadratic':
                nameTrendMethod = "Linear Trend Equation";
                break;
            case 'exponential':
                nameTrendMethod = "Exponential Trend Equation";
                break;
            default:
                throw new Error(`Unknown method: ${trendMethod}`);
        }

        // get components
        let seasonalComponent = Array.from(decomposition.get_seasonal_component());
        let trendComponent = Array.from(decomposition.get_trend_component());
        let irregularComponent = Array.from(decomposition.get_irregular_component());

        // round component
        let seasonalRound = seasonalComponent.map(value => Number(parseFloat(value.toString()).toFixed(3)));
        let trendRound = trendComponent.map(value => Number(parseFloat(value.toString()).toFixed(3)));
        let irregularRound = irregularComponent.map(value => Number(parseFloat(value.toString()).toFixed(3)));

        let evalValue = await decomposition.decomposition_evaluation(new Float64Array(forecastingValue)) as Record<string, number>;
        let evalJSON = JSON.stringify({
            tables: [
                {
                    title: `Decompostion Forecasting Evaluation Results`,
                    columnHeaders: [{header:""},{header: 'value'}], 
                    rows: Object.entries(evalValue).map(([key, value]) => ({
                        rowHeader: [key], 
                        value: value.toFixed(3),     
                    })),
                },
            ],
        });

        let seasonalIndices = Array.from(decomposition.get_seasonal_indices());
        let namePeriodLable = seasonalIndices.map((_, i) => `period ${i + 1} of ${periodValue}`);
        let seasonValue: Record<string, number> = Object.fromEntries(
            namePeriodLable.map((label, i) => [label, seasonalIndices[i]])
        );
        let seasonJSON = JSON.stringify({
            tables: [
                {
                    title: `Seasonal Indices ${periodLable}`,
                    columnHeaders: [{header:""},{header: 'value'}],
                    rows: Object.entries(seasonValue).map(([key, value]) => ({
                        rowHeader: [key], 
                        value: value.toFixed(3),     
                    })),
                },
            ],
        });

        let equation = decomposition.get_trend_equation() as string;
        let equationJSON = JSON.stringify({
            "tables": [
                {
                "title": `${nameTrendMethod}`,
                "columnHeaders": [{"header": `${equation}`}], 
                "rows": [
                    {
                    "rowHeader": [`The Equation`],
                    "trend": `${equation}` // Isi nilai biar nggak error
                    }
                ]
                }
            ]
        });

        return [centered,seasonalRound,trendRound,irregularRound,forecastingRound,evalJSON,seasonJSON,equationJSON];
    } catch (error) {
        let errorMessage = error as Error;
        return [[0],[0],[0],[0],[0],JSON.stringify({ error: errorMessage.message }),JSON.stringify({ error: errorMessage.message }),JSON.stringify({ error: errorMessage.message })];
    }
}