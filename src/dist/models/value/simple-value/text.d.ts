import { SimpleValue } from './simple-value.js';
/**
 * @property {string} value a string where the max length is determined by its implementation
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifctext.htm}
*/
export declare class Text extends SimpleValue<string> {
}
export interface Text extends SimpleValue<string> {
    type: 'Text';
}
