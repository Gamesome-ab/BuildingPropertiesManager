import { SimpleValue } from './simple-value.js';
import { StringOfLength } from '../../../types/string-of-length.type.js';
/**
 * @property {string} value a string of length 1 to 255.
 * It is a string which represents the human-interpretable name of something and shall have a natural-language meaning.
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifclabel.htm}
 */
export declare class Label extends SimpleValue<StringOfLength<1, 255>> {
    /**
     * @param {string} value that will be converted to a string of length 1 to 255.
     */
    constructor(value?: string);
}
export interface Label extends SimpleValue<StringOfLength<1, 255>> {
    type: 'Label';
}
