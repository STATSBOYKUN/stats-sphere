import {OptScaDefineMainType, OptScaDefineType} from "@/models/dimension-reduction/optimal-scaling-define";

export const OptScaDefineMainDefault: OptScaDefineMainType = {
    AllVarsMultiNominal: false,
    SomeVarsNotMultiNominal: false,
    OneSet: false,
    MultipleSets: false,
};

export const OptScaDefineDefault: OptScaDefineType = {
    main: OptScaDefineMainDefault,
}