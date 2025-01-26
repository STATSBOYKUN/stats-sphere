// components/Modals/Regression/AutomaticLinearModeling/Fields.tsx

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, PencilIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Fields: React.FC = () => {
    // State untuk radio buttons
    const [radioOption, setRadioOption] = useState<string>("predefined");

    return (
        <>
            <div className="flex">
                {/* Panel Fields (Left) */}
                <div className="w-1/3 p-4 border-r">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Available Fields</h2>
                        <Button variant="secondary" size="sm">
                            <PlusIcon className="w-4 h-4 mr-1" />
                            Add Field
                        </Button>
                    </div>
                    <ul className="space-y-2">
                        {/* Contoh daftar field */}
                        <li className="flex justify-between items-center p-2 border rounded">
                            <span>Variable 1</span>
                            <Button variant="ghost" size="icon">
                                <PlusIcon className="w-4 h-4" />
                            </Button>
                        </li>
                        <li className="flex justify-between items-center p-2 border rounded">
                            <span>Variable 2</span>
                            <Button variant="ghost" size="icon">
                                <PlusIcon className="w-4 h-4" />
                            </Button>
                        </li>
                        {/* Tambahkan field sesuai kebutuhan */}
                    </ul>
                </div>

                {/* Panel Input (Right) */}
                <div className="w-2/3 p-4 flex flex-col">
                    {/* Target Field */}
                    <div className="mb-4">
                        <Label htmlFor="target" className="block mb-2">
                            Target
                        </Label>
                        <Input id="target" placeholder="Select target variable" />
                    </div>

                    {/* Predictors */}
                    <div className="mb-4 flex-1">
                        <Label className="block mb-2">Predictors</Label>
                        <ul className="space-y-2">
                            {/* Contoh predictors */}
                            <li className="flex justify-between items-center p-2 border rounded">
                                <span>Predictor 1</span>
                                <Button variant="ghost" size="icon">
                                    <PencilIcon className="w-4 h-4" />
                                </Button>
                            </li>
                            <li className="flex justify-between items-center p-2 border rounded">
                                <span>Predictor 2</span>
                                <Button variant="ghost" size="icon">
                                    <PencilIcon className="w-4 h-4" />
                                </Button>
                            </li>
                            {/* Tambahkan predictors sesuai kebutuhan */}
                        </ul>
                    </div>

                    {/* Analysis Weight */}
                    <div className="mb-4">
                        <Label htmlFor="analysis-weight" className="block mb-2">
                            Analysis Weight (Optional)
                        </Label>
                        <Input id="analysis-weight" placeholder="Enter analysis weight" />
                    </div>
                </div>
            </div>

            {/* Radio Buttons di dalam Tab "Fields" */}
            <div className="mt-4 p-4 border-t">
                <RadioGroup defaultValue="predefined" onValueChange={setRadioOption} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="predefined" id="predefined" />
                        <Label htmlFor="predefined">Use predefined roles</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label htmlFor="custom">Use custom field assignments</Label>
                    </div>
                </RadioGroup>
            </div>
        </>
    );
};

export default Fields;
