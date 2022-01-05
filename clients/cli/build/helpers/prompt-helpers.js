import E from 'enquirer';
import colors from 'ansi-colors';
export const { Select } = E;
export const enquirerPromptWrapper = async (runningPrompt, onSuccess, onCancel) => {
    return await runningPrompt
        .then(async (answer) => {
        if (onSuccess)
            await onSuccess(answer);
        return answer;
    })
        .catch(async (err) => {
        if (!err) {
            if (onCancel) {
                Logger.warn('cancelled...');
                await onCancel();
            }
        }
        else {
            console.error('err:', err);
            return err;
        }
    });
};
export const Logger = {
    warn: (message, ...args) => {
        console.warn(colors.yellow(message), ...args);
    },
};
/**
 * enquirer Confirm prompt doesn't show the different values to choose from, and generally
 * looks weird. This provides a similar functionality, but with a more consistent look.
 *
 * if you don't pass choices then it will just show a Yes/No prompt where Yes represents true
 *
 * you can pass a custom result handler, or it will default to returning the 'value' in your choices
*/
export class NicerConfirm extends Select {
    // eslint-disable-next-line require-jsdoc
    constructor(args) {
        super({
            type: 'select',
            name: args.name || 'name',
            message: args.message || 'Is this correct?',
            choices: args.choices || [
                {
                    name: 'Yes',
                    value: true,
                    // hint: 'Yes',
                },
                {
                    name: 'No',
                    value: false,
                    // hint: 'No',
                },
            ],
            initial: args.initial || 'Yes',
            required: true,
            result: args.result || ((res) => {
                const choiceNameToValueDict = this.map(res);
                const selectedBoolean = choiceNameToValueDict[res];
                return { selectedBoolean };
            }),
        });
    }
    // eslint-disable-next-line require-jsdoc
    run() {
        return super.run();
    }
}
//# sourceMappingURL=prompt-helpers.js.map