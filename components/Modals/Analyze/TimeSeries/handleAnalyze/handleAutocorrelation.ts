import init, {Autocorrelation} from '../../../../../src/wasm/pkg/wasm.js';

export async function handleAutocorrelation(
    data: (number)[], 
    dataHeader: (string), 
    lag: (number),
    difference: (string),
    seasonal: (number),
):Promise<[number[], string, string]> {
    await init(); // Inisialisasi WebAssembly
    const inputData = Array.isArray(data) ? data : null;
    
    if (!inputData) {
        throw new Error("Invalid input data");
    }

    try {
        if (!inputData.every((val) => typeof val === 'number')) {
            throw new Error("dataValues contains non-numeric values");
        }

        const autocorrelation = new Autocorrelation(new Float64Array(data), dataHeader, lag as number);
        await autocorrelation.autocorelate(difference, seasonal);

        const test1 = Array.from(autocorrelation.calculate_acf(new Float64Array(data)));
        const test2 = Array.from(autocorrelation.calculate_acf_se(new Float64Array(test1)));
        const test3 = Array.from(autocorrelation.calculate_pacf(new Float64Array(test1)));
        const test4 = Array.from(autocorrelation.calculate_pacf_se(new Float64Array(test3)));
        const test5 = Array.from(autocorrelation.calculate_ljung_box(new Float64Array(test1)));
        const test6 = Array.from(autocorrelation.df_ljung_box());
        const test7 = Array.from(autocorrelation.pvalue_ljung_box(new Float64Array(test5)));

        const acf = Array.from(autocorrelation.get_acf());
        const acf_se = Array.from(autocorrelation.get_acf_se());
        const pacf = Array.from(autocorrelation.get_pacf());
        const pacf_se = Array.from(autocorrelation.get_pacf_se());
        const lb = Array.from(autocorrelation.get_lb());
        const pval = Array.from(autocorrelation.get_pvalue_lb());
        const df = Array.from(autocorrelation.get_df_lb());

        let acfStruct: Record<string, any> = {}; // Menggunakan objek kosong
        // Mengecek panjang seluruh data apakah sama
        if ((acf.length + acf_se.length + lb.length + df.length + pval.length) % acf.length == 0) {
            for (let i = 0; i < acf.length; i++) {
                acfStruct[i] = { // Gunakan i sebagai key dalam objek
                    acf: acf[i],
                    acf_se: acf_se[i],
                    lb: lb[i],
                    pval: pval[i],
                    df: df[i]
                };
            }
        } else {
            throw new Error("Data length is not equal");
        }
        let acfJSON = JSON.stringify({
            tables: [{
                title: "Autocorrelation Function (ACF)",
                columnHeaders: [{header: ""}, {header: "ACF"}, {header: "SE"}, {header: "Ljung-Box"}, {header: "df"}, {header: "p-value"}],
                rows: Object.entries(acfStruct).map(([key, value]) => ({
                    "rowHeader": [key],
                    "ACF": value.acf,
                    "SE": value.acf_se,
                    "Ljung-Box": value.lb,
                    "df": value.df,
                    "p-value": value.pval,
                })),
            }]
        });

        let pacfStruct: Record<string, any> = {};
        // mengecek panjang seluruh data apakah sama
        if ((pacf.length + pacf_se.length) % pacf.length == 0) {
            for (let i = 0; i < pacf.length; i++) {
                pacfStruct[i] = {
                    pacf: pacf[i],
                    pacf_se: pacf_se[i],
                };
            }
        }else{
            throw new Error("Data length is not equal");
        }
        let pacfJSON = JSON.stringify({
            tables: [{
                title: "Partial Autocorrelation Function (PACF)",
                columnHeaders: [{header: ""}, {header: "PACF"}, {header: "SE"}],
                rows: Object.entries(pacfStruct).map(([key, value]) => ({
                    "rowHeader": [key],
                    "PACF": value.pacf,
                    "SE": value.pacf_se,
                })),
            }]
        });

        return [test7,acfJSON ,pacfJSON];
    } catch (error) {
        let errorMessage = error as Error;
        return [[0],"" ,JSON.stringify({ error: errorMessage.message })];
    }
}