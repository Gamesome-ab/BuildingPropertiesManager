export declare type Int = number & {
    __int__: void;
};
export declare const int: (num: number) => Int;
export declare const parse: {
    checkIsInt: (num: number) => num is Int;
    toInt: (value: string) => Int;
    roundToInt: (num: number) => Int;
};
