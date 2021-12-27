import {PropertySetReference} from '../property-set/property-set.js';
import {Identifier} from '../value/simple-value/identifier.js';
import {Text} from '../value/simple-value/text.js';
import {IProperty, Property, PropertyReference} from './property.js';

/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifccomplexproperty.htm}
 */
export class ComplexProperty extends Property implements IComplexProperty {
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
	constructor(
		name: Identifier,
		usageName: Identifier,
		description: Text = null,
		hasProperties: PropertyReference[] = [],
		partOfPset: PropertySetReference[] = [],
		partOfComplex: PropertyReference[] = [],
	) {
		super(name, description, partOfPset, partOfComplex);
		this.usageName = usageName;
		this.hasProperties = hasProperties;
	}

	// eslint-disable-next-line require-jsdoc
	get asLegibleString(): string {
		return `Usage name: ${this.usageName.value}` +
			(this.hasProperties.length > 0 ? `, Has ${this.hasProperties.length} properties` : '') +
			(this.partOfPset.length > 0 ? `, Part of ${this.partOfPset.length} property sets` : '') +
			(this.partOfComplex.length > 0 ? `, Part of ${this.partOfComplex.length} complex properties` : '');
	}

	/**
     * map object from database to actual class object
	 *
     * not part of IFC specification
     * @param {IComplexProperty} propertyData
	 * @return {ComplexProperty}
     */
	static fromData(propertyData: IComplexProperty): ComplexProperty {
		return new ComplexProperty(
			propertyData.name,
			propertyData.usageName,
			propertyData.description,
			propertyData.hasProperties,
			propertyData.partOfPset,
			propertyData.partOfComplex,
		);
	}
}

export interface IComplexProperty extends IProperty {
    usageName: Identifier
    hasProperties: PropertyReference[]
}

