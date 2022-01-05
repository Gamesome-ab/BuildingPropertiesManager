import { Property } from '../property.js';
/**
 * @see {@link https://standards.buildingsmart.org/IFC/RELEASE/IFC4/ADD2_TC1/HTML/link/ifcsimpleproperty.htm}
 */
export declare abstract class SimpleProperty extends Property implements ISimpleProperty {
}
export interface ISimpleProperty extends Property {
}
