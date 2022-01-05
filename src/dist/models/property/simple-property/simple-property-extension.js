import { PropertyEnumeratedValue } from './property-enumerated-value.js';
import { PropertySingleValue } from './property-single-value.js';
/**
 * helper constant to allow creating value-entities with new SimplePropertyExtension\[simplePropertyExtensionType\]()
 */
export const SimplePropertyExtension = {
    PropertySingleValue,
    PropertyEnumeratedValue,
};
/**
 * map anonymous SimpleProperties from database to actual classes
 * @param  {ISimpleProperty} someSimpleProperty
 * @return {SimpleProperty}
*/
export const someSimplePropertyFromData = (someSimpleProperty) => {
    if (someSimpleProperty.type === 'PropertySingleValue') {
        return PropertySingleValue.fromData(someSimpleProperty);
    }
    else if (someSimpleProperty.type === 'PropertyEnumeratedValue') {
        return PropertyEnumeratedValue.fromData(someSimpleProperty);
    }
    else {
        throw new Error(`Unknown property type: ${someSimpleProperty.type}`);
    }
};
//# sourceMappingURL=simple-property-extension.js.map