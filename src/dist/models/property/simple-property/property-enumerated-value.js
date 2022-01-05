import { SimpleProperty } from './simple-property.js';
/**
 * A property with an enumerated value, PropertyEnumeratedValue, defines a property object which
 * has a value assigned that is chosen from an enumeration. It defines a property - value combination
 * for which the property Name, an optional Description, the optional EnumerationValues
 * with measure type and optionally an Unit is given.
 *
 * More precisely: The PropertyEnumeratedValue defines a property, which value is selected from a defined
 * list of enumerators. The enumerators are stored in a dynamic enumeration of values including the type
 * information from Value (see PropertyEnumeration). This enables applications to use an enumeration
 * value as a property within a property set (PropertySet) including the allowed list of values.
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcpropertysinglevalue.htm}
 */
export class PropertyEnumeratedValue extends SimpleProperty {
    /**
     * @param {Identifier} name The name of the Property.
     * @param {Text} description The description of the Property.
     * @param {PropertyEnumerationReference} enumerationReference Enumeration from which a enumeration value has
     * been selected. The referenced enumeration also establishes the unit of the enumeration value.
     * @param {PropertySetReference[]} partOfPset - The PropertySet to which this Property belongs.
     * @param {PropertyReference[]} partOfComplex - The ComplexProperty to which this Property belongs.
    */
    constructor(name, description = null, 
    // enumerationValues: Value[] = null, not used since it is deprecated in IFC4
    enumerationReference = null, partOfPset = [], partOfComplex = []) {
        super(name, description, partOfPset, partOfComplex);
        this.enumerationReference = enumerationReference;
    }
    // eslint-disable-next-line require-jsdoc
    get asLegibleString() {
        return [
            this.enumerationValues && `enumerationValues: ${JSON.stringify(this.enumerationValues)}`,
            this.enumerationReference && `references ${this.enumerationReference.name.value}`,
        ].filter((v) => !!v).join(', ');
    }
    /**
     * map object from database to actual class object
     *
     * not part of IFC specification
     * @param {IPropertySingleValue} propertyData
     * @return {PropertySingleValue}
     */
    static fromData(propertyData) {
        return new PropertyEnumeratedValue(propertyData.name, propertyData.description, propertyData.enumerationReference, propertyData.partOfPset, propertyData.partOfComplex);
    }
}
//# sourceMappingURL=property-enumerated-value.js.map