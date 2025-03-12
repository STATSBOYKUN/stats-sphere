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
        let coef = Array.from(arima.estimate_coef());
        let se = Array.from(arima.estimate_se()); 
        let zStat = Array.from(arima.z_stat());
        let pValue = Array.from(arima.p_value());
        let lnLikelihood = arima.ln_likelihood();
        let aic = arima.aic();
        let bic = arima.bic();
        let sbc = arima.sbc();

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
        // Mengecek panjang seluruh data apakah sama
        if (se[0] == 0.0) {
            se = []; zStat = []; pValue = [];
            for (let i = 0; i < coef.length; i++) {
                se.push(NaN);
                zStat.push(NaN);
                pValue.push(NaN);
            }
        }
        if ((coefName.length + coef.length + se.length + zStat.length + pValue.length) % coef.length == 0) {
            for (let i = 0; i < coef.length; i++) {
                coefStruct[i] = { // Gunakan i sebagai key dalam objek
                    coefName: coefName[i],
                    coef: coef[i],
                    se: se[i],
                    zStat: zStat[i],
                    pValue: pValue[i]
                };
            }
        } else {
            throw new Error("Data length is not equal");
        }
        let coefStructJson = JSON.stringify({
            tables: [{
                title: `Coefficients Test for ARIMA (${orderParameter[0]},${orderParameter[1]},${orderParameter[2]})`,
                columnHeaders: [{header: ""}, {header: "coef"}, {header: "std. error"}, {header: "z value"}, {header: "p-value"}],
                rows: Object.entries(coefStruct).map(([key, value]) => ({
                    "rowHeader": [value.coefName],
                    "coef": value.coef.toFixed(3),
                    "std. error": value.se.toFixed(3),
                    "z value": value.zStat.toFixed(3),
                    "p-value": value.pValue.toFixed(3),
                })),
            }]
        });

        let selectionCriteriaName = [`Log-Likelihood`, `Akaike's Information Criterion`, `Bayesian Information Criterion`, `Schwartz's Bayesian Criterion`];
        let selectionCriteriaValue = [lnLikelihood, aic, bic, sbc];
        let selectionCriteriaStruct: Record<string, any> = {}; // Menggunakan objek kosong
        // Mengecek panjang seluruh data apakah sama
        if ((selectionCriteriaName.length + selectionCriteriaValue.length) % selectionCriteriaName.length == 0) {
            for (let i = 0; i < selectionCriteriaName.length; i++) {
                selectionCriteriaStruct[i] = { // Gunakan i sebagai key dalam objek
                    selectionCriteriaName: selectionCriteriaName[i],
                    selectionCriteriaValue: selectionCriteriaValue[i],
                };
            }
        } else {
            throw new Error("Data length is not equal");
        }
        let selectionCriteriaStructJson = JSON.stringify({
            tables: [{
                title: `Selection Criteria for ${dataHeader}`,
                columnHeaders: [{header: ""}, {header: "value"}],
                rows: Object.entries(selectionCriteriaStruct).map(([key, value]) => ({
                    "rowHeader": [value.selectionCriteriaName],
                    "value": value.selectionCriteriaValue.toFixed(3),
                })),
            }]
        });

        let forecast;
        let forecastEval;
        let forecastEvalJson = "";
        if (forecasting) {
            forecast = Array.from(arima.forecast(data.length));
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
            forecast = Array.from(arima.forecast(data.length + period));
        } else{
            forecast = [0];
        }

        return [[...coef, ...se],coefStructJson , selectionCriteriaStructJson, forecastEvalJson, forecast];
    } catch (error) {
        let errorMessage = error as Error;
        return [[0],"" , "",JSON.stringify({ error: errorMessage.message }),[0]];
    }
}