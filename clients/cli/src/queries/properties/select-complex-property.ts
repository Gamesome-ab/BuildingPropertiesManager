import E from 'enquirer';

import {
	ComplexProperty,
	ComplexPropertyRepository,
} from '@building-properties-manager/core';


import {Logger} from '../../helpers/prompt-helpers.js';

const {Select} = E as any;

export const selectComplexPropertyPrompt = async (): Promise<ComplexProperty> => {
	const complexPropertyRepository = new ComplexPropertyRepository();
	const properties = await complexPropertyRepository.getAll();

	if (properties.length === 0) {
		Logger.warn(`No complex properties found`);
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
				hint: `[${p.asLegibleString}]`,
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
