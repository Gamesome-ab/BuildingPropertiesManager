import E from 'enquirer';

import {
	PropertySet,
	PropertySetRepository,
} from '@building-properties-manager/core';

import {enquirerPromptWrapper as promptWrapper} from '../../helpers/prompt-helpers.js';
import {handleMainMenu} from '../main.js';
import {handleAddPropertySet, handleEditPropertySet} from './add-and-edit-property-set.js';
import {selectPropertySetPrompt} from './select-property-set.js';

const {Select} = E as any;

export enum PropertySetAction {
	/* eslint-disable */
	EDIT = "See / modify existing",
	ADD = "Create a property set",
	REMOVE = "Delete an existing property set",
	BACK = "Back to main menu"
	/* eslint-enable */
}

const selectPropertySetsActionPrompt = async (): Promise<PropertySetAction> => {
	const prompt = new Select({
		type: 'select',
		name: 'name',
		message: 'What do you want to do with property sets?',
		choices: Object.keys(PropertySetAction)
			.map( (key) => ({
				name: PropertySetAction[key],
				value: key,
				hint: key,
			})),
		required: true,

	});

	return await prompt.run();
};

export const managePropertySetsPrompt = async (): Promise<void> => {
	const propertySetRepository = new PropertySetRepository();
	const action = await promptWrapper(
		selectPropertySetsActionPrompt(),
		null,
		handleMainMenu,
	);

	switch (action) {
	case PropertySetAction.EDIT:
		await promptWrapper(
			selectPropertySetPrompt('Select the property set you want to edit'),
			async (oldPropertySet: PropertySet) => await promptWrapper(
				handleEditPropertySet(oldPropertySet),
			),
			managePropertySetsPrompt,
		);
		await managePropertySetsPrompt();
		break;
	case PropertySetAction.ADD:
		await promptWrapper(
			handleAddPropertySet(),
			null,
			managePropertySetsPrompt,
		);
		await managePropertySetsPrompt(); // TODO: should list all property sets after adding.
		break;
	case PropertySetAction.REMOVE:
		await promptWrapper(
			selectPropertySetPrompt('Select the property set you want to remove'),
			async (propertySet: PropertySet) => await propertySetRepository.remove(propertySet),
			managePropertySetsPrompt,
		);
		await managePropertySetsPrompt(); // TODO: should list all property sets after deleting.
		break;
	case PropertySetAction.BACK:
		await handleMainMenu();
		break;
	default:
		break;
	}
	return;
};
