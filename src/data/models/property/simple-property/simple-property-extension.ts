import {PropertyEnumeratedValue} from './property-enumerated-value.js';
import {PropertySingleValue} from './property-single-value.js';
import {SimpleProperty} from './simple-property.js';

/**
 * helper constant to allow creating value-entities with new SimplePropertyExtension\[simplePropertyExtensionType\]()
 */
export const SimplePropertyExtension = {
	PropertySingleValue,
	PropertyEnumeratedValue,
};

export type SimplePropertyExtensionType = keyof typeof SimplePropertyExtension;


export const simplePropertyFromData = (property: SimpleProperty): SimpleProperty => {
	if (<SimplePropertyExtensionType>property.type === 'PropertySingleValue') {
		return PropertySingleValue.fromData(property as PropertySingleValue);
	}
};
