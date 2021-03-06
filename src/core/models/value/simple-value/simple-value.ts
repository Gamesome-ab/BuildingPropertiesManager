import {Value} from '../value.js';

/**
 * @property {string} value
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcsimplevalue.htm}
 */
export abstract class SimpleValue<ValueType> extends Value {
	/**
     * @param {ValueType} value
     */
	constructor(value: ValueType = null) {
		super();
		this.value = value;
	}
}

export interface SimpleValue<ValueType> extends Value {
    value: ValueType;
};
