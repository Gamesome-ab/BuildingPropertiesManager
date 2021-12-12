export const enquirerPromptWrapper = async <T, U> (
	runningPrompt: Promise<T>,
	onSuccess?: (result: T) => Promise<T | void>,
	onCancel?: () => Promise<U> | null,
): Promise<T | U> => {
	return await runningPrompt
		.then(async (answer) => {
			if (onSuccess) await onSuccess(answer);
			// console.log('prompt will return:', answer);
			return answer;
		})
		.catch(async (err) => {
			if (!err) {
				if (onCancel) {
					console.warn('cancelled...');
					await onCancel();
				}
			} else {
				console.error('err:', err);
				return err;
			}
		});
};
