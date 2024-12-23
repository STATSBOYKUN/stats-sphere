// components/Modals/Regression/AutomaticLinearModeling/BuildOptions.tsx

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BuildOptionsProps {
    // Tambahkan props jika diperlukan, misalnya callback untuk pengambilan data form
}

const BuildOptions: React.FC<BuildOptionsProps> = () => {
    const [activeSidebar, setActiveSidebar] = useState<string>('basics'); // 'basics' dipilih saat ini
    const [autoPrepareData, setAutoPrepareData] = useState<boolean>(false);
    const [confidenceLevel, setConfidenceLevel] = useState<string>('95.0');
    const [errors, setErrors] = useState<{ confidenceLevel?: string }>({});

    // Fungsi validasi
    const validateFields = () => {
        const newErrors: { confidenceLevel?: string } = {};

        if (!confidenceLevel) {
            newErrors.confidenceLevel = 'Confidence Level wajib diisi.';
        } else {
            const value = parseFloat(confidenceLevel);
            if (isNaN(value) || value < 0 || value > 100) {
                newErrors.confidenceLevel = 'Confidence Level harus antara 0 dan 100.';
            }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-1/5 p-4 border-r">
                <ul className="space-y-2">
                    {['objectives', 'basics', 'model-selection', 'ensembles', 'advanced'].map((item) => (
                        <li key={item}>
                            <Button
                                variant={activeSidebar === item ? 'default' : 'ghost'}
                                onClick={() => setActiveSidebar(item)}
                                className="w-full text-left"
                            >
                                {item.charAt(0).toUpperCase() + item.slice(1).replace('-', ' ')}
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Panel Konten Utama */}
            <div className="w-4/5 p-4">
                {activeSidebar === 'basics' && (
                    <div>
                        {/* Header Utama */}
                        <div className="flex items-center mb-6">
                            {/* Ikon Aplikasi */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-blue-500 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <div>
                                <h2 className="text-xl font-semibold">Automatic Linear Modeling</h2>
                                <p className="text-sm text-gray-600">Objective: Standard model</p>
                            </div>
                        </div>

                        {/* Checkbox "Automatically prepare data" */}
                        <div className="mb-6">
                            <div className="flex items-start">
                                <Checkbox
                                    id="auto-prepare-data"
                                    checked={autoPrepareData}
                                    onCheckedChange={(checked) => setAutoPrepareData(checked === true)}
                                />
                                <Label htmlFor="auto-prepare-data" className="ml-2">
                                    Automatically prepare data
                                </Label>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Automatically handle time series, measurements, outliers, and other data preprocessing steps.
                            </p>
                        </div>

                        {/* Spin Button "Confidence Level (%)" */}
                        <div className="mb-6">
                            <Label htmlFor="confidence-level" className="block mb-2">
                                Confidence Level (%)
                            </Label>
                            <Input
                                id="confidence-level"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={confidenceLevel}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Membatasi input hingga 1 digit di belakang koma
                                    const regex = /^\d+(\.\d)?$/;
                                    if (value === '' || regex.test(value)) {
                                        setConfidenceLevel(value);
                                    }
                                }}
                                className={errors.confidenceLevel ? 'border-red-500' : ''}
                            />
                            {errors.confidenceLevel && (
                                <p className="mt-1 text-sm text-red-500">{errors.confidenceLevel}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Konten Sidebar Lainnya */}
                {activeSidebar !== 'basics' && (
                    <div>
                        <p className="text-gray-500">Content for {activeSidebar.replace('-', ' ')}.</p>
                    </div>
                )}
            </div>
        </div>
    );

};

export default BuildOptions;
