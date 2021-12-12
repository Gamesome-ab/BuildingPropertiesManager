import {SimpleValue} from './simple-value.js';
import {stringOfLength, StringOfLength} from '../../../types/string-of-length.type.js';

/**
 * @property {string} value a string of length 1 to 255.
 * An identifier is an alphanumeric string which allows an individual thing to be identified.
 * It may not provide natural-language meaning.
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcidentifier.htm}
 */
export class Identifier extends SimpleValue<StringOfLength<1, 255>> {
	/**
     * @param {string} value that will be converted to a string of length 1 to 255.
     */
	constructor(value: string = null) {
		if ( value === null) super(null);
		else super(stringOfLength(value));
	}
}

export interface Identifier extends SimpleValue<StringOfLength<1, 255>> {
    type: 'Identifier';
}
