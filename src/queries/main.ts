import E from 'enquirer';

import {enquirerPromptWrapper as promptWrapper} from '../helpers/prompt-helpers.js';
import {handleManageProperties} from './properties/manage-properties.js';
import {managePropertySetsPrompt} from './property-sets/manage-property-set.js';

const {Select} = E as any;

export enum MainAction {
	/* eslint-disable */
	PROPERTY_SETS = "Property sets",
	PROPERTIES = "Properties",
	// ENTITIES = "Entities",
	QUIT = "QUIT"
	/* eslint-enable */
}

export const mainMenu = async (): Promise<MainAction> => {
	const prompt = new Select({
		type: 'select',
		name: 'name',
		message: 'What do you want to manage?',
		choices: Object.keys(MainAction)
			.map( (key) => ({
				name: MainAction[key],
				value: key,
				hint: key,
			})),
		required: true,

	});

	return await prompt.run();
};

export const handleMainMenu = async (onCancel?: () => Promise<void>): Promise<void> => {
	const main = await promptWrapper(
		mainMenu(),
		null,
		onCancel ? onCancel : () => handleMainMenu(process.exit), // cancel twice to exit
	);

	switch (main) {
	case MainAction.PROPERTY_SETS:
		await managePropertySetsPrompt();
		break;
	case MainAction.PROPERTIES:
		await handleManageProperties();
		break;
	case MainAction.QUIT:
		process.exit(0);
	default:
		break;
	}
};
