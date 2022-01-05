/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcproperty.htm}
 */
export class Property {
    // propertyForDependance: [];
    // propertyDependsOn: [];
    // hasConstraints: [];
    // hasApprovals: [];
    /**
     * @param {Identifier} name
     * @param {Text} description
     * @param {PropertySetReference} partOfPset - The PropertySet to which this Property belongs.
     * @param {PropertyReference} partOfComplex - The ComplexProperty to which this Property belongs.
     */
    constructor(name, description = null, partOfPset = [], partOfComplex = []) {
        this.type = this.constructor.name;
        this.name = name;
        this.description = description;
        this.partOfPset = partOfPset;
        this.partOfComplex = partOfComplex;
    }
    /**
     * Create an object that holds enough data to use as a reference to this Property
     *
     * not part of IFC specification
     * @return {PropertyReference}
     */
    get asPropertyReference() {
        return new PropertyReference(this);
    }
}
/**
 * Reduce any property to a reference containing only name and type.
 * Used to create a property reference for a property set.
 */
export class PropertyReference {
    /**
     * @param {Property} property
     */
    constructor(property) {
        this.name = property.name;
        this.type = property.type;
    }
}
//# sourceMappingURL=property.js.map