import init, {group_statistics} from "@/src/wasm/pkg";
import {DiscriminantAnalysisGroupStatisticsType} from "@/models/classify/discriminant/discriminant-worker";

export async function groupStatistics({
                                          groupData,
                                          groupDefs,
                                          independentData,
                                          independentDefs,
                                          minRange,
                                          maxRange
                                      }: DiscriminantAnalysisGroupStatisticsType) {
    await init();

    const groupName = groupDefs[0][0]?.name || "Group"; // Ambil nama dari groupDefs, default ke "Group"
    const independentNames = independentDefs.map(independent => independent.map((item: any) => item.name)).flat();

    console.log(groupName, independentNames);
    if (minRange === null || maxRange === null) {
        return;
    }

    const firstObject = groupData[0][0];
    const dynamicKey: string | undefined = firstObject ? Object.keys(firstObject)[0] : undefined;

    if (!dynamicKey) {
        return;
    }

    const varValues: number[] = groupData[0]
    .map((item: Record<string, any>) => item[dynamicKey])
    .filter((v: unknown): v is number => typeof v === "number" && !isNaN(v));

    const min = Math.min(...varValues);
    const max = Math.max(...varValues);

    if (minRange < min || maxRange > max) {
        return;
    }

    const result = await group_statistics(groupData, independentData, minRange, maxRange);
    if (!result) return;

    // Iterasi untuk setiap rentang dan setiap independent variable
    const rangeRows = Object.entries(result.ranges).flatMap(([range, stats]: [string, any]) => {
        return independentNames.map((independentName, index) => ({
            rowHeader: [range, independentName],
            value: [
                stats.valid_in_independent[index] || 0, // Unweighted
                stats.valid_in_independent[index] || 0  // Weighted
            ]
        }));
    });

    // Iterasi untuk total case per group
    const totalRows = independentNames.map((independentName, index) => ({
        rowHeader: ["Total", independentName],
        value: [
            result.total_cases_per_group[index] || 0, // Unweighted
            result.total_cases_per_group[index] || 0  // Weighted
        ]
    }));

    // Tambahkan total keseluruhan
    totalRows.push({
        rowHeader: ["Total", "All Groups"],
        value: [
            result.total_cases_all || 0, // Unweighted
            result.total_cases_all || 0  // Weighted
        ]
    });

    return JSON.stringify({
        tables: [
            {
                title: "Group Statistics Summary",
                columnHeaders: [
                    {header: groupName}, // Menggunakan nama dari groupDefs
                    {header: "Valid N (listwise)"},
                    {header: "Unweighted"},
                    {header: "Weighted"}
                ],
                rows: [...rangeRows, ...totalRows]
            }
        ]
    });
}