/**
 * @property {Label} name Property sets that are not declared as part
 * of the IFC specification shall have a Name value not including the "Pset_" prefix.
 * @property {Text} description (optional)
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcpropertyset.htm}
 */
export class PropertySet {
    /**
     * @param {Label} name
     * @param {Text} description
     * @param {PropertyReference[]} hasProperties
     */
    constructor(name, description, hasProperties = []) {
        this.type = this.constructor.name;
        this.name = name;
        this.description = description;
        this.hasProperties = hasProperties;
    }
    /**
     * @return {PropertySetReference}
     */
    asPropertySetReference() {
        return new PropertySetReference(this);
    }
    /**
     * @param {IPropertySet} propertySetData
     * @return {PropertySet}
     */
    static fromData(propertySetData) {
        return new PropertySet(propertySetData.name, propertySetData.description, propertySetData.hasProperties);
    }
}
/**
 * Reduce any property to a reference containing only name and type.
 * Used to create a property reference for a property set.
 */
export class PropertySetReference {
    /**
     * @param {PropertySet} propertySet
     */
    constructor(propertySet) {
        this.name = propertySet.name;
        this.type = propertySet.type;
    }
}
//# sourceMappingURL=property-set.js.map