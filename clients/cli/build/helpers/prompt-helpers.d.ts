export declare const Select: any;
export declare const enquirerPromptWrapper: <T>(runningPrompt: Promise<T>, onSuccess?: (result: T) => Promise<void | T>, onCancel?: () => Promise<any>) => Promise<T>;
export declare const Logger: {
    warn: (message?: any, ...args: any[]) => void;
};
/**
 * enquirer Confirm prompt doesn't show the different values to choose from, and generally
 * looks weird. This provides a similar functionality, but with a more consistent look.
 *
 * if you don't pass choices then it will just show a Yes/No prompt where Yes represents true
 *
 * you can pass a custom result handler, or it will default to returning the 'value' in your choices
*/
export declare class NicerConfirm extends Select {
    constructor(args: {
        message?: string;
        name?: string;
        choices?: any[];
        initial?: string;
        result?(res: string): {
            selectedBoolean: boolean;
        };
    });
    run(): Promise<{
        selectedBoolean: boolean;
    }>;
}
export declare type NicerConfirmResult = {
    selectedBoolean: boolean;
};
