/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcpropertyenumeration.htm}
 */
export class PropertyEnumeration {
    /**
     * @param {Label} name
     * @param {Unit} unit
     * @param {Value[]} enumerationValues
     */
    constructor(name, unit = null, enumerationValues = []) {
        this.type = this.constructor.name;
        this.name = name;
        this.unit = unit;
        this.enumerationValues = enumerationValues;
    }
    /**
     * @return {PropertyEnumerationReference}
     */
    get asPropertyEnumerationReference() {
        return new PropertyEnumerationReference(this);
    }
    /**
     * @param {IPropertyEnumeration} propertyEnumerationData
     * @return {PropertyEnumeration}
     */
    static fromData(propertyEnumerationData) {
        return new PropertyEnumeration(propertyEnumerationData.name, propertyEnumerationData.unit, propertyEnumerationData.enumerationValues);
    }
}
/**
 * Reduce any property to a reference containing only name and type.
 * Used to create a property reference for a property set.
 */
export class PropertyEnumerationReference {
    /**
     * @param {Property} propertyEnumeration
     */
    constructor(propertyEnumeration) {
        this.name = propertyEnumeration.name;
        this.type = propertyEnumeration.type;
    }
}
//# sourceMappingURL=property-enumeration.js.map