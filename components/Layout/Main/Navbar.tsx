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

    return (
        <nav>
            <div className="flex items-center justify-between w-full px-2 py-2">
                <Menubar className="ml-0 hidden lg:flex">
                    <MenubarMenu>
                        <MenubarTrigger>File</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem>New</MenubarItem>
                            <MenubarSub>
                                <MenubarSubTrigger>Open</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => openModal(ModalType.OpenFile)}>Data</MenubarItem>
                                    <MenubarItem>Syntax</MenubarItem>
                                    <MenubarItem>Output</MenubarItem>
                                    <MenubarSub>
                                        <MenubarSubTrigger>Script</MenubarSubTrigger>
                                        <MenubarSubContent>
                                            <MenubarItem>Python2</MenubarItem>
                                            <MenubarItem>Python3</MenubarItem>
                                            <MenubarItem>Basic</MenubarItem>
                                        </MenubarSubContent>
                                    </MenubarSub>
                                </MenubarSubContent>
                            </MenubarSub>
                            <MenubarSub>
                                <MenubarSubTrigger>Import Data</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem>Excel...</MenubarItem>
                                    <MenubarItem>CSV Data...</MenubarItem>
                                    <MenubarItem>Text Data...</MenubarItem>
                                    <MenubarItem>Sass...</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                            <MenubarSeparator />
                            <MenubarItem>Save All Data</MenubarItem>
                            <MenubarSub>
                                <MenubarSubTrigger>Export</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem>Database...</MenubarItem>
                                    <MenubarItem>Excel...</MenubarItem>
                                    <MenubarItem>CSV Data...</MenubarItem>
                                    <MenubarItem>Tab-delimited...</MenubarItem>
                                    <MenubarItem>Fixed Text...</MenubarItem>
                                    <MenubarItem>SAS...</MenubarItem>
                                    <MenubarItem>Stata...</MenubarItem>
                                    <MenubarItem>dBase...</MenubarItem>
                                    <MenubarItem>Lotus...</MenubarItem>
                                    <MenubarItem>Cognos TM1...</MenubarItem>
                                    <MenubarItem>SYLK...</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                            <MenubarSeparator />
                            <MenubarItem>Rename Dataset...</MenubarItem>
                            <MenubarItem>Display Data File Information</MenubarItem>
                            <MenubarItem>Cache Data...</MenubarItem>
                            <MenubarItem>Collect Variable Information</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Stop Processor</MenubarItem>
                            <MenubarItem>Switch Server...</MenubarItem>
                            <MenubarItem>Repository</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Print Preview</MenubarItem>
                            <MenubarItem>Print...</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Welcome Dialog...</MenubarItem>
                            <MenubarItem>Recently Used Data</MenubarItem>
                            <MenubarItem>Recently Used Files</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Exit</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>

                    {/* Menu Edit */}
                    <MenubarMenu>
                        <MenubarTrigger>Edit</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem>Undo</MenubarItem>
                            <MenubarItem>Redo</MenubarItem>
                            <MenubarItem>Cut</MenubarItem>
                            <MenubarItem>Copy</MenubarItem>
                            <MenubarItem>Copy with Variable Names</MenubarItem>
                            <MenubarItem>Copy with Variable Labels</MenubarItem>
                            <MenubarItem>Paste</MenubarItem>
                            <MenubarItem>Paste Variables...</MenubarItem>
                            <MenubarItem>Paste with Variable Names</MenubarItem>
                            <MenubarItem>Clear</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Insert Variable</MenubarItem>
                            <MenubarItem>Insert Cases</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Search Data Files</MenubarItem>
                            <MenubarItem>Find...</MenubarItem>
                            <MenubarItem>Find Next</MenubarItem>
                            <MenubarItem>Replace...</MenubarItem>
                            <MenubarItem>Go to Case...</MenubarItem>
                            <MenubarItem>Go to Variable...</MenubarItem>
                            <MenubarItem>Go to Imputation...</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Options...</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>

                    {/* Menu View */}
                    <MenubarMenu>
                        <MenubarTrigger>View</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem>Status Bar</MenubarItem>
                            <MenubarItem>Toolbars</MenubarItem>
                            <MenubarItem>Menu Editor...</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Fonts...</MenubarItem>
                            <MenubarItem>Grid Lines</MenubarItem>
                            <MenubarItem>Value Labels</MenubarItem>
                            <MenubarItem>Mark Imputed Data</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Customize Variable View...</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Variables</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>

                    {/* Menu Data */}
                    <MenubarMenu>
                        <MenubarTrigger>Data</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem>Define Variable Properties...</MenubarItem>
                            <MenubarItem>Set Measurement Level for Unknown...</MenubarItem>
                            <MenubarItem>Copy Data Properties...</MenubarItem>
                            <MenubarItem>New Custom Attribute...</MenubarItem>
                            <MenubarItem>Define date and time...</MenubarItem>
                            <MenubarItem>Define Multiple Response Sets...</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Validation</MenubarItem>
                            <MenubarItem>Identify Duplicate Cases...</MenubarItem>
                            <MenubarItem>Identify Unusual Cases...</MenubarItem>
                            <MenubarItem>Compare Datasets...</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Sort Cases...</MenubarItem>
                            <MenubarItem>Sort Variables...</MenubarItem>
                            <MenubarItem>Transpose...</MenubarItem>
                            <MenubarItem>Adjust String Widths Across Files</MenubarItem>
                            <MenubarItem>Merge Files</MenubarItem>
                            <MenubarItem>Restructure...</MenubarItem>
                            <MenubarItem>Rake Weights...</MenubarItem>
                            <MenubarItem>Propensity Score Matching...</MenubarItem>
                            <MenubarItem>Case Control Matching...</MenubarItem>
                            <MenubarItem>Aggregate...</MenubarItem>
                            <MenubarItem>Orthogonal Design</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Split into Files</MenubarItem>
                            <MenubarItem>Copy Dataset</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Split File...</MenubarItem>
                            <MenubarItem>Select Cases...</MenubarItem>
                            <MenubarItem>Weight Cases...</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>

                    {/* Menu Transform */}
                    <MenubarMenu>
                        <MenubarTrigger>Transform</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={() => openModal(ModalType.ComputeVariable)}>Compute Variable...</MenubarItem>
                            <MenubarItem >Programmability Transformation...</MenubarItem>
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
                                    <MenubarItem onClick={() => openModal(ModalType.FrequenciesStatistic)}>Frequencies</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.DescriptiveStatistic)}>Descriptives</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.Explore)}>Explore...</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.Crosstabs)}>Crosstabs...</MenubarItem>
                                    <MenubarItem>TURF Analisys</MenubarItem>
                                    <MenubarItem>Ratio...</MenubarItem>
                                    <MenubarItem>P-P Plots...</MenubarItem>
                                    <MenubarItem>Q-Q Plots...</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                            
                            <MenubarSub>
                                <MenubarSubTrigger>Compare Means</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => openModal(ModalType.OneSampleTTest)}>One-Sample T Test...</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.IndependentSamplesTTest)}>Independent-Samples T Test...</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.PairedSamplesTTest)}>Paired-Samples T Test...</MenubarItem>
                                    <MenubarItem onClick={() => openModal(ModalType.OneWayAnova)}>One-Way ANOVA...</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>

                            <MenubarSub>
                                <MenubarSubTrigger>General Linear Model</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => openModal(ModalType.Univariate)}>Univariate...</MenubarItem>
                                    <MenubarItem>Multivariate...</MenubarItem>
                                    <MenubarItem>Repeated Measures...</MenubarItem>
                                    <MenubarSeparator />
                                    <MenubarItem>Variance Components...</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                            
                            <MenubarSub>
                                <MenubarSubTrigger>Correlate</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => openModal(ModalType.Bivariate)}>Bivariate...</MenubarItem>
                                    <MenubarItem>Partial...</MenubarItem>
                                    <MenubarItem>Distances...</MenubarItem>
                                    <MenubarItem>Canonical Correlation...</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>

                            <MenubarSub>
                                <MenubarSubTrigger>Nonparametric Tests</MenubarSubTrigger>
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
                                <MenubarSubTrigger>Nonparametric Tests</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem>One Sample...</MenubarItem>
                                    <MenubarItem>Independent Samples...</MenubarItem>
                                    <MenubarItem>Related Samples...</MenubarItem>
                                    <MenubarSub>
                                        <MenubarSubTrigger>Legacy Dialogs</MenubarSubTrigger>
                                        <MenubarSubContent>
                                            <MenubarItem onClick={() => openModal(ModalType.ChiSquare)}>Chi-square...</MenubarItem>
                                            <MenubarItem onClick={() => openModal(ModalType.Runs)}>Runs...</MenubarItem>
                                            <MenubarItem onClick={() => openModal(ModalType.TwoIndependentSamplesTest)}>2 Independent Samples...</MenubarItem>
                                            <MenubarItem onClick={() => openModal(ModalType.KIndependentSamplesTest)}>K Independent Samples...</MenubarItem>
                                            <MenubarItem>2 Related Samples...</MenubarItem>
                                            <MenubarItem onClick={() => openModal(ModalType.KRelatedSamplesTest)}>K Related Samples...</MenubarItem>
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
                        <MenubarTrigger>Window</MenubarTrigger>
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
