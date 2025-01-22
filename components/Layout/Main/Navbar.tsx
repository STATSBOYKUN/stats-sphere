// components/Layout/Main/Navbar.tsx
"use client";

import React from 'react';
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
    MenubarContent,
    MenubarItem,
    MenubarSeparator,
    MenubarSub,
    MenubarSubTrigger,
    MenubarSubContent,
} from "@/components/ui/menubar";

import { ModalType, useModal } from "@/hooks/useModal";

const Navbar: React.FC = () => {
    const { openModal } = useModal();

    const handleAction = ({actionType}: { actionType: any }) => {
        switch (actionType) {
            case 'Undo':
                break;
            case 'Redo':
                // Tambahkan logika untuk Redo
                break;
            case 'Cut':
                // Tambahkan logika untuk Cut
                break;
            case 'Copy':
                // Tambahkan logika untuk Copy
                break;
            case 'CopyWithVariableNames':
                // Tambahkan logika untuk Copy with Variable Names
                break;
            case 'CopyWithVariableLabels':
                // Tambahkan logika untuk Copy with Variable Labels
                break;
            case 'Paste':
                // Tambahkan logika untuk Paste
                break;
            case 'PasteVariables':
                // Tambahkan logika untuk Paste Variables
                break;
            case 'PasteWithVariableNames':
                // Tambahkan logika untuk Paste with Variable Names
                break;
            case 'Clear':
                // Tambahkan logika untuk Clear
                break;
            case 'InsertVariable':
                // Tambahkan logika untuk Insert Variable
                break;
            case 'InsertCases':
                // Tambahkan logika untuk Insert Cases
                break;
            default:
                console.warn('Unknown action:', actionType);
        }
    };


    return (
        <nav>
            <div className="flex items-center justify-between w-full px-2 py-2">
                <Menubar className="ml-0 lg:flex">
                    <MenubarMenu>
                        <MenubarTrigger>File</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={() => openModal(ModalType.NewFile)}>New</MenubarItem>
                            <MenubarSub>
                                <MenubarSubTrigger>Open</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => openModal(ModalType.OpenData)}>Data</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.OpenOutput)}>Output</MenubarItem>
                                    {/*<MenubarSub>*/}
                                    {/*    <MenubarSubTrigger>Script</MenubarSubTrigger>*/}
                                    {/*    <MenubarSubContent>*/}
                                    {/*        <MenubarItem onClick={() => openModal(ModalType.OpenPython2)}>Python2</MenubarItem>*/}
                                    {/*        <MenubarItem onClick={() => openModal(ModalType.OpenPython3)}>Python3</MenubarItem>*/}
                                    {/*        <MenubarItem onClick={() => openModal(ModalType.OpenBasic)}>Basic</MenubarItem>*/}
                                    {/*    </MenubarSubContent>*/}
                                    {/*</MenubarSub>*/}
                                </MenubarSubContent>
                            </MenubarSub>
                            <MenubarSub>
                                <MenubarSubTrigger>Import Data</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => openModal(ModalType.ImportExcel)}>Excel...</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.ImportCSV)}>CSV Data...</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                            <MenubarSeparator />
                            {/*<MenubarItem onClick={() => openModal(ModalType.SaveAllData)}>Save All Data</MenubarItem>*/}
                            <MenubarSub>
                                <MenubarSubTrigger>Export</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => openModal(ModalType.ExportDatabase)}>Database...</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.ExportExcel)}>Excel...</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.ExportCSV)}>CSV Data...</MenubarItem>
                                    {/*<MenubarItem onClick={() => openModal(ModalType.ExportTabDelimited)}>Tab-delimited...</MenubarItem>*/}
                                    {/*<MenubarItem onClick={() => openModal(ModalType.ExportFixedText)}>Fixed Text...</MenubarItem>*/}
                                    {/*<MenubarItem onClick={() => openModal(ModalType.ExportSAS)}>SAS...</MenubarItem>*/}
                                    {/*<MenubarItem onClick={() => openModal(ModalType.ExportStata)}>Stata...</MenubarItem>*/}
                                    {/*<MenubarItem onClick={() => openModal(ModalType.ExportDBase)}>dBase...</MenubarItem>*/}
                                    {/*<MenubarItem onClick={() => openModal(ModalType.ExportLotus)}>Lotus...</MenubarItem>*/}
                                    {/*<MenubarItem onClick={() => openModal(ModalType.ExportCognos)}>Cognos TM1...</MenubarItem>*/}
                                    {/*<MenubarItem onClick={() => openModal(ModalType.ExportSYLK)}>SYLK...</MenubarItem>*/}
                                </MenubarSubContent>
                            </MenubarSub>
                            <MenubarSeparator />
                            {/*<MenubarItem onClick={() => openModal(ModalType.RenameDataset)}>Rename Dataset...</MenubarItem>*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.DisplayFileInfo)}>Display Data File Information</MenubarItem>*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.CacheData)}>Cache Data...</MenubarItem>*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.CollectVariableInfo)}>Collect Variable Information</MenubarItem>*/}
                            {/*<MenubarSeparator />*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.StopProcessor)}>Stop Processor</MenubarItem>*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.SwitchServer)}>Switch Server...</MenubarItem>*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.Repository)}>Repository</MenubarItem>*/}
                            {/*<MenubarSeparator />*/}
                            <MenubarItem onClick={() => openModal(ModalType.PrintPreview)}>Print Preview</MenubarItem>
                            <MenubarItem onClick={() => openModal(ModalType.Print)}>Print...</MenubarItem>
                            <MenubarSeparator />
                            {/*<MenubarItem onClick={() => openModal(ModalType.WelcomeDialog)}>Welcome Dialog...</MenubarItem>*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.RecentlyUsedData)}>Recently Used Data</MenubarItem>*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.RecentlyUsedFiles)}>Recently Used Files</MenubarItem>*/}
                            {/*<MenubarSeparator />*/}
                            <MenubarItem onClick={() => openModal(ModalType.Exit)}>Exit</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>

                {/* Menu Edit */}
                    <MenubarMenu>
                        <MenubarTrigger>Edit</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={() => handleAction({actionType: 'Undo'})}>Undo</MenubarItem>
                            <MenubarItem onClick={() => handleAction({actionType: 'Redo'})}>Redo</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem onClick={() => handleAction({actionType: 'Cut'})}>Cut</MenubarItem>
                            <MenubarItem onClick={() => handleAction({actionType: 'Copy'})}>Copy</MenubarItem>
                            <MenubarItem onClick={() => handleAction({actionType: 'CopyWithVariableNames'})}>Copy with Variable Names</MenubarItem>
                            <MenubarItem onClick={() => handleAction({actionType: 'CopyWithVariableLabels'})}>Copy with Variable Labels</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem onClick={() => handleAction({actionType: 'Paste'})}>Paste</MenubarItem>
                            <MenubarItem onClick={() => handleAction({actionType: 'PasteVariables'})}>Paste Variables...</MenubarItem>
                            <MenubarItem onClick={() => handleAction({actionType: 'PasteWithVariableNames'})}>Paste with Variable Names</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem onClick={() => handleAction({actionType: 'Clear'})}>Clear</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem onClick={() => handleAction({actionType: 'InsertVariable'})}>Insert Variable</MenubarItem>
                            <MenubarItem onClick={() => handleAction({actionType: 'InsertCases'})}>Insert Cases</MenubarItem>
                            <MenubarSeparator />
                            {/*<MenubarItem>Search Data Files</MenubarItem>*/}
                            <MenubarItem onClick={() => openModal(ModalType.Find)}>Find...</MenubarItem>
                            {/*<MenubarItem>Find Next</MenubarItem>*/}
                            <MenubarItem onClick={() => openModal(ModalType.Replace)}>Replace...</MenubarItem>
                            <MenubarItem onClick={() => openModal(ModalType.GoToCase)}>Go to Case...</MenubarItem>
                            <MenubarItem onClick={() => openModal(ModalType.GoToVariable)}>Go to Variable...</MenubarItem>
                            {/*<MenubarItem>Go to Imputation...</MenubarItem>*/}
                            {/*<MenubarSeparator />*/}
                            {/*<MenubarItem>Options...</MenubarItem>*/}
                        </MenubarContent>
                    </MenubarMenu>

                    {/* Menu Data */}
                    <MenubarMenu>
                        <MenubarTrigger>Data</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={() => openModal(ModalType.DefineVariableProperties)}>Define Variable Properties...</MenubarItem>
                            <MenubarItem onClick={() => openModal(ModalType.SetMeasurementLevel)}>Set Measurement Level for Unknown...</MenubarItem>
                            {/*<MenubarItem onClick={() => openModal(ModalType.CopyDataProperties)}>Copy Data Properties...</MenubarItem>*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.NewCustomAttribute)}>New Custom Attribute...</MenubarItem>*/}
                            <MenubarItem onClick={() => openModal(ModalType.DefineDateTime)}>Define date and time...</MenubarItem>
                            {/*<MenubarItem onClick={() => openModal(ModalType.DefineMultipleResponseSets)}>Define Multiple Response Sets...</MenubarItem>*/}
                            <MenubarSeparator />
                            {/*<MenubarItem onClick={() => openModal(ModalType.Validation)}>Validation</MenubarItem>*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.IdentifyDuplicateCases)}>Identify Duplicate Cases...</MenubarItem>*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.IdentifyUnusualCases)}>Identify Unusual Cases...</MenubarItem>*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.CompareDatasets)}>Compare Datasets...</MenubarItem>*/}
                            {/*<MenubarSeparator />*/}
                            <MenubarItem onClick={() => openModal(ModalType.SortCases)}>Sort Cases...</MenubarItem>
                            <MenubarItem onClick={() => openModal(ModalType.SortVariables)}>Sort Variables...</MenubarItem>
                            <MenubarItem onClick={() => openModal(ModalType.Transpose)}>Transpose...</MenubarItem>
                            {/*<MenubarItem onClick={() => openModal(ModalType.AdjustStringWidths)}>Adjust String Widths Across Files</MenubarItem>*/}
                            <MenubarItem onClick={() => openModal(ModalType.MergeFiles)}>Merge Files</MenubarItem>
                            <MenubarItem onClick={() => openModal(ModalType.Restructure)}>Restructure...</MenubarItem>
                            {/*<MenubarItem onClick={() => openModal(ModalType.RakeWeights)}>Rake Weights...</MenubarItem>*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.PropensityScoreMatching)}>Propensity Score Matching...</MenubarItem>*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.CaseControlMatching)}>Case Control Matching...</MenubarItem>*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.Aggregate)}>Aggregate...</MenubarItem>*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.OrthogonalDesign)}>Orthogonal Design</MenubarItem>*/}
                            <MenubarSeparator />
                            {/*<MenubarItem onClick={() => openModal(ModalType.SplitIntoFiles)}>Split into Files</MenubarItem>*/}
                            {/*<MenubarItem onClick={() => openModal(ModalType.CopyDataset)}>Copy Dataset</MenubarItem>*/}
                            {/*<MenubarSeparator />*/}
                            <MenubarItem onClick={() => openModal(ModalType.SplitFile)}>Split File...</MenubarItem>
                            {/*<MenubarItem onClick={() => openModal(ModalType.SelectCases)}>Select Cases...</MenubarItem>*/}
                            <MenubarItem onClick={() => openModal(ModalType.WeightCases)}>Weight Cases...</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>

                    {/* Menu Transform */}
                    <MenubarMenu>
                        <MenubarTrigger>Transform</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={() => openModal(ModalType.ComputeVariable)}>Compute Variable...</MenubarItem>
                            <MenubarItem>Programmability Transformation...</MenubarItem>
                            <MenubarItem>Count Values within Cases...</MenubarItem>
                            <MenubarItem>Shift Values...</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Recode into Same Variables...</MenubarItem>
                            <MenubarItem>Recode into Different Variables...</MenubarItem>
                            <MenubarItem>Automatic Recode...</MenubarItem>
                            <MenubarItem>Create Dummy Variables...</MenubarItem>
                            <MenubarItem>Visual Binning...</MenubarItem>
                            <MenubarItem>Optimal Binning...</MenubarItem>
                            <MenubarItem>Prepare Data for Modeling</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Rank Cases...</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Date and Time Wizard...</MenubarItem>
                            <MenubarItem>Create Time Series...</MenubarItem>
                            <MenubarItem>Replace Missing Values...</MenubarItem>
                            <MenubarItem>Random Number Generators...</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Run Pending Transforms</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger>Analyze</MenubarTrigger>
                        <MenubarContent>
                        <MenubarSub>
                                <MenubarSubTrigger>Descriptive Statistics</MenubarSubTrigger>
                            <MenubarSubContent>
                                <MenubarItem onClick={() => openModal(ModalType.Frequencies)}>Frequencies</MenubarItem>
                                <MenubarItem onClick={() => openModal(ModalType.Descriptive)}>Descriptives</MenubarItem>
                                <MenubarItem onClick={() => openModal(ModalType.Explore)}>Explore...</MenubarItem>
                                <MenubarItem onClick={() => openModal(ModalType.Crosstabs)}>Crosstabs...</MenubarItem>
                                {/*<MenubarItem onClick={() => openModal(ModalType.TurfAnalysis)}>TURF Analysis</MenubarItem>*/}
                                <MenubarItem onClick={() => openModal(ModalType.Ratio)}>Ratio...</MenubarItem>
                                {/*<MenubarItem onClick={() => openModal(ModalType.PPPlots)}>P-P Plots...</MenubarItem>*/}
                                <MenubarItem onClick={() => openModal(ModalType.QQPlots)}>Q-Q Plots...</MenubarItem>
                            </MenubarSubContent>

                        </MenubarSub>
                            
                            <MenubarSub>
                                <MenubarSubTrigger>Compare Means</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem>One-Sample T Test...</MenubarItem>
                                    <MenubarItem>Independent-Samples T Test...</MenubarItem>
                                    <MenubarItem>Paired-Samples T Test...</MenubarItem>
                                    <MenubarItem>One-Way ANOVA...</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>

                            <MenubarSub>
                                <MenubarSubTrigger>General Linear Model</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem>Univariate...</MenubarItem>
                                    <MenubarItem>Multivariate...</MenubarItem>
                                    <MenubarItem>Repeated Measures...</MenubarItem>
                                    <MenubarSeparator />
                                    <MenubarItem>Variance Components...</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                            
                            <MenubarSub>
                                <MenubarSubTrigger>Correlate</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem>Bivariate...</MenubarItem>
                                    <MenubarItem>Partial...</MenubarItem>
                                    <MenubarItem>Distances...</MenubarItem>
                                    <MenubarItem>Canonical Correlation...</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>

                            <MenubarSub>
                                <MenubarSubTrigger>Regression</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => openModal(ModalType.ModalAutomaticLinearModeling)}>Automatic Linear Modeling...</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.ModalLinear)}>Linear...</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.ModalCurveEstimation)}>Curve Estimation...</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.ModalPartialLeastSquares)}>Partial Least Squares...</MenubarItem>
                                    <MenubarSeparator />
                                    <MenubarItem onClick={() => openModal(ModalType.ModalBinaryLogistic)}>Binary Logistic...</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.ModalMultinomialLogistic)}>Multinomial Logistic...</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.ModalOrdinal)}>Ordinal...</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.ModalProbit)}>Probit...</MenubarItem>
                                    <MenubarSeparator />
                                    <MenubarItem onClick={() => openModal(ModalType.ModalNonlinear)}>Nonlinear...</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.ModalWeightEstimation)}>Weight Estimation...</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.ModalTwoStageLeastSquares)}>2-Stage Least Squares...</MenubarItem>
                                    <MenubarSeparator />
                                    <MenubarItem onClick={() => openModal(ModalType.ModalQuantiles)}>Quantiles...</MenubarItem>
                                    <MenubarSeparator />
                                    <MenubarItem onClick={() => openModal(ModalType.ModalOptimalScaling)}>Optimal Scaling (Catreg)...</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>

                            <MenubarSub>
                                <MenubarSubTrigger>Nonparametric Test</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem>One Sample...</MenubarItem>
                                    <MenubarItem>Independent Samples...</MenubarItem>
                                    <MenubarItem>Related Samples...</MenubarItem>
                                    <MenubarSub>
                                        <MenubarSubTrigger>Legacy Dialogs</MenubarSubTrigger>
                                        <MenubarSubContent>
                                            <MenubarItem>Chi-square...</MenubarItem>
                                            <MenubarItem>Runs...</MenubarItem>
                                            <MenubarItem>2 Independent Samples...</MenubarItem>
                                            <MenubarItem>K Independent Samples...</MenubarItem>
                                            <MenubarItem>2 Related Samples...</MenubarItem>
                                            <MenubarItem>K Related Samples...</MenubarItem>
                                        </MenubarSubContent>
                                    </MenubarSub>
                                </MenubarSubContent>
                            </MenubarSub>

                            <MenubarSub>
                                <MenubarSubTrigger>Time Series</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={()=>openModal(ModalType.Decomposition)}>Decomposition</MenubarItem>
                                    <MenubarItem onClick={()=>openModal(ModalType.Smoothing)}>Smoothing</MenubarItem>
                                    <MenubarItem onClick={()=>openModal(ModalType.StationaryTest)}>Stationary Test</MenubarItem>
                                    <MenubarItem onClick={()=>openModal(ModalType.CreateModel)}>Create Models</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                        </MenubarContent>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger>Graphs</MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger>Utilities</MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger>Extension</MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger>Help</MenubarTrigger>
                    </MenubarMenu>
                </Menubar>

                {/* Logo atau Nama Aplikasi */}
                <div className="text-xl font-bold">
                    Statify
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
