import { SimpleProperty } from './simple-property.js';
/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcpropertysinglevalue.htm}
 */
export class PropertySingleValue extends SimpleProperty {
    /**
     * @param {Identifier} name - The name of the Property.
     * @param {Text} description - The description of the Property.
     * @param {Value} nominalValue
     * @param {Unit} unit
     * @param {PropertySetReference[]} partOfPset - The PropertySet to which this Property belongs.
     * @param {PropertyReference[]} partOfComplex - The ComplexProperty to which this Property belongs.
     */
    constructor(name, description = null, nominalValue = null, unit = null, partOfPset = [], partOfComplex = []) {
        super(name, description, partOfPset, partOfComplex);
        this.nominalValue = nominalValue;
        this.unit = unit;
    }
    // eslint-disable-next-line require-jsdoc
    get asLegibleString() {
        return `Value type: ${this.nominalValue.type}` +
            (this.unit ? `, Unit: ${JSON.stringify(this.unit)}` : '') +
            (this.partOfPset.length > 0 ? `, Part of ${this.partOfPset.length} property sets` : '') +
            (this.partOfComplex.length > 0 ? `, Part of ${this.partOfComplex.length} complex properties` : '');
    }
    /**
     * map object from database to actual class object
     *
     * not part of IFC specification
     * @param {IPropertySingleValue} propertyData
     * @return {PropertySingleValue}
     */
    static fromData(propertyData) {
        return new PropertySingleValue(propertyData.name, propertyData.description, propertyData.nominalValue, propertyData.unit, propertyData.partOfPset, propertyData.partOfComplex);
    }
}
//# sourceMappingURL=property-single-value.js.map