import E from 'enquirer';
import colors from 'ansi-colors';

import {
	SimpleValueExtension,
	SimpleValueExtensionType,
} from '@building-properties-manager/core';
import {ValueExtension, ValueExtensionType} from '@building-properties-manager/core';
import {SimpleValue} from '@building-properties-manager/core';

const {Select, Input, NumberPrompt} = E as any;

const selectValueExtensionPrompt = async (old?: ValueExtensionType): Promise<ValueExtensionType> => {
	const prompt = new Select({
		type: 'select',
		name: 'name',
		message: 'Select the type of Value to use:',
		choices: Object.keys(ValueExtension)
			.map( (key) => ({
				name: old === key ? colors.yellow(key) : key,
				value: key,
				hint: key,
			})),
		required: true,
		result(res) { // mapping needed since name might be color coded (will include \x1B[33m around the string)
			const choiceNameToValueDict: {string: string} = this.map(res);
			const name: string = choiceNameToValueDict[res];
			return name;
		},

	});

	return await prompt.run();
};

const selectSimpleValueExtensionPrompt = async (old?: SimpleValueExtensionType): Promise<SimpleValueExtensionType> => {
	const prompt = new Select({
		type: 'select',
		name: 'name',
		message: 'Select the type of SimpleValue to use:',
		choices: Object.keys(SimpleValueExtension)
			.map( (key) => ({
				name: old === key ? colors.yellow(key) : key,
				value: key,
				hint: key,
			})),
		required: true,
		result(res) { // mapping needed since name might be color coded (will include \x1B[33m around the string)
			const choiceNameToValueDict: {string: string} = this.map(res);
			const name: string = choiceNameToValueDict[res];
			return name;
		},

	});

	return await prompt.run();
};

const stringValuePrompt = async (
	old: string,
	limitLength: boolean,
): Promise<string> => {
	const prompt = new Input({
		message:
            'Value to store:',
		name: 'string',
		initial: old && old.toString(),
		validate: (value) => {
			if (limitLength && value.length < 1) {
				return prompt.styles.danger('you must enter a value');
			}
			if (limitLength && value.length >= 255) {
				return prompt.styles.danger('value must be less than 255 characters');
			}
			return true;
		},
	});

	return prompt.run();
};

const numericValuePrompt = async (
	old: number,
): Promise<number> => {
	const prompt = new NumberPrompt({
		message:
            'Value to store:',
		name: 'number',
		initial: old && Number(old),
	});

	return prompt.run();
};

const booleanValuePrompt = async (
	old: {selectedBoolean: boolean},
): Promise<{selectedBoolean: boolean}> => {
	const prompt = new Select({
		message:
            'Value to store:',
		choices: [true.toString(), false.toString()],
		name: 'boolean',
		initial: old ? old.selectedBoolean.toString() : '',
		result: (res) => {
			return res === true.toString() ? {selectedBoolean: true} : {selectedBoolean: false};
		},
	});

	return prompt.run();
};


export const handleAddAndEditValue = async (
	withValuePrompt: boolean = false,
	oldValue: SimpleValue<any> = null,
	currentPromptData: {
		mainValueType?: ValueExtensionType,
		subValueType?: SimpleValueExtensionType, // || DerivedMeasureValueExtensionType
		value?: any,
	} = {},
	currentPromptStep: number = 0,
): Promise<SimpleValue<any>> => {
	if (oldValue) {
		if (!currentPromptData.mainValueType) {
			currentPromptData.mainValueType = Object.keys(SimpleValueExtension).includes(oldValue.type) ?
				'SimpleValue' :
				'SimpleValue'; // i.e not implemented
		}
		if (!currentPromptData.subValueType) {
			currentPromptData.subValueType = oldValue.type as SimpleValueExtensionType; // TODO: Implement other types!
			if (!currentPromptData.value) {
				currentPromptData.value = oldValue.value; // TODO: Implement other types!
			}
		}
	}

	if (currentPromptStep === 0) {
		const mainValueType = await selectValueExtensionPrompt(currentPromptData.mainValueType);
		if (!mainValueType) {
			return null; // cancel
		}
		currentPromptData.mainValueType = mainValueType;
		currentPromptStep ++;
	}
	if (currentPromptStep === 1) {
		if (currentPromptData.mainValueType === 'SimpleValue') {
			const simpleValueExtension = await selectSimpleValueExtensionPrompt(currentPromptData.subValueType);
			if (!simpleValueExtension) {
				handleAddAndEditValue(
					withValuePrompt,
					oldValue,
					currentPromptData,
					currentPromptStep -1,
				);
			}
			currentPromptData.subValueType = simpleValueExtension;
		} else {
			throw new Error('not implemented');
		}
		currentPromptStep ++;
	}
	if (currentPromptStep === 2) {
		if (withValuePrompt) {
			if (currentPromptData.mainValueType === 'SimpleValue') {
				switch (currentPromptData.subValueType) {
				case 'Label':
				case 'Identifier':
					currentPromptData.value = await stringValuePrompt(currentPromptData.value, true);
					break;
				case 'Text':
					currentPromptData.value = await stringValuePrompt(currentPromptData.value, false);
					break;
				case 'Binary':
					currentPromptData.value = await numericValuePrompt(currentPromptData.value);
					break;
				case 'Boolean':
					currentPromptData.value = await (
						await booleanValuePrompt({selectedBoolean: currentPromptData.value})
					).selectedBoolean;
					break;
				default:
					throw new Error(`Unhandled SimpleValueExtensionType: ${currentPromptData.subValueType}`);
				}
			}
		}
		const value = Reflect.construct(
			SimpleValueExtension[currentPromptData.subValueType],
			[currentPromptData.value],
		);
		return value;
	}
	// TODO: add optional step to set a value (for enumerations)
};

