import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {TreeCategoriesProps, TreeCategoriesType} from "@/models/classify/tree/tree";
import {CheckedState} from "@radix-ui/react-checkbox";

export const TreeCategories = ({ isCategoriesOpen, setIsCategoriesOpen, updateFormData, data }: TreeCategoriesProps) => {
    const [categoriesState, setCategoriesState] = useState<TreeCategoriesType>({ ...data });
    const [isContinueDisabled, setIsContinueDisabled] = useState(true);

    useEffect(() => {
        if (isCategoriesOpen) {
            setCategoriesState({ ...data });
        }
    }, [isCategoriesOpen, data]);

    const handleChange = (field: keyof TreeCategoriesType, value: CheckedState | number | boolean | string | null) => {
        setCategoriesState((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        Object.entries(categoriesState).forEach(([key, value]) => {
            updateFormData(key as keyof TreeCategoriesType, value);
        });
        setIsCategoriesOpen(false);
    };

    return (
        <>
            {/* Categories Dialog */}
            <Dialog open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Decision Tree: Categories</DialogTitle>
                    </DialogHeader>
                    <Separator />
                    <div className="flex flex-col items-start gap-2">

                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button disabled={isContinueDisabled} type="button" onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsCategoriesOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="secondary">
                            Help
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
