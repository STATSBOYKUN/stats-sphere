import React from "react";

export type KMeansClusterMainType = {
    TargetVar: string | null;
    CaseTarget: string | null;
    IterateClassify: boolean;
    ClassifyOnly: boolean;
    OpenDataset: boolean;
    ExternalDatafile: boolean;
    NewDataset: boolean;
    DataFile: boolean;
    ReadInitial: boolean;
    WriteFinal: boolean;
    OpenDatasetMethod: string | null;
    NewData: string | null;
    Cluster: number | null;
    InitialData: string | null;
    FinalData: string | null;
}

export type KMeansClusterDialogProps = {
    isMainOpen: boolean;
    setIsMainOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsIterateOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (field: keyof KMeansClusterMainType, value: string | boolean | number | null) => void;
    data: KMeansClusterMainType;
};

export type KMeansClusterIterateType = {
    MaximumIterations: number | null;
    ConvergenceCriterion: number | null;
    UseRunningMeans: boolean;
}

export type KMeansClusterIterateProps = {
    isIterateOpen: boolean;
    setIsIterateOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (field: keyof KMeansClusterIterateType, value: string | boolean | number | null) => void;
    data: KMeansClusterIterateType;
};

export type KMeansClusterSaveType = {
    ClusterMembership: boolean;
    DistanceClusterCenter: boolean;
}

export type KMeansClusterSaveProps = {
    isSaveOpen: boolean;
    setIsSaveOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (field: keyof KMeansClusterSaveType, value: string | boolean | null) => void;
    data: KMeansClusterSaveType;
};

export type KMeansClusterOptionsType = {
    InitialCluster: boolean;
    ANOVA: boolean;
    ClusterInfo: boolean;
    ExcludeListWise: boolean;
    ExcludePairWise: boolean;
}

export type KMeansClusterOptionsProps = {
    isOptionsOpen: boolean;
    setIsOptionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (field: keyof KMeansClusterOptionsType, value: string | boolean | null) => void;
    data: KMeansClusterOptionsType;
};

export type KMeansClusterType = {
    main: KMeansClusterMainType;
    iterate: KMeansClusterIterateType;
    save: KMeansClusterSaveType;
    options: KMeansClusterOptionsType;
}

export type KMeansClusterContainerProps = {
    onClose: () => void;
}