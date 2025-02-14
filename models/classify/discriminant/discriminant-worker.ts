import {DiscriminantType} from "@/models/classify/discriminant/discriminant";

export type WorkerMessage<T> = {
    action: string;
    data: T;
};

export type ProcessDataOutput = {
    processed: boolean;
    timestamp: string;
    input: DiscriminantType;
};