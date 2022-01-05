import {Value} from '../../value/value.js';
import {Unit} from '../../unit/unit.interface.js';
import {ISimpleProperty, SimpleProperty} from './simple-property.js';
import {Identifier} from '../../value/simple-value/identifier.js';
import {Text} from '../../value/simple-value/text.js';
import {PropertySetReference} from '../../property-set/property-set.js';
import {PropertyReference} from '../property.js';

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
	 * @param {PropertySetReference[]} partOfPset - The PropertySet to which this Property belongs.
	 * @param {PropertyReference[]} partOfComplex - The ComplexProperty to which this Property belongs.
     */
	constructor(
		name: Identifier,
		description: Text = null,
		nominalValue: Value = null,
		unit: Unit = null,
		partOfPset: PropertySetReference[] = [],
		partOfComplex: PropertyReference[] = [],
	) {
		super(name, description, partOfPset, partOfComplex);
		this.nominalValue = nominalValue;
		this.unit = unit;
	}

	// eslint-disable-next-line require-jsdoc
	get asLegibleString(): string {
		return `Value type: ${this.nominalValue.type}` +
			(this.unit ? `, Unit: ${JSON.stringify(this.unit)}` : '') +
			(this.partOfPset.length > 0 ? `, Part of ${this.partOfPset.length} property sets` : '') +
			(this.partOfComplex.length > 0 ? `, Part of ${this.partOfComplex.length} complex properties` : '');
	}

	/**
     * map object from database to actual class object
	 *
     * not part of IFC specification
     * @param {IPropertySingleValue} propertyData
	 * @return {PropertySingleValue}
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


export interface IPropertySingleValue extends ISimpleProperty {
    nominalValue?: Value
    unit?: Unit
}
