import E from 'enquirer';

import {
	PropertySet,
	PropertySetRepository,
} from '@building-properties-manager/core';

const {Select, MultiSelect} = E as any;

export const selectPropertySetPrompt = async (
	message: string,
	multiSelect: boolean = false, // will trigger return of array of selected items
	initiallySelectedPsetNames: string[] = [],
): Promise<PropertySet | PropertySet[]> => {
	const propertySetRepository = new PropertySetRepository();
	const pSets = await propertySetRepository.getAll();

	if (pSets.length === 0) {
		throw new Error('No property sets found');
	}

	if (pSets.length >= 1) {
		const LocalSelect = multiSelect ? MultiSelect : Select;
		const prompt = new LocalSelect({
			name: 'name',
			message: message,
			hint: multiSelect ? '(Use <space> to select, <return> to submit)': null,
			initial: multiSelect ? initiallySelectedPsetNames : null,
			// NOTE: Resulting type cast as any due to a bug in
			// type definitions (name is required although it should not be).
			choices: pSets.map((pSet) => ({
				name: `${pSet.name.value}`,
				value: pSet.name.value,
				hint: `has ${pSet.hasProperties.length} properties: ${
					pSet.hasProperties.map((p) => p.name.value).join(', ')
				}`,
			})),
			result(res) {
				// NOTE: See https://github.com/enquirer/enquirer/blob/8d626c206733420637660ac7c2098d7de45e8590/examples/multiselect/option-result.js
				// for relevant example. Had to dig in to get to the bottom of this.
				// If we do not do this, it's pretty much impossible to maintain
				// user-friendly display names in options and confirms.

				const choiceNameToValueDict: {string: string} = this.map(res);
				if (multiSelect) {
					const selectedPropSets = pSets.filter((pSet) => res.includes(pSet.name.value));
					return selectedPropSets;
				} else {
					const name: string = choiceNameToValueDict[res];
					const pSet = pSets.find((pSet) => pSet.name.value === name);
					// TODO: Error handling
					return pSet;
				}
			},
			required: true,
		});

		return prompt.run();

		// const [name] = Object.values(result);

		// return name;
	}

	throw new Error('unexpected result');
};
