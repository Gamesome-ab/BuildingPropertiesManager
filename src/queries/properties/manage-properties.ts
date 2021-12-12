import E from 'enquirer';
import {enquirerPromptWrapper as promptWrapper} from '../../helpers/prompt-helpers.js';
import {handleMainMenu} from '../main.js';
import {handleAddPropertyToPropertySet} from '../relations/connect-property-and-property-set.js';
import {handleAddSimpleProperty, handleEditSimpleProperty} from './add-and-edit-simple-property.js';
import {handleSelectSimpleProperty} from './select-simple-property.js';

const {Select, Confirm} = E as any;

export enum PropertyAction {
	/* eslint-disable */
	EDIT_SIMPLE = "See / edit existing simple properties",
	ADD_SIMPLE = "Create a simple property",
	ADD_COMPLEX = "Create a complex property",
	REMOVE = "Delete an existing property",
	BACK = "Back to main menu"
	/* eslint-enable */
}

const addPropertyToPsetPrompt = async (message: string): Promise<boolean> => {
	const prompt = new Confirm({
		message: message,
		name: 'propertyToPropertySet',
		initial: 'y',
	});

	return prompt.run();
};

const managePropertiesPrompt = async (): Promise<PropertyAction> => {
	const prompt = new Select({
		type: 'select',
		name: 'name',
		message: 'What do you want to do with properties?',
		choices: Object.keys(PropertyAction)
			.map( (key) => ({
				name: PropertyAction[key],
				value: key,
				hint: key,
			})),
		required: true,

	});

	return prompt.run();
};

export const handleManageProperties = async (): Promise<void> => {
	const action = await promptWrapper(
		managePropertiesPrompt(),
		null,
		handleMainMenu,
	);

	switch (action) {
	case PropertyAction.EDIT_SIMPLE:
		const propertyToUpdate = await handleSelectSimpleProperty();
		if (propertyToUpdate) {
			const updatedProp = await handleEditSimpleProperty(propertyToUpdate);
			if (updatedProp) {
				const shouldEditPsetConnections = await addPropertyToPsetPrompt(
					'Do you want to edit the property set(s) the property belongs to?',
				);
				if (shouldEditPsetConnections) {
					await handleAddPropertyToPropertySet(updatedProp);
				}
			}
		}
		await handleManageProperties();

		break;
	case PropertyAction.ADD_SIMPLE:
		const createdProp = await handleAddSimpleProperty();
		if (createdProp) {
			const shouldAddToPset = await addPropertyToPsetPrompt(
				'Do you want to add this property to a property set?',
			);
			if (shouldAddToPset) {
				await handleAddPropertyToPropertySet(createdProp);
			}
		}
		await handleManageProperties();

		break;
	// case PropertyAction.REMOVE:
	// 	await promptWrapper(
	// 		selectPropertySet(propertySetRepository, action),
	// 		async (propertySet) => await propertySetRepository.remove(propertySet),
	// 		handleManagePropertySets,
	// 	);
	// 	await handleManagePropertySets(); // TODO: should list all property sets after deleting.
	// 	break;
	// case PropertyAction.EDIT:
	// 	await promptWrapper(
	// 		selectPropertySet(propertySetRepository, action),
	// 		async (oldPropertySet) => await promptWrapper(
	// 			namePropertySet(propertySetRepository, action, oldPropertySet),
	// 			async (propertySet) => await propertySetRepository.update(oldPropertySet, propertySet),
	// 			handleManagePropertySets,
	// 		),
	// 		handleManagePropertySets,
	// 	);
	// 	break;
	case PropertyAction.BACK:
		await handleMainMenu();
		break;
	default:
		break;
	}
	return;
};
