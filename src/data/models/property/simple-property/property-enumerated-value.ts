import {Value} from '../../value/value.js';
import {SimpleProperty} from './simple-property.js';
import {Identifier} from '../../value/simple-value/identifier.js';
import {Text} from '../../value/simple-value/text.js';

/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcpropertysinglevalue.htm}
 */
export class PropertyEnumeratedValue extends SimpleProperty implements IPropertyEnumeratedValue {
	enumerationValues: Value[];
	enumerationReference: any; // TODO: should be PropertyEnumeration
	/**
     * @param {Identifier} name The name of the Property.
     * @param {Text} description The description of the Property.
     * @param {Value} enumerationValues Enumeration values, which shall be listed in the
	 * referenced IfcPropertyEnumeration, if such a reference is provided.
     * @param {Unit} enumerationReference Enumeration from which a enumeration value has
	 * been selected. The referenced enumeration also establishes the unit of the enumeration value.
     */
	constructor(
		name: Identifier,
		description: Text = null,
		/**
		 * @deprecated use enumerationReference instead
		 */
		enumerationValues: Value[] = [],
		enumerationReference: any = null, // TODO: should be PropertyEnumeration
	) {
		super(name, description);
		this.enumerationValues = enumerationValues;
		this.enumerationReference = enumerationReference;
	}

	// eslint-disable-next-line require-jsdoc
	get valuesToLegibleString(): string {
		return [
			this.enumerationValues && `enumerationValues: ${JSON.stringify(this.enumerationValues)}`,
			this.enumerationReference && `enumerationReference: ${JSON.stringify(this.enumerationReference)}`,
		].filter((v) => !!v).join(', ');
	}
}

export interface IPropertyEnumeratedValue extends SimpleProperty {
    enumerationValues?: Value[]
    enumerationReference?: any // TODO: should be PropertyEnumeration
}
