import React from "react";

export type OptScaDefineMainType = {
    AllVarsMultiNominal: boolean;
    SomeVarsNotMultiNominal: boolean;
    OneSet: boolean;
    MultipleSets: boolean;
};

export type OptScaDefineProps = {
    isDefineOpen: boolean;
    setIsDefineOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (field: keyof OptScaDefineMainType, value: boolean) => void;
    data: OptScaDefineMainType;
    onReset: () => void;
};

export type OptScaDefineType = {
    main: OptScaDefineMainType;
};

export type OptScaContainerProps = {
    onClose: () => void;
};
