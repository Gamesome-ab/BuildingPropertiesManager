import { PropertySetReference } from '../property-set/property-set.js';
import { Identifier } from '../value/simple-value/identifier.js';
import { Text } from '../value/simple-value/text.js';
/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcproperty.htm}
 */
export declare abstract class Property implements IProperty {
    type: string;
    name: Identifier;
    description?: Text;
    partOfPset: PropertySetReference[];
    partOfComplex: PropertyReference[];
    /**
     * @param {Identifier} name
     * @param {Text} description
     * @param {PropertySetReference} partOfPset - The PropertySet to which this Property belongs.
     * @param {PropertyReference} partOfComplex - The ComplexProperty to which this Property belongs.
     */
    constructor(name: Identifier, description?: Text, partOfPset?: any[], partOfComplex?: any[]);
    /**
     * Create an object that holds enough data to use as a reference to this Property
     *
     * not part of IFC specification
     * @return {PropertyReference}
     */
    get asPropertyReference(): PropertyReference;
    /**
     * helper function to describe any of the extending classes values
     *
     * not part of IFC specification
     */
    abstract get asLegibleString(): string;
}
export interface IProperty {
    type: string;
    name: Identifier;
    description?: Text;
    partOfPset: PropertySetReference[];
    partOfComplex: PropertyReference[];
    get asLegibleString(): string;
}
/**
 * Reduce any property to a reference containing only name and type.
 * Used to create a property reference for a property set.
 */
export declare class PropertyReference {
    /**
     * @param {Property} property
     */
    constructor(property: Property);
}
export interface PropertyReference extends Pick<Property, 'name' | 'type'> {
}
