// components/Modals/ModalContainer.tsx

"use client";

import React from "react";
import { useModal, ModalType } from "@/hooks/useModal";

// Time Series Tolong Jangan Dihapus
import SmoothingModal from "@/components/Modals/Analyze/TimeSeries/SmoothingModal";
import DecompositionModal from "@/components/Modals/Analyze/TimeSeries/DecompositionModal";
import AutocorrelationModal from "@/components/Modals/Analyze/TimeSeries/AutocorrelationModal";
import UnitRootTestModal from "@/components/Modals/Analyze/TimeSeries/UnitRootTestModal";
import BoxJenkinsModelModal from "@/components/Modals/Analyze/TimeSeries/BoxJenkinsModelModal";

import ComputeVariableModal from "@/components/Modals/Transform/ComputeVariableModal";
import { Dialog } from "@/components/ui/dialog";
import SimpleBarModal from "./Graphs/LegacyDialogs/BarModal/SimpleBarModal";
import FrequenciesModal from "@/components/Modals/Analyze/DescriptiveStatistic/Frequencies/FrequenciesModal";
import ImportCSV from "@/components/Modals/File/ImportCSV";
// import OpenData from "@/components/Modals/File/OpenData";
import ReadCSVFile from "@/components/Modals/File/ReadCSVFile";
import ImportExcel from "@/components/Modals/File/ImportExcel";
import ReadExcelFile from "@/components/Modals/File/ReadExcelFile";
import ModalAutomaticLinearModeling from "@/components/Modals/Regression/AutomaticLinearModeling/ModalAutomaticLinearModeling";
import ModalLinear from "./Regression/Linear/ModalLinear";
import ModalCurveEstimation from "./Regression/CurveEstimation/ModalCurveEstimation";
import ModalPartialLeastSquares from "./Regression/PartialLeastSquares/ModalPartialLeastSquares";
import ModalBinaryLogistic from "./Regression/BinaryLogistic/ModalBinaryLogistic";
import ModalMultinomialLogistic from "./Regression/MultinomialLogistic/ModalMultinomialLogistic";
import ModalOrdinal from "./Regression/Ordinal/ModalOrdinal";
import ModalProbit from "./Regression/Probit/ModalProbit";
import ModalNonlinear from "./Regression/Nonlinear/ModalNonlinear";

import OpenData from "@/components/Modals/File/OpenData";
import PrintModal from "@/components/Modals/File/Print";
import ModalTwoStageLeastSquares from "./Regression/TwoStageLeastSquares/ModalTwoStageLeastSquares";
import ModalWeightEstimation from "./Regression/WeightEstimation/ModalWeightEstimation";
import ModalQuantiles from "./Regression/Quantiles/ModalQuantiles";
import ModalOptimalScaling from "./Regression/OptimalScaling/ModalOptimalScaling";
import ChartBuilderModal from "./Graphs/ChartBuilder/ChartBuilderModal";
import { UnivariateContainer } from "@/components/Modals/Analyze/general-linear-model/univariate/univariate-main";
import { MultivariateContainer } from "@/components/Modals/Analyze/general-linear-model/multivariate/multivariate-main";
import { RepeatedMeasuresContainer } from "@/components/Modals/Analyze/general-linear-model/repeated-measures/repeated-measures-main";
import { VarianceCompsContainer } from "@/components/Modals/Analyze/general-linear-model/variance-components/variance-components-main";
import { FactorContainer } from "@/components/Modals/Analyze/dimension-reduction/factor/factor-main";
import { CorrespondenceContainer } from "@/components/Modals/Analyze/dimension-reduction/correspondence-analysis/correspondence-analysis-main";
import { OptScaContainer } from "@/components/Modals/Analyze/dimension-reduction/optimal-scaling/optimal-scaling-main";
import { TwoStepClusterContainer } from "@/components/Modals/Analyze/classify/two-step-cluster/two-step-cluster-main";
import { KMeansClusterContainer } from "@/components/Modals/Analyze/classify/k-means-cluster/k-means-cluster-main";
import { HierClusContainer } from "@/components/Modals/Analyze/classify/hierarchical-cluster/hierarchical-cluster-main";
import { TreeContainer } from "@/components/Modals/Analyze/classify/tree/tree-main";
import { DiscriminantContainer } from "@/components/Modals/Analyze/classify/discriminant/discriminant-main";
import { KNNContainer } from "@/components/Modals/Analyze/classify/nearest-neighbor/nearest-neighbor-main";
import { RocCurveContainer } from "@/components/Modals/Analyze/classify/roc-curve/roc-curve-main";
import { RocAnalysisContainer } from "@/components/Modals/Analyze/classify/roc-analysis/roc-analysis-main";
import { OptScaCatpcaContainer } from "./Analyze/dimension-reduction/optimal-scaling/catpca/optimal-scaling-catpca-main";
import { OptScaMCAContainer } from "./Analyze/dimension-reduction/optimal-scaling/mca/optimal-scaling-mca-main";
import { OptScaOveralsContainer } from "./Analyze/dimension-reduction/optimal-scaling/overals/optimal-scaling-overals-main";

