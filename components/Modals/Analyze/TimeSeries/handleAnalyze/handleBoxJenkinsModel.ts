import init, {Arima} from '../../../../../src/wasm/pkg/wasm.js';

export async function handleBoxJenkinsModel(
    data: (number)[], 
    dataHeader: (string), 
    time: (string)[], 
    timeHeader: (string),
    orderParameter: (number)[],
    forecasting: boolean,
    period: number
):Promise<[number[], string, string, string, number[]]> {
    await init(); // Inisialisasi WebAssembly
    const inputData = Array.isArray(data) ? data : null;
    
    if (!inputData) {
        throw new Error("Invalid input data");
    }

    try {
        if (!inputData.every((val) => typeof val === 'number')) {
            throw new Error("dataValues contains non-numeric values");
        }

        const arima = new Arima(new Float64Array(data), orderParameter[0], orderParameter[1], orderParameter[2]);
        // let test = Array.from(burg_alg(5, new Float64Array(data)));
        let coef = Array.from(arima.estimate_coef());
        let se = Array.from(arima.estimate_se()); 
        let tStat = Array.from(arima.t_stat());
        let pValue = Array.from(arima.p_value());
        let selCritValue = Array.from(arima.selection_criteria());

        let coefName = ['Constant'];
        // if(orderParameter[1] == 0){
        //     coefName.push(`Constant`);
        // }
        if(orderParameter[0] > 0){
            for(let i = 1; i <= orderParameter[0]; i++){
                coefName.push(`AR(${i})`);
            }
        }
        if(orderParameter[2] > 0){
            for(let i = 1; i <= orderParameter[2]; i++){
                coefName.push(`MA(${i})`);
            }
        }

        let coefStruct: Record<string, any> = {}; // Menggunakan objek kosong
        // Jika Nilai SE elemen ke-0, maka determinan 0 maka matriks singular
        for (let i = 0; i < se.length; i++) {
            if (se[i] == 0.0) {
                se[i] = NaN; // Mengganti nilai SE dengan NaN
                tStat[i] = NaN; // Mengganti nilai SE dengan NaN
                pValue[i] = NaN; // Mengganti nilai SE dengan NaN
            }
        }
        
        if ((coefName.length + coef.length + se.length + tStat.length + pValue.length) % coef.length == 0) {
            for (let i = 0; i < coef.length; i++) {
                coefStruct[i] = { // Gunakan i sebagai key dalam objek
                    coefName: coefName[i],
                    coef: coef[i],
                    se: se[i],
                    tStat: tStat[i],
                    pValue: pValue[i]
                };
            }
        } else {
            throw new Error("Data length is not equal");
        }
        let coefStructJson = JSON.stringify({
            tables: [{
                title: `Coefficients Test for ARIMA (${orderParameter[0]},${orderParameter[1]},${orderParameter[2]})`,
                columnHeaders: [{header: ""}, {header: "coef"}, {header: "std. error"}, {header: "t value"}, {header: "p-value"}],
                rows: Object.entries(coefStruct).map(([key, value]) => ({
                    "rowHeader": [value.coefName],
                    "coef": value.coef.toFixed(3),
                    "std. error": value.se.toFixed(3),
                    "t value": value.tStat.toFixed(3),
                    "p-value": value.pValue.toFixed(3),
                })),
            }]
        });

        let selCritName = orderParameter[0] == 0 && orderParameter[2] == 0 ? 
        [
            `S.E. of Regression`,`Sum Squared Resid`,
            `Log Likelihood`, `Mean Dependent Var`, `S.D. Dependent Var`,
            `Akaike Info Crit`, `Schwarz Criterion`, `Hannan-Quinn`, `Durbin-Watson`
        ]
        :
        [
            `R-Squared`, `Adj. R-Squared`, `S.E. of Regression`,`Sum Squared Resid`,
            `Log Likelihood`, `F-Statistic`, `Prob(F-Stat)`, `Mean Dependent Var`, `S.D. Dependent Var`,
            `Akaike Info Crit`, `Schwarz Criterion`, `Hannan-Quinn`, `Durbin-Watson`
        ];
        let selCritStruct: Record<string, any> = {}; // Menggunakan objek kosong
        // Mengecek panjang seluruh data apakah sama
        if ((selCritName.length + selCritValue.length) % selCritValue.length == 0) {
            for (let i = 0; i < selCritName.length; i++) {
                selCritStruct[i] = { // Gunakan i sebagai key dalam objek
                    selCritName: selCritName[i],
                    selCritValue: selCritValue[i],
                };
            }
        } else {
            throw new Error("Data length is not equal");
        }
        let selCritStructJson = JSON.stringify({
            tables: [{
                title: `Selection Criteria for ${dataHeader}`,
                columnHeaders: [{header: ""}, {header: "value"}],
                rows: Object.entries(selCritStruct).map(([key, value]) => ({
                    "rowHeader": [value.selCritName],
                    "value": value.selCritValue.toFixed(3),
                })),
            }]
        });

        let forecast;
        let forecastEval;
        let forecastEvalJson = "";
        if (forecasting) {
            forecast = Array.from(arima.forecast());
            forecastEval = arima.forecasting_evaluation() as Record<string, number>;
            forecastEvalJson = JSON.stringify({
                tables: [
                    {
                        title: `Arima Forecasting Evaluation`,
                        columnHeaders: [{header:""},{header: 'value'}], 
                        rows: Object.entries(forecastEval).map(([key, value]) => ({
                            "rowHeader": [key], 
                            "value": value.toFixed(3),     
                        })),
                    },
                ],
            });
            forecast = Array.from(arima.forecast());
        } else{
            forecast = [0];
        }

        return [[...coef, ...se], coefStructJson , selCritStructJson, forecastEvalJson, forecast];
    } catch (error) {
        let errorMessage = error as Error;
        return [[0],"" , "",JSON.stringify({ error: errorMessage.message }),[0]];
    }
}