export declare type StringOfLength<Min, Max> = string & {
    readonly StringOfLength: unique symbol;
};
/**
 * type constructor function
 * @param {string} input The string to check
 * @param {number} min The minimum length of the string
 * @param {number} max The maximum length of the string
 * @return {StringOfLength} a string of type StringOfLength<Min,Max>
 */
export declare const stringOfLength: <Min extends number, Max extends number>(input: unknown, min?: Min, max?: Max) => StringOfLength<Min, Max>;
