import {SimpleProperty} from './simple-property/simple-property';


/**
 * helper constant to allow creating value-entities with new PropertyExtension\[propertyExtensionType\]()
 */
export const PropertyExtension = {
	SimpleProperty,
};


export type PropertyExtensionType = keyof typeof PropertyExtension;
