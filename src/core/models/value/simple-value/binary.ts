import {SimpleValue} from './simple-value.js';

/**
 * @property {string} value a string where the max length is determined by its implementation
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcbinary.htm}
 */
export class Binary extends SimpleValue<number> {}

export interface Binary extends SimpleValue<number> { // TODO: should probably handle binary better than with number
    type: 'Binary';
}
