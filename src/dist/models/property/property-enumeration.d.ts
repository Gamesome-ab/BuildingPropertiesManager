import { Unit } from '../unit/unit.interface.js';
import { Label } from '../value/simple-value/label.js';
import { Value } from '../value/value.js';
/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcpropertyenumeration.htm}
 */
export declare class PropertyEnumeration implements IPropertyEnumeration {
    type: string;
    name: Label;
    unit: Unit;
    enumerationValues: Value[];
    /**
     * @param {Label} name
     * @param {Unit} unit
     * @param {Value[]} enumerationValues
     */
    constructor(name: Label, unit?: Unit, enumerationValues?: Value[]);
    /**
     * @return {PropertyEnumerationReference}
     */
    get asPropertyEnumerationReference(): PropertyEnumerationReference;
    /**
     * @param {IPropertyEnumeration} propertyEnumerationData
     * @return {PropertyEnumeration}
     */
    static fromData(propertyEnumerationData: IPropertyEnumeration): PropertyEnumeration;
}
export interface IPropertyEnumeration {
    type: string;
    name: Label;
    unit: Unit;
    enumerationValues: Value[];
}
/**
 * Reduce any property to a reference containing only name and type.
 * Used to create a property reference for a property set.
 */
export declare class PropertyEnumerationReference {
    /**
     * @param {Property} propertyEnumeration
     */
    constructor(propertyEnumeration: PropertyEnumeration);
}
export interface PropertyEnumerationReference extends Omit<PropertyEnumeration, 'unit' | 'enumerationValues'> {
}
