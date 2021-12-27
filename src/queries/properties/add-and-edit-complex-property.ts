import E from 'enquirer';
import colors from 'ansi-colors';
import _ from 'lodash';

import {
	enquirerPromptWrapper as promptWrapper,
	NicerConfirm,
	NicerConfirmResult,
} from '../../helpers/prompt-helpers.js';
import {handleManageProperties} from './manage-properties.js';
import {Identifier} from '../../data/models/value/simple-value/identifier.js';
import {handleAddPropertyNameAndDescription, handleEditPropertyNameAndDescription} from './add-and-edit-property.js';
import {PropertyExtension, PropertyExtensionType} from '../../data/models/property/property-extension.js';
import {ComplexProperty} from '../../data/models/property/complex-property.js';
import {handleSelectSimpleProperty} from './select-simple-property.js';
import {ComplexPropertyRepository} from '../../data/repositories/complex-property-repository.js';

const {Select, Input} = E as any;

const setUsageNamePrompt = async (
	old?: Identifier,
): Promise<Identifier> => {
	const firstMessageLine = `What do you want the usage name for the complex property to be?`;

	const prompt = new Input({
		message:
            firstMessageLine +
            '\n' +
            'Usage description of the IfcComplexProperty within the property set' +
			'which references the IfcComplexProperty.',
		name: 'propertyUsageName',
		initial: old?.value || 'FireResistanceComplex',
		validate: (value: string) => {
			if (value.length < 1) {
				return prompt.styles.danger('you must submit a name for the property');
			}
			if (value.length >= 255) {
				return prompt.styles.danger('name can\'t be more than 255 characters long');
			}
			if (value.includes('Pset_') || value.includes('pset_')) {
				return prompt.styles.danger('the name should not contain Pset_ or pset_ (that is for property sets)');
			}
			return true;
		},
		result: (res: string): Identifier => {
			return new Identifier(res);
		},
	});

	return prompt.run();
};

const selectPropertyExtensionPrompt = async (
	old?: PropertyExtensionType,
): Promise<PropertyExtensionType> => {
	const prompt = new Select({
		type: 'select',
		name: 'name',
		message: 'What type of Property do you want to add?',
		choices: Object.keys(PropertyExtension)
			.map( (key) => ({
				name: old === key ? colors.yellow(key) : key,
				value: key,
				hint: key,
			})),
		required: true,

	});

	return await prompt.run();
};

const confirmComplexPropertyPrompt = async (
	complexProperty: ComplexProperty,
): Promise<NicerConfirmResult> => {
	const messageLines = [
		`Property will be saved with this data:`,
		`   ${complexProperty.type}: ${complexProperty.name.value}`,
		`   Description: ${complexProperty.description.value}`,
		`   ${complexProperty.asLegibleString}`,
		`   Is this correct?`,
	];

	const prompt = new NicerConfirm({
		message: messageLines.join('\n'),
		name: 'propertyConfirmation',
	});

	return prompt.run();
};

const complexPropertyHasPropertiesActionPrompt = async (
	complexProperty: ComplexProperty,
): Promise<ComplexPropertyHasPropertiesAction> => {
	const prompt = new Select({
		type: 'select',
		name: 'name',
		message: 'What do you want to do with the property enumeration?' +
			'\n' +
			`It has ${complexProperty.hasProperties.length} values`,
		choices: Object.keys(ComplexPropertyHasPropertiesAction)
			.map( (key) => ({
				name: ComplexPropertyHasPropertiesAction[key],
				value: key,
				hint: key,
			})),
		required: true,

	});

	return prompt.run();
};

export enum ComplexPropertyHasPropertiesAction {
	/* eslint-disable */
	ADD = 'Add new property reference to the complex property',
	REMOVE = 'Remove property reference from the complex property, go back by Ctrl+C',
	CONTINUE = 'Continue to validating the property and possibly adding it to a property set',
	CANCEL = 'Discard all edits and go back',
	/* eslint-enable */
}

export const handleAddComplexProperty = async (
	complexProperty: ComplexProperty = new ComplexProperty(null, null),
	currentPromptStep: number = 0,
): Promise<ComplexProperty | void> => {
	console.log(colors.red('Started prompt'));
	const back = () => {
		return handleAddComplexProperty(
			complexProperty,
			currentPromptStep - 1,
		);
	};

	const next = () => {
		return handleAddComplexProperty(
			complexProperty,
			currentPromptStep + 1,
		);
	};

	const loop = () => {
		return handleAddComplexProperty(
			complexProperty,
			currentPromptStep,
		);
	};

	if (currentPromptStep === 0) {
		return handleAddPropertyNameAndDescription(
			{
				type: 'ComplexProperty',
				name: complexProperty.name,
				description: complexProperty.description,
			},
			() => handleManageProperties(),
			(nameAndDescription) => {
				complexProperty.name = nameAndDescription.name;
				complexProperty.description = nameAndDescription.description;
				return next();
			},
		);
	}
	if (currentPromptStep === 1) {
		complexProperty.usageName = await promptWrapper(
			setUsageNamePrompt(
				complexProperty.usageName || complexProperty.name,
			),
			null,
			back,
		);
		if (complexProperty.usageName === null) return back();
		else return next();
	}
	if (currentPromptStep === 2) {
		const action = await promptWrapper(
			complexPropertyHasPropertiesActionPrompt(complexProperty),
			null,
			() => {
				console.log('doing back from action');
				return back();
			},
		);

		switch (action) {
		case ComplexPropertyHasPropertiesAction.ADD:
			const propertyExtension = await promptWrapper(
				selectPropertyExtensionPrompt(),
				null,
				loop,
			);
			if (propertyExtension === null) return loop();
			if (propertyExtension === 'ComplexProperty') {
				throw new Error('not implemented');
			}
			if (propertyExtension === 'SimpleProperty') {
				const simpleProperty = await handleSelectSimpleProperty();
				if (simpleProperty === null) return loop();
				complexProperty.hasProperties.push(simpleProperty.asPropertyReference);
				console.log(colors.green('Added property reference to the complex property'));
			}
			return loop();
			break;
		case ComplexPropertyHasPropertiesAction.CONTINUE:
			return next();
			break;
		}
	}
	if (currentPromptStep === 3) {
		const confirm = await promptWrapper(
			confirmComplexPropertyPrompt(complexProperty),
		);
		if (confirm && confirm.selectedBoolean) return next();
		else return back();
	}
	console.log(colors.red('reached end of prompt'));

	const repo = new ComplexPropertyRepository();

	await repo.add(complexProperty);

	return complexProperty;
};

export const handleEditComplexProperty = async (
	oldSimpleProperty: ComplexProperty, // TODO: just property!
	currentlyEditing: ComplexProperty = null,
): Promise<ComplexProperty | void> => {
	currentlyEditing = currentlyEditing ? currentlyEditing : _.cloneDeep(oldSimpleProperty);

	const editedProp = await handleEditPropertyNameAndDescription(
		currentlyEditing,
		handleManageProperties,
	);

	if (!editedProp) return handleManageProperties();
	// TODO: Add steps to edit variables on the property
	// no need to confirm changing name and description. they can easily be changed again.

	currentlyEditing = editedProp;

	const repo = new ComplexPropertyRepository();
	const storedProperty = await repo.update(oldSimpleProperty, currentlyEditing);

	return storedProperty;
};
