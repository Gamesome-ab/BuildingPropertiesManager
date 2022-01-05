import { ComplexProperty } from './complex-property.js';
import { SimpleProperty } from './simple-property/simple-property.js';
/**
 * helper constant to allow creating value-entities with new PropertyExtension\[propertyExtensionType\]()
 */
export declare const PropertyExtension: {
    SimpleProperty: typeof SimpleProperty;
    ComplexProperty: typeof ComplexProperty;
};
export declare type PropertyExtensionType = keyof typeof PropertyExtension;
