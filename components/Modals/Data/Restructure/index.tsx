"use client";

import React, { useState } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

enum RestructureMethod {
    VariablesToCases = "variables_to_cases",
    CasesToVariables = "cases_to_variables",
    TransposeAllData = "transpose_all_data",
}

const RestructureDataWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    // State untuk mengelola step wizard
    const [currentStep, setCurrentStep] = useState<number>(1);

    // State untuk menyimpan metode restruktur yang dipilih
    const [method, setMethod] = useState<RestructureMethod>(
        RestructureMethod.VariablesToCases
    );

    // Event handler untuk tombol Next
    const handleNext = () => {
        // Di sini Anda bisa melakukan validasi atau menyimpan pilihan sebelum ke step berikutnya
        setCurrentStep((prev) => prev + 1);
    };

    // Event handler untuk tombol Back
    const handleBack = () => {
        setCurrentStep((prev) => prev - 1);
    };

    // Event handler untuk tombol Cancel
    const handleCancel = () => {
        // Tutup wizard tanpa menyimpan perubahan
        onClose();
    };

    // Contoh tampilan step 2 (opsional)
    const Step2 = () => (
        <div>
            <p>Ini adalah contoh Step 2. Di sini Anda dapat menambahkan form/opsi lanjutan.</p>
        </div>
    );

    return (
        <DialogContent className="max-w-xl">
            {currentStep === 1 && (
                <>
                    <DialogHeader>
                        <DialogTitle>Welcome to the Restructure Data Wizard!</DialogTitle>
                    </DialogHeader>
                    <div className="mb-4 space-y-2">
                        <p>
                            This wizard helps you restructure your data from multiple variables
                            (columns) in a single case to groups of related cases (rows) or vice
                            versa, or choose to transpose your data. The wizard replaces the current
                            data with the restructured data. Note that data restructuring cannot be undone.
                        </p>
                        <p className="font-semibold">What do you want to do?</p>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="restructureMethod"
                                    checked={method === RestructureMethod.VariablesToCases}
                                    onChange={() => setMethod(RestructureMethod.VariablesToCases)}
                                />
                                Restructure selected variables into cases
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="restructureMethod"
                                    checked={method === RestructureMethod.CasesToVariables}
                                    onChange={() => setMethod(RestructureMethod.CasesToVariables)}
                                />
                                Restructure selected cases into variables
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="restructureMethod"
                                    checked={method === RestructureMethod.TransposeAllData}
                                    onChange={() => setMethod(RestructureMethod.TransposeAllData)}
                                />
                                Transpose all data
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" disabled>
                            Back
                        </Button>
                        <Button variant="outline" onClick={handleNext}>
                            Next
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button variant="outline" onClick={() => alert("Help dialog here")}>
                            Help
                        </Button>
                    </DialogFooter>
                </>
            )}

            {currentStep === 2 && (
                <>
                    <DialogHeader>
                        <DialogTitle>Restructure Data - Step 2</DialogTitle>
                    </DialogHeader>
                    <Step2 />
                    <DialogFooter>
                        <Button variant="outline" onClick={handleBack}>
                            Back
                        </Button>
                        <Button variant="outline" onClick={() => alert("Next step")}>
                            Next
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button variant="outline" onClick={() => alert("Help dialog here")}>
                            Help
                        </Button>
                    </DialogFooter>
                </>
            )}

            {/* Tambahkan step lain jika diperlukan */}
        </DialogContent>
    );
};

export default RestructureDataWizard;