const ModalContainer: React.FC = () => {
    const { modals, closeModal } = useModal();

    if (modals.length === 0) return null;

    const currentModal = modals[modals.length - 1];

    const renderModal = () => {
        switch (currentModal.type) {
            case ModalType.ImportCSV:
                console.log("ImportCSV");
                return (
                    <ImportCSV onClose={closeModal} {...currentModal.props} />
                );
            case ModalType.ReadCSVFile:
                return (
                    <ReadCSVFile onClose={closeModal} {...currentModal.props} />
                );
            case ModalType.ImportExcel:
                return (
                    <ImportExcel onClose={closeModal} {...currentModal.props} />
                );
            case ModalType.ReadExcelFile:
                return (
                    <ReadExcelFile
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.OpenData:
                console.log("OpenData");
                return (
                    <OpenData onClose={closeModal} {...currentModal.props} />
                );
            case ModalType.ComputeVariable:
                return (
                    <ComputeVariableModal
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.Print:
                return (
                    <PrintModal onClose={closeModal} {...currentModal.props} />
                );

            case ModalType.ImportCSV:
                return (
                    <ImportCSV onClose={closeModal} {...currentModal.props} />
                );
            case ModalType.ReadCSVFile:
                return (
                    <ReadCSVFile onClose={closeModal} {...currentModal.props} />
                );
            case ModalType.ImportExcel:
                return (
                    <ImportExcel onClose={closeModal} {...currentModal.props} />
                );
            case ModalType.ReadExcelFile:
                return (
                    <ReadExcelFile
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            // case ModalType.OpenData:
            //   return <OpenData onClose={closeModal} {...currentModal.props} />;
            case ModalType.ComputeVariable:
                return (
                    <ComputeVariableModal
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );

            // Regression Nopal
            case ModalType.ModalAutomaticLinearModeling:
                return (
                    <ModalAutomaticLinearModeling
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.ModalLinear:
                return (
                    <ModalLinear onClose={closeModal} {...currentModal.props} />
                );
            case ModalType.ModalCurveEstimation:
                return (
                    <ModalCurveEstimation
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.ModalPartialLeastSquares:
                return (
                    <ModalPartialLeastSquares
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.ModalBinaryLogistic:
                return (
                    <ModalBinaryLogistic
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.ModalMultinomialLogistic:
                return (
                    <ModalMultinomialLogistic
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.ModalOrdinal:
                return (
                    <ModalOrdinal
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.ModalProbit:
                return (
                    <ModalProbit onClose={closeModal} {...currentModal.props} />
                );
            case ModalType.ModalNonlinear:
                return (
                    <ModalNonlinear
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.ModalWeightEstimation:
                return (
                    <ModalWeightEstimation
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.ModalTwoStageLeastSquares:
                return (
                    <ModalTwoStageLeastSquares
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.ModalQuantiles:
                return (
                    <ModalQuantiles
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.ModalOptimalScaling:
                return (
                    <ModalOptimalScaling
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );

            //   General Linear Model
            case ModalType.Univariate:
                return (
                    <UnivariateContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.Multivariate:
                return (
                    <MultivariateContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.RepeatedMeasures:
                return (
                    <RepeatedMeasuresContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.VarianceComponents:
                return (
                    <VarianceCompsContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );

            //   Dimension Reduction
            case ModalType.Factor:
                return (
                    <FactorContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.CorrespondenceAnalysis:
                return (
                    <CorrespondenceContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.OptimalScaling:
                return (
                    <OptScaContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.OptimalScalingCATPCA:
                return (
                    <OptScaCatpcaContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.OptimalScalingMCA:
                return (
                    <OptScaMCAContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.OptimalScalingOVERALS:
                return (
                    <OptScaOveralsContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );

            //   Classify
            case ModalType.TwoStepCluster:
                return (
                    <TwoStepClusterContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.KMeansCluster:
                return (
                    <KMeansClusterContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.HierarchicalCluster:
                return (
                    <HierClusContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            // case ModalType.ClusterSilhouettes:
            //   return <Clust onClose={closeModal} {...currentModal.props} />;
            case ModalType.Tree:
                return (
                    <TreeContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.Discriminant:
                return (
                    <DiscriminantContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.NearestNeighbor:
                return (
                    <KNNContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.ROCCurve:
                return (
                    <RocCurveContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.ROCAnalysis:
                return (
                    <RocAnalysisContainer
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );

            // Time Series
            case ModalType.Smoothing:
                return (
                    <SmoothingModal
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.Decomposition:
                return (
                    <DecompositionModal
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.Autocorrelation:
                return (
                    <AutocorrelationModal
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.UnitRootTest:
                return (
                    <UnitRootTestModal
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.BoxJenkinsModel:
                return (
                    <BoxJenkinsModelModal
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );

            case ModalType.Frequencies:
            case ModalType.FrequenciesStatistic:
                return (
                    <FrequenciesModal
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );

            // Chart Builder
            case ModalType.ChartBuilderModal:
                return (
                    <ChartBuilderModal
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );
            case ModalType.SimpleBarModal:
                return (
                    <SimpleBarModal
                        onClose={closeModal}
                        {...currentModal.props}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && closeModal()}>
            {renderModal()}
        </Dialog>
    );
};

export default ModalContainer;
