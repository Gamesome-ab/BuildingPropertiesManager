import {PropertyEnumeratedValue} from './property-enumerated-value.js';
import {PropertySingleValue} from './property-single-value.js';
import {ISimpleProperty, SimpleProperty} from './simple-property.js';

/**
 * helper constant to allow creating value-entities with new SimplePropertyExtension\[simplePropertyExtensionType\]()
 */
export const SimplePropertyExtension = {
	PropertySingleValue,
	PropertyEnumeratedValue,
};

/**
 * List of all defined extensions of SimpleProperty - for parsing and type casting
 */
export type SimplePropertyExtensionType = keyof typeof SimplePropertyExtension;


/**
 * map anonymous SimpleProperties from database to actual classes
 * @param  {ISimpleProperty} someSimpleProperty
 * @return {SimpleProperty}
*/
export const simplePropertyFromData = (someSimpleProperty: ISimpleProperty): SimpleProperty => {
	if (<SimplePropertyExtensionType>someSimpleProperty.type === 'PropertySingleValue') {
		return PropertySingleValue.fromData(someSimpleProperty as PropertySingleValue);
	} else if (<SimplePropertyExtensionType>someSimpleProperty.type === 'PropertyEnumeratedValue') {
		return PropertyEnumeratedValue.fromData(someSimpleProperty as PropertyEnumeratedValue);
	} else {
		throw new Error(`Unknown property type: ${someSimpleProperty.type}`);
	}
};
