import init, {check_sliced_data} from "@/src/wasm/pkg";
import {DiscriminantAnalysisCheckDataType} from "@/models/classify/discriminant/discriminant-worker";

export async function analyzeCase({data}: DiscriminantAnalysisCheckDataType) {
    await init();
    const result = await check_sliced_data(data);
    const validCases = result.valid_cases;
    const excludedCases = result.excluded_cases;
    const totalCases = result.total_cases;

    return JSON.stringify({
        tables: [
            {
                title: "Case Processing Summary",
                columnHeaders: [
                    {header: "Unweighted Cases"},
                    {header: "N"},
                    {header: "Percent"}
                ],
                rows: [
                    {
                        rowHeader: ["Valid"],
                        value: [validCases, ((validCases / totalCases) * 100).toFixed(2)]
                    },
                    {
                        rowHeader: ["Excluded"],
                        value: [excludedCases, ((excludedCases / totalCases) * 100).toFixed(2)]
                    },
                    {
                        rowHeader: ["Total"],
                        value: [totalCases, "100"]
                    }
                ]
            }
        ]
    });
}