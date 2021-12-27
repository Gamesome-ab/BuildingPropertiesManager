import E from 'enquirer';
import colors from 'ansi-colors';
import _ from 'lodash';

import {
	enquirerPromptWrapper as promptWrapper,
	NicerConfirm,
	NicerConfirmResult,
} from '../../helpers/prompt-helpers.js';
import {handleManageProperties} from './manage-properties.js';
import {SimplePropertyRepository} from '../../data/repositories/simple-property-repository.js';
import {Identifier} from '../../data/models/value/simple-value/identifier.js';
import {Text} from '../../data/models/value/simple-value/text.js';
import {PropertySingleValue} from '../../data/models/property/simple-property/property-single-value.js';
import {
	SimplePropertyExtension,
	SimplePropertyExtensionType,
} from '../../data/models/property/simple-property/simple-property-extension.js';
import {SimpleProperty} from '../../data/models/property/simple-property/simple-property.js';
import {Value} from '../../data/models/value/value.js';
import {handleAddAndEditValue} from '../value/add-and-edit-value.js';
import {SimpleValue} from '../../data/models/value/simple-value/simple-value.js';
import {selectPropertyEnumerationPrompt} from './select-property-enumeration.js';
import {PropertyEnumeration} from '../../data/models/property/property-enumeration.js';
import {PropertyEnumeratedValue} from '../../data/models/property/simple-property/property-enumerated-value.js';
import {handleAddPropertyNameAndDescription, handleEditPropertyNameAndDescription} from './add-and-edit-property.js';

const {Select} = E as any;


const selectSimplePropertyExtensionPrompt = async (
	old?: SimplePropertyExtensionType,
): Promise<SimplePropertyExtensionType> => {
	const prompt = new Select({
		type: 'select',
		name: 'name',
		message: 'What type of SimpleProperty do you want to add?',
		choices: Object.keys(SimplePropertyExtension)
			.map( (key) => ({
				name: old === key ? colors.yellow(key) : key,
				value: key,
				hint: key,
			})),
		required: true,

	});

	return await prompt.run();
};

const confirmSimplePropertyPrompt = async (
	simpleProperty: SimpleProperty,
): Promise<NicerConfirmResult> => {
	const messageLines = [
		`Property will be saved with this data:`,
		`   ${simpleProperty.type}: ${simpleProperty.name.value}`,
		`   Description: ${simpleProperty.description.value}`,
		`   ${simpleProperty.asLegibleString}`,
		`   Is this correct?`,
	];

	const prompt = new NicerConfirm({
		message: messageLines.join('\n'),
		name: 'propertyConfirmation',
	});

	return prompt.run();
};

export const handleAddSimpleProperty = async (
	simplePropertyExtensionType: SimplePropertyExtensionType = null,
	name : Identifier = null,
	description : Text = null,
	simpleProperty: SimpleProperty = null,
	currentPromptStep: number = 0,
): Promise<SimpleProperty | void> => {
	const reset = () => {
		return handleAddSimpleProperty();
	};

	const back = () => {
		return handleAddSimpleProperty(
			simplePropertyExtensionType,
			name,
			description,
			simpleProperty,
			currentPromptStep - 1,
		);
	};

	const next = () => {
		return handleAddSimpleProperty(
			simplePropertyExtensionType,
			name,
			description,
			simpleProperty,
			currentPromptStep + 1,
		);
	};

	if (currentPromptStep === 0) {
		simplePropertyExtensionType = await promptWrapper(
			selectSimplePropertyExtensionPrompt(simplePropertyExtensionType),
		);
		if (!(
			simplePropertyExtensionType &&
			Object.keys(SimplePropertyExtension).includes(simplePropertyExtensionType)
		)) {
			return handleManageProperties();
		}
		currentPromptStep ++;
	}
	if (currentPromptStep === 1) {
		return await handleAddPropertyNameAndDescription(
			{
				type: simplePropertyExtensionType,
				name: name,
				description: description,
			},
			() => handleManageProperties(),
			(editedProp) => {
				name = editedProp.name;
				description = editedProp.description;
				return next();
			},
		);
	}
	if (currentPromptStep === 2) {
		if (simplePropertyExtensionType === 'PropertySingleValue') {
			const value: Value = await promptWrapper(
				handleAddAndEditValue(
					false,
					simpleProperty?.type === 'PropertySingleValue' ?
						(simpleProperty as PropertySingleValue).nominalValue as SimpleValue<any>:
						null,
				),
				null,
				back,
			);
			// TODO: allow to set unit
			if (value) {
				simpleProperty = new PropertySingleValue(
					name,
					description,
					value,
					null,
				);
			}
		} else if (simplePropertyExtensionType === 'PropertyEnumeratedValue') {
			// NOTE: we don't use a connector since this is just a pointer and not reflected to the enumeration
			const enumeration: PropertyEnumeration = await promptWrapper(
				selectPropertyEnumerationPrompt(
					simpleProperty?.type === 'PropertyEnumeratedValue' ?
						(simpleProperty as PropertyEnumeratedValue).enumerationReference :
						null,
				),
				null,
				back,
			);
			// happens when there where no enumerations. reset, not back, because we want to reuse name
			if (enumeration === null) return reset();
			if (enumeration) {
				simpleProperty = new PropertyEnumeratedValue(
					name,
					description,
					enumeration.asPropertyEnumerationReference(),
				);
			}
		} else {
			throw new Error('not implemented');
		}
		if (!simpleProperty) {
			// request was cancelled or we got a bad value, go back to the previous step
			return back();
		}
		currentPromptStep ++;
	}
	if (currentPromptStep === 3) {
		const confirm = await promptWrapper(
			confirmSimplePropertyPrompt(simpleProperty),
		);
		if (confirm && confirm.selectedBoolean) return next();
		else return back();
	}

	const repo = new SimplePropertyRepository();

	await repo.add(simpleProperty);

	return simpleProperty;
};

export const handleEditSimpleProperty = async (
	oldSimpleProperty: SimpleProperty, // TODO: just property!
	currentlyEditing: SimpleProperty = null,
): Promise<SimpleProperty | void> => {
	currentlyEditing = currentlyEditing ? currentlyEditing : _.cloneDeep(oldSimpleProperty);

	const editedProp = await handleEditPropertyNameAndDescription(
		currentlyEditing,
		handleManageProperties,
	);

	if (!editedProp) return handleManageProperties();
	// TODO: Add steps to edit variables on the property
	// no need to confirm changing name and description. they can easily be changed again.

	currentlyEditing = editedProp;

	const repo = new SimplePropertyRepository();
	const storedProperty = await repo.update(oldSimpleProperty, currentlyEditing);

	return storedProperty;
};
