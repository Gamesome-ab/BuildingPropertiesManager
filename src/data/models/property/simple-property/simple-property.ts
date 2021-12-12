import {Property} from '../property.js';

/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcsimpleproperty.htm}
 */
export abstract class SimpleProperty extends Property implements ISimpleProperty {
	abstract get valuesToLegibleString(): string;
}

export interface ISimpleProperty extends Property {
    /**
     * helper function to describe any of the extending classes values
     * not part of IFC specification
     * @abstract
     */
    get valuesToLegibleString(): string;
}

