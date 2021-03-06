import {
	PropertySet,
	Property,
	PropertySetRepository,
} from '@building-properties-manager/core';

import {enquirerPromptWrapper as promptWrapper} from '../../helpers/prompt-helpers.js';
import {handleManageProperties} from '../properties/manage-properties.js';
import {selectPropertySetPrompt} from '../property-sets/select-property-set.js';

export const handleAddPropertyToPropertySet = async (
	property: Property,
) => {
	await promptWrapper(
		selectPropertySetPrompt(
			`Which property set(s) do you want to add the ${property.type} ${property.name.value} to?`,
			true, // multiSelect
			property.partOfPset.map((pSet) => pSet.name.value.toString()), // get property sets where the property is already in
		),
		async (pSets) => {
			if (pSets === null) return null;
			if (pSets) {
				await addConnection(property, [].concat(pSets));
			} else {
				await addConnection(property, []);
			}
		},
		handleManageProperties,
	);
};

const addConnection = async (
	property: Property,
	propertySets: PropertySet[],
) => {
	const propertySetRepository = new PropertySetRepository();
	await propertySetRepository.updatePropertyConnections(property, propertySets); // will also remove old references
};
