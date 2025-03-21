import {
    OptScaDefineMainType,
    OptScaDefineType,
} from "@/models/dimension-reduction/optimal-scaling-define";

export const OptScaDefineMainDefault: OptScaDefineMainType = {
    AllVarsMultiNominal: true,
    SomeVarsNotMultiNominal: false,
    OneSet: true,
    MultipleSets: false,
};

export const OptScaDefineDefault: OptScaDefineType = {
    main: OptScaDefineMainDefault,
};
