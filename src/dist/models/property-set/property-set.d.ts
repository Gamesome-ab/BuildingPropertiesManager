import { PropertyReference } from '../property/property';
import { Label } from '../value/simple-value/label';
import { Text } from '../value/simple-value/text';
/**
 * @property {Label} name Property sets that are not declared as part
 * of the IFC specification shall have a Name value not including the "Pset_" prefix.
 * @property {Text} description (optional)
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcpropertyset.htm}
 */
export declare class PropertySet {
    type: string;
    name: Label;
    description: Text;
    hasProperties: PropertyReference[];
    /**
     * @param {Label} name
     * @param {Text} description
     * @param {PropertyReference[]} hasProperties
     */
    constructor(name?: Label, description?: Text, hasProperties?: PropertyReference[]);
    /**
     * @return {PropertySetReference}
     */
    asPropertySetReference(): PropertySetReference;
    /**
     * @param {IPropertySet} propertySetData
     * @return {PropertySet}
     */
    static fromData(propertySetData: IPropertySet): PropertySet;
}
export interface IPropertySet {
    name?: Label;
    description?: Text;
    hasProperties: PropertyReference[];
}
/**
 * Reduce any property to a reference containing only name and type.
 * Used to create a property reference for a property set.
 */
export declare class PropertySetReference {
    /**
     * @param {PropertySet} propertySet
     */
    constructor(propertySet: PropertySet);
}
export interface PropertySetReference extends Omit<PropertySet, 'hasProperties' | 'description'> {
}
