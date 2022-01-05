import {ComplexProperty} from './complex-property.js';
import {SimpleProperty} from './simple-property/simple-property.js';


/**
 * helper constant to allow creating value-entities with new PropertyExtension\[propertyExtensionType\]()
 */
export const PropertyExtension = {
	SimpleProperty,
	ComplexProperty,
};


export type PropertyExtensionType = keyof typeof PropertyExtension;
