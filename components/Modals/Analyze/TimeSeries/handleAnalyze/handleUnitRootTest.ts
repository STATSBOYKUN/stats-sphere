import init, {DickeyFuller, AugmentedDickeyFuller, get_beta_inf, get_gamma_0_tab1, MultipleLinearRegression} from '../../../../../src/wasm/pkg/wasm.js';

export async function handleUnitRootTest(
    data: (number)[], 
    dataHeader: (string), 
    method: (string),
    lag: (number),
    equation: (string),
    level: (string),
):Promise<[number[], string, string, string]> {
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
        
        let t_statistic = await unitroot.calculate_test_stat();
        // let test = await get_beta_inf();
        // let test2 = await get_gamma_0_tab1();
        let critical_value = Array.from(await unitroot.calculate_critical_value());
        let pvalue = await unitroot.calculate_pvalue() as number;
        let coeficient = await unitroot.get_b() as number;
        let standard_error = await unitroot.get_se() as number;

        let t: number[] = [];
        let difference: number[] = [];
        let x: number[] = [];
        for (let i = 0; i < data.length - 1; i++) {
            t.push(i+1.0);
            difference.push(data[i+1] - data[i]);
            x.push(data[i]);
        }
        let rlb = new MultipleLinearRegression([new Float64Array(t), new Float64Array(x)], new Float64Array(difference));
        await rlb.calculate_regression();
        let beta = Array.from(rlb.get_beta());
        let se = Array.from(rlb.calculate_standard_error());
        let statisticJSON = JSON.stringify({
            tables: [{
                title: "Test Statistic",
                columnHeaders: [{header: ""}, {header: "coeficient"}, {header: "standard error"}, {header: "t-statistic"}, {header: "p-value"}],
                rows: [{
                    "rowHeader": [dataHeader],
                    "coeficient": `${coeficient.toFixed(3)}`,
                    "standard error": `${standard_error.toFixed(3)}`,
                    "t-statistic": `${t_statistic.toFixed(3)}`,
                    "p-value": `${pvalue.toFixed(3)}`,
                }],
            }]
        });

        let criticalJSON = JSON.stringify({
            tables: [{
                title: "Critical Value",
                columnHeaders: [{header: ""}, {header: "1%"}, {header: "5%"}, {header: "10%"}],
                rows: [{
                    "rowHeader": [dataHeader],
                    "1%": `${critical_value[0].toFixed(3)}`,
                    "5%": `${critical_value[1].toFixed(3)}`,
                    "10%": `${critical_value[2].toFixed(3)}`,
                }],
            }]
        });
        
        return [[...critical_value, t_statistic, coeficient, standard_error, pvalue], statisticJSON, criticalJSON, methodName];
    } catch (error) {
        let errorMessage = error as Error;
        return [[0],"" ,JSON.stringify({ error: errorMessage.message }), ""];
    }
}