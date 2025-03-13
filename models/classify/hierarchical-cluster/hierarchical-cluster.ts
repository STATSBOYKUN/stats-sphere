import React from "react";

export type HierClusMainType = {
    Variables: string[] | null;
    LabelCases: string | null;
    ClusterCases: boolean;
    ClusterVar: boolean;
    DispStats: boolean;
    DispPlots: boolean;
};

export type HierClusDialogProps = {
    isMainOpen: boolean;
    setIsMainOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsStatisticsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsMethodOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof HierClusMainType,
        value: string[] | string | boolean | null
    ) => void;
    data: HierClusMainType;
    globalVariables: string[];
    onContinue: (mainState: HierClusMainType) => void;
    onReset: () => void;
};

export type HierClusStatisticsType = {
    AgglSchedule: boolean;
    ProxMatrix: boolean;
    NoneSol: boolean;
    SingleSol: boolean;
    RangeSol: boolean;
    NoOfCluster: number | null;
    MaxCluster: number | null;
    MinCluster: number | null;
};

export type HierClusStatisticsProps = {
    isStatisticsOpen: boolean;
    setIsStatisticsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof HierClusStatisticsType,
        value: number | boolean | null
    ) => void;
    data: HierClusStatisticsType;
};

export type HierClusPlotsType = {
    Dendrograms: boolean;
    AllClusters: boolean;
    RangeClusters: boolean;
    NoneClusters: boolean;
    StartCluster: number | null;
    StopCluster: number | null;
    StepByCluster: number | null;
    VertOrien: boolean;
    HoriOrien: boolean;
};

export type HierClusPlotsProps = {
    isPlotsOpen: boolean;
    setIsPlotsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof HierClusPlotsType,
        value: number | boolean | null
    ) => void;
    data: HierClusPlotsType;
};

export type HierClusSaveType = {
    NoneSol: boolean;
    SingleSol: boolean;
    RangeSol: boolean;
    NoOfCluster: number | null;
    MaxCluster: number | null;
    MinCluster: number | null;
};

export type HierClusSaveProps = {
    isSaveOpen: boolean;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof HierClusSaveType,
        value: number | boolean | null
    ) => void;
    data: HierClusSaveType;
};

export type HierClusMethodType = {
    ClusMethod: string | null;
    Interval: boolean;
    IntervalMethod: string | null;
    Power: string | null;
    Root: string | null;
    Counts: boolean;
    CountsMethod: string | null;
    Binary: boolean;
    BinaryMethod: string | null;
    Present: number | null;
    Absent: number | null;
    StandardizeMethod: string | null;
    ByVariable: boolean;
    ByCase: boolean;
    AbsValue: boolean;
    ChangeSign: boolean;
    RescaleRange: boolean;
};

export type HierClusMethodProps = {
    isMethodOpen: boolean;
    setIsMethodOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (
        field: keyof HierClusMethodType,
        value: number | string | boolean | null
    ) => void;
    data: HierClusMethodType;
};

export type HierClusType = {
    main: HierClusMainType;
    statistics: HierClusStatisticsType;
    plots: HierClusPlotsType;
    save: HierClusSaveType;
    method: HierClusMethodType;
};

export type HierClusContainerProps = {
    onClose: () => void;
};
