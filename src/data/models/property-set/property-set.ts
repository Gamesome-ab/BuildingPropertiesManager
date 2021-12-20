import {PropertyReference} from '../property/property';
import {Label} from '../value/simple-value/label';
import {Text} from '../value/simple-value/text';

/**
 * @property {Label} name Property sets that are not declared as part
 * of the IFC specification shall have a Name value not including the "Pset_" prefix.
 * @property {Text} description (optional)
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcpropertyset.htm}
 */
export class PropertySet {
	type = this.constructor.name;
	name: Label; // from Root
	description: Text;
	hasProperties: PropertyReference[]; // stored as reference to avoid circular references IFC states that these should be Property[]

	/**
     * @param {Label} name
     * @param {Text} description
     * @param {PropertyReference[]} hasProperties
     */
	constructor(
		name?: Label,
		description?: Text,
		hasProperties: PropertyReference[] = [],
	) {
		this.name = name;
		this.description = description;
		this.hasProperties = hasProperties;
	}

	/**
     * @return {PropertySetReference}
     */
	asPropertySetReference(): PropertySetReference {
		return new PropertySetReference(this);
	}

	/**
     * @param {IPropertySet} propertySetData
     * @return {PropertySet}
     */
	static fromData(propertySetData: IPropertySet): PropertySet {
		return new PropertySet(
			propertySetData.name,
			propertySetData.description,
			propertySetData.hasProperties,
		);
	}
}

export interface IPropertySet {
    name?: Label; // from Root
    description?: Text;
    hasProperties: PropertyReference[]; // stored as reference to avoid circular references IFC states that these should be Property[]
}

/**
 * Reduce any property to a reference containing only name and type.
 * Used to create a property reference for a property set.
 */
export class PropertySetReference {
	/**
     * @param {PropertySet} propertySet
     */
	constructor(propertySet: PropertySet) {
		this.name = propertySet.name;
		this.type = propertySet.type;
	}
}
export interface PropertySetReference extends Omit<PropertySet, 'hasProperties' | 'description'> {}

