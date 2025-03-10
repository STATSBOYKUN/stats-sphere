import React, {useState} from "react";
import {HierClusDialog} from "@/components/Modals/Analyze/classify/hierarchical-cluster/dialog";
import {HierClusContainerProps, HierClusType} from "@/models/classify/hierarchical-cluster/hierarchical-cluster";
import {HierClusDefault} from "@/constants/classify/hierarchical-cluster/hierarchical-cluster-default";
import {HierClusStatistics} from "@/components/Modals/Analyze/classify/hierarchical-cluster/statistics";
import {HierClusPlots} from "@/components/Modals/Analyze/classify/hierarchical-cluster/plots";
import {HierClusSave} from "@/components/Modals/Analyze/classify/hierarchical-cluster/save";
import {HierClusMethod} from "@/components/Modals/Analyze/classify/hierarchical-cluster/method";

export const HierClusContainer = ({onClose} : HierClusContainerProps) => {
    const [formData, setFormData] = useState<HierClusType>({...HierClusDefault});

    const updateFormData = <T extends keyof typeof formData>(
        section: T,
        field: keyof typeof formData[T],
        value: unknown
    ) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const [isMainOpen, setIsMainOpen] = useState(false);
    const [isStatisticsOpen, setIsStatisticsOpen] = useState(false);
    const [isPlotsOpen, setIsPlotsOpen] = useState(false);
    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [isMethodOpen, setIsMethodOpen] = useState(false);

    return (
        <>
            <HierClusDialog
                isMainOpen={isMainOpen}
                setIsMainOpen={setIsMainOpen}
                setIsStatisticsOpen={setIsStatisticsOpen}
                setIsPlotsOpen={setIsPlotsOpen}
                setIsSaveOpen={setIsSaveOpen}
                setIsMethodOpen={setIsMethodOpen}
                updateFormData={(field, value) => updateFormData("main", field, value)}
                data={formData.main}
            />

            {/* Statistics */}
            <HierClusStatistics
                isStatisticsOpen={isStatisticsOpen}
                setIsStatisticsOpen={setIsStatisticsOpen}
                updateFormData={(field, value) => updateFormData("statistics", field, value)}
                data={formData.statistics}
            />

            {/* Plots */}
            <HierClusPlots
                isPlotsOpen={isPlotsOpen}
                setIsPlotsOpen={setIsPlotsOpen}
                updateFormData={(field, value) => updateFormData("plots", field, value)}
                data={formData.plots}
            />

            {/* Save */}
            <HierClusSave
                isSaveOpen={isSaveOpen}
                setIsSaveOpen={setIsSaveOpen}
                updateFormData={(field, value) => updateFormData("save", field, value)}
                data={formData.save}
            />

            {/* Method */}
            <HierClusMethod
                isMethodOpen={isMethodOpen}
                setIsMethodOpen={setIsMethodOpen}
                updateFormData={(field, value) => updateFormData("method", field, value)}
                data={formData.method}
            />
        </>
    );
}