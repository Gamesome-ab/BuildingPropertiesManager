import E from 'enquirer';
import colors from 'ansi-colors';

import {PropertyEnumeration, PropertyEnumerationReference} from '../../data/models/property/property-enumeration.js';
import {PropertyEnumerationRepository} from '../../data/repositories/property-enumeration-repository.js';
import {Logger} from '../../helpers/prompt-helpers.js';

const {Select} = E as any;


export const selectPropertyEnumerationPrompt = async (
	old: PropertyEnumeration | PropertyEnumerationReference = null,
): Promise<PropertyEnumeration> => {
	const propertyEnumerationRepository = new PropertyEnumerationRepository();
	const enumerations = await propertyEnumerationRepository.getAll();

	if (enumerations.length === 0) {
		Logger.warn('No property enumerations found');
		return null;
	}

	if (enumerations.length >= 1) {
		const prompt = new Select({
			name: 'name',
			message: 'Select a property enumeration:',
			// NOTE: Resulting type cast as any due to a bug in
			// type definitions (name is required although it should not be).
			choices: enumerations.map((e) => ({
				name: old?.name?.value === e.name.value ? colors.yellow(e.name.value) : e.name.value,
				value: e.name.value,
				hint: `Unit: ${JSON.stringify(e.unit)}, with value types: ${
					e.enumerationValues
						.map((eV) => eV.type)
						.filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
						.join(', ')
				}`,
			})),
			result(res) {
				// NOTE: See https://github.com/enquirer/enquirer/blob/8d626c206733420637660ac7c2098d7de45e8590/examples/multiselect/option-result.js
				// for relevant example. Had to dig in to get to the bottom of this.
				// If we do not do this, it's pretty much impossible to maintain
				// user-friendly display names in options and confirms.
				const choiceNameToValueDict: {string: string} = this.map(res);
				const name: string = choiceNameToValueDict[res];
				const enumeration = enumerations.find((e) => e.name.value === name);
				// TODO: Error handling
				return enumeration;
			},
			required: true,
		});

		return prompt.run();

		// const [name] = Object.values(result);

		// return name;
	}

	throw new Error('unexpected result');
};
