/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcvalue.htm}
 */
export class Value {
	type = this.constructor.name;
}

export interface Value {};

/* eslint-disable no-unused-vars */
export enum ValueExtension {
    SimpleValue = 'SimpleValue',
    SomeUnusedValue = 'SomeUnusedValue', // TODO: Remove!
}
/* eslint-enable */
