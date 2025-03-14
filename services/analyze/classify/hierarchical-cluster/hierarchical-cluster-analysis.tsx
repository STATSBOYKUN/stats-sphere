import { getSlicedData, getVarDefs } from "@/hooks/useVariable";
import { HierClusAnalysisType } from "@/models/classify/hierarchical-cluster/hierarchical-cluster-worker";
import init, { HierarchicalClusteringWasm } from "@/src/wasm/pkg/wasm";

export async function analyzeHierClus({
    tempData,
    dataVariables,
    variables,
    addLog,
    addAnalytic,
    addStatistic,
}: HierClusAnalysisType) {
    await init();

    // const ClusterVariables = tempData.main.Variables || [];

    // const LabelCasesVariable = tempData.main.LabelCases
    //     ? [tempData.main.LabelCases]
    //     : [];

    // const slicedDataForCluster = getSlicedData({
    //     dataVariables: dataVariables,
    //     variables: variables,
    //     selectedVariables: ClusterVariables,
    // });

    // const slicedDataForLabelCases = getSlicedData({
    //     dataVariables: dataVariables,
    //     variables: variables,
    //     selectedVariables: LabelCasesVariable,
    // });

    // const varDefsForCluster = getVarDefs(variables, ClusterVariables);
    // const varDefsForLabelCases = getVarDefs(variables, LabelCasesVariable);

    console.log("Test");

    const configData = {
        main: {
            Variables: ["age", "incbef"],
            LabelCases: "gender",
            ClusterCases: false,
            ClusterVar: false,
            DispStats: false,
            DispPlots: false,
        },
        statistics: {
            AgglSchedule: true,
            ProxMatrix: true,
            NoneSol: false,
            SingleSol: true,
            RangeSol: false,
            NoOfCluster: 3,
            MaxCluster: null,
            MinCluster: null,
        },
        plots: {
            Dendrograms: true,
            AllClusters: false,
            RangeClusters: false,
            NoneClusters: false,
            StartCluster: null,
            StopCluster: null,
            StepByCluster: null,
            VertOrien: false,
            HoriOrien: false,
        },
        save: {
            NoneSol: false,
            SingleSol: false,
            RangeSol: false,
            NoOfCluster: null,
            MaxCluster: null,
            MinCluster: null,
        },
        method: {
            ClusMethod: "AverageBetweenGroups",
            Interval: true,
            IntervalMethod: "Euclidean",
            Power: null,
            Root: null,
            Counts: false,
            CountsMethod: null,
            Binary: false,
            BinaryMethod: null,
            Present: null,
            Absent: null,
            StandardizeMethod: "ZScore",
            ByVariable: true,
            ByCase: false,
            AbsValue: false,
            ChangeSign: false,
            RescaleRange: false,
        },
    };

    const slicedDataForCluster = [
        [
            { age: 16 },
            { age: 17 },
            { age: 17 },
            { age: 19 },
            { age: 18 },
            { age: 17 },
            { age: 17 },
            { age: 21 },
            { age: 18 },
            { age: 16 },
        ],
        [
            { incbef: 8 },
            { incbef: 8 },
            { incbef: 8 },
            { incbef: 9 },
            { incbef: 7 },
            { incbef: 8 },
            { incbef: 8 },
            { incbef: 9 },
            { incbef: 7 },
            { incbef: 7 },
        ],
    ];

    const slicedDataForLabelCases = [
        [
            { gender: "m" },
            { gender: "f" },
            { gender: "f" },
            { gender: "f" },
            { gender: "f" },
            { gender: "f" },
            { gender: "f" },
            { gender: "f" },
            { gender: "m" },
            { gender: "m" },
        ],
    ];

    const varDefsForCluster = [
        [
            {
                name: "age",
                type: "Numeric",
                label: "",
                values: "None",
                missing: "None",
                measure: "Nominal",
            },
        ],
        [
            {
                name: "incbef",
                type: "Numeric",
                label: "",
                values: "None",
                missing: "None",
                measure: "Nominal",
            },
        ],
    ];

    const varDefsForLabelCases = [
        [
            {
                name: "gender",
                type: "String",
                label: "",
                values: "None",
                missing: "None",
                measure: "Nominal",
            },
        ],
    ];

    const hc = new HierarchicalClusteringWasm(
        configData,
        slicedDataForCluster,
        slicedDataForLabelCases,
        varDefsForCluster,
        varDefsForLabelCases
    );

    // perform anaylsis and etc
    hc.perform_analysis();

    // get results
    const results = hc.get_results();

    console.log(
        tempData,
        slicedDataForCluster,
        slicedDataForLabelCases,
        varDefsForCluster,
        varDefsForLabelCases
    );

    console.log(results);
}
