import { row } from 'mathjs';
import init, {DickeyFuller, AugmentedDickeyFuller, get_t} from '../../../../../src/wasm/pkg/wasm.js';
import { headers } from 'next/headers.js';

export async function handleUnitRootTest(
    data: (number)[], 
    dataHeader: (string), 
    method: (string),
    lag: (number),
    equation: (string),
    level: (string),
):Promise<[number[], string, string, string, string]> {
    await init(); // Inisialisasi WebAssembly
    const inputData = Array.isArray(data) ? data : null;
    
    if (!inputData) {
        throw new Error("Invalid input data");
    }

    try {
        if (!inputData.every((val) => typeof val === 'number')) {
            throw new Error("dataValues contains non-numeric values");
        }

        let unitroot;
        let methodName;
        
        if(method === "dickey-fuller"){
            unitroot = new DickeyFuller(new Float64Array(data), equation, level);
            methodName = "Dickey-Fuller";
        } else if(method === "augmented-dickey-fuller"){
            unitroot = new AugmentedDickeyFuller(new Float64Array(data), equation, level, lag);
            methodName = "Augmented Dickey-Fuller";
        } else {
            throw new Error("Invalid equation");
        }
        
        let adf_statistic = await unitroot.calculate_test_stat();
        let test = await get_t();
        // let test2 = await get_gamma_0_tab1();
        let critical_value = Array.from(await unitroot.calculate_critical_value());
        let adf_pvalue = await unitroot.calculate_pvalue() as number;
        let coeficient = Array.from(await unitroot.get_b_vec());
        let standard_error = Array.from(await unitroot.get_se_vec());
        let coef_pvalue = Array.from(await unitroot.get_p_value_vec());
        let coef_statistic = Array.from(await unitroot.get_test_stat_vec());
        let r_square = Array.from(await unitroot.get_r_square());

        let t: number[] = [];
        let difference: number[] = [];
        let x: number[] = [];
        for (let i = 0; i < data.length - 1; i++) {
            t.push(i+1.0);
            difference.push(data[i+1] - data[i]);
            x.push(data[i]);
        }
        let adfJSON = JSON.stringify({
            tables: [{
                title: `${methodName} Test Statistic`,
                columnHeaders: [{header: ""}, {header: ""}, {header: "t-statistic"}, {header: "p-value"}],
                rows: [{
                    "rowHeader": [`${methodName} Test`],
                    "t-statistic": `${adf_statistic.toFixed(3)}`,
                    "p-value": `${adf_pvalue.toFixed(3)}`,
                },{
                    "rowHeader": ["Critical Value"],
                    children:[{
                        "rowHeader": [null, "1%"],
                        "t-statistic": `${critical_value[0].toFixed(3)}`,
                    }, {
                        "rowHeader": [null, "5%"],
                        "t-statistic": `${critical_value[1].toFixed(3)}`,
                    }, {
                        "rowHeader": [null,"10%"],
                        "t-statistic": `${critical_value[2].toFixed(3)}`,
                    }],
                }]
            }]
        });

        let coefName = [];
        if (equation === "no_trend" || equation === "with_trend") {
            coefName.push("Constant");
            if (method === "augmented-dickey-fuller") {
                for (let i = 1; i <= lag; i++) {
                    coefName.push(`${dataHeader} Diff Lag (${i})`);
                }
            }
            if (equation === "with_trend") {
                coefName.push("Trend");
            }
            coefName.push(`${dataHeader}`);
        } else {
            coefName.push(`${dataHeader}`)
        }
        let coefStruct: Record<string, any> = {}; // Menggunakan objek kosong
        // Mengecek panjang seluruh data apakah sama
        if ((coefName.length + coeficient.length + standard_error.length + coef_pvalue.length + coef_statistic.length) % coeficient.length == 0) {
            for (let i = 0; i < coeficient.length; i++) {
                coefStruct[i] = { // Gunakan i sebagai key dalam objek
                    coefName: coefName[i],
                    coeficient: coeficient[i],
                    standard_error: standard_error[i],
                    coef_statistic: coef_statistic[i],
                    coef_pvalue: coef_pvalue[i]
                };
            }
        } else {
            throw new Error("Data length is not equal");
        }
        let coefJSON = JSON.stringify({
            tables: [{
                title: "Coefficients Test",
                columnHeaders: [{header: ""}, {header: "coeficient"}, {header: "standard error"}, {header: "t-statistic"}, {header: "p-value"}],
                rows: Object.entries(coefStruct).map(([key, value]) => ({
                    "rowHeader": [value.coefName],
                    "coeficient": value.coeficient.toFixed(3),
                    "standard error": value.standard_error.toFixed(3),
                    "t-statistic": value.coef_statistic.toFixed(3),
                    "p-value": value.coef_pvalue.toFixed(3),
                })),
            }]
        });

        let fitJSON = JSON.stringify({
            tables: [{
                title: "Fit Regression",
                columnHeaders: [{header: ""}, {header: "R-Square"}, {header: "R-Square Adj"}],
                rows: [{
                    "rowHeader": [`model ${equation} ${lag === 0 ? "without lag" : "with " + lag + " lags"}`],
                    "R-Square": `${r_square[0].toFixed(3)}`,
                    "R-Square Adj": `${r_square[1].toFixed(3)}`,
                }],
            }]
        });
        
        return [[...critical_value, adf_statistic, ...coeficient, ...standard_error, adf_pvalue], adfJSON, coefJSON, fitJSON, methodName];
    } catch (error) {
        let errorMessage = error as Error;
        return [[0],"" , "", JSON.stringify({ error: errorMessage.message }), ""];
    }
}