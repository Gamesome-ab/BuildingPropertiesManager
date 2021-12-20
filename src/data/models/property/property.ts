import {PropertySetReference} from '../property-set/property-set.js';
import {Identifier} from '../value/simple-value/identifier.js';
import {Text} from '../value/simple-value/text.js';

/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcproperty.htm}
 */
export abstract class Property implements IProperty {
	type = this.constructor.name;
	name: Identifier;
	description?: Text;

	partOfPset: PropertySetReference[]; // should be PropertySet[] acc to IFC, but we don't have references
	partOfComplex: PropertyReference[];
	// propertyForDependance: [];
	// propertyDependsOn: [];
	// hasConstraints: [];
	// hasApprovals: [];


	/**
     * @param {Identifier} name
     * @param {Text} description
	 * @param {PropertySetReference} partOfPset - The PropertySet to which this Property belongs.
	 * @param {PropertyReference} partOfComplex - The ComplexProperty to which this Property belongs.
     */
	constructor(
		name: Identifier,
		description: Text = null,
		partOfPset = [],
		partOfComplex = [],
	) {
		this.name = name;
		this.description = description;
		this.partOfPset = partOfPset;
		this.partOfComplex = partOfComplex;
	}

	/**
     * @return {PropertyReference}
     */
	asPropertyReference(): PropertyReference {
		return new PropertyReference(this);
	}
}

export interface IProperty {
	type: string;
	name: Identifier;
	description?: Text;

	partOfPset: PropertySetReference[]; // should be PropertySet[] acc to IFC, but we don't have references
	partOfComplex: PropertyReference[];
     // propertyForDependance: [];
     // propertyDependsOn: [];
     // hasConstraints: [];
     // hasApprovals: [];
}

/**
 * Reduce any property to a reference containing only name and type.
 * Used to create a property reference for a property set.
 */
export class PropertyReference {
	/**
     * @param {Property} property
     */
	constructor(property: Property) {
		this.name = property.name;
		this.type = property.type;
	}
}
export interface PropertyReference extends Omit<Property, 'partOfPset' | 'partOfComplex' | 'description'> {}
