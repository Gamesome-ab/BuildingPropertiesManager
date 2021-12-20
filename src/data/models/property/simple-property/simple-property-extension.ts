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
	} else if (<SimplePropertyExtensionType>property.type === 'PropertyEnumeratedValue') {
		return PropertyEnumeratedValue.fromData(property as PropertyEnumeratedValue);
	} else {
		throw new Error(`Unknown property type: ${property.type}`);
	}
};
