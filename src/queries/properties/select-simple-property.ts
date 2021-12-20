import E from 'enquirer';
import {SimplePropertyRepository} from '../../data/simple-property-repository.js';
import {
	SimplePropertyExtension,
	SimplePropertyExtensionType,
} from '../../data/models/property/simple-property/simple-property-extension.js';
import {SimpleProperty} from '../../data/models/property/simple-property/simple-property.js';

import {Logger} from '../../helpers/prompt-helpers.js';

const {Select} = E as any;

type SelectSimplePropertyExtensionActionType = SimplePropertyExtensionType | 'All' | 'Back'

const SelectSimplePropertyExtensionAction: SelectSimplePropertyExtensionActionType[] =
	Object.keys(SimplePropertyExtension) as unknown as SimplePropertyExtensionType[];
SelectSimplePropertyExtensionAction.push('All');
SelectSimplePropertyExtensionAction.push('Back');

const selectSimplePropertyTypeExtensionPrompt = async (): Promise<SelectSimplePropertyExtensionActionType> => {
	const prompt = new Select({
		type: 'select',
		name: 'name',
		message: 'Select the SimpleProperty extension type:',
		choices: SelectSimplePropertyExtensionAction
			.map( (key) => ({
				name: key,
				value: key,
				hint: key,
			})),
		required: true,

	});

	return prompt.run();
};

const selectSimplePropertyPrompt = async (
	extensionType: SimplePropertyExtensionType | 'All',
): Promise<SimpleProperty> => {
	const simplePropertyRepository = new SimplePropertyRepository();
	const properties = extensionType === 'All' ?
		await simplePropertyRepository.getAll() :
		await simplePropertyRepository.getAllOfSubType(extensionType);

	if (properties.length === 0) {
		Logger.warn('No simple properties found');
		return null;
	}

	if (properties.length >= 1) {
		const prompt = new Select({
			name: 'name',
			message: 'Select a property:',
			// NOTE: Resulting type cast as any due to a bug in
			// type definitions (name is required although it should not be).
			choices: properties.map((p) => ({
				name: `${p.name.value}`,
				value: p.name.value,
				hint: `${extensionType === 'All' ? p.type + ' ' : ''} [${p.valuesToLegibleString}]`,
			})),
			result(res) {
				// NOTE: See https://github.com/enquirer/enquirer/blob/8d626c206733420637660ac7c2098d7de45e8590/examples/multiselect/option-result.js
				// for relevant example. Had to dig in to get to the bottom of this.
				// If we do not do this, it's pretty much impossible to maintain
				// user-friendly display names in options and confirms.
				const choiceNameToValueDict: {string: string} = this.map(res);
				const name: string = choiceNameToValueDict[res];
				const property = properties.find((p) => p.name.value === name);
				// TODO: Error handling
				return property;
			},
			required: true,
		});

		return prompt.run();

		// const [name] = Object.values(result);

		// return name;
	}

	throw new Error('unexpected result');
};

export const handleSelectSimpleProperty = async (): Promise<SimpleProperty> => {
	const extensionType = await selectSimplePropertyTypeExtensionPrompt();

	if (extensionType === 'Back') {
		return null;
	}
	try {
		const property = await selectSimplePropertyPrompt(extensionType);

		return property;
	} catch (e) {
		Logger.warn('e', e);
		return null;
	}
};
