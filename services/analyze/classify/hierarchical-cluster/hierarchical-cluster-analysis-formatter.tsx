import {
    JsonData,
    ResultJson,
    TableRow,
    Table,
} from "@/models/classify/hierarchical-cluster/hierarchical-cluster-output";

// Fungsi utama untuk mengonversi data statistik clustering ke format JSON yang ditentukan
export function convertClusteringData(jsonData: JsonData): ResultJson {
    // Fungsi untuk memformat angka sesuai dengan tampilan yang diinginkan
    function formatDisplayNumber(
        num: number | undefined | null
    ): string | null {
        if (typeof num === "undefined" || num === null) return null;

        if (Number.isInteger(num)) {
            return num.toString();
        } else {
            // Format angka desimal
            if (num === 100) {
                return "100.0";
            } else if (num < 1 && num > 0) {
                return num.toFixed(3).replace(/0+$/, "");
            } else {
                // Untuk sebagian besar nomor desimal
                return num.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
            }
        }
    }

    // Buat struktur JSON hasil
    const resultJson: ResultJson = {
        tables: [],
    };

    // 1. Tabel Cluster Membership
    if (jsonData.dendrogram_data && jsonData.dendrogram_data.labels) {
        const clusterMembershipTable: Table = {
            title: "Cluster Membership",
            columnHeaders: [
                { header: "Case" },
                { header: "3 Clusters" }, // Nama kolom berdasarkan jumlah cluster yang dipilih
            ],
            rows: [],
        };

        // Hitung jumlah cluster berdasarkan data dendrogram
        // Konversi dari data merge steps ke cluster assignments
        const caseLabels = jsonData.dendrogram_data.labels;
        const numCases = caseLabels.length;

        // Membuat array assignment cluster secara dinamis
        // Kita akan menganalisis data dendrogram untuk menentukan keanggotaan cluster

        // Implementasi sederhana: Buat cluster assignments dari merge history
        // Kita asumsikan bahwa 3 cluster adalah hasil akhir (bisa diganti dengan parameter dinamis)
        let clusterAssignments = Array(numCases)
            .fill(0)
            .map((_, i) => i + 1);

        // Terapkan penggabungan berdasarkan data merges
        if (jsonData.dendrogram_data.merges) {
            // Mulai dengan setiap kasus dalam cluster sendiri
            // Kemudian gabungkan cluster berdasarkan riwayat penggabungan
            for (let i = 0; i < jsonData.dendrogram_data.merges.length; i++) {
                const [cluster1, cluster2] = jsonData.dendrogram_data.merges[i];

                // Cari semua kasus yang berada di cluster2 dan pindahkan ke cluster1
                const cluster2Value = clusterAssignments[cluster2];

                for (let j = 0; j < clusterAssignments.length; j++) {
                    if (clusterAssignments[j] === cluster2Value) {
                        clusterAssignments[j] = clusterAssignments[cluster1];
                    }
                }
            }
        }

        // Normalisasi nomor cluster (1, 2, 3, ...) tanpa celah - menggunakan metode alternatif
        const uniqueClusters: number[] = [];
        for (let i = 0; i < clusterAssignments.length; i++) {
            if (uniqueClusters.indexOf(clusterAssignments[i]) === -1) {
                uniqueClusters.push(clusterAssignments[i]);
            }
        }

        const clusterMap = new Map<number, number>();
        for (let i = 0; i < uniqueClusters.length; i++) {
            clusterMap.set(uniqueClusters[i], i + 1);
        }

        const normalizedAssignments = clusterAssignments.map(
            (cluster) => clusterMap.get(cluster) || 1
        );

        // Buat baris untuk setiap kasus
        for (let i = 0; i < numCases; i++) {
            const caseLabel = `${i + 1}:${caseLabels[i]}`;
            clusterMembershipTable.rows.push({
                rowHeader: [caseLabel],
                "3 Clusters": normalizedAssignments[i],
            });
        }

        resultJson.tables.push(clusterMembershipTable);
    }

    // 2. Tabel Proximity Matrix
    if (jsonData.proximity_matrix) {
        const proximityMatrixTable: Table = {
            title: "Proximity Matrix",
            columnHeaders: [{ header: "Case" }],
            rows: [],
        };

        const caseLabels =
            jsonData.dendrogram_data?.labels ||
            Array(jsonData.proximity_matrix.length)
                .fill(0)
                .map((_, i) => `Case ${i}`);

        // Tambahkan header kolom untuk setiap kasus
        for (let i = 0; i < caseLabels.length; i++) {
            const caseLabel = `${i + 1}:${caseLabels[i].replace("Case ", "")}`;
            proximityMatrixTable.columnHeaders.push({ header: caseLabel });
        }

        // Cari nilai max dalam proximity matrix untuk scaling
        let maxDistance = 0;
        for (let i = 0; i < jsonData.proximity_matrix.length; i++) {
            for (let j = 0; j < jsonData.proximity_matrix[i].length; j++) {
                maxDistance = Math.max(
                    maxDistance,
                    jsonData.proximity_matrix[i][j]
                );
            }
        }

        // Tambahkan row subtitle - Rescaled Reversed Absolute Euclidean Distance
        proximityMatrixTable.rows.push({
            rowHeader: ["Rescaled Reversed Absolute Euclidean Distance"],
        });

        // Transformasi matrix proximity (nilai dari 0-1, di mana nilai yang lebih tinggi = lebih dekat)
        for (let i = 0; i < jsonData.proximity_matrix.length; i++) {
            const row: TableRow = {
                rowHeader: [`${i + 1}:${caseLabels[i].replace("Case ", "")}`],
            };

            // Tambahkan nilai proximity untuk setiap kolom
            for (let j = 0; j < jsonData.proximity_matrix[i].length; j++) {
                // Transformasi nilai: 1 - (distance / max_distance)
                const originalValue = jsonData.proximity_matrix[i][j];
                const transformedValue = 1 - originalValue / maxDistance;

                // Format nilai untuk ditampilkan dengan 3 desimal
                const formattedValue = formatDisplayNumber(transformedValue);

                const caseLabel = `${j + 1}:${caseLabels[j].replace(
                    "Case ",
                    ""
                )}`;
                row[caseLabel] = formattedValue;
            }

            proximityMatrixTable.rows.push(row);
        }

        // Tambahkan catatan di bawah tabel sebagai baris terakhir
        proximityMatrixTable.rows.push({
            rowHeader: ["This is a similarity matrix"],
        });

        resultJson.tables.push(proximityMatrixTable);
    }

    // 3. Tabel Agglomeration Schedule
    if (
        jsonData.agglomeration_schedule &&
        jsonData.agglomeration_schedule.steps
    ) {
        const agglomerationScheduleTable: Table = {
            title: "Agglomeration Schedule",
            columnHeaders: [
                { header: "Stage" },
                { header: "Cluster Combined" },
                { header: "Cluster Combined_2" },
                { header: "Coefficients" },
                { header: "Stage Cluster First Appears" },
                { header: "Stage Cluster First Appears_2" },
                { header: "Next Stage" },
            ],
            rows: [],
        };

        // Tambahkan subColumnHeaders sebagai baris pertama
        agglomerationScheduleTable.rows.push({
            rowHeader: [""],
            "Cluster Combined": "Cluster 1",
            "Cluster Combined_2": "Cluster 2",
            Coefficients: "",
            "Stage Cluster First Appears": "Cluster 1",
            "Stage Cluster First Appears_2": "Cluster 2",
            "Next Stage": "",
        });

        // Tambahkan data dari agglomeration_schedule
        for (let i = 0; i < jsonData.agglomeration_schedule.steps.length; i++) {
            const step = jsonData.agglomeration_schedule.steps[i];

            // Pastikan nilai indeks cluster dimulai dari 1 alih-alih 0
            const cluster1 = step.cluster1 + 1;
            const cluster2 = step.cluster2 + 1;

            // konversi nilai stage_cluster_first_appears yang -1 menjadi 0
            const stageCluster1FirstAppears =
                step.stage_cluster1_first_appears === -1
                    ? 0
                    : step.stage_cluster1_first_appears;
            const stageCluster2FirstAppears =
                step.stage_cluster2_first_appears === -1
                    ? 0
                    : step.stage_cluster2_first_appears;

            // konversi nilai next_stage yang -1 menjadi 0
            const nextStage = step.next_stage === -1 ? 0 : step.next_stage;

            const row: TableRow = {
                rowHeader: [(i + 1).toString()],
                "Cluster Combined": cluster1,
                "Cluster Combined_2": cluster2,
                Coefficients: formatDisplayNumber(step.coefficient),
                "Stage Cluster First Appears": stageCluster1FirstAppears,
                "Stage Cluster First Appears_2": stageCluster2FirstAppears,
                "Next Stage": nextStage,
            };

            agglomerationScheduleTable.rows.push(row);
        }

        resultJson.tables.push(agglomerationScheduleTable);
    }

    // Tambahkan informasi metode
    if (
        jsonData.agglomeration_schedule &&
        jsonData.agglomeration_schedule.method
    ) {
        resultJson.method = jsonData.agglomeration_schedule.method;

        // Tambahkan Ward Linkage jika metodenya adalah "AverageBetweenGroups"
        if (jsonData.agglomeration_schedule.method === "AverageBetweenGroups") {
            resultJson.method = "Ward Linkage";
        }
    }

    // 4. Tabel Evaluation Metrics (jika tersedia)
    if (jsonData.evaluation) {
        const evaluationMetricsTable: Table = {
            title: "Cluster Evaluation Metrics",
            columnHeaders: [{ header: "Metric" }, { header: "Value" }],
            rows: [],
        };

        // Tambahkan metrik evaluasi yang tersedia
        if (jsonData.evaluation.silhouette !== undefined) {
            evaluationMetricsTable.rows.push({
                rowHeader: ["Silhouette Coefficient"],
                Value: formatDisplayNumber(jsonData.evaluation.silhouette),
            });
        }

        if (jsonData.evaluation.sse !== undefined) {
            evaluationMetricsTable.rows.push({
                rowHeader: ["Sum of Squared Errors (SSE)"],
                Value: formatDisplayNumber(jsonData.evaluation.sse),
            });
        }

        if (jsonData.evaluation.ssb !== undefined) {
            evaluationMetricsTable.rows.push({
                rowHeader: ["Sum of Squares Between Clusters (SSB)"],
                Value: formatDisplayNumber(jsonData.evaluation.ssb),
            });
        }

        // Tambahkan predictor importance jika tersedia
        if (
            jsonData.evaluation.predictor_importance &&
            jsonData.evaluation.predictor_importance.length > 0
        ) {
            const predictorImportanceTable: Table = {
                title: "Predictor Importance",
                columnHeaders: [
                    { header: "Variable" },
                    { header: "Importance" },
                ],
                rows: [],
            };

            for (
                let i = 0;
                i < jsonData.evaluation.predictor_importance.length;
                i++
            ) {
                if (jsonData.evaluation.predictor_importance[i] !== null) {
                    predictorImportanceTable.rows.push({
                        rowHeader: [`Variable ${i + 1}`],
                        Importance: formatDisplayNumber(
                            jsonData.evaluation.predictor_importance[i]
                        ),
                    });
                }
            }

            if (predictorImportanceTable.rows.length > 0) {
                resultJson.tables.push(predictorImportanceTable);
            }
        }

        if (evaluationMetricsTable.rows.length > 0) {
            resultJson.tables.push(evaluationMetricsTable);
        }
    }

    return resultJson;
}
