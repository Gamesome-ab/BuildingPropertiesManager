import {PropertySet} from '../../data/models/property-set/property-set.js';
import {PropertySetRepository} from '../../data/property-set-repository.js';
import _ from 'lodash';

import E from 'enquirer';
import {Label} from '../../data/models/value/simple-value/label.js';
import {Text} from '../../data/models/value/simple-value/text.js';
import {managePropertySetsPrompt} from './manage-property-set.js';
const {Input} = E as any;

export const handleAddPropertySet = async (
	currentlyEditing?: PropertySet,
	currentPromptStep: number = 0,
): Promise<PropertySet | void> => {
	currentlyEditing = currentlyEditing ? currentlyEditing : new PropertySet(
		new Label('Pset_SomePsetName'),
		new Text('Some explicit description of what this will contain and how it will be used'),
	);

	const namePromptFirstMessageLine = 'What do you want to name the property set?';

	if (currentPromptStep === 0) {
		const name = await namePropertySetPrompt(currentlyEditing, namePromptFirstMessageLine);
		if (!name) {
			return managePropertySetsPrompt();
		}
		currentlyEditing.name = name;
		currentPromptStep ++;
	}
	if (currentPromptStep === 1) {
		const description = await describePropertySetPrompt(
			currentlyEditing.name,
			currentlyEditing.description,
		);
		if (!description) {
			return handleAddPropertySet(currentlyEditing, 0);
		}
		currentlyEditing.description = description;
	}
	const propertySetRepository = new PropertySetRepository();
	const storedPropertySet = await propertySetRepository.add(currentlyEditing);

	return storedPropertySet;
};

export const handleEditPropertySet = async (
	oldPropertySet: PropertySet,
	currentlyEditing?: PropertySet,
	currentPromptStep: number = 0,
): Promise<PropertySet | void> => {
	currentlyEditing = currentlyEditing ? currentlyEditing : _.cloneDeep(oldPropertySet);
	const namePromptFirstMessageLine = `Choose a new name for ${currentlyEditing.name.value}`;

	if (currentPromptStep === 0) {
		const name = await namePropertySetPrompt(currentlyEditing, namePromptFirstMessageLine);
		if (!name) {
			return managePropertySetsPrompt();
		}
		currentlyEditing.name = name;
		currentPromptStep ++;
	}
	if (currentPromptStep === 1) {
		const description = await describePropertySetPrompt(
			currentlyEditing.name,
			currentlyEditing.description,
		);
		if (!description) {
			return handleEditPropertySet(oldPropertySet, currentlyEditing, 0);
		}
		currentlyEditing.description = description;
	}
	const propertySetRepository = new PropertySetRepository();
	const storedPropertySet = await propertySetRepository.update(oldPropertySet, currentlyEditing);

	return storedPropertySet;
};


const describePropertySetPrompt = async (
	propertySetName: Label,
	initial: Text,
): Promise<Text> => {
	const firstMessageLine = `Describe the property set ${propertySetName.value}:`;

	const prompt = new Input({
		message:
            firstMessageLine +
            '\n' +
            'This should be explicit since this and the name should be sufficient ' +
            'to distinguish this from all other property sets',
		name: 'propertySetDescription',
		initial: initial.value,
		validate: (value) => {
			if (value.length < 1) {
				return prompt.styles.danger('you must submit a description for the property');
			}
			return true;
		},
		result: (res: string): Text => {
			return new Text(res);
		},
	});

	return prompt.run();
};

const namePropertySetPrompt = async (
	editablePropertySet: PropertySet,
	firstMessageLine: string,
): Promise<Label> => {
	const propertySetRepository = new PropertySetRepository();
	const pSets = await propertySetRepository.getAll();
	const pSetNames = pSets.map((pSet) => pSet.name.value.toString());

	const prompt = new Input({
		message:
            firstMessageLine +
            '\n' +
            'It should begin with something that is not Pset_, but contains an underscore',
		name: 'pset_name',
		initial: editablePropertySet.name.value,
		validate: (value: string) => {
			if (value.length < 1) {
				return prompt.styles.danger('you must submit a name for the property set');
			}
			if (value.length >= 255) {
				return prompt.styles.danger('name can\'t be more than 255 characters long');
			}
			if (value.startsWith('Pset_') || value.startsWith('pset_')) {
				return prompt.styles.danger('the name cannot start with Pset_ or pset_');
			}
			if (!value.includes('_')) {
				return prompt.styles.danger('the name must contain an underscore');
			}
			if (value.split('_').length > 2) {
				return prompt.styles.danger('you can only use one prefix in the pset name (use only one underscore)');
			}
			if (pSetNames.includes(value) && value !== editablePropertySet.name.value) {
				return prompt.styles.danger('a property set with that name already exists');
			}
			return true;
		},
		result: (res) => {
			return new Label(res);
		},
	});

	return prompt.run();
};
