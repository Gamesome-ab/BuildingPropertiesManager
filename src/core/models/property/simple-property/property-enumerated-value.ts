import {Value} from '../../value/value.js';
import {SimpleProperty} from './simple-property.js';
import {Identifier} from '../../value/simple-value/identifier.js';
import {Text} from '../../value/simple-value/text.js';
import {PropertyEnumerationReference} from '../property-enumeration.js';
import {PropertySetReference} from '../../property-set/property-set.js';
import {PropertyReference} from '../property.js';

/**
 * A property with an enumerated value, PropertyEnumeratedValue, defines a property object which
 * has a value assigned that is chosen from an enumeration. It defines a property - value combination
 * for which the property Name, an optional Description, the optional EnumerationValues
 * with measure type and optionally an Unit is given.
 *
 * More precisely: The PropertyEnumeratedValue defines a property, which value is selected from a defined
 * list of enumerators. The enumerators are stored in a dynamic enumeration of values including the type
 * information from Value (see PropertyEnumeration). This enables applications to use an enumeration
 * value as a property within a property set (PropertySet) including the allowed list of values.
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcpropertysinglevalue.htm}
 */
export class PropertyEnumeratedValue extends SimpleProperty implements IPropertyEnumeratedValue {
	/**
	 * Enumeration values, which shall be listed in the
	 * referenced PropertyEnumeration, if such a reference is provided (which it should be).
	 * @deprecated use enumerationReference instead
	*/
	enumerationValues: Value[];
	enumerationReference: PropertyEnumerationReference; // TODO: should be PropertyEnumeration
	/**
     * @param {Identifier} name The name of the Property.
     * @param {Text} description The description of the Property.
     * @param {PropertyEnumerationReference} enumerationReference Enumeration from which a enumeration value has
	 * been selected. The referenced enumeration also establishes the unit of the enumeration value.
     * @param {PropertySetReference[]} partOfPset - The PropertySet to which this Property belongs.
	 * @param {PropertyReference[]} partOfComplex - The ComplexProperty to which this Property belongs.
	*/
	constructor(
		name: Identifier,
		description: Text = null,
		// enumerationValues: Value[] = null, not used since it is deprecated in IFC4
		enumerationReference: PropertyEnumerationReference = null,
		partOfPset: PropertySetReference[] = [],
		partOfComplex: PropertyReference[] = [],
	) {
		super(name, description, partOfPset, partOfComplex);
		this.enumerationReference = enumerationReference;
	}

	// eslint-disable-next-line require-jsdoc
	get asLegibleString(): string {
		return [
			this.enumerationValues && `enumerationValues: ${JSON.stringify(this.enumerationValues)}`,
			this.enumerationReference && `references ${this.enumerationReference.name.value}`,
		].filter((v) => !!v).join(', ');
	}

	/**
     * map object from database to actual class object
	 *
     * not part of IFC specification
     * @param {IPropertySingleValue} propertyData
	 * @return {PropertySingleValue}
     */
	static fromData(propertyData: IPropertyEnumeratedValue): PropertyEnumeratedValue {
		return new PropertyEnumeratedValue(
			propertyData.name,
			propertyData.description,
			propertyData.enumerationReference,
			propertyData.partOfPset,
			propertyData.partOfComplex,
		);
	}
}

export interface IPropertyEnumeratedValue extends SimpleProperty {
    enumerationValues?: Value[]
    enumerationReference?: any // TODO: should be PropertyEnumeration
}
