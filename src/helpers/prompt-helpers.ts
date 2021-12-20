import colors from 'ansi-colors';

export const enquirerPromptWrapper = async <T> (
	runningPrompt: Promise<T>,
	onSuccess?: (result: T) => Promise<T | void>,
	onCancel?: () => Promise<any>,
): Promise<T> => {
	return await runningPrompt
		.then(async (answer) => {
			if (onSuccess) await onSuccess(answer);

			return answer;
		})
		.catch(async (err) => {
			if (!err) {
				if (onCancel) {
					Logger.warn('cancelled...');
					await onCancel();
				}
			} else {
				console.error('err:', err);

				return err;
			}
		});
};

export const Logger = {
	warn: (message?: any, ...args: any[]) => {
		console.warn(colors.yellow(message), ...args);
	},
};
