import React from "react";

export type OptScaDefineMainType = {
    AllVarsMultiNominal: boolean;
    SomeVarsNotMultiNominal: boolean;
    OneSet: boolean;
    MultipleSets: boolean;
}

export type OptScaDefineProps = {
    isDefineOpen: boolean;
    setIsDefineOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOptScaCatpca: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOptScaMCA: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOptScaOverals: React.Dispatch<React.SetStateAction<boolean>>;
    updateFormData: (field: keyof OptScaDefineMainType, value: boolean) => void;
    data: OptScaDefineMainType;
}

export type OptScaDefineType = {
    main: OptScaDefineMainType;
}

export type OptScaCatpcaContainerProps = {
    isOptScaCatpca: boolean;
    setIsOptScaCatpca: React.Dispatch<React.SetStateAction<boolean>>;
}

export type OptScaMCAContainerProps = {
    isOptScaMCA: boolean;
    setIsOptScaMCA: React.Dispatch<React.SetStateAction<boolean>>;
}

export type OptScaOveralsContainerProps = {
    isOptScaOverals: boolean;
    setIsOptScaOverals: React.Dispatch<React.SetStateAction<boolean>>;
}

export type OptScaContainerProps = {
    onClose: () => void;
}