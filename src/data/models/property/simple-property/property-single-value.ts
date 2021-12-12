import {Value} from '../../value/value.js';
import {Unit} from '../../unit/unit.interface.js';
import {SimpleProperty} from './simple-property.js';
import {Identifier} from '../../value/simple-value/identifier.js';
import {Text} from '../../value/simple-value/text.js';

/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcpropertysinglevalue.htm}
 */
export class PropertySingleValue extends SimpleProperty implements IPropertySingleValue {
	nominalValue: Value;
	unit: Unit;
	/**
     * @param {Identifier} name - The name of the Property.
     * @param {Text} description - The description of the Property.
     * @param {Value} nominalValue
     * @param {Unit} unit
	 * @param {PropertySetReference} partOfPset - The PropertySet to which this Property belongs.
	 * @param {PropertyReference} partOfComplex - The ComplexProperty to which this Property belongs.
     */
	constructor(
		name: Identifier,
		description: Text = null,
		nominalValue: Value = null,
		unit: Unit = null,
		partOfPset = [],
		partOfComplex = [],
	) {
		super(name, description, partOfPset, partOfComplex);
		this.nominalValue = nominalValue;
		this.unit = unit;
	}

	// eslint-disable-next-line require-jsdoc
	get valuesToLegibleString(): string {
		return `valueType: ${this.nominalValue.type}` +
			(this.unit ? `, unit: ${JSON.stringify(this.unit)}` : '');
	}

	/**
     * helper function to describe any of the extending classes values
     * not part of IFC specification
     * @param {SimpleProperty} propertyData
	 * @return {SimpleProperty}
     */
	static fromData(propertyData: IPropertySingleValue): PropertySingleValue {
		return new PropertySingleValue(
			propertyData.name,
			propertyData.description,
			propertyData.nominalValue,
			propertyData.unit,
			propertyData.partOfPset,
			propertyData.partOfComplex,
		);
	}
}


export interface IPropertySingleValue extends SimpleProperty {
    nominalValue?: Value
    unit?: Unit
}
