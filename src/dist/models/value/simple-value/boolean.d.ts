import { SimpleValue } from './simple-value.js';
/**
 * @property {string} value a string where the max length is determined by its implementation
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcboolean.htm}
 */
export declare class Boolean extends SimpleValue<boolean> {
}
export interface Boolean extends SimpleValue<boolean> {
    type: 'Boolean';
}
