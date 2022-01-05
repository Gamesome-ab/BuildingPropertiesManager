import { PropertySetReference } from '../property-set/property-set.js';
import { Identifier } from '../value/simple-value/identifier.js';
import { Text } from '../value/simple-value/text.js';
import { IProperty, Property, PropertyReference } from './property.js';
/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifccomplexproperty.htm}
 */
export declare class ComplexProperty extends Property implements IComplexProperty {
    usageName: Identifier;
    hasProperties: PropertyReference[];
    /**
     * @param {Identifier} name - The name of the Property.
     * @param {Identifier} usageName - Usage description of the IfcComplexProperty within the
     * property set which references the IfcComplexProperty.
     *
     * NOTE: Consider a complex property for glazing properties.
     * The Name attribute of the IfcComplexProperty could be Pset_GlazingProperties,
     * and the UsageName attribute could be OuterGlazingPane.
     * @param {Text} description - The description of the Property.
     * @param {PropertyReference} hasProperties - The properties that are included in the ComplexProperty.
     * @param {PropertySetReference[]} partOfPset - The PropertySet to which this Property belongs.
     * @param {PropertyReference[]} partOfComplex - The ComplexProperty to which this Property belongs.
     */
    constructor(name: Identifier, usageName: Identifier, description?: Text, hasProperties?: PropertyReference[], partOfPset?: PropertySetReference[], partOfComplex?: PropertyReference[]);
    get asLegibleString(): string;
    /**
     * map object from database to actual class object
     *
     * not part of IFC specification
     * @param {IComplexProperty} propertyData
     * @return {ComplexProperty}
     */
    static fromData(propertyData: IComplexProperty): ComplexProperty;
}
export interface IComplexProperty extends IProperty {
    usageName: Identifier;
    hasProperties: PropertyReference[];
}
