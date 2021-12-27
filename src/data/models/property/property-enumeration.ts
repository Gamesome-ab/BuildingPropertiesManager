import {Unit} from '../unit/unit.interface.js';
import {Label} from '../value/simple-value/label.js';
import {Value} from '../value/value.js';

/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcpropertyenumeration.htm}
 */
export class PropertyEnumeration implements IPropertyEnumeration {
	type = this.constructor.name;
	name: Label;
	unit: Unit; // Formal proposition WR01 suggests that all values within the list of EnumerationValues shall be of the same measure type.
	enumerationValues: Value[];

	/**
     * @param {Label} name
	 * @param {Unit} unit
	 * @param {Value[]} enumerationValues
     */
	constructor(
		name: Label,
		unit: Unit = null,
		enumerationValues: Value[] = [],
	) {
		this.name = name;
		this.unit = unit;
		this.enumerationValues = enumerationValues;
	}

	/**
     * @return {PropertyEnumerationReference}
     */
	get asPropertyEnumerationReference(): PropertyEnumerationReference {
		return new PropertyEnumerationReference(this);
	}

	/**
     * @param {IPropertyEnumeration} propertyEnumerationData
     * @return {PropertyEnumeration}
     */
	static fromData(propertyEnumerationData: IPropertyEnumeration): PropertyEnumeration {
		return new PropertyEnumeration(
			propertyEnumerationData.name,
			propertyEnumerationData.unit,
			propertyEnumerationData.enumerationValues,
		);
	}
}

export interface IPropertyEnumeration {
	type: string;
	name: Label;
	unit: Unit; // Formal proposition WR01 suggests that all values within the list of EnumerationValues shall be of the same measure type.
	enumerationValues: Value[];
}

/**
 * Reduce any property to a reference containing only name and type.
 * Used to create a property reference for a property set.
 */
export class PropertyEnumerationReference {
	/**
     * @param {Property} propertyEnumeration
     */
	constructor(propertyEnumeration: PropertyEnumeration) {
		this.name = propertyEnumeration.name;
		this.type = propertyEnumeration.type;
	}
}
export interface PropertyEnumerationReference extends Omit<PropertyEnumeration, 'unit' | 'enumerationValues'> {}
