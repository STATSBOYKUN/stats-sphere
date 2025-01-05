import init, {Smoothing} from '../../../src/wasm/pkg/wasm.js';

export async function handleSmoothing(data: (number|string)[][], pars: (number)[], resultElement: HTMLElement, evalElement: HTMLElement, method: string): Promise<void> {
    await init(); // Inisialisasi WebAssembly
    const inputData = Array.isArray(data[0]) ? data : null;
    const resultPlace = resultElement;
    if (!inputData) {
        throw new Error("Invalid input data");
    }
    try {
        const timeHeader = inputData[0][0] as (string);
        const dataHeader = inputData[0][1] as (string);
        const time:string[] = [];
        const dataValue:number[] = [];

        for(let i = 1; i < inputData.length; i++){
            time.push(inputData[i][0] as string);
            dataValue.push(inputData[i][1] as number);
        }

        if(dataValue.length != time.length){
            throw new Error("Data and Time length is not equal");
        }

        let smoothing;
        let smoothingValue;
        let nameMethod;

        smoothing = new Smoothing(dataHeader, new Float64Array(dataValue), timeHeader, time);
        switch (method) {
            case 'sma':
                smoothingValue = smoothing.calculate_sma(pars[0]);
                nameMethod = 'Simple Moving Average';
                break;
            case 'dma':
                smoothingValue = smoothing.calculate_dma(pars[0]);
                nameMethod = 'Double Moving Average';
                break;
            case 'wma':
                smoothingValue = smoothing.calculate_wma(pars[0]);
                nameMethod = `Weighted Moving Average`;
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

        // Membuat HTML tabel
        let html = `
                <table class="table table-zebra shadow-xl text-center w-full">
                    <thead class="bg-grey">
                        <tr>
            `;
        
        // Menambahkan header
        html += `<th>${timeHeader}</th>`;
        html += `<th>${nameMethod}</th>`;
        html += `</tr></thead><tbody>`;

        // Menambahkan baris data
        for (let i = 0; i < time.length; i++) {
            html += '<tr>';
            html += `<td>${time[i]}</td>`;
            html += `<td>${smoothingValue[i]}</td>`;
            html += '</tr>';
        }

        html += `</tbody></table>`;
        resultPlace.innerHTML = html;

        let evalValue = await smoothing.smoothing_evaluation(smoothingValue) as Record<string, number>;

        // Menambahkan evaluasi
        let evalHtml = `
            <table class="table table-zebra shadow-xl text-center w-full">
                    <thead class="bg-grey">
                        <tr>
            `;
        
        // Menambahkan header
        evalHtml += `<th>evaluation</th>`;
        evalHtml += `<th>value</th>`;
        evalHtml += `</tr></thead><tbody>`;

        // Menambahkan baris data
        for (let [key, value] of Object.entries(evalValue)) {
            evalHtml += '<tr>';
            evalHtml += `<td>${key}</td>`;
            evalHtml += `<td>${value}</td>`;
            evalHtml += '</tr>';
        }
        

        evalHtml += `</tbody></table>`;
        evalElement.innerHTML = evalHtml;
    } catch (error) {
        resultElement.innerHTML = `<p>Error: ${error instanceof Error ? error.message : "Unknown error"}</p>`;
    }
}